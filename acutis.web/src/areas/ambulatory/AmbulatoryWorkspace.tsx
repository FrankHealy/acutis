"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  ClipboardCheck,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  Mic,
  Mail,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Search,
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
  type AmbulatoryLocalConfig,
} from "./ambulatoryConfig";
import {
  ambulatoryService,
  type AmbulatoryAppointment,
  type AmbulatoryDashboard,
  type AmbulatoryParticipant,
  type AmbulatoryProgramme,
  type UpsertAmbulatoryAppointmentRequest,
} from "@/services/ambulatoryService";
import { JitsiSessionFrame } from "./JitsiSessionFrame";
import groupTherapyTerms from "@/data/groupTherapyTerms.json";
import AccessDeniedNotice from "@/areas/shared/AccessDeniedNotice";
import { isForbiddenError } from "@/lib/apiError";
import Header from "@/areas/shared/layout/Header";
import DynamicFormRenderer from "@/areas/screening/forms/DynamicFormRenderer";
import {
  getActiveForm,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
  type SaveProgressResponse,
  type SaveResponse,
} from "@/areas/screening/forms/ApiClient";

type AmbulatoryWorkspaceProps = {
  programme: AmbulatoryProgramme;
};

type DialogMode = "participant" | "assessment" | "care-plan" | "appointment" | "session" | null;
type CalendarMode = "day" | "work-week" | "month";
type CommunityView = "dashboard" | "service-users" | "operations";
type AppointmentDraftDefaults = { startsAt: string; endsAt: string } | null;
type ObservationTerm = { id: number; term: string; description: string; ratingId: number };
const COMMUNITY_INITIAL_ASSESSMENT_FORM_CODE = "community_initial_assessment";

const appointmentTypes = [
  { value: "individual-therapy", label: "One to One Therapy" },
  { value: "group-meeting", label: "Group Meeting" },
  { value: "initial-assessment", label: "Initial Assessment" },
  { value: "full-assessment", label: "Full Assessment" },
] as const;
const observationTerms = (groupTherapyTerms as ObservationTerm[])
  .filter((term) => term.ratingId <= 2)
  .slice(0, 24);

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const accessDenied = isForbiddenError(error);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => config.calendar.defaultMode === "month" || config.calendar.defaultMode === "day" ? config.calendar.defaultMode : "work-week");
  const [communityView, setCommunityView] = useState<CommunityView>("dashboard");
  const [anchorDate, setAnchorDate] = useState(startOfDay(new Date()));
  const [appointmentDefaults, setAppointmentDefaults] = useState<AppointmentDraftDefaults>(null);

  useEffect(() => {
    mergeTranslations(ambulatoryLocalTranslations);
  }, [mergeTranslations]);

  const participants = useMemo(() => dashboard?.participants ?? [], [dashboard?.participants]);
  const appointments = useMemo(() => dashboard?.appointments ?? [], [dashboard?.appointments]);
  const filteredParticipants = useMemo(() => {
    const query = participantSearch.trim().toLowerCase();
    if (!query) return participants;
    return participants.filter((participant) => [
      participant.displayName,
      participant.preferredName,
      participant.phone,
      participant.email,
      participant.referralSource,
      participant.status,
      participant.currentCarePlan?.status,
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [participantSearch, participants]);
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
      const safeDashboard = {
        ...next,
        participants: next.participants ?? [],
        appointments: next.appointments ?? [],
      };
      setDashboard(safeDashboard);
      setSelectedParticipantId((current) => current ?? safeDashboard.participants[0]?.id ?? null);
      setSelectedAppointmentId((current) => current ?? safeDashboard.appointments[0]?.id ?? null);
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
    status: appointment.status,
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

  const markAppointmentMissed = async (appointment: AmbulatoryAppointment) => {
    if (appointment.status === "missed") return;

    try {
      setError(null);
      await ambulatoryService.updateAppointment(programme, appointment.id, {
        ...buildAppointmentPayload(appointment, new Date(appointment.startsAtUtc), new Date(appointment.endsAtUtc)),
        status: "missed",
      }, session?.accessToken);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
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

  const isCommunity = programme === "community";
  const communityNavItems: { key: CommunityView | "configuration"; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "service-users", label: "Service Users" },
    { key: "operations", label: "Operations" },
    { key: "configuration", label: "Configuration" },
  ];
  const serviceUserPanel = (
    <ServiceUserPanel
      config={config}
      t={t}
      participants={filteredParticipants}
      totalParticipants={participants.length}
      selectedParticipant={selectedParticipant}
      search={participantSearch}
      onSearch={setParticipantSearch}
      onAdd={() => openDialog("participant")}
      onSelect={(participant) => setSelectedParticipantId(participant.id)}
      onAssessment={(participant) => openDialog("assessment", { participant })}
      onCarePlan={(participant) => openDialog("care-plan", { participant })}
      onAppointment={(participant) => openDialog("appointment", { participant })}
    />
  );
  const calendarBoard = (
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
      onMarkMissed={(appointment) => void markAppointmentMissed(appointment)}
      onExportOutlook={exportAppointments}
      onExportGoogle={() => openGoogleCalendar(selectedAppointment)}
    />
  );
  const communityWorkspace = communityView === "dashboard" ? (
    <div className="mt-5 grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <CommunityShortcut
          Icon={Users}
          label="Service Users"
          value={`${participants.length} active`}
          onClick={() => setCommunityView("service-users")}
        />
        <CommunityShortcut
          Icon={CalendarDays}
          label="Appointment"
          value={`${todayAppointments.length} today`}
          onClick={() => openDialog("appointment")}
        />
        <CommunityShortcut
          Icon={ClipboardCheck}
          label="Assessment"
          value="New"
          onClick={() => openDialog("assessment", { participant: selectedParticipant ?? undefined })}
        />
        <CommunityShortcut
          Icon={FileText}
          label="Care Plan"
          value={`${reportsDueToday} reports`}
          onClick={() => openDialog("care-plan", { participant: selectedParticipant ?? undefined })}
        />
      </div>
      {calendarBoard}
    </div>
  ) : communityView === "service-users" ? (
    <div className="mt-5">
      <ServiceUsersTable
        config={config}
        participants={filteredParticipants}
        totalParticipants={participants.length}
        selectedParticipant={selectedParticipant}
        search={participantSearch}
        onSearch={setParticipantSearch}
        onAdd={() => openDialog("participant")}
        onSelect={(participant) => setSelectedParticipantId(participant.id)}
        onAssessment={(participant) => openDialog("assessment", { participant })}
        onCarePlan={(participant) => openDialog("care-plan", { participant })}
        onAppointment={(participant) => openDialog("appointment", { participant })}
      />
    </div>
  ) : (
    <div className="mt-5">
      {calendarBoard}
    </div>
  );

  return (
    <>
      {isCommunity && (
        <>
          <Header
            showCapacity={false}
            unitName="Community"
            unitLabel="Current Unit"
            unitAccentClass="text-cyan-700"
            unitIconKey="community"
            brandNameOverride="Acutis"
            brandSubtitleOverride="Arbour House"
            brandLogoUrlOverride="/acutis-icon.svg"
          />
          <nav className="app-surface">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-14 items-center">
                <div className="flex items-center gap-6">
                  {communityNavItems.map((item) => {
                    const active = item.key !== "configuration" && communityView === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          if (item.key === "configuration") {
                            router.push("/units/config");
                            return;
                          }
                          setCommunityView(item.key);
                        }}
                        className={`text-sm font-medium ${active ? "text-[var(--app-primary)]" : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
      <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        {!isCommunity && <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => router.push("/")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>}

        {!isCommunity && <header className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className={`h-1.5 ${config.primaryClass}`} />
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${config.primaryClass}`}>
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-primary)]">{t(config.eyebrowKey)}</p>
                <h1 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">{t(config.titleKey)}</h1>
                <p className="mt-1 text-sm text-slate-500">{clinicalDisplayName}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill Icon={CalendarDays} label={`${todayAppointments.length} appointments`} />
              <StatusPill Icon={MapPin} label={`${outreachToday} outreach`} />
              <StatusPill Icon={FileText} label={`${reportsDueToday} reports`} />
            </div>
          </div>
        </header>}
        {isCommunity && (
          <div className="flex flex-wrap justify-end gap-2">
            <StatusPill Icon={CalendarDays} label={`${todayAppointments.length} appointments`} />
            <StatusPill Icon={MapPin} label={`${outreachToday} outreach`} />
            <StatusPill Icon={FileText} label={`${reportsDueToday} reports`} />
          </div>
        )}

        {accessDenied ? (
          <div className="mt-4">
            <AccessDeniedNotice message={error} />
          </div>
        ) : (
          error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {loading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}

        {!loading && dashboard && (
          isCommunity ? communityWorkspace : (
            <div className="mt-5 grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
              {serviceUserPanel}
              {calendarBoard}
            </div>
          )
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
    </>
  );
}

function StatusPill({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-[var(--app-primary)]" />
      {label}
    </span>
  );
}

function CommunityShortcut({ label, value, Icon, onClick }: { label: string; value: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-700 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-950">{label}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{value}</span>
      </span>
    </button>
  );
}

function participantAvatarUrl(participant: AmbulatoryParticipant) {
  return participant.photoUrl?.trim() || participant.photo?.trim() || "";
}

function ServiceUserAvatar({ participant }: { participant: AmbulatoryParticipant }) {
  const [src, setSrc] = useState(participantAvatarUrl(participant));
  const initials = participant.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SU";

  useEffect(() => {
    setSrc(participantAvatarUrl(participant));
  }, [participant]);

  return (
    <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
      {initials}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={participant.displayName}
          width={44}
          height={44}
          onError={() => setSrc("")}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}

function ServiceUsersTable({
  config,
  participants,
  totalParticipants,
  selectedParticipant,
  search,
  onSearch,
  onAdd,
  onSelect,
  onAssessment,
  onCarePlan,
  onAppointment,
}: {
  config: AmbulatoryLocalConfig;
  participants: AmbulatoryParticipant[];
  totalParticipants: number;
  selectedParticipant: AmbulatoryParticipant | null;
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onSelect: (participant: AmbulatoryParticipant) => void;
  onAssessment: (participant: AmbulatoryParticipant) => void;
  onCarePlan: (participant: AmbulatoryParticipant) => void;
  onAppointment: (participant: AmbulatoryParticipant) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1 ${config.primaryClass}`} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Service Users</h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{totalParticipants} active</p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <label className="flex h-11 min-w-56 max-w-sm flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-600/10">
            <Search className="h-4 w-4" />
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent font-medium text-slate-900 outline-none placeholder:text-slate-400" />
          </label>
          <button type="button" onClick={onAdd} className={`inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white ${config.primaryClass}`}>
            <UserPlus className="h-4 w-4" />
            Service User
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50">
            <tr>
              {["Photo", "Service User", "Status", "Referral", "Care Plan", "Contact", "Counsellor", "Actions"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                  No service users found.
                </td>
              </tr>
            ) : (
              participants.map((participant) => {
                const selected = selectedParticipant?.id === participant.id;
                return (
                  <tr
                    key={participant.id}
                    onClick={() => onSelect(participant)}
                    className={`cursor-pointer transition ${selected ? "bg-cyan-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-5 py-4">
                      <ServiceUserAvatar participant={participant} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-950">{participant.displayName}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{participant.preferredName || participant.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">{participant.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{participant.referralSource || "Community referral"}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{participant.currentCarePlan?.status ?? "Plan needed"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div>{participant.phone || "No phone"}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{participant.email || "No email"}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{participant.counsellorDisplayName || "Not assigned"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <TableAction label="Assess" Icon={ClipboardCheck} onClick={() => onAssessment(participant)} />
                        <TableAction label="Plan" Icon={ClipboardList} onClick={() => onCarePlan(participant)} />
                        <TableAction label="Appointment" Icon={CalendarDays} onClick={() => onAppointment(participant)} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TableAction({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-3.5 w-3.5 text-cyan-700" />
      {label}
    </button>
  );
}

function ServiceUserPanel({
  config,
  t,
  participants,
  totalParticipants,
  selectedParticipant,
  search,
  onSearch,
  onAdd,
  onSelect,
  onAssessment,
  onCarePlan,
  onAppointment,
}: {
  config: AmbulatoryLocalConfig;
  t: (key: string) => string;
  participants: AmbulatoryParticipant[];
  totalParticipants: number;
  selectedParticipant: AmbulatoryParticipant | null;
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onSelect: (participant: AmbulatoryParticipant) => void;
  onAssessment: (participant: AmbulatoryParticipant) => void;
  onCarePlan: (participant: AmbulatoryParticipant) => void;
  onAppointment: (participant: AmbulatoryParticipant) => void;
}) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden">
      <div className={`h-1 ${config.primaryClass}`} />
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">{t(config.participantLabelKey)}</h2>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{totalParticipants} active</p>
          </div>
          <button type="button" onClick={onAdd} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white ${config.primaryClass}`} aria-label={`Add ${t(config.participantLabelKey)}`}>
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
        <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 focus-within:border-[var(--app-primary)] focus-within:ring-2 focus-within:ring-[var(--app-primary)]/10">
          <Search className="h-4 w-4" />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent font-medium text-slate-900 outline-none placeholder:text-slate-400" />
        </label>
      </div>
      <div className="max-h-[48vh] overflow-y-auto p-3 xl:max-h-[calc(100vh-18rem)]">
        {participants.length === 0 && <p className="px-2 py-4 text-sm text-slate-500">No matching service users.</p>}
        <div className="space-y-2">
          {participants.map((participant) => {
            const selected = selectedParticipant?.id === participant.id;
            return (
              <button key={participant.id} type="button" onClick={() => onSelect(participant)} className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${selected ? config.selectedClass : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">{participant.displayName}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{participant.referralSource || participant.preferredName || "Community referral"}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">{participant.status}</span>
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-500">
                  {participant.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />Phone</span>}
                  {participant.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>}
                  <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{participant.currentCarePlan?.status ?? "plan needed"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedParticipant && (
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3">
          <PanelAction label="Assess" Icon={ClipboardCheck} onClick={() => onAssessment(selectedParticipant)} />
          <PanelAction label="Care plan" Icon={FileText} onClick={() => onCarePlan(selectedParticipant)} />
          <PanelAction label="Session" Icon={CalendarDays} onClick={() => onAppointment(selectedParticipant)} />
          <PanelAction label="Remote" Icon={Video} onClick={() => onAppointment(selectedParticipant)} />
        </div>
      )}
    </aside>
  );
}

function PanelAction({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      <Icon className="h-4 w-4 text-[var(--app-primary)]" />
      {label}
    </button>
  );
}

function getAppointmentVisual(appointment: AmbulatoryAppointment): {
  Icon: LucideIcon;
  className: string;
  accentClass: string;
} {
  if (appointment.status === "missed") {
    return { Icon: CircleSlash, className: "border-slate-300 bg-slate-100 text-slate-500", accentClass: "bg-slate-500" };
  }
  if (hasReportDue(appointment)) {
    return { Icon: FileText, className: "border-amber-300 bg-amber-50 text-amber-950", accentClass: "bg-amber-500" };
  }
  if (appointment.deliveryMode === "video") {
    return { Icon: Video, className: "border-indigo-300 bg-indigo-50 text-indigo-950", accentClass: "bg-indigo-500" };
  }
  if (locationFromNotes(appointment.notes)?.toLowerCase().includes("shelter")) {
    return { Icon: MapPin, className: "border-rose-300 bg-rose-50 text-rose-950", accentClass: "bg-rose-500" };
  }
  if (appointment.appointmentType === "initial-assessment" || appointment.appointmentType === "full-assessment") {
    return { Icon: ClipboardCheck, className: "border-sky-300 bg-sky-50 text-sky-950", accentClass: "bg-sky-500" };
  }
  if (appointment.appointmentType === "group-meeting") {
    return { Icon: Users, className: "border-violet-300 bg-violet-50 text-violet-950", accentClass: "bg-violet-500" };
  }
  return { Icon: UserRound, className: "border-emerald-300 bg-emerald-50 text-emerald-950", accentClass: "bg-emerald-500" };
}

function CalendarAppointmentCard({
  appointment,
  slotMinutes,
  onOpen,
  onResize,
  onMarkMissed,
}: {
  appointment: AmbulatoryAppointment;
  slotMinutes: number;
  onOpen: () => void;
  onResize: (deltaMinutes: number) => void;
  onMarkMissed: () => void;
}) {
  const visual = getAppointmentVisual(appointment);
  const Icon = visual.Icon;
  const duration = durationInMinutes(appointment);
  const isMissed = appointment.status === "missed";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
      draggable={!appointment.isFixed}
      onDragStart={(event) => {
        if (appointment.isFixed) return;
        event.dataTransfer.setData("text/ambulatory-appointment", appointment.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={`group relative h-full min-h-10 w-full cursor-pointer overflow-hidden rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:shadow-md ${visual.className} ${isMissed ? "opacity-75" : ""}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${visual.accentClass}`} />
      <span className="flex items-center justify-between gap-1 pl-1 text-[11px] font-bold leading-none">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatTime(appointment.startsAtUtc)} · {duration}m</span>
        </span>
        {appointment.isFixed && <Lock className="h-3.5 w-3.5 shrink-0" />}
      </span>
      <span className="mt-1 block truncate pl-1 text-xs font-bold leading-tight">{appointment.title}</span>
      <span className="mt-0.5 block truncate pl-1 text-[11px] opacity-80">{appointment.participantName ?? locationFromNotes(appointment.notes) ?? appointmentTypeLabel(appointment.appointmentType)}</span>
      {!appointment.isFixed && (
        <span className="absolute bottom-1 right-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button type="button" onClick={(event) => { event.stopPropagation(); onMarkMissed(); }} className="inline-flex h-6 w-6 items-center justify-center rounded border border-current/20 bg-white/85" aria-label="Mark missed">
            <CircleSlash className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onResize(-slotMinutes); }} className="inline-flex h-6 w-6 items-center justify-center rounded border border-current/20 bg-white/85" aria-label="Shorten">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onResize(slotMinutes); }} className="inline-flex h-6 w-6 items-center justify-center rounded border border-current/20 bg-white/85" aria-label="Extend">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </div>
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
  onMarkMissed,
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
  onMarkMissed: (appointment: AmbulatoryAppointment) => void;
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
  const slotHeight = 34;
  const dayHeight = slots.length * slotHeight;
  const startMinutes = config.calendar.startHour * 60;
  const endMinutes = config.calendar.endHour * 60;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{t("ambulatory.calendar.title")}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onAnchorChange(addDays(anchorDate, -step))} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => onAnchorChange(startOfDay(new Date()))} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50" aria-label={t("ambulatory.calendar.today")}><CalendarDays className="h-4 w-4" /></button>
          <button type="button" onClick={() => onAnchorChange(addDays(anchorDate, step))} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
          <div className="ml-1 inline-flex overflow-hidden rounded-lg border border-slate-300 bg-slate-50">
            {(["day", "work-week", "month"] as CalendarMode[]).map((item) => (
              <button key={item} type="button" onClick={() => onModeChange(item)} className={`px-3 py-2 text-sm font-semibold ${mode === item ? config.selectedClass : "text-slate-500"}`}>{modeLabels[item]}</button>
            ))}
          </div>
          <button type="button" onClick={() => onExportOutlook(visibleAppointments)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Outlook
          </button>
          <button type="button" onClick={onExportGoogle} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="min-w-[920px]">
            <div className="grid border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns: `76px repeat(${visibleDays.length}, minmax(168px, 1fr))` }}>
              <div className="px-3 py-3 text-xs font-bold uppercase text-slate-500">Time</div>
              {visibleDays.map((day) => (
                <div key={dateKeyLocal(day)} className="border-l border-slate-200 px-3 py-3">
                  <p className="text-xs font-bold uppercase text-slate-500">{dayNames[day.getDay()]}</p>
                  <p className="text-sm font-bold text-slate-950">{day.getDate()}</p>
                </div>
              ))}
            </div>
            <div className="grid" style={{ gridTemplateColumns: `76px repeat(${visibleDays.length}, minmax(168px, 1fr))` }}>
              <div className="relative border-r border-slate-200 bg-slate-50" style={{ height: dayHeight }}>
                {slots.map((slot) => (
                  <div key={slot} className={`absolute left-0 right-0 px-3 text-xs font-semibold ${slot % 60 === 0 ? "border-t border-slate-300 text-slate-600" : "border-t border-dotted border-slate-200 text-slate-400"}`} style={{ top: (slot - startMinutes) / config.calendar.slotMinutes * slotHeight, height: slotHeight }}>
                    <span className="relative -top-2 bg-slate-50 pr-1">{slot % 60 === 0 ? formatSlot(slot) : ":30"}</span>
                  </div>
                ))}
              </div>
              {visibleDays.map((day) => {
                const dayAppointments = appointments.filter((appointment) => isSameDate(appointment.startsAtUtc, day));
                return (
                  <div key={dateKeyLocal(day)} className="relative border-l border-slate-200 bg-white" style={{ height: dayHeight }}>
                    {slots.map((slot) => (
                      <div
                        key={`${dateKeyLocal(day)}-${slot}`}
                        onContextMenu={(event) => { event.preventDefault(); onCreateAt(day, slot); }}
                        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const id = event.dataTransfer.getData("text/ambulatory-appointment");
                          if (id) onMoveAppointment(id, day, slot);
                        }}
                        className={`absolute left-0 right-0 transition hover:bg-slate-100/60 ${slot % 60 === 0 ? "border-t border-slate-300" : "border-t border-dotted border-slate-200"}`}
                        style={{ top: (slot - startMinutes) / config.calendar.slotMinutes * slotHeight, height: slotHeight }}
                      />
                    ))}
                    {dayAppointments.map((appointment) => {
                      const start = new Date(appointment.startsAtUtc);
                      const startOfAppointment = start.getHours() * 60 + start.getMinutes();
                      const top = Math.max(0, (startOfAppointment - startMinutes) / config.calendar.slotMinutes * slotHeight);
                      const height = Math.max(30, durationInMinutes(appointment) / config.calendar.slotMinutes * slotHeight - 4);
                      if (startOfAppointment < startMinutes || startOfAppointment >= endMinutes) return null;
                      return (
                        <div key={appointment.id} className="absolute left-1.5 right-1.5 z-10" style={{ top: top + 2, height }}>
                          <CalendarAppointmentCard
                            appointment={appointment}
                            slotMinutes={config.calendar.slotMinutes}
                            onOpen={() => onOpenSession(appointment)}
                            onResize={(deltaMinutes) => onResizeAppointment(appointment, deltaMinutes)}
                            onMarkMissed={() => onMarkMissed(appointment)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {visibleDays.map((day) => {
            const dateKey = dateKeyLocal(day);
            const dayAppointments = appointments.filter((appointment) => isSameDate(appointment.startsAtUtc, day));
            const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
            return (
              <div key={dateKey} onContextMenu={(event) => { event.preventDefault(); onCreateAt(day, config.calendar.startHour * 60); }} className={`min-h-40 rounded-lg border p-2 ${isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`}>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase text-slate-500">{dayNames[day.getDay()]}</span>
                  <span className="text-sm font-bold text-slate-950">{day.getDate()}</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {dayAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="h-16">
                      <CalendarAppointmentCard
                        appointment={appointment}
                        slotMinutes={config.calendar.slotMinutes}
                        onOpen={() => onOpenSession(appointment)}
                        onResize={(deltaMinutes) => onResizeAppointment(appointment, deltaMinutes)}
                        onMarkMissed={() => onMarkMissed(appointment)}
                      />
                    </div>
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

function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><X className="h-5 w-5" /></button>
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
  if (programme === "community") {
    return (
      <CommunityInitialAssessmentDialog
        open={open}
        participant={participant}
        accessToken={accessToken}
        error={error}
        onError={onError}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

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

function CommunityInitialAssessmentDialog({ open, participant, accessToken, error, onError, onClose, onSaved }: { open: boolean; participant: AmbulatoryParticipant | null; accessToken?: string | null; error: string | null; onError: (value: string | null) => void; onClose: () => void; onSaved: () => Promise<void> }) {
  const { locale, mergeTranslations } = useLocalization();
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const subjectId = participant?.id ?? null;

  useEffect(() => {
    let active = true;
    if (!open || !subjectId) {
      setFormData(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        onError(null);
        const response = await getActiveForm(
          accessToken ?? undefined,
          locale,
          "participant",
          subjectId,
          COMMUNITY_INITIAL_ASSESSMENT_FORM_CODE
        );
        if (!active) return;
        mergeTranslations(response.translations);
        setFormData(response);
      } catch (loadError) {
        if (!active) return;
        setFormData(null);
        onError(loadError instanceof Error ? loadError.message : "Unable to load Community Initial Assessment.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [accessToken, locale, mergeTranslations, onError, open, subjectId]);

  const handleSaveProgress = async (payload: { submissionId: string | null; answers: Record<string, JsonValue> }): Promise<SaveProgressResponse> => {
    if (!participant || !formData) {
      throw new Error("No Community participant or assessment form is loaded.");
    }

    return saveProgress(accessToken ?? undefined, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType: "participant",
      subjectId: participant.id,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
  };

  const handleSave = async (payload: { submissionId: string | null; answers: Record<string, JsonValue> }): Promise<SaveResponse> => {
    if (!participant || !formData) {
      throw new Error("No Community participant or assessment form is loaded.");
    }

    const response = await save(accessToken ?? undefined, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType: "participant",
      subjectId: participant.id,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
    await onSaved();
    onClose();
    return response;
  };

  return (
    <Dialog open={open} title={`Community Initial Assessment${participant ? `: ${participant.displayName}` : ""}`} onClose={onClose}>
      {!participant && <p className="text-sm text-gray-500">Select a Community service user before starting an assessment.</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading HSE Initial Assessment...</p>}
      {participant && formData && (
        <DynamicFormRenderer
          form={formData.form}
          optionSets={formData.optionSets}
          locale={locale}
          initialSubmissionId={formData.submissionId}
          initialSubmissionStatus={formData.submissionStatus}
          initialAnswers={formData.draftAnswers}
          subjectType="participant"
          subjectId={participant.id}
          renderMode="wizard"
          onSaveProgress={handleSaveProgress}
          onSave={handleSave}
          submitLabel="Confirm Assessment"
          submittingLabel="Confirming..."
          submittedLabel="Community Initial Assessment saved."
        />
      )}
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
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setSessionNotes(appointment?.notes ?? ""); setSelectedTerms([]); } }, [appointment?.notes, open]);
  const toggleTerm = (term: string) => {
    setSelectedTerms((current) => current.includes(term) ? current.filter((item) => item !== term) : [...current, term]);
  };
  const addObservationsToNotes = () => {
    if (selectedTerms.length === 0) return;
    const line = `Observations: ${selectedTerms.join(", ")}`;
    setSessionNotes((current) => current.trim() ? `${current.trim()}\n${line}` : line);
  };
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
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">Clinical observations</p>
                <p className="mt-0.5 text-xs text-slate-500">Alcohol therapy observation library</p>
              </div>
              <button type="button" onClick={addObservationsToNotes} disabled={selectedTerms.length === 0} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Add to note</button>
            </div>
            <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {observationTerms.map((term) => {
                const selected = selectedTerms.includes(term.term);
                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => toggleTerm(term.term)}
                    title={term.description}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${selected ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    {term.term}
                  </button>
                );
              })}
            </div>
          </div>
          <VoiceNotes value={sessionNotes} onChange={setSessionNotes} />
        </div>
      )}
    </Dialog>
  );
}
