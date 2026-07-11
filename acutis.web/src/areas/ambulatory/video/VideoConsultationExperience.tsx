"use client";

import { useMemo, useState } from "react";
import {
  ConnectionQualityIndicator,
  LiveKitRoom,
  MediaDeviceMenu,
  PreJoin,
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  useConnectionState,
  useRemoteParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { LogOut, PhoneOff } from "lucide-react";
import type { LiveKitCredential } from "@/services/videoConsultationService";
import "@livekit/components-styles";

export type ConsultationSummary = {
  clientName: string;
  practitionerName: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

type Props = {
  summary: ConsultationSummary;
  displayName?: string;
  requireDisplayName?: boolean;
  blockedReason?: string | null;
  issueCredential: (displayName: string) => Promise<LiveKitCredential>;
  onEnd?: () => Promise<void>;
};

export default function VideoConsultationExperience({
  summary,
  displayName: initialDisplayName = "",
  requireDisplayName = false,
  blockedReason,
  issueCredential,
  onEnd,
}: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [credential, setCredential] = useState<LiveKitCredential | null>(null);
  const [deviceChoices, setDeviceChoices] = useState<{ audioEnabled: boolean; videoEnabled: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);

  if (ended) {
    return <StatusPanel title="Consultation ended" detail="You may close this window." />;
  }

  if (blockedReason) {
    return <StatusPanel title="Consultation unavailable" detail={blockedReason} />;
  }

  if (!credential) {
    return (
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="bg-indigo-700 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Acutis Practitioner</p>
          <h1 className="mt-1 text-2xl font-bold">Video consultation</h1>
          <p className="mt-2 text-sm text-indigo-100">
            {summary.clientName} with {summary.practitionerName} · {formatAppointment(summary.startsAtUtc, summary.endsAtUtc)}
          </p>
        </div>
        <div className="p-5 sm:p-7">
          {requireDisplayName && (
            <label className="mb-5 grid gap-2 text-sm font-semibold text-slate-800">
              Confirm your display name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={100}
                autoComplete="name"
                className="h-11 rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
              />
            </label>
          )}
          {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <PreJoin
            defaults={{ audioEnabled: true, videoEnabled: true, username: displayName }}
            onSubmit={async (choices) => {
              const chosenName = (requireDisplayName ? displayName : initialDisplayName).trim();
              if (!chosenName) {
                setError("Please enter your name before joining.");
                return;
              }
              try {
                setError(null);
                const next = await issueCredential(chosenName);
                setDeviceChoices({ audioEnabled: choices.audioEnabled, videoEnabled: choices.videoEnabled });
                setCredential(next);
              } catch (reason) {
                setError((reason as Error).message);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={credential.server_url}
      token={credential.participant_token}
      connect
      audio={deviceChoices?.audioEnabled ?? true}
      video={deviceChoices?.videoEnabled ?? true}
      onDisconnected={() => setEnded(true)}
      className="min-h-[70vh]"
    >
      <OneToOneRoom
        onLeave={() => setEnded(true)}
        onEnd={onEnd ? async () => { await onEnd(); setEnded(true); } : undefined}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function OneToOneRoom({ onLeave, onEnd }: { onLeave: () => void; onEnd?: () => Promise<void> }) {
  const room = useRoomContext();
  const state = useConnectionState();
  const remoteParticipants = useRemoteParticipants();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const localTrack = tracks.find((track) => track.participant.isLocal);
  const remoteTrack = tracks.find((track) => !track.participant.isLocal);
  const remote = remoteParticipants[0];
  const connectionText = useMemo(() => {
    if (state === ConnectionState.Reconnecting) return "Reconnecting…";
    if (state === ConnectionState.Connected) return remote ? "Connected" : "Waiting for the other participant";
    return "Connecting…";
  }, [remote, state]);

  const leave = async () => {
    await room.disconnect();
    onLeave();
  };

  return (
    <section className="relative min-h-[70vh] overflow-hidden rounded-2xl bg-slate-950 text-white" aria-label="Video consultation">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3 rounded-full bg-slate-900/85 px-4 py-2 text-sm backdrop-blur">
        <span>{connectionText}</span>
        {remote && <ConnectionQualityIndicator participant={remote} />}
      </div>

      <div className="flex min-h-[70vh] items-center justify-center">
        {remoteTrack ? (
          <VideoTrack trackRef={remoteTrack} className="h-[70vh] w-full object-contain" />
        ) : (
          <div className="grid place-items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-700 text-3xl font-bold">
              {initials(remote?.name ?? remote?.identity ?? "Guest")}
            </div>
            <p className="mt-4 text-lg font-semibold">{remote ? `${remote.name || "Participant"} has camera off` : "Waiting for participant"}</p>
          </div>
        )}
      </div>

      <div className="absolute right-4 top-4 z-20 h-36 w-48 overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-xl sm:h-44 sm:w-64">
        {localTrack ? <VideoTrack trackRef={localTrack} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm">Camera off</div>}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-t from-black/90 to-transparent px-4 pb-5 pt-12">
        <TrackToggle source={Track.Source.Microphone} showIcon>Microphone</TrackToggle>
        <TrackToggle source={Track.Source.Camera} showIcon>Camera</TrackToggle>
        <MediaDeviceMenu kind="audioinput" />
        <MediaDeviceMenu kind="videoinput" />
        <MediaDeviceMenu kind="audiooutput" />
        <button type="button" onClick={() => void leave()} className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-700 px-4 text-sm font-semibold hover:bg-slate-600">
          <LogOut className="h-4 w-4" /> Leave
        </button>
        {onEnd && (
          <button type="button" onClick={() => void onEnd()} className="inline-flex h-11 items-center gap-2 rounded-full bg-red-700 px-4 text-sm font-semibold hover:bg-red-600">
            <PhoneOff className="h-4 w-4" /> End consultation
          </button>
        )}
      </div>
    </section>
  );
}

function StatusPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Acutis Practitioner</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function formatAppointment(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString("en-IE", { weekday: "short", day: "2-digit", month: "short" })}, ${startDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}–${endDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}`;
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VC";
}
