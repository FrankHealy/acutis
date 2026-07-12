"use client";

import { ControlBar, LiveKitRoom, MediaDeviceMenu, ParticipantTile, RoomAudioRenderer, useConnectionState, useTracks } from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import styles from "./VideoConsultation.module.css";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

function OneToOneLayout() {
  const { t } = useLocalization();
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const remote = tracks.find((track) => !track.participant.isLocal);
  const local = tracks.find((track) => track.participant.isLocal);
  const state = useConnectionState();
  const status = state === ConnectionState.Reconnecting ? t("video_consultation.status.reconnecting") : state === ConnectionState.Connected ? t("video_consultation.status.connected") : t("video_consultation.status.connecting");
  return <div className={styles.call}>
    <div className={styles.status} role="status" aria-live="polite">{status}</div>
    <div className={styles.mainVideo}>{remote ? <ParticipantTile trackRef={remote} /> : <div>{t("video_consultation.status.waiting")}</div>}</div>
    {local && <div className={styles.pip}><ParticipantTile trackRef={local} /></div>}
    <div className={styles.controls}><ControlBar variation="minimal" controls={{ microphone: true, camera: true, screenShare: false, chat: false, settings: true, leave: true }} /></div>
    <MediaDeviceMenu className={styles.speaker} kind="audiooutput">{t("video_consultation.device.speaker")}</MediaDeviceMenu>
    <RoomAudioRenderer />
  </div>;
}

export default function ConsultationRoom({ serverUrl, token, choices, onEnded }: { serverUrl: string; token: string; choices: { audioEnabled: boolean; videoEnabled: boolean; audioDeviceId?: string; videoDeviceId?: string }; onEnded: () => void }) {
  return <LiveKitRoom serverUrl={serverUrl} token={token} connect audio={choices.audioEnabled} video={choices.videoEnabled}
    options={{ adaptiveStream: true, dynacast: true }} onDisconnected={onEnded} data-lk-theme="default">
    <OneToOneLayout />
  </LiveKitRoom>;
}
