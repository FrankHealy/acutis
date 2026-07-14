import { type FormEvent, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { ShieldCheck, Video } from "lucide-react";

const api = import.meta.env.VITE_API_URL ?? "http://localhost:5010";
type Resolution = { status: "ready" | "too-early" | "closed" | "unavailable"; practitionerName?: string; appointmentDateTimeUtc?: string; timeZone?: string; supportAddress: string };

export default function GuestJoin({ productName, invitationToken }: { productName: string; invitationToken: string }) {
  const isArabic = navigator.language.toLowerCase().startsWith("ar");
  const copy = isArabic ? {
    checking: "جارٍ التحقق من دعوتك…", title: "الانضمام إلى موعد الفيديو", unavailable: "هذه الدعوة غير متاحة. ربما انتهت صلاحيتها أو تم استبدالها أو لم يعد الموعد متاحًا.", early: "الموعد غير مفتوح بعد. يُرجى العودة قبل الوقت المحدد بقليل.", closed: "انتهت فترة الانضمام إلى هذا الموعد.", practitioner: "الممارس", date: "التاريخ والوقت", confirm: "أكد هوية المستلم المقصود للمتابعة.", surname: "اسم العائلة", dob: "تاريخ الميلاد", checkingIdentity: "جارٍ التحقق…", confirmIdentity: "تأكيد الهوية", confirmed: "تم تأكيد هويتك. ستظل الكاميرا والميكروفون متوقفين حتى تختار الانضمام وتمنح الإذن.", preparing: "جارٍ التحضير…", join: "الانضمام إلى الموعد", help: "هل تحتاج إلى مساعدة؟"
  } : {
    checking: "Checking your invitation…", title: "Join video appointment", unavailable: "This invitation is unavailable. It may have expired, been replaced, or the appointment may no longer be available.", early: "This appointment is not open yet. Please return shortly before the scheduled time.", closed: "The joining window for this appointment has closed.", practitioner: "Practitioner", date: "Date and time", confirm: "Confirm the intended recipient’s identity to continue.", surname: "Surname", dob: "Date of birth", checkingIdentity: "Checking…", confirmIdentity: "Confirm identity", confirmed: "Your identity has been confirmed. Your camera and microphone remain off until you choose Join and grant permission.", preparing: "Preparing…", join: "Join appointment", help: "Need help?"
  };
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const remoteAudio = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en-IE";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${api}/api/video-invitations/resolve?token=${encodeURIComponent(invitationToken)}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); setResolution(await response.json() as Resolution); })
      .catch(() => setResolution({ status: "unavailable", supportAddress: "enquiries@salientrecovery.com" }));
    return () => controller.abort();
  }, [invitationToken]);

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

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${api}/api/video-invitations/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: invitationToken, surname: form.get("surname"), dateOfBirth: form.get("dateOfBirth") }) });
      const result = await response.json() as { verificationToken?: string; message?: string };
      if (!response.ok || !result.verificationToken) throw new Error(result.message ?? "We could not confirm those details.");
      setVerificationToken(result.verificationToken);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not confirm those details."); }
    finally { setBusy(false); }
  };

  const join = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`${api}/api/video-invitations/livekit-token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationToken }) });
      const credentials = await response.json() as { serverUrl?: string; accessToken?: string; message?: string };
      if (!response.ok || !credentials.serverUrl || !credentials.accessToken) throw new Error(credentials.message ?? "The appointment cannot be joined right now.");
      const next = new Room();
      await next.connect(credentials.serverUrl, credentials.accessToken);
      try {
        // Browser permission is deliberately requested only after identity confirmation
        // and this explicit Join action. A call is not shown as connected without tracks.
        await next.localParticipant.setMicrophoneEnabled(true);
        await next.localParticipant.setCameraEnabled(true);
      } catch {
        next.disconnect();
        throw new Error("Camera and microphone permission is required. Allow both devices, then try again.");
      }
      setRoom(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to join."); }
    finally { setBusy(false); }
  };

  if (room) return <main className="guest-call"><div className="remote-feed"><video ref={remoteVideo} autoPlay playsInline /><span>Waiting for your practitioner</span></div><div className="local-feed"><video ref={localVideo} autoPlay muted playsInline /><small>You</small></div><div ref={remoteAudio} className="remote-audio" /><button className="call-leave" onClick={() => { room.disconnect(); setRoom(null); }}>Leave appointment</button></main>;
  if (!resolution) return <main className="guest-join"><img src="/acutis-icon.svg" alt="" /><h1>{copy.checking}</h1></main>;
  const appointment = resolution.appointmentDateTimeUtc ? new Date(resolution.appointmentDateTimeUtc).toLocaleString([], { dateStyle: "full", timeStyle: "short", timeZone: resolution.timeZone }) : null;
  return <main className="guest-join"><img src="/acutis-icon.svg" alt="" /><span className="eyebrow">{productName}</span><h1>{copy.title}</h1>{resolution.status === "unavailable" && <p>{copy.unavailable}</p>}{resolution.status === "too-early" && <p>{copy.early}</p>}{resolution.status === "closed" && <p>{copy.closed}</p>}{resolution.practitionerName && <div className="appointment-summary"><p><strong>{copy.practitioner}</strong><br />{resolution.practitionerName}</p><p><strong>{copy.date}</strong><br />{appointment} ({resolution.timeZone})</p></div>}{resolution.status === "ready" && !verificationToken && <form onSubmit={(event) => void verify(event)}><p>{copy.confirm}</p><label>{copy.surname}<input name="surname" autoComplete="family-name" required /></label><label>{copy.dob}<input name="dateOfBirth" type="date" autoComplete="bday" required /></label><button className="primary" disabled={busy}><ShieldCheck />{busy ? copy.checkingIdentity : copy.confirmIdentity}</button></form>}{verificationToken && <><p>{copy.confirmed}</p><button className="primary" disabled={busy} onClick={() => void join()}><Video />{busy ? copy.preparing : copy.join}</button></>}{error && <p role="alert">{error}</p>}<p><small>{copy.help} <a href={`mailto:${resolution.supportAddress}`}>{resolution.supportAddress}</a></small></p></main>;
}
