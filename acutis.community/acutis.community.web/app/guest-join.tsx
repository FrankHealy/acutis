import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { Video } from "lucide-react";

const api = import.meta.env.VITE_API_URL;

export default function GuestJoin({ productName }: { productName: string }) {
  const invitationToken = new URLSearchParams(window.location.search).get("token") ?? "";
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const remoteAudio = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!room) return;
    const local = Array.from(room.localParticipant.videoTrackPublications.values()).find((item) => item.source === Track.Source.Camera)?.track;
    if (local && localVideo.current) local.attach(localVideo.current);
    const attach = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video && remoteVideo.current) track.attach(remoteVideo.current);
      if (track.kind === Track.Kind.Audio && remoteAudio.current) remoteAudio.current.appendChild(track.attach());
    };
    room.remoteParticipants.forEach((participant) => participant.trackPublications.forEach((publication) => publication.track && attach(publication.track)));
    room.on(RoomEvent.TrackSubscribed, attach);
    return () => { room.off(RoomEvent.TrackSubscribed, attach); local?.detach(); };
  }, [room]);
  const join = async () => {
    setError("");
    try {
      const response = await fetch(`${api}/api/consultations/guest-credentials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationToken }) });
      if (!response.ok) throw new Error("This invitation is invalid or has expired.");
      const credentials = await response.json() as { serverUrl: string; accessToken: string };
      const next = new Room(); await next.connect(credentials.serverUrl, credentials.accessToken);
      await next.localParticipant.setMicrophoneEnabled(true); await next.localParticipant.setCameraEnabled(true); setRoom(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to join."); }
  };
  if (!room) return <main className="guest-join"><img src="/acutis-icon.svg" alt="" /><span className="eyebrow">{productName}</span><h1>Join video appointment</h1><p>Your camera and microphone will only start after you choose Join and grant browser permission.</p><button className="primary" disabled={!invitationToken} onClick={() => void join()}><Video /> Join appointment</button>{error && <p role="alert">{error}</p>}</main>;
  return <main className="guest-call"><div className="remote-feed"><video ref={remoteVideo} autoPlay playsInline /><span>Waiting for your practitioner</span></div><div className="local-feed"><video ref={localVideo} autoPlay muted playsInline /><small>You</small></div><div ref={remoteAudio} className="remote-audio" /><button className="call-leave" onClick={() => { room.disconnect(); setRoom(null); }}>Leave appointment</button></main>;
}

