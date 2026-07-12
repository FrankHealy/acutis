"use client";

import { PreJoin } from "@livekit/components-react";
import type { LocalUserChoices } from "@livekit/components-core";
import { useEffect, useState } from "react";
import ConsultationRoom from "./ConsultationRoom";
import styles from "./VideoConsultation.module.css";
import type { ConsultationContext, JoinCredential } from "@/services/videoConsultationService";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

const LOCALIZATION_KEYS = [
  "video_consultation.brand", "video_consultation.title", "video_consultation.ended.title",
  "video_consultation.ended.description", "video_consultation.context.with_practitioner",
  "video_consultation.error.join", "video_consultation.error.device_permission",
  "video_consultation.label.practitioner", "video_consultation.label.confirm_display_name",
  "video_consultation.action.join", "video_consultation.device.microphone",
  "video_consultation.device.camera", "video_consultation.device.speaker",
  "video_consultation.status.connecting", "video_consultation.status.connected",
  "video_consultation.status.reconnecting", "video_consultation.status.waiting",
] as const;

export default function VideoJoinScreen({ loadContext, issueCredential, practitioner = false, onEnd }: {
  loadContext: () => Promise<ConsultationContext>; issueCredential: (displayName: string) => Promise<JoinCredential>;
  practitioner?: boolean; onEnd?: () => Promise<void>;
}) {
  const { locale, loadKeys, t } = useLocalization();
  const [context, setContext] = useState<ConsultationContext>();
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<LocalUserChoices>();
  const [credential, setCredential] = useState<JoinCredential>();
  const [ended, setEnded] = useState(false);
  useEffect(() => { void loadKeys([...LOCALIZATION_KEYS]); }, [loadKeys]);
  useEffect(() => { loadContext().then(setContext).catch(() => setError(t("video_consultation.error.join"))); }, [loadContext, t]);
  const join = async (values: LocalUserChoices) => {
    try { setError(""); setChoices(values); setCredential(await issueCredential(values.username)); }
    catch { setError(t("video_consultation.error.join")); }
  };
  const leave = async () => { setEnded(true); if (onEnd) await onEnd().catch(() => undefined); };
  if (ended || context?.status.toLowerCase() === "ended") return <main className={styles.shell}><section className={styles.card}><div className={styles.brand}>{t("video_consultation.brand")}</div><h1>{t("video_consultation.ended.title")}</h1><p className={styles.context}>{t("video_consultation.ended.description")}</p></section></main>;
  if (credential && choices) return <ConsultationRoom serverUrl={credential.server_url} token={credential.participant_token} choices={choices} onEnded={leave} />;
  return <main className={styles.shell}><section className={`${styles.card} ${styles.prejoin} ${practitioner ? styles.practitioner : ""}`}>
    <div className={styles.brand}>{t("video_consultation.brand")}</div>
    <h1>{t("video_consultation.title")}</h1>
    {context && <p className={styles.context}>{practitioner ? context.clientName : t("video_consultation.context.with_practitioner").replace("{{name}}", context.practitionerName)} · {new Date(context.startsAtUtc).toLocaleString(locale)}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {context && <PreJoin defaults={{ username: practitioner ? context.practitionerName : context.clientName, videoEnabled: true, audioEnabled: true }}
      userLabel={practitioner ? t("video_consultation.label.practitioner") : t("video_consultation.label.confirm_display_name")} joinLabel={t("video_consultation.action.join")} micLabel={t("video_consultation.device.microphone")} camLabel={t("video_consultation.device.camera")}
      onSubmit={join} onError={() => setError(t("video_consultation.error.device_permission"))} persistUserChoices />}
  </section></main>;
}
