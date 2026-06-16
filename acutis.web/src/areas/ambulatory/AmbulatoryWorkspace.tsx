"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  Mic,
  Minus,
  Plus,
  RefreshCw,
  UserPlus,
  UserRound,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { isAuthorizedClient } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { useSectionDictation } from "@/features/voice/useSectionDictation";
import {
  ambulatoryLocalConfigs,
  ambulatoryLocalTranslations,
  type AmbulatoryIconKey,
  type AmbulatoryLocalConfig,
  type AmbulatoryQuickLinkKey,
} from "./ambulatoryConfig";
import {
  ambulatoryService,
  type AmbulatoryAppointment,
  type AmbulatoryDashboard,
  type AmbulatoryParticipant,
  type AmbulatoryProgramme,
  type AmbulatoryProgrammeOffering,
  type UpsertAmbulatoryAppointmentRequest,
} from "@/services/ambulatoryService";
import { JitsiSessionFrame } from "./JitsiSessionFrame";

type AmbulatoryWorkspaceProps = {
  programme: AmbulatoryProgramme;
};

type DialogMode = "participant" | "assessment" | "care-plan" | "appointment" | "session" | null;
type CalendarMode = "day" | "work-week" | "month";
type AppointmentDraftDefaults = { startsAt: string; endsAt: string } | null;

const appointmentTypes = [
  { value: "individual-therapy", label: "One to One Therapy" },
  { value: "group-meeting", label: "Group Meeting" },
  { value: "initial-assessment", label: "Initial Assessment" },
  { value: "full-assessment", label: "Full Assessment" },
] as const;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iconMap: Record<AmbulatoryIconKey, LucideIcon> = {
  assessment: ClipboardCheck,
  calendar: CalendarDays,
  "care-plan": FileText,
  location: MapPin,
  meeting: Users,
  participant: UserRound,
  programme: BriefcaseBusiness,
  report: FileText,
  therapy: UserRound,
  video: Video,
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  const diff = date.getDay() === 0 ? -6 : 1 - date.getDay();
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function toLocalInputValue(date = new Date()) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}

function addMinutes(localDateTime: string, minutes: number) {
  const date = new Date(localDateTime);
  date.setMinutes(date.getMinutes() + minutes);
  return toLocalInputValue(date);
}

function addMinutesToDate(date: Date, minutes: number) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
}

function buildTimeSlots(startHour: number, endHour: number, slotMinutes: number) {
  const slots: number[] = [];
  for (let minutes = startHour * 60; minutes < endHour * 60; minutes += slotMinutes) {
    slots.push(minutes);
  }
  return slots;
}

function dateKeyLocal(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function setMinutesOnDay(day: Date, minutes: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60);
}

function durationInMinutes(appointment: AmbulatoryAppointment) {
  return Math.max(30, Math.round((new Date(appointment.endsAtUtc).getTime() - new Date(appointment.startsAtUtc).getTime()) / 60000));
}

function toUtc(localDateTime: string) {
  return new Date(localDateTime).toISOString();
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });
}

function formatSlot(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IE", { weekday: "short", day: "2-digit", month: "short" });
}

function appointmentTypeLabel(value: string) {
  return appointmentTypes.find((item) => item.value === value)?.label ?? value;
}

function isSameDate(value: string, date: Date) {
  const candidate = new Date(value);
  return candidate.getFullYear() === date.getFullYear() &&
    candidate.getMonth() === date.getMonth() &&
    candidate.getDate() === date.getDate();
}

function locationFromNotes(notes?: string | null) {
  const match = notes?.match(/Location:\s*([^.;]+)/i);
  return match?.[1]?.trim() ?? null;
}

function hasReportDue(appointment: AmbulatoryAppointment) {
  return /report due/i.test(appointment.notes ?? "") || /meeting/i.test(appointment.title);
}

export default function AmbulatoryWorkspace({ programme }: AmbulatoryWorkspaceProps) {
  const config = ambulatoryLocalConfigs[programme];
  const { t, mergeTranslations } = useLocalization();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboard, setDashboard] = useState<AmbulatoryDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => config.calendar.defaultMode === "month" || config.calendar.defaultMode === "day" ? config.calendar.defaultMode : "work-week");
  const [anchorDate, setAnchorDate] = useState(startOfDay(new Date()));
  const [appointmentDefaults, setAppointmentDefaults] = useState<AppointmentDraftDefaults>(null);

  useEffect(() => {
    mergeTranslations(ambulatoryLocalTranslations);
  }, [mergeTranslations]);

  const participants = useMemo(() => dashboard?.participants ?? [], [dashboard?.participants]);
  const appointments = useMemo(() => dashboard?.appointments ?? [], [dashboard?.appointments]);
  const offerings = useMemo(() => dashboard?.programmeOfferings ?? [], [dashboard?.programmeOfferings]);
  const selectedParticipant = useMemo(
    () => participants.find((participant) => participant.id === selectedParticipantId) ?? participants[0] ?? null,
    [participants, selectedParticipantId],
  );
  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0] ?? null,
    [appointments, selectedAppointmentId],
  );

  const refresh = useCallback(async () => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      setLoading(status === "loading");
      setError(status === "authenticated" && !session?.accessToken ? "Your session is missing an API access token. Log out and back in to refresh it." : null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await ambulatoryService.getDashboard(programme, session?.accessToken);
      setDashboard(next);
      setSelectedParticipantId((current) => current ?? next.participants[0]?.id ?? null);
      setSelectedAppointmentId((current) => current ?? next.appointments[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [programme, session?.accessToken, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openDialog = (mode: DialogMode, options?: { participant?: AmbulatoryParticipant; appointment?: AmbulatoryAppointment; defaults?: AppointmentDraftDefaults }) => {
    setDialogError(null);
    if (options?.participant) setSelectedParticipantId(options.participant.id);
    if (options?.appointment) setSelectedAppointmentId(options.appointment.id);
    setAppointmentDefaults(options?.defaults ?? null);
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setDialogError(null);
    setAppointmentDefaults(null);
    setDialogMode(null);
  };

  const todayAppointments = appointments.filter((appointment) => isSameDate(appointment.startsAtUtc, anchorDate));
  const officeToday = todayAppointments.filter((appointment) => (locationFromNotes(appointment.notes) ?? "").toLowerCase().includes("office")).length;
  const outreachToday = todayAppointments.filter((appointment) => (locationFromNotes(appointment.notes) ?? "").toLowerCase().includes("shelter")).length;
  const reportsDueToday = todayAppointments.filter(hasReportDue).length;
  const clinicalDisplayName =
    participants.find((participant) => participant.counsellorDisplayName)?.counsellorDisplayName ??
    session?.user?.name ??
    "Counsellor";

  const buildAppointmentPayload = (appointment: AmbulatoryAppointment, startsAt: Date, endsAt: Date): UpsertAmbulatoryAppointmentRequest => ({
    participantId: appointment.participantId ?? null,
    appointmentType: appointment.appointmentType as UpsertAmbulatoryAppointmentRequest["appointmentType"],
    title: appointment.title,
    startsAtUtc: startsAt.toISOString(),
    endsAtUtc: endsAt.toISOString(),
    deliveryMode: appointment.deliveryMode === "video" ? "video" : "in-person",
    notes: appointment.notes ?? "",
  });

  const updateAppointmentTime = async (appointment: AmbulatoryAppointment, startsAt: Date, endsAt: Date) => {
    if (appointment.isFixed) {
      setError("This is a fixed programme session and requires administrator rights to change.");
      return;
    }

    if (endsAt <= startsAt) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setError(null);
      await ambulatoryService.updateAppointment(programme, appointment.id, buildAppointmentPayload(appointment, startsAt, endsAt), session?.accessToken);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const moveAppointment = async (appointmentId: string, day: Date, slotMinutes: number) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;
    const nextStart = setMinutesOnDay(day, slotMinutes);
    await updateAppointmentTime(appointment, nextStart, addMinutesToDate(nextStart, durationInMinutes(appointment)));
  };

  const resizeAppointment = async (appointment: AmbulatoryAppointment, deltaMinutes: number) => {
    const start = new Date(appointment.startsAtUtc);
    const nextDuration = Math.max(config.calendar.slotMinutes, durationInMinutes(appointment) + deltaMinutes);
    await updateAppointmentTime(appointment, start, addMinutesToDate(start, nextDuration));
  };

  const createAppointmentAt = (day: Date, slotMinutes: number) => {
    const startsAt = toLocalInputValue(setMinutesOnDay(day, slotMinutes));
    openDialog("appointment", { defaults: { startsAt, endsAt: addMinutes(startsAt, config.calendar.slotMinutes) } });
  };

  const exportAppointments = (items: AmbulatoryAppointment[]) => {
    const escapeIcs = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const events = items.map((appointment) => {
      const start = new Date(appointment.startsAtUtc).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
      const end = new Date(appointment.endsAtUtc).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
      return [
        "BEGIN:VEVENT",
        `UID:${appointment.id}@acutis`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(appointment.title)}`,
        `DESCRIPTION:${escapeIcs(appointment.notes ?? appointmentTypeLabel(appointment.appointmentType))}`,
        "END:VEVENT",
      ].join("\r\n");
    }).join("\r\n");
    const blob = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Acutis//Ambulatory Schedule//EN\r\n${events}\r\nEND:VCALENDAR\r\n`], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `acutis-schedule-${dateKeyLocal(anchorDate)}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = (appointment: AmbulatoryAppointment | null) => {
    if (!appointment) return;
    const formatGoogleDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: appointment.title,
      dates: `${formatGoogleDate(appointment.startsAtUtc)}/${formatGoogleDate(appointment.endsAtUtc)}`,
      details: appointment.notes ?? appointmentTypeLabel(appointment.appointmentType),
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const runQuickLink = (key: AmbulatoryQuickLinkKey) => {
    if (key === "today") {
      setAnchorDate(startOfDay(new Date()));
      setCalendarMode("day");
      return;
    }
    if (key === "new-appointment") {
      openDialog("appointment");
      return;
    }
    if (key === "start-remote") {
      const remote = todayAppointments.find((appointment) => appointment.deliveryMode === "video" && appointment.avJoinUrl) ??
        appointments.find((appointment) => appointment.deliveryMode === "video" && appointment.avJoinUrl);
      if (remote) openDialog("session", { appointment: remote });
      return;
    }
    if (key === "assessment" && selectedParticipant) {
      openDialog("assessment", { participant: selectedParticipant });
      return;
    }
    if (key === "report") {
      const report = todayAppointments.find(hasReportDue);
      if (report) openDialog("session", { appointment: report });
      return;
    }
    if (key === "programmes") {
      document.getElementById("ambulatory-programmes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="app-page-shell min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => router.push("/")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--app-primary)]">{t(config.eyebrowKey)}</p>
            <h1 className="mt-2 text-4xl font-bold text-[var(--app-text)]">{t(config.titleKey)}</h1>
          </div>
          <div className={`rounded-lg border bg-[var(--app-surface)] px-4 py-3 text-sm font-semibold shadow-sm ${config.badgeClass}`}>
            {formatDate(anchorDate)}
          </div>
        </header>

        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}

        {!loading && dashboard && (
          <div className="mt-6 space-y-6">
            <QuickLinks config={config} t={t} onAction={runQuickLink} />

            <div className="grid gap-4 md:grid-cols-4">
              <Metric label={t("ambulatory.metric.appointments_today")} value={todayAppointments.length} Icon={CalendarDays} />
              <Metric label={t("ambulatory.metric.in_office")} value={officeToday} Icon={Users} />
              <Metric label={t("ambulatory.metric.outreach")} value={outreachToday} Icon={MapPin} />
              <Metric label={t("ambulatory.metric.reports_due")} value={reportsDueToday} Icon={FileText} />
            </div>

            <CalendarBoard
              config={config}
              t={t}
              mode={calendarMode}
              anchorDate={anchorDate}
              appointments={appointments}
              onModeChange={setCalendarMode}
              onAnchorChange={setAnchorDate}
              onNewAppointment={() => openDialog("appointment")}
              onOpenSession={(appointment) => openDialog("session", { appointment })}
              onCreateAt={createAppointmentAt}
              onMoveAppointment={(appointmentId, day, slotMinutes) => void moveAppointment(appointmentId, day, slotMinutes)}
              onResizeAppointment={(appointment, deltaMinutes) => void resizeAppointment(appointment, deltaMinutes)}
              onExportOutlook={exportAppointments}
              onExportGoogle={() => openGoogleCalendar(selectedAppointment)}
            />

            <TodayAgenda t={t} appointments={todayAppointments} onOpenSession={(appointment) => openDialog("session", { appointment })} />

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <CaseloadPanel
                config={config}
                t={t}
                participants={participants}
                selectedParticipant={selectedParticipant}
                onAdd={() => openDialog("participant")}
                onSelect={(participant) => setSelectedParticipantId(participant.id)}
                onAssessment={(participant) => openDialog("assessment", { participant })}
                onCarePlan={(participant) => openDialog("care-plan", { participant })}
                onAppointment={(participant) => openDialog("appointment", { participant })}
              />
              <ProgrammePanel t={t} offerings={offerings} onBook={() => openDialog("appointment")} />
            </div>
          </div>
        )}
      </div>

      <ParticipantDialog open={dialogMode === "participant"} config={config} t={t} error={dialogError} onClose={closeDialog} onSubmit={async (payload) => {
        try {
          setDialogError(null);
          const created = await ambulatoryService.createParticipant(programme, payload, session?.accessToken);
          setSelectedParticipantId(created.id);
          await refresh();
          closeDialog();
        } catch (e) {
          setDialogError((e as Error).message);
        }
      }} />
      <AssessmentDialog open={dialogMode === "assessment"} participant={selectedParticipant} programme={programme} accessToken={session?.accessToken} error={dialogError} onError={setDialogError} onClose={closeDialog} onSaved={refresh} />
      <CarePlanDialog open={dialogMode === "care-plan"} participant={selectedParticipant} programme={programme} accessToken={session?.accessToken} error={dialogError} onError={setDialogError} onClose={closeDialog} onSaved={refresh} />
      <AppointmentDialog open={dialogMode === "appointment"} config={config} defaults={appointmentDefaults} participants={participants} selectedParticipant={selectedParticipant} programme={programme} accessToken={session?.accessToken} allowVideo error={dialogError} onError={setDialogError} onClose={closeDialog} onSaved={refresh} />
      <SessionDialog open={dialogMode === "session"} appointment={selectedAppointment} displayName={clinicalDisplayName} jwt={session?.accessToken} onClose={closeDialog} />
    </main>
  );
}

function Metric({ label, value, Icon }: { label: string; value: number; Icon: LucideIcon }) {
  return (
    <div className="app-card rounded-xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--app-text-muted)]">{label}</span>
        <Icon className="h-5 w-5 text-[var(--app-primary)]" />
      </div>
      <p className="mt-3 text-3xl font-bold text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function QuickLinks({
  config,
  t,
  onAction,
}: {
  config: AmbulatoryLocalConfig;
  t: (key: string) => string;
  onAction: (key: AmbulatoryQuickLinkKey) => void;
}) {
  return (
    <section className="app-card rounded-xl p-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {config.quickLinks.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <button
              key={link.key}
              type="button"
              onClick={() => onAction(link.key)}
              className="flex min-h-20 min-w-36 flex-col items-start justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-left shadow-sm"
            >
              <Icon className="h-5 w-5 text-[var(--app-primary)]" />
              <span className="text-sm font-semibold text-[var(--app-text)]">{t(link.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getAppointmentVisual(appointment: AmbulatoryAppointment): {
  Icon: LucideIcon;
  className: string;
} {
  if (hasReportDue(appointment)) {
    return { Icon: FileText, className: "border-amber-300 bg-amber-50 text-amber-950" };
  }
  if (appointment.deliveryMode === "video") {
    return { Icon: Video, className: "border-indigo-300 bg-indigo-50 text-indigo-950" };
  }
  if (locationFromNotes(appointment.notes)?.toLowerCase().includes("shelter")) {
    return { Icon: MapPin, className: "border-rose-300 bg-rose-50 text-rose-950" };
  }
  if (appointment.appointmentType === "initial-assessment" || appointment.appointmentType === "full-assessment") {
    return { Icon: ClipboardCheck, className: "border-sky-300 bg-sky-50 text-sky-950" };
  }
  if (appointment.appointmentType === "group-meeting") {
    return { Icon: Users, className: "border-violet-300 bg-violet-50 text-violet-950" };
  }
  return { Icon: UserRound, className: "border-emerald-300 bg-emerald-50 text-emerald-950" };
}

function CalendarAppointmentCard({
  appointment,
  slotMinutes,
  onOpen,
  onResize,
}: {
  appointment: AmbulatoryAppointment;
  slotMinutes: number;
  onOpen: () => void;
  onResize: (deltaMinutes: number) => void;
}) {
  const visual = getAppointmentVisual(appointment);
  const Icon = visual.Icon;
  const duration = durationInMinutes(appointment);
  return (
    <button
      type="button"
      onClick={onOpen}
      draggable={!appointment.isFixed}
      onDragStart={(event) => {
        if (appointment.isFixed) return;
        event.dataTransfer.setData("text/ambulatory-appointment", appointment.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={`group w-full rounded-lg border px-3 py-2 text-left shadow-sm ${visual.className}`}
      style={{ minHeight: Math.max(44, Math.ceil(duration / slotMinutes) * 38) }}
    >
      <span className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          {formatTime(appointment.startsAtUtc)} · {duration}m
        </span>
        {appointment.isFixed && <Lock className="h-3.5 w-3.5" />}
      </span>
      <span className="mt-1 block text-sm font-semibold leading-tight">{appointment.title}</span>
      <span className="mt-1 block text-xs opacity-80">{locationFromNotes(appointment.notes) ?? appointmentTypeLabel(appointment.appointmentType)}</span>
      {!appointment.isFixed && (
        <span className="mt-2 flex gap-1 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => { event.stopPropagation(); onResize(-slotMinutes); }}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onResize(-slotMinutes); } }}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-current/20 bg-white/70"
          >
            <Minus className="h-3.5 w-3.5" />
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => { event.stopPropagation(); onResize(slotMinutes); }}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onResize(slotMinutes); } }}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-current/20 bg-white/70"
          >
            <Plus className="h-3.5 w-3.5" />
          </span>
        </span>
      )}
    </button>
  );
}

function CalendarBoard({
  config,
  t,
  mode,
  anchorDate,
  appointments,
  onModeChange,
  onAnchorChange,
  onNewAppointment,
  onOpenSession,
  onCreateAt,
  onMoveAppointment,
  onResizeAppointment,
  onExportOutlook,
  onExportGoogle,
}: {
  config: AmbulatoryLocalConfig;
  t: (key: string) => string;
  mode: CalendarMode;
  anchorDate: Date;
  appointments: AmbulatoryAppointment[];
  onModeChange: (mode: CalendarMode) => void;
  onAnchorChange: (date: Date) => void;
  onNewAppointment: () => void;
  onOpenSession: (appointment: AmbulatoryAppointment) => void;
  onCreateAt: (day: Date, slotMinutes: number) => void;
  onMoveAppointment: (appointmentId: string, day: Date, slotMinutes: number) => void;
  onResizeAppointment: (appointment: AmbulatoryAppointment, deltaMinutes: number) => void;
  onExportOutlook: (appointments: AmbulatoryAppointment[]) => void;
  onExportGoogle: () => void;
}) {
  const visibleDays = useMemo(() => {
    if (mode === "day") return [anchorDate];
    if (mode === "work-week") return Array.from({ length: config.calendar.workWeekDays }, (_, index) => addDays(startOfWeek(anchorDate), index));
    const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const start = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [anchorDate, config.calendar.workWeekDays, mode]);

  const slots = useMemo(() => buildTimeSlots(config.calendar.startHour, config.calendar.endHour, config.calendar.slotMinutes), [config.calendar.endHour, config.calendar.slotMinutes, config.calendar.startHour]);
  const visibleAppointments = appointments.filter((appointment) => visibleDays.some((day) => isSameDate(appointment.startsAtUtc, day)));
  const step = mode === "month" ? 30 : mode === "work-week" ? config.calendar.workWeekDays : 1;
  const title = mode === "month"
    ? anchorDate.toLocaleDateString("en-IE", { month: "long", year: "numeric" })
    : `${formatDate(visibleDays[0])} - ${formatDate(visibleDays[visibleDays.length - 1])}`;
  const modeLabels: Record<CalendarMode, string> = {
    day: "Day",
    "work-week": `${config.calendar.workWeekDays} Day`,
    month: "Month",
  };

  return (
    <section className="app-card rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--app-text)]">{t("ambulatory.calendar.title")}</h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onAnchorChange(addDays(anchorDate, -step))} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => onAnchorChange(startOfDay(new Date()))} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold">{t("ambulatory.calendar.today")}</button>
          <button type="button" onClick={() => onAnchorChange(addDays(anchorDate, step))} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"><ChevronRight className="h-4 w-4" /></button>
          <div className="ml-1 inline-flex overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]">
            {(["day", "work-week", "month"] as CalendarMode[]).map((item) => (
              <button key={item} type="button" onClick={() => onModeChange(item)} className={`px-3 py-2 text-sm font-semibold ${mode === item ? config.selectedClass : "text-[var(--app-text-muted)]"}`}>{modeLabels[item]}</button>
            ))}
          </div>
          <button type="button" onClick={() => onExportOutlook(visibleAppointments)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
            <Download className="h-4 w-4" />
            Outlook
          </button>
          <button type="button" onClick={onExportGoogle} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
            <ExternalLink className="h-4 w-4" />
            Google
          </button>
          <button type="button" onClick={onNewAppointment} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white ${config.primaryClass}`}>
            <Plus className="h-4 w-4" />
            {t("ambulatory.calendar.new_appointment")}
          </button>
        </div>
      </div>

      {mode !== "month" ? (
        <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="min-w-[860px]">
            <div className="grid border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]" style={{ gridTemplateColumns: `84px repeat(${visibleDays.length}, minmax(150px, 1fr))` }}>
              <div className="px-3 py-3 text-xs font-semibold uppercase text-[var(--app-text-muted)]">Time</div>
              {visibleDays.map((day) => (
                <div key={dateKeyLocal(day)} className="border-l border-[var(--app-border)] px-3 py-3">
                  <p className="text-xs font-semibold uppercase text-[var(--app-text-muted)]">{dayNames[day.getDay()]}</p>
                  <p className="text-sm font-bold text-[var(--app-text)]">{day.getDate()}</p>
                </div>
              ))}
            </div>
            {slots.map((slot) => (
              <div key={slot} className="grid min-h-[58px] border-b border-[var(--app-border)] last:border-b-0" style={{ gridTemplateColumns: `84px repeat(${visibleDays.length}, minmax(150px, 1fr))` }}>
                <div className="border-r border-[var(--app-border)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)]">{formatSlot(slot)}</div>
                {visibleDays.map((day) => {
                  const cellAppointments = appointments
                    .filter((appointment) => isSameDate(appointment.startsAtUtc, day))
                    .filter((appointment) => {
                      const start = new Date(appointment.startsAtUtc);
                      return start.getHours() * 60 + start.getMinutes() === slot;
                    });
                  return (
                    <div
                      key={`${dateKeyLocal(day)}-${slot}`}
                      onContextMenu={(event) => { event.preventDefault(); onCreateAt(day, slot); }}
                      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const id = event.dataTransfer.getData("text/ambulatory-appointment");
                        if (id) onMoveAppointment(id, day, slot);
                      }}
                      className="border-l border-[var(--app-border)] p-1.5 transition hover:bg-[var(--app-surface-muted)]"
                    >
                      <div className="space-y-1.5">
                        {cellAppointments.map((appointment) => (
                          <CalendarAppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            slotMinutes={config.calendar.slotMinutes}
                            onOpen={() => onOpenSession(appointment)}
                            onResize={(deltaMinutes) => onResizeAppointment(appointment, deltaMinutes)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {visibleDays.map((day) => {
            const dateKey = dateKeyLocal(day);
            const dayAppointments = appointments.filter((appointment) => isSameDate(appointment.startsAtUtc, day));
            const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
            return (
              <div key={dateKey} className={`min-h-40 rounded-lg border p-3 ${isCurrentMonth ? "border-[var(--app-border)] bg-[var(--app-surface)]" : "border-[var(--app-border)] bg-[var(--app-surface-muted)] opacity-70"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-500">{dayNames[day.getDay()]}</span>
                  <span className="text-sm font-bold text-gray-950">{day.getDate()}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {dayAppointments.slice(0, 4).map((appointment) => (
                    <CalendarAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      slotMinutes={config.calendar.slotMinutes}
                      onOpen={() => onOpenSession(appointment)}
                      onResize={(deltaMinutes) => onResizeAppointment(appointment, deltaMinutes)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TodayAgenda({
  t,
  appointments,
  onOpenSession,
}: {
  t: (key: string) => string;
  appointments: AmbulatoryAppointment[];
  onOpenSession: (appointment: AmbulatoryAppointment) => void;
}) {
  const sorted = [...appointments].sort((a, b) => a.startsAtUtc.localeCompare(b.startsAtUtc));
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">{t("ambulatory.agenda.title")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("ambulatory.agenda.subtitle")}</p>
        </div>
      </div>
      <div className="mt-5 divide-y divide-gray-100">
        {sorted.length === 0 && <p className="py-5 text-sm text-gray-500">No appointments for this day.</p>}
        {sorted.map((appointment) => {
          const location = locationFromNotes(appointment.notes);
          const reportDue = hasReportDue(appointment);
          return (
            <div key={appointment.id} className="grid gap-4 py-4 md:grid-cols-[96px_1fr_auto] md:items-center">
              <div className="text-sm font-bold text-gray-950">{formatTime(appointment.startsAtUtc)}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-950">{appointment.title}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{appointmentTypeLabel(appointment.appointmentType)}</span>
                  {reportDue && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Report due</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{appointment.participantName ?? "Meeting"}</span>
                  <span>{appointment.deliveryMode === "video" ? "Remote" : "In person"}</span>
                  {location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>}
                </div>
              </div>
              <button type="button" onClick={() => onOpenSession(appointment)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                {appointment.deliveryMode === "video" ? <Video className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                {appointment.deliveryMode === "video" ? "Start" : "Open"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CaseloadPanel({
  config,
  t,
  participants,
  selectedParticipant,
  onAdd,
  onSelect,
  onAssessment,
  onCarePlan,
  onAppointment,
}: {
  config: AmbulatoryLocalConfig;
  t: (key: string) => string;
  participants: AmbulatoryParticipant[];
  selectedParticipant: AmbulatoryParticipant | null;
  onAdd: () => void;
  onSelect: (participant: AmbulatoryParticipant) => void;
  onAssessment: (participant: AmbulatoryParticipant) => void;
  onCarePlan: (participant: AmbulatoryParticipant) => void;
  onAppointment: (participant: AmbulatoryParticipant) => void;
}) {
  return (
    <section className="app-card rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">{t("ambulatory.caseload.title")}</h2>
        <button type="button" onClick={onAdd} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"><UserPlus className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 space-y-2">
        {participants.map((participant) => (
          <button key={participant.id} type="button" onClick={() => onSelect(participant)} className={`w-full rounded-lg border px-3 py-3 text-left ${selectedParticipant?.id === participant.id ? config.selectedClass : "border-[var(--app-border)] bg-[var(--app-surface)]"}`}>
            <span className="block font-semibold text-gray-950">{participant.displayName}</span>
            <span className="text-xs text-gray-500">{participant.currentCarePlan?.reviewDate ? `Review ${participant.currentCarePlan.reviewDate}` : "Care plan needed"}</span>
          </button>
        ))}
      </div>
      {selectedParticipant && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <ActionButton label="Assessment" Icon={ClipboardCheck} onClick={() => onAssessment(selectedParticipant)} />
          <ActionButton label="Care Plan" Icon={FileText} onClick={() => onCarePlan(selectedParticipant)} />
          <ActionButton label="One to One" Icon={CalendarDays} onClick={() => onAppointment(selectedParticipant)} />
          <ActionButton label="Remote" Icon={Video} onClick={() => onAppointment(selectedParticipant)} />
        </div>
      )}
    </section>
  );
}

function ProgrammePanel({ t, offerings, onBook }: { t: (key: string) => string; offerings: AmbulatoryProgrammeOffering[]; onBook: (offering: AmbulatoryProgrammeOffering) => void }) {
  return (
    <section id="ambulatory-programmes" className="app-card rounded-xl p-5">
      <h2 className="text-lg font-semibold text-[var(--app-text)]">{t("ambulatory.programmes.title")}</h2>
      <div className="mt-4 space-y-3">
        {offerings.map((offering) => (
          <div key={offering.code} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-950">{offering.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-gray-500">{offering.category} · {offering.cadence}</p>
              </div>
              <button type="button" onClick={() => onBook(offering)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50">Refer</button>
            </div>
            <p className="mt-2 text-sm text-gray-600">{offering.description}</p>
            <p className="mt-2 text-xs font-semibold text-gray-500">{offering.nextSessionLabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionButton({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-semibold text-gray-700"><span>{label}</span>{children}</label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="rounded-lg border border-gray-300 px-3 py-2" /></Field>;
}

function VoiceNotes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const dictation = useSectionDictation("en-IE");
  useEffect(() => {
    if (dictation.transcript) onChange(dictation.transcript);
  }, [dictation.transcript, onChange]);
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-sky-950">Transcription</p>
        <div className="flex gap-2">
          <button type="button" onClick={dictation.start} disabled={dictation.isListening} className="inline-flex items-center gap-2 rounded bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Mic className="h-3.5 w-3.5" />Start</button>
          <button type="button" onClick={dictation.stop} disabled={!dictation.isListening} className="rounded border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 disabled:opacity-50">Stop</button>
        </div>
      </div>
      {dictation.error && <p className="mt-2 text-xs text-red-700">{dictation.error}</p>}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-3 w-full rounded border border-sky-200 bg-white px-3 py-2 text-sm" />
    </div>
  );
}

function ParticipantDialog({ open, config, t, error, onClose, onSubmit }: { open: boolean; config: AmbulatoryLocalConfig; t: (key: string) => string; error: string | null; onClose: () => void; onSubmit: (payload: { displayName: string; preferredName: string; phone: string; email: string; referralSource: string }) => Promise<void> }) {
  const [displayName, setDisplayName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referralSource, setReferralSource] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setDisplayName(""); setPreferredName(""); setPhone(""); setEmail(""); setReferralSource(""); } }, [open]);
  return (
    <Dialog open={open} title={`Add ${t(config.participantLabelKey)}`} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void onSubmit({ displayName, preferredName, phone, email, referralSource }); }}>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Field label="Name"><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required /></Field>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Preferred Name"><input value={preferredName} onChange={(event) => setPreferredName(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" /></Field><Field label="Referral Source"><input value={referralSource} onChange={(event) => setReferralSource(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" /></Field></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Phone"><input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" /></Field><Field label="Email"><input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" /></Field></div>
        <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${config.primaryClass}`}>Save</button>
      </form>
    </Dialog>
  );
}

function AssessmentDialog({ open, participant, programme, accessToken, error, onError, onClose, onSaved }: { open: boolean; participant: AmbulatoryParticipant | null; programme: AmbulatoryProgramme; accessToken?: string | null; error: string | null; onError: (value: string | null) => void; onClose: () => void; onSaved: () => Promise<void> }) {
  const [assessmentType, setAssessmentType] = useState<"initial" | "full">("initial");
  const [presentingNeeds, setPresentingNeeds] = useState("");
  const [riskSummary, setRiskSummary] = useState("");
  const [strengths, setStrengths] = useState("");
  const [summary, setSummary] = useState("");
  const [goalsDiscussed, setGoalsDiscussed] = useState("");
  const [outcome, setOutcome] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setAssessmentType("initial"); setPresentingNeeds(""); setRiskSummary(""); setStrengths(""); setSummary(""); setGoalsDiscussed(""); setOutcome(""); } }, [open]);
  return (
    <Dialog open={open} title={`${assessmentType === "initial" ? "Initial" : "Full"} Assessment${participant ? `: ${participant.displayName}` : ""}`} onClose={onClose}>
      <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); if (!participant) return; try { onError(null); await ambulatoryService.addAssessment(programme, participant.id, { assessmentType, presentingNeeds, riskSummary, strengths, substanceOrBehaviourSummary: summary, goalsDiscussed, outcome }, accessToken); await onSaved(); onClose(); } catch (e) { onError((e as Error).message); } }}>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Field label="Assessment Type"><select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as "initial" | "full")} className="rounded-lg border border-gray-300 px-3 py-2"><option value="initial">Initial Assessment</option><option value="full">Full Assessment</option></select></Field>
        <VoiceNotes value={presentingNeeds} onChange={setPresentingNeeds} />
        <TextArea label="Risk Summary" value={riskSummary} onChange={setRiskSummary} />
        <TextArea label="Strengths" value={strengths} onChange={setStrengths} />
        <TextArea label="Substance or Behaviour Summary" value={summary} onChange={setSummary} />
        <TextArea label="Goals Discussed" value={goalsDiscussed} onChange={setGoalsDiscussed} />
        <TextArea label="Outcome" value={outcome} onChange={setOutcome} />
        <button type="submit" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">Save Assessment</button>
      </form>
    </Dialog>
  );
}

function CarePlanDialog({ open, participant, programme, accessToken, error, onError, onClose, onSaved }: { open: boolean; participant: AmbulatoryParticipant | null; programme: AmbulatoryProgramme; accessToken?: string | null; error: string | null; onError: (value: string | null) => void; onClose: () => void; onSaved: () => Promise<void> }) {
  const plan = participant?.currentCarePlan;
  const [status, setStatus] = useState("active");
  const [needs, setNeeds] = useState("");
  const [strengths, setStrengths] = useState("");
  const [risks, setRisks] = useState("");
  const [goals, setGoals] = useState("");
  const [actions, setActions] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setStatus(plan?.status ?? "active"); setNeeds(plan?.needs ?? ""); setStrengths(plan?.strengths ?? ""); setRisks(plan?.risks ?? ""); setGoals(plan?.goals ?? ""); setActions(plan?.actions ?? ""); setReviewNotes(plan?.reviewNotes ?? ""); setReviewDate(plan?.reviewDate ?? ""); } }, [open, plan]);
  return (
    <Dialog open={open} title={`Online Care Plan${participant ? `: ${participant.displayName}` : ""}`} onClose={onClose}>
      <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); if (!participant) return; try { onError(null); await ambulatoryService.upsertCarePlan(programme, participant.id, { status, needs, strengths, risks, goals, actions, reviewNotes, reviewDate: reviewDate || null }, accessToken); await onSaved(); onClose(); } catch (e) { onError((e as Error).message); } }}>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2"><Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2"><option value="draft">Draft</option><option value="active">Active</option><option value="review">Review</option><option value="closed">Closed</option></select></Field><Field label="Review Date"><input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" /></Field></div>
        <TextArea label="Needs" value={needs} onChange={setNeeds} />
        <TextArea label="Strengths" value={strengths} onChange={setStrengths} />
        <TextArea label="Risks and Contingencies" value={risks} onChange={setRisks} />
        <TextArea label="Goals" value={goals} onChange={setGoals} />
        <TextArea label="Actions" value={actions} onChange={setActions} />
        <VoiceNotes value={reviewNotes} onChange={setReviewNotes} />
        <button type="submit" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">Save Care Plan</button>
      </form>
    </Dialog>
  );
}

function AppointmentDialog({ open, config, defaults, participants, selectedParticipant, programme, accessToken, allowVideo, error, onError, onClose, onSaved }: { open: boolean; config: AmbulatoryLocalConfig; defaults: AppointmentDraftDefaults; participants: AmbulatoryParticipant[]; selectedParticipant: AmbulatoryParticipant | null; programme: AmbulatoryProgramme; accessToken?: string | null; allowVideo: boolean; error: string | null; onError: (value: string | null) => void; onClose: () => void; onSaved: () => Promise<void> }) {
  const [participantId, setParticipantId] = useState("");
  const [appointmentType, setAppointmentType] = useState<UpsertAmbulatoryAppointmentRequest["appointmentType"]>("individual-therapy");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [endsAt, setEndsAt] = useState(() => addMinutes(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)), 60));
  const [deliveryMode, setDeliveryMode] = useState<"in-person" | "video">("in-person");
  const [notes, setNotes] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { const start = defaults?.startsAt ?? toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)); setParticipantId(selectedParticipant?.id ?? ""); setAppointmentType("individual-therapy"); setTitle(""); setStartsAt(start); setEndsAt(defaults?.endsAt ?? addMinutes(start, config.calendar.slotMinutes * 2)); setDeliveryMode("in-person"); setNotes(""); } }, [config.calendar.slotMinutes, defaults?.endsAt, defaults?.startsAt, open, selectedParticipant?.id]);
  return (
    <Dialog open={open} title="New Appointment" onClose={onClose}>
      <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); if (new Date(endsAt) <= new Date(startsAt)) { onError("End time must be after start time."); return; } try { onError(null); await ambulatoryService.createAppointment(programme, { participantId: participantId || null, appointmentType, title, startsAtUtc: toUtc(startsAt), endsAtUtc: toUtc(endsAt), deliveryMode, notes }, accessToken); await onSaved(); onClose(); } catch (e) { onError((e as Error).message); } }}>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2"><Field label="Type"><select value={appointmentType} onChange={(event) => setAppointmentType(event.target.value as UpsertAmbulatoryAppointmentRequest["appointmentType"])} className="rounded-lg border border-gray-300 px-3 py-2">{appointmentTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Participant"><select value={participantId} onChange={(event) => setParticipantId(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2"><option value="">Group or unassigned</option>{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></Field></div>
        <Field label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Leave blank to generate from type and participant" className="rounded-lg border border-gray-300 px-3 py-2" /></Field>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Starts"><input type="datetime-local" value={startsAt} onChange={(event) => { setStartsAt(event.target.value); setEndsAt(addMinutes(event.target.value, 60)); }} className="rounded-lg border border-gray-300 px-3 py-2" required /></Field><Field label="Ends"><input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required /></Field></div>
        <Field label="Delivery"><select value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value as "in-person" | "video")} className="rounded-lg border border-gray-300 px-3 py-2"><option value="in-person">In Person</option>{allowVideo && <option value="video">Remote Video</option>}</select></Field>
        <VoiceNotes value={notes} onChange={setNotes} />
        <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${config.primaryClass}`}>Save Appointment</button>
      </form>
    </Dialog>
  );
}

function SessionDialog({ open, appointment, displayName, jwt, onClose }: { open: boolean; appointment: AmbulatoryAppointment | null; displayName: string; jwt?: string | null; onClose: () => void }) {
  const [sessionNotes, setSessionNotes] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) setSessionNotes(appointment?.notes ?? ""); }, [appointment?.notes, open]);
  return (
    <Dialog open={open} title={appointment ? appointment.title : "Session"} onClose={onClose}>
      {!appointment && <p className="text-sm text-gray-500">No session selected.</p>}
      {appointment && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-950">{appointmentTypeLabel(appointment.appointmentType)}</p>
            <p className="mt-1 text-sm text-gray-500">{formatDate(new Date(appointment.startsAtUtc))} · {formatTime(appointment.startsAtUtc)} - {formatTime(appointment.endsAtUtc)}</p>
            <p className="mt-1 text-sm text-gray-500">{appointment.participantName ?? "Group session"} · {appointment.deliveryMode === "video" ? "Remote video" : "In person"}</p>
          </div>
          {appointment.deliveryMode === "video" && appointment.avRoomName && (
            <JitsiSessionFrame
              roomName={appointment.avRoomName}
              displayName={displayName}
              jwt={jwt}
              authorised={Boolean(appointment.avRoomName && jwt)}
            />
          )}
          <VoiceNotes value={sessionNotes} onChange={setSessionNotes} />
          <p className="text-xs text-gray-500">Transcript text is captured locally here for now and can be pasted into the assessment or care plan fields.</p>
        </div>
      )}
    </Dialog>
  );
}
