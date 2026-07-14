import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProductSpaAuth } from "@acutis/identity/spa";
import { ClinicalCalendar, type ScheduleItem } from "@acutis/design-system";
import { directionForLocale, productText } from "@acutis/localization";
import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import "./call.css";
import "./calendar.css";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
type View =
  | "dashboard"
  | "service-users"
  | "appointments"
  | "assessments"
  | "care-plans"
  | "notes"
  | "forms"
  | "settings";
type Person = {
  id: string;
  displayName: string;
  preferredName?: string;
  phone?: string;
  email?: string;
  status: string;
  staffDisplayName: string;
};
type Appointment = {
  id: string;
  participantId?: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  deliveryMode: string;
  status: string;
  notes?: string;
  appointmentType: string;
  participant?: Person;
};
type Item = {
  id: string;
  participantId: string;
  status?: string;
  assessmentType?: string;
};
type Programme = {
  code: string;
  name: string;
  cadence: string;
  sessions: number;
  modules: string[];
};
type Data = {
  serviceUsers: Person[];
  appointments: Appointment[];
  assessments: Item[];
  carePlans: Item[];
  programmes: Programme[];
  staff: { subject: string; roles: string }[];
  currentRoles: string;
};
const api = import.meta.env.VITE_API_URL ?? "http://localhost:5020";
const nav: [View, string, typeof LayoutDashboard, string][] = [
  ["dashboard", "nav.dashboard", LayoutDashboard, "/"],
  ["service-users", "nav.service_users", Users, "/service-users"],
  ["appointments", "nav.calendar", CalendarDays, "/appointments"],
  ["assessments", "nav.assessments", ClipboardCheck, "/assessments"],
  ["care-plans", "nav.care_plans", HeartHandshake, "/care-plans"],
  ["notes", "nav.notes.community", FileText, "/notes"],
  ["forms", "nav.forms", Activity, "/forms"],
  ["settings", "nav.configuration", Settings, "/settings"],
];
const localeStorageKey = "acutis.community.locale";
export default function Workspace({ view }: { view: View }) {
  return <Content view={view} />;
}
function Content({ view }: { view: View }) {
  const { token, authenticated } = useProductSpaAuth();
  const status = authenticated ? "authenticated" : "unauthenticated";
  const [tenant, setTenant] = useState("");
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [dialog, setDialog] = useState<"person" | "appointment" | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [callAppointment, setCallAppointment] = useState<Appointment | null>(null);
  const [callError, setCallError] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") return "en-IE";
    const stored = window.localStorage.getItem(localeStorageKey);
    return stored === "ga-IE" || stored === "ar" ? stored : "en-IE";
  });
  const [theme, setTheme] = useState("default");
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );
  const load = useCallback(async () => {
    if (status !== "authenticated" || !token) return;
    setBusy(true);
    setError("");
    try {
      const a = await fetch(`${api}/api/access`, { headers });
      if (!a.ok) throw new Error("Unable to verify Community membership.");
      const m = (await a.json()) as { tenantId: string }[];
      if (!m[0]) throw new Error("No active Community membership.");
      setTenant(m[0].tenantId);
      const r = await fetch(`${api}/api/tenants/${m[0].tenantId}/dashboard`, {
        headers,
      });
      if (!r.ok)
        throw new Error(
          r.status === 403
            ? "Community access denied."
            : "Unable to load Community.",
        );
      setData(await r.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [headers, status, token]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionForLocale(locale);
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);
  const send = async (path: string, body: unknown, method = "POST") => {
    const r = await fetch(`${api}/api/tenants/${tenant}${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.text()) || "Request failed");
    const result = (await r.json()) as { joinUrl?: string };
    if (result.joinUrl) setInvitationUrl(result.joinUrl);
    setDialog(null);
    await load();
  };
  if (busy)
    return (
      <State locale={locale} theme={theme} title="Acutis Community" text={`${productText(locale, "common.loading")}…`} />
    );
  if (error || !data)
    return (
      <State
        locale={locale}
        theme={theme}
        title={productText(locale, "common.access_unavailable")}
        text={error || "No Community data is available."}
        retry={() => void load()}
      />
    );
  const schedule: ScheduleItem[] = data.appointments.map((x) => ({
    ...x,
    personName: x.participant?.displayName,
  }));
  const roles = parseRoles(data.currentRoles);
  const isLeadership = roles.some((role) => /manager|administrator/i.test(role));
  const activeView: View =
    view === "dashboard" && !isLeadership ? "appointments" : view;
  const join = async (item: ScheduleItem) => {
    setCallError("");
    try {
      const r = await fetch(
        `${api}/api/tenants/${tenant}/appointments/${item.id}/consultation/credentials`,
        { method: "POST", headers },
      );
      if (!r.ok) throw new Error(await r.text());
      const c = (await r.json()) as { serverUrl: string; accessToken: string };
      const next = new Room();
      await next.connect(c.serverUrl, c.accessToken);
      try {
        await next.localParticipant.setMicrophoneEnabled(true);
        await next.localParticipant.setCameraEnabled(true);
      } catch {
        next.disconnect();
        throw new Error(
          "Camera and microphone permission is required. Allow both devices in your browser site settings, then try again.",
        );
      }
      setRoom(next);
      setCallAppointment(data.appointments.find((appointment) => appointment.id === item.id) ?? null);
    } catch (error) {
      setCallError(
        error instanceof Error ? error.message : "Unable to join the video appointment.",
      );
    }
  };
  return (
    <div
      className="product community"
      data-theme={theme}
      dir={directionForLocale(locale)}
    >
      <header className="brand">
        <div className="brand-mark"><img src="/acutis-icon.svg" alt="" width={44} height={44} /></div>
        <div>
          <strong>Acutis</strong>
          <span>{productText(locale, "product.community")}</span>
        </div>
        <div className="brand-context">
          <label className="header-control">
            {productText(locale, "common.language")}
            <select value={locale} onChange={(event) => setLocale(event.target.value)}>
              <option value="en-IE">English</option>
              <option value="ga-IE">Gaeilge</option>
              <option value="ar">العربية</option>
            </select>
          </label>
          <label className="header-control">
            {productText(locale, "common.theme")}
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="default">{productText(locale, "common.theme.default")}</option>
              <option value="calm">{productText(locale, "common.theme.calm")}</option>
              <option value="dark">{productText(locale, "common.theme.dark")}</option>
            </select>
          </label>
          <ShieldCheck />
          <span>{roles.join(" · ") || productText(locale, "community.staff")}</span>
          <b>{productText(locale, "community.scope")}</b>
        </div>
      </header>
      <nav className="topnav">
        {nav.map(([k, l, I, h]) => (
          <a href={h} className={activeView === k ? "active" : ""} key={k}>
            <I />
            {productText(locale, l)}
          </a>
        ))}
      </nav>
      <main className="page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">{productText(locale, "community.eyebrow")}</span>
            <h1>{productText(locale, nav.find((x) => x[0] === activeView)?.[1] ?? "nav.dashboard")}</h1>
            <p>{productText(locale, "community.description")}</p>
          </div>
          <button className="outline" onClick={() => void load()}>
            <RefreshCw /> {productText(locale, "common.refresh")}
          </button>
        </div>
        {activeView === "dashboard" && (
          <Dashboard data={data} setDialog={setDialog} />
        )}{" "}
        {activeView === "appointments" && (
          <ClinicalCalendar
            items={schedule}
            locale={locale}
            onCreate={() => setDialog("appointment")}
            onOpen={(x) =>
              x.deliveryMode === "video" ? void join(x) : undefined
            }
          />
        )}{" "}
        {activeView === "service-users" && (
          <People data={data} onAdd={() => setDialog("person")} />
        )}{" "}
        {activeView === "assessments" && (
          <History
            title="Assessments"
            items={data.assessments.map((x) => ({
              id: x.id,
              name:
                data.serviceUsers.find((p) => p.id === x.participantId)
                  ?.displayName ?? "Service user",
              meta: x.assessmentType ?? "Assessment",
            }))}
          />
        )}{" "}
        {activeView === "care-plans" && (
          <History
            title="Care plans"
            items={data.carePlans.map((x) => ({
              id: x.id,
              name:
                data.serviceUsers.find((p) => p.id === x.participantId)
                  ?.displayName ?? "Service user",
              meta: x.status ?? "Draft",
            }))}
          />
        )}{" "}
        {activeView === "notes" && (
          <History
            title="Contact records"
            items={data.appointments
              .filter((x) => x.notes)
              .map((x) => ({ id: x.id, name: x.title, meta: x.notes! }))}
          />
        )}{" "}
        {activeView === "forms" && (
          <Panel title="Community forms">
            <p>
              Community assessments, assignments and responses remain isolated
              from Centre and Practitioner.
            </p>
          </Panel>
        )}{" "}
        {activeView === "settings" && (
          <SettingsView roles={roles} staff={data.staff} />
        )}{" "}
        {dialog && (
          <Modal
            title={dialog === "person" ? "Add service user" : "New appointment"}
            close={() => setDialog(null)}
          >
            {dialog === "person" ? (
              <PersonForm send={send} />
            ) : (
              <AppointmentForm people={data.serviceUsers} send={send} />
            )}
          </Modal>
        )}{" "}
        {room && (
          <VideoConsultation
            room={room}
            appointment={callAppointment}
            tenant={tenant}
            headers={headers}
            title="Community video appointment"
            onLeave={() => {
              room.disconnect();
              setRoom(null);
              setCallAppointment(null);
            }}
          />
        )}
        {invitationUrl && !room && (
          <div className="callbar" role="status"><Video /><strong>Guest invitation ready</strong><button onClick={() => void navigator.clipboard.writeText(invitationUrl)}>Copy join link</button><button onClick={() => setInvitationUrl("")}>Dismiss</button></div>
        )}
        {callError && !room && (
          <div className="callbar" role="alert">
            <Video />
            <strong>Unable to start video appointment</strong>
            <span>{callError}</span>
            <button onClick={() => setCallError("")}>Dismiss</button>
          </div>
        )}
      </main>
    </div>
  );
}
function VideoConsultation({
  room,
  appointment,
  tenant,
  headers,
  title,
  onLeave,
}: {
  room: Room;
  appointment: Appointment | null;
  tenant: string;
  headers: Record<string, string>;
  title: string;
  onLeave: () => void;
}) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const remoteAudio = useRef<HTMLDivElement>(null);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteName, setRemoteName] = useState("Waiting for the other participant");
  const initialCapture = parseConsultationCapture(appointment?.notes);
  const [notes, setNotes] = useState(initialCapture.notes);
  const [observations, setObservations] = useState(initialCapture.observations);
  const [inviteUrl, setInviteUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const localVideoElement = localVideo.current;
    const attachLocalCamera = () => {
      const publication = Array.from(
        room.localParticipant.videoTrackPublications.values(),
      ).find((candidate) => candidate.source === Track.Source.Camera);
      if (publication?.track && localVideoElement) publication.track.attach(localVideoElement);
    };
    const attachRemoteTrack = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      setRemoteName(participant.name || participant.identity);
      if (track.kind === Track.Kind.Video && remoteVideo.current) {
        track.attach(remoteVideo.current);
      } else if (track.kind === Track.Kind.Audio && remoteAudio.current) {
        remoteAudio.current.appendChild(track.attach());
      }
    };
    const detachRemoteTrack = (track: RemoteTrack) => {
      track.detach().forEach((element) => element.remove());
    };

    attachLocalCamera();
    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.track) attachRemoteTrack(publication.track, publication, participant);
      });
    });
    room.on(RoomEvent.TrackSubscribed, attachRemoteTrack);
    room.on(RoomEvent.TrackUnsubscribed, detachRemoteTrack);
    return () => {
      room.off(RoomEvent.TrackSubscribed, attachRemoteTrack);
      room.off(RoomEvent.TrackUnsubscribed, detachRemoteTrack);
      room.localParticipant.videoTrackPublications.forEach((publication) => {
        if (publication.track && localVideoElement) publication.track.detach(localVideoElement);
      });
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) =>
          publication.track?.detach().forEach((element) => element.remove()),
        );
      });
    };
  }, [room]);

  const toggleMicrophone = async () => {
    const enabled = !microphoneOn;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setMicrophoneOn(enabled);
  };
  const toggleCamera = async () => {
    const enabled = !cameraOn;
    await room.localParticipant.setCameraEnabled(enabled);
    setCameraOn(enabled);
    if (enabled) {
      const publication = Array.from(
        room.localParticipant.videoTrackPublications.values(),
      ).find((candidate) => candidate.source === Track.Source.Camera);
      if (publication?.track && localVideo.current) publication.track.attach(localVideo.current);
    }
  };
  const saveCapture = async () => {
    if (!appointment) return;
    setSaveStatus("Saving…");
    const response = await fetch(`${api}/api/tenants/${tenant}/appointments/${appointment.id}/consultation/capture`, { method: "PUT", headers, body: JSON.stringify({ notes, observations }) });
    setSaveStatus(response.ok ? "Saved" : "Unable to save");
  };
  const createInvitation = async () => {
    if (!appointment) return;
    const response = await fetch(`${api}/api/tenants/${tenant}/appointments/${appointment.id}/consultation/invitation`, { method: "POST", headers, body: JSON.stringify({ guestName: appointment.participant?.preferredName ?? appointment.participant?.displayName }) });
    if (!response.ok) { setSaveStatus("Unable to create invitation"); return; }
    const result = (await response.json()) as { joinUrl: string }; setInviteUrl(result.joinUrl); await navigator.clipboard.writeText(result.joinUrl); setSaveStatus("Guest link copied");
  };

  return (
    <div className="call-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="call-window">
        <header>
          <div>
            <span className="call-security"><ShieldCheck /> LiveKit encrypted</span>
            <h2>{title}</h2>
          </div>
          <strong className="call-connected">Connected</strong>
        </header>
        <div className="consultation-layout"><div className="call-stage">
          <div className="remote-feed">
            <video ref={remoteVideo} autoPlay playsInline />
            <span>{remoteName}</span>
          </div>
          <div className="local-feed">
            <video ref={localVideo} autoPlay muted playsInline />
            {!cameraOn && <span>Camera off</span>}
            <small>You</small>
          </div>
          <div ref={remoteAudio} className="remote-audio" />
        </div><aside className="consultation-capture"><h3>Consultation record</h3><label>Session notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Themes, support provided and agreed actions" /></label><label>Observations<textarea value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Presentation, engagement, wellbeing and safeguarding observations" /></label><div className="capture-actions"><button className="call-control" onClick={() => void saveCapture()}>Save record</button><button className="call-control" onClick={() => void createInvitation()}>Copy guest link</button></div>{inviteUrl && <input readOnly value={inviteUrl} aria-label="Guest join link" />}{saveStatus && <small>{saveStatus}</small>}</aside></div>
        <footer>
          <button className={microphoneOn ? "call-control" : "call-control off"} onClick={() => void toggleMicrophone()}>
            {microphoneOn ? "Mute microphone" : "Unmute microphone"}
          </button>
          <button className={cameraOn ? "call-control" : "call-control off"} onClick={() => void toggleCamera()}>
            {cameraOn ? "Turn camera off" : "Turn camera on"}
          </button>
          <button className="call-leave" onClick={onLeave}>Leave appointment</button>
        </footer>
      </section>
    </div>
  );
}
function parseConsultationCapture(value?: string) {
  if (!value) return { notes: "", observations: "" };
  try { const parsed = JSON.parse(value) as { notes?: string; observations?: string }; return { notes: parsed.notes ?? "", observations: parsed.observations ?? "" }; }
  catch { return { notes: value, observations: "" }; }
}
function parseRoles(value: string) {
  try {
    return (JSON.parse(value) as string[]).map((x) =>
      x.replace(/([a-z])([A-Z])/g, "$1 $2"),
    );
  } catch {
    return [];
  }
}
function State({ title, text, locale, theme, retry }: { title: string; text: string; locale: string; theme: string; retry?: () => void }) {
  return (
    <main className="state" data-theme={theme} dir={directionForLocale(locale)} aria-live="polite">
      <div className="brand-mark"><img src="/acutis-icon.svg" alt="" width={44} height={44} /></div>
      <h1>{title}</h1>
      <p>{text}</p>
      {retry && <button className="primary" type="button" onClick={retry}><RefreshCw /> {productText(locale, "common.retry")}</button>}
    </main>
  );
}
function Dashboard({
  data,
  setDialog,
}: {
  data: Data;
  setDialog: (x: "person" | "appointment") => void;
}) {
  const today = new Date().toDateString(),
    upcoming = data.appointments
      .filter((x) => new Date(x.startsAtUtc) >= new Date())
      .slice(0, 6);
  return (
    <>
      <section className="metrics">
        <Metric
          label="Active service users"
          value={data.serviceUsers.filter((x) => x.status === "active").length}
          note="Community participants"
          icon={<Users />}
        />
        <Metric
          label="Appointments today"
          value={
            data.appointments.filter(
              (x) => new Date(x.startsAtUtc).toDateString() === today,
            ).length
          }
          note="Contacts and groups"
          icon={<CalendarDays />}
        />
        <Metric
          label="Outreach contacts"
          value={
            data.appointments.filter((x) => /outreach/i.test(x.notes ?? ""))
              .length
          }
          note="Community locations"
          icon={<MapPin />}
        />
        <Metric
          label="Video appointments"
          value={
            data.appointments.filter((x) => x.deliveryMode === "video").length
          }
          note="Secure LiveKit rooms"
          icon={<Video />}
        />
      </section>
      <section className="quick">
        <h2>Quick actions</h2>
        <div>
          <button onClick={() => setDialog("person")}>
            <Users />
            <b>Add service user</b>
            <span>Create a Community record</span>
          </button>
          <button onClick={() => setDialog("appointment")}>
            <CalendarDays />
            <b>New appointment</b>
            <span>Contact, group or video</span>
          </button>
          <a href="/assessments">
            <ClipboardCheck />
            <b>Assessment</b>
            <span>Needs, strengths and safety</span>
          </a>
          <a href="/care-plans">
            <HeartHandshake />
            <b>Care plan</b>
            <span>Goals, supports and actions</span>
          </a>
        </div>
      </section>
      <div className="dashboard-grid">
        <Panel title="Community timeline">
          <div className="timeline">
            {upcoming.map((x) => (
              <article key={x.id}>
                <time>
                  {new Date(x.startsAtUtc).toLocaleTimeString("en-IE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <i />
                <div>
                  <b>{x.title}</b>
                  <span>
                    {x.participant?.displayName ?? "Community event"} ·{" "}
                    {x.deliveryMode}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Community programmes">
          <div className="programmes">
            {data.programmes.map((x) => (
              <article key={x.code}>
                <span>{x.code}</span>
                <div>
                  <b>{x.name}</b>
                  <small>
                    {x.sessions} sessions · {x.cadence}
                  </small>
                  <p>{x.modules.join(" · ")}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="metric">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function People({ data, onAdd }: { data: Data; onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const people = data.serviceUsers.filter((person) => `${person.displayName} ${person.preferredName ?? ""} ${person.email ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Panel title="Community service users">
      <div className="table-head">
        <p>{data.serviceUsers.length} active service-user records</p>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search service users" aria-label="Search service users" />
        <button className="primary" onClick={onAdd}>
          + Add service user
        </button>
      </div>
      <div className="data-table">
        <div className="tr th">
          <span>Service user</span>
          <span>Contact</span>
          <span>Community worker</span>
          <span>Status</span>
        </div>
        {people.map((x) => (
          <div className="tr" key={x.id}>
            <span>
              <b>{x.displayName}</b>
              <small>{x.preferredName}</small>
            </span>
            <span>
              {x.email}
              <small>{x.phone}</small>
            </span>
            <span>{x.staffDisplayName}</span>
            <span>
              <em>{x.status}</em>
            </span>
          </div>
        ))}
        {people.length === 0 && <div className="empty-directory"><Users /><strong>No service users match this view</strong><span>Clear the search or add a service user.</span></div>}
      </div>
    </Panel>
  );
}
function History({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string; meta: string }[];
}) {
  return (
    <Panel title={title}>
      <div className="record-list">
        {items.map((x) => (
          <article key={x.id}>
            <FileText />
            <div>
              <b>{x.name}</b>
              <span>{x.meta}</span>
            </div>
          </article>
        ))}
        {items.length === 0 && <p className="empty-directory">{productText(document.documentElement.lang || "en-IE", "common.no_records")}</p>}
      </div>
    </Panel>
  );
}
function SettingsView({
  roles,
  staff,
}: {
  roles: string[];
  staff: { subject: string; roles: string }[];
}) {
  const leadership = roles.some((role) => /manager|administrator/i.test(role));
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(() => {
    const defaults = { dayStart: "08:00", dayEnd: "18:00", appointmentMinutes: "60", videoInvitations: true, safeguardingPrompt: true };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem("acutis.community.settings") ?? "{}") as object }; } catch { return defaults; }
  });
  const save = () => { localStorage.setItem("acutis.community.settings", JSON.stringify(settings)); setSaved(true); };
  return (
    <div className="settings-layout">
      <Panel title={leadership ? "Community service configuration" : "My working preferences"}>
        <div className="settings-form"><label>Working day starts<input type="time" value={settings.dayStart} onChange={(event) => setSettings({ ...settings, dayStart: event.target.value })} /></label><label>Working day ends<input type="time" value={settings.dayEnd} onChange={(event) => setSettings({ ...settings, dayEnd: event.target.value })} /></label><label>Default appointment length<select value={settings.appointmentMinutes} onChange={(event) => setSettings({ ...settings, appointmentMinutes: event.target.value })}><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option></select></label><label className="check"><input type="checkbox" checked={settings.videoInvitations} onChange={(event) => setSettings({ ...settings, videoInvitations: event.target.checked })} />Generate guest links for video appointments</label><label className="check"><input type="checkbox" checked={settings.safeguardingPrompt} onChange={(event) => setSettings({ ...settings, safeguardingPrompt: event.target.checked })} />Show safeguarding observations during consultation</label><button className="primary" onClick={save}>Save configuration</button>{saved && <small>Configuration saved on this device.</small>}</div>
      </Panel>
      <Panel title="My access">
        <p>{roles.join(", ") || "Community staff"}</p>
        <p>Community membership and roles are enforced by the Community API.</p>
      </Panel>
      <Panel title="Service defaults"><p>CBT, DBT and Gambling Recovery are available for programme scheduling.</p><p>Irish Gaelic and Arabic RTL remain available across Community screens.</p></Panel>
      <Panel title="Community team">
        <div className="record-list">
          {staff.map((x) => (
            <article key={x.subject}>
              <ShieldCheck />
              <div>
                <b>{x.subject}</b>
                <span>{parseRoles(x.roles).join(" · ")}</span>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button onClick={close}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
function PersonForm({
  send,
}: {
  send: (p: string, b: unknown, m?: string) => Promise<void>;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void send("/service-users", {
      displayName: f.get("name"),
      preferredName: f.get("preferred"),
      phone: f.get("phone"),
      email: f.get("email"),
      referralSource: f.get("referral"),
    });
  };
  return (
    <form onSubmit={submit}>
      <label>
        Service user name
        <input name="name" required />
      </label>
      <label>
        Preferred name
        <input name="preferred" />
      </label>
      <div className="form-grid">
        <label>
          Phone
          <input name="phone" />
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
      </div>
      <label>
        Referral source
        <input name="referral" />
      </label>
      <button className="primary">Save service user</button>
    </form>
  );
}
function AppointmentForm({
  people,
  send,
}: {
  people: Person[];
  send: (p: string, b: unknown, m?: string) => Promise<void>;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      start = new Date(String(f.get("start")));
    void send("/appointments", {
      participantId: f.get("person") || null,
      appointmentType: f.get("type"),
      title: f.get("title"),
      startsAtUtc: start.toISOString(),
      endsAtUtc: new Date(
        start.getTime() + Number(f.get("duration")) * 60000,
      ).toISOString(),
      deliveryMode: f.get("delivery"),
      status: "scheduled",
      notes: f.get("notes"),
    });
  };
  return (
    <form onSubmit={submit}>
      <label>
        Service user
        <select name="person">
          <option value="">Community event</option>
          {people.map((x) => (
            <option value={x.id} key={x.id}>
              {x.displayName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input name="title" required />
      </label>
      <div className="form-grid">
        <label>
          Type
          <select name="type">
            <option value="community-session">Community contact</option>
            <option value="group-meeting">Programme group</option>
            <option value="initial-assessment">Assessment</option>
          </select>
        </label>
        <label>
          Delivery
          <select name="delivery">
            <option value="in-person">In person</option>
            <option value="video">Secure video</option>
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>
          Starts
          <input name="start" type="datetime-local" required />
        </label>
        <label>
          Duration
          <select name="duration">
            <option value="50">50 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </label>
      </div>
      <label>
        Contact notes
        <textarea name="notes" />
      </label>
      <button className="primary">Save appointment</button>
    </form>
  );
}
