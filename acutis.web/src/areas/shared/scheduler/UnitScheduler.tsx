"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  Coffee,
  Dumbbell,
  Handshake,
  HeartPulse,
  Megaphone,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { isAuthorizedClient } from "@/lib/authMode";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import {
  globalConfigurationService,
  type ScheduleOccurrenceDto,
  type ScheduleTemplateDto,
  type UnitConfigurationDto,
  type UpsertScheduleOccurrenceRequest,
  type UpsertScheduleTemplateRequest,
} from "@/services/globalConfigurationService";
import { staffRosterService, type UnitStaffRosterBoardDto } from "@/services/staffRosterService";

type UnitSchedulerProps = {
  unitId: UnitId;
  unitName: string;
};

type SchedulerMode = "template" | "week";

type DragPayload =
  | {
      kind: "template";
      templateId: string;
    }
  | {
      kind: "occurrence";
      occurrenceId: string;
    };

type EventIconKey =
  | "roll-call"
  | "morning-call"
  | "group-therapy"
  | "meeting"
  | "health"
  | "exercise"
  | "meal"
  | "announcement"
  | "handover"
  | "check-in";

type IconOption = {
  key: EventIconKey;
  label: string;
  Icon: LucideIcon;
};

const iconOptions: IconOption[] = [
  { key: "morning-call", label: "Morning Call", Icon: Bell },
  { key: "roll-call", label: "Roll Call", Icon: UserCheck },
  { key: "group-therapy", label: "Group Therapy", Icon: Users },
  { key: "meeting", label: "Meeting", Icon: ClipboardList },
  { key: "health", label: "Health", Icon: HeartPulse },
  { key: "exercise", label: "Exercise", Icon: Dumbbell },
  { key: "meal", label: "Meal", Icon: Coffee },
  { key: "announcement", label: "Announcement", Icon: Megaphone },
  { key: "handover", label: "Handover", Icon: Handshake },
  { key: "check-in", label: "Check In", Icon: MessageCircle },
];

const dayColumns = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const hourRows = Array.from({ length: 16 }, (_, index) => 7 + index);

const emptyNewEvent = {
  name: "",
  description: "",
  iconKey: "group-therapy" as EventIconKey,
  startTime: "09:00",
  endTime: "10:00",
  facilitatorType: "Staff",
};

function startOfWeekIso(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function addDaysIso(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-IE", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function timeFromHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function endTimeFromHour(hour: number) {
  return `${String(Math.min(hour + 1, 23)).padStart(2, "0")}:00`;
}

function getIconOption(key: string | null | undefined, fallbackName?: string) {
  const normalized = (key || fallbackName || "").trim().toLowerCase().replaceAll(" ", "-");
  return (
    iconOptions.find((option) => option.key === normalized) ??
    iconOptions.find((option) => normalized.includes(option.key)) ??
    iconOptions.find((option) => fallbackName?.toLowerCase().includes(option.label.toLowerCase())) ??
    iconOptions[2]
  );
}

function makeCode(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return normalized || `event-${Date.now()}`;
}

const UnitScheduler: React.FC<UnitSchedulerProps> = ({ unitId, unitName }) => {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const [mode, setMode] = useState<SchedulerMode>("template");
  const [weekStart, setWeekStart] = useState(() => startOfWeekIso(new Date()));
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplateDto[]>([]);
  const [occurrences, setOccurrences] = useState<ScheduleOccurrenceDto[]>([]);
  const [rosters, setRosters] = useState<Record<string, UnitStaffRosterBoardDto>>({});
  const [newEvent, setNewEvent] = useState(emptyNewEvent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unit = useMemo(
    () => units.find((entry) => entry.unitCode.toLowerCase() === unitId),
    [unitId, units],
  );

  const weekDates = useMemo(
    () => dayColumns.map((_, index) => addDaysIso(weekStart, index)),
    [weekStart],
  );

  const unitTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.isActive &&
          template.recurrenceType === "Weekly" &&
          template.unitId === unit?.unitId,
      ),
    [templates, unit?.unitId],
  );

  const weekOccurrences = useMemo(
    () =>
      occurrences.filter(
        (occurrence) =>
          occurrence.unitId === unit?.unitId &&
          occurrence.scheduledDate >= weekDates[0] &&
          occurrence.scheduledDate <= weekDates[6] &&
          occurrence.status !== "Cancelled",
      ),
    [occurrences, unit?.unitId, weekDates],
  );

  const staffOptions = useMemo(() => {
    const staffById = new Map<string, string>();
    Object.values(rosters).forEach((board) => {
      board.staff.forEach((staff) => staffById.set(staff.appUserId, staff.displayName));
    });
    return Array.from(staffById, ([appUserId, displayName]) => ({ appUserId, displayName }));
  }, [rosters]);

  const loadScheduler = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (!isAuthorizedClient(status, accessToken)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [nextUnits, nextTemplates, nextOccurrences] = await Promise.all([
        globalConfigurationService.getUnits(accessToken, false),
        globalConfigurationService.getScheduleTemplates(accessToken, true),
        globalConfigurationService.getScheduleOccurrences(accessToken),
      ]);
      setUnits(nextUnits);
      setTemplates(nextTemplates);
      setOccurrences(nextOccurrences);

      const rosterEntries = await Promise.all(
        weekDates.map(async (date) => [date, await staffRosterService.getBoard(accessToken, unitId, date)] as const),
      );
      setRosters(Object.fromEntries(rosterEntries));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load unit scheduler.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, status, unitId, weekDates]);

  useEffect(() => {
    void loadScheduler();
  }, [loadScheduler]);

  const buildTemplatePayload = useCallback(
    (template: ScheduleTemplateDto, weeklyDayOfWeek: number, startTime: string, endTime: string): UpsertScheduleTemplateRequest => ({
      centreId: template.centreId,
      unitId: template.unitId,
      programmeDefinitionId: template.programmeDefinitionId,
      code: template.code,
      name: template.name,
      description: template.description,
      category: template.category,
      recurrenceType: "Weekly",
      weeklyDayOfWeek,
      monthlyDayOfMonth: null,
      recurrenceStartDate: null,
      startTime,
      endTime,
      audienceType: template.audienceType || "UnitResidents",
      facilitatorType: template.facilitatorType || "Staff",
      facilitatorRole: template.facilitatorRole,
      externalResourceName: template.externalResourceName,
      isActive: template.isActive,
    }),
    [],
  );

  const buildOccurrencePayload = useCallback(
    (occurrence: ScheduleOccurrenceDto, scheduledDate: string, startTime: string, endTime: string): UpsertScheduleOccurrenceRequest => ({
      centreId: occurrence.centreId,
      unitId: occurrence.unitId,
      programmeDefinitionId: occurrence.programmeDefinitionId,
      templateId: occurrence.templateId,
      title: occurrence.title,
      description: occurrence.description,
      category: occurrence.category,
      scheduledDate,
      startTime,
      endTime,
      audienceType: occurrence.audienceType || "UnitResidents",
      facilitatorType: occurrence.facilitatorType || "Staff",
      facilitatorRole: occurrence.facilitatorRole,
      externalResourceName: occurrence.externalResourceName,
      status: occurrence.status || "Scheduled",
      notes: occurrence.notes,
    }),
    [],
  );

  const createTemplate = async () => {
    if (!unit || !newEvent.name.trim() || !isAuthorizedClient(status, accessToken)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await globalConfigurationService.createScheduleTemplate(accessToken, {
        centreId: unit.centreId,
        unitId: unit.unitId,
        programmeDefinitionId: unit.programmeDefinitionId ?? null,
        code: makeCode(newEvent.name),
        name: newEvent.name.trim(),
        description: newEvent.description.trim(),
        category: newEvent.iconKey,
        recurrenceType: "Weekly",
        weeklyDayOfWeek: 1,
        monthlyDayOfMonth: null,
        recurrenceStartDate: null,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        audienceType: "UnitResidents",
        facilitatorType: newEvent.facilitatorType,
        facilitatorRole: "",
        externalResourceName: "",
        isActive: true,
      });
      setNewEvent(emptyNewEvent);
      await loadScheduler();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create scheduler event.");
    } finally {
      setSaving(false);
    }
  };

  const archiveTemplate = async (templateId: string) => {
    setSaving(true);
    setError(null);
    try {
      await globalConfigurationService.archiveScheduleTemplate(accessToken, templateId);
      await loadScheduler();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive scheduler event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLElement>, dayValue: number, date: string, hour: number) => {
    event.preventDefault();
    if (!unit || !isAuthorizedClient(status, accessToken)) {
      return;
    }

    const raw = event.dataTransfer.getData("application/json");
    if (!raw) {
      return;
    }

    const payload = JSON.parse(raw) as DragPayload;
    const startTime = timeFromHour(hour);
    const endTime = endTimeFromHour(hour);

    setSaving(true);
    setError(null);
    try {
      if (payload.kind === "template") {
        const template = templates.find((entry) => entry.scheduleTemplateId === payload.templateId);
        if (!template) return;

        if (mode === "template") {
          await globalConfigurationService.updateScheduleTemplate(
            accessToken,
            template.scheduleTemplateId,
            buildTemplatePayload(template, dayValue, startTime, endTime),
          );
        } else {
          await globalConfigurationService.createScheduleOccurrence(accessToken, {
            centreId: template.centreId,
            unitId: template.unitId,
            programmeDefinitionId: template.programmeDefinitionId,
            templateId: template.scheduleTemplateId,
            title: template.name,
            description: template.description,
            category: template.category,
            scheduledDate: date,
            startTime,
            endTime,
            audienceType: template.audienceType || "UnitResidents",
            facilitatorType: template.facilitatorType || "Staff",
            facilitatorRole: template.facilitatorRole,
            externalResourceName: template.externalResourceName,
            status: "Scheduled",
            notes: "",
          });
        }
      }

      if (payload.kind === "occurrence") {
        const occurrence = occurrences.find((entry) => entry.scheduleOccurrenceId === payload.occurrenceId);
        if (!occurrence) return;
        await globalConfigurationService.updateScheduleOccurrence(
          accessToken,
          occurrence.scheduleOccurrenceId,
          buildOccurrencePayload(occurrence, date, startTime, endTime),
        );
      }

      await loadScheduler();
    } catch (dropError) {
      setError(dropError instanceof Error ? dropError.message : "Unable to update scheduler grid.");
    } finally {
      setSaving(false);
    }
  };

  const renderEventBlock = (entry: ScheduleTemplateDto | ScheduleOccurrenceDto, key: string, payload: DragPayload) => {
    const icon = getIconOption(entry.category, "name" in entry ? entry.name : entry.title);
    const Icon = icon.Icon;
    const title = "name" in entry ? entry.name : entry.title;
    const time = `${entry.startTime || "?"}${entry.endTime ? ` - ${entry.endTime}` : ""}`;

    return (
      <article
        key={key}
        draggable
        onDragStart={(dragEvent) => {
          dragEvent.dataTransfer.setData("application/json", JSON.stringify(payload));
          dragEvent.dataTransfer.effectAllowed = "move";
        }}
        className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-sm"
      >
        <div className="flex items-start gap-2">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-semibold text-[var(--app-text)]">{title}</h4>
            <p className="truncate text-[11px] text-[var(--app-text-muted)]">{time}</p>
          </div>
        </div>
      </article>
    );
  };

  if (status === "unauthenticated") {
    return (
      <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--app-warning)_28%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-warning)_10%,var(--app-surface))] p-4 text-sm text-[var(--app-text)]">
        Please sign in to access the unit scheduler.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="app-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--app-text)]">
              <CalendarDays className="h-6 w-6 text-[var(--app-primary)]" />
              {unitName} Unit Scheduler
            </h1>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              Build reusable weekly event templates, place exceptions into a selected week, and check staffed coverage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-1">
              {(["template", "week"] as SchedulerMode[]).map((nextMode) => (
                <button
                  key={nextMode}
                  type="button"
                  onClick={() => setMode(nextMode)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    mode === nextMode ? "app-primary-button" : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                  }`}
                >
                  {nextMode === "template" ? "Template" : "Week"}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]">
              Week
              <input
                type="date"
                value={weekStart}
                onChange={(event) => setWeekStart(startOfWeekIso(new Date(`${event.target.value}T00:00:00`)))}
                className="bg-transparent outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadScheduler()}
              disabled={loading || saving}
              className="app-secondary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-[color:color-mix(in_srgb,var(--app-danger)_28%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,var(--app-surface))] px-4 py-3 text-sm text-[var(--app-danger)]">
            {error}
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="app-card rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--app-text)]">Available Events</h2>
              <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary)]">
                {unitTemplates.length}
              </span>
            </div>
            <div className="space-y-2">
              {unitTemplates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm text-[var(--app-text-muted)]">
                  Create an event below to add it to the toolbar.
                </div>
              ) : (
                unitTemplates.map((template) => (
                  <div key={template.scheduleTemplateId} className="space-y-2">
                    {renderEventBlock(template, `toolbar:${template.scheduleTemplateId}`, {
                      kind: "template",
                      templateId: template.scheduleTemplateId,
                    })}
                    <button
                      type="button"
                      onClick={() => void archiveTemplate(template.scheduleTemplateId)}
                      disabled={saving}
                      className="text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-danger)]"
                    >
                      Archive
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="app-card rounded-xl p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--app-text)]">
              <CirclePlus className="h-4 w-4 text-[var(--app-primary)]" />
              New Event
            </h2>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                Name
                <input
                  value={newEvent.name}
                  onChange={(event) => setNewEvent((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                  placeholder="Morning Call"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                Description
                <textarea
                  value={newEvent.description}
                  onChange={(event) => setNewEvent((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 min-h-16 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                  Start
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(event) => setNewEvent((current) => ({ ...current, startTime: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                  />
                </label>
                <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                  End
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(event) => setNewEvent((current) => ({ ...current, endTime: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => setNewEvent((current) => ({ ...current, iconKey: key }))}
                    className={`inline-flex h-10 items-center justify-center rounded-lg border ${
                      newEvent.iconKey === key
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void createTemplate()}
                disabled={saving || !newEvent.name.trim()}
                className="app-primary-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Create Event
              </button>
            </div>
          </section>
        </aside>

        <section className="app-card overflow-hidden rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] p-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--app-text)]">
                {mode === "template" ? "Reusable Weekly Template" : formatWeekLabel(weekStart)}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                {mode === "template"
                  ? "Drop toolbar events into recurring day/time slots."
                  : "Drop toolbar events to add this week's exceptions, or move existing week events."}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--app-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--app-primary)]" />
              Staff list from roster
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-[var(--app-text-muted)]">Loading scheduler...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[76px_repeat(7,minmax(128px,1fr))] border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                  <div className="p-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">Time</div>
                  {dayColumns.map((day, index) => (
                    <div key={day.value} className="border-l border-[var(--app-border)] p-3">
                      <p className="text-sm font-semibold text-[var(--app-text)]">{day.label}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{weekDates[index]}</p>
                    </div>
                  ))}
                </div>
                {hourRows.map((hour) => (
                  <div key={hour} className="grid min-h-28 grid-cols-[76px_repeat(7,minmax(128px,1fr))] border-b border-[var(--app-border)]">
                    <div className="bg-[var(--app-surface-muted)] p-3 text-xs font-semibold text-[var(--app-text-muted)]">
                      {timeFromHour(hour)}
                    </div>
                    {dayColumns.map((day, index) => {
                      const date = weekDates[index];
                      const templatesForCell = unitTemplates.filter(
                        (template) => template.weeklyDayOfWeek === day.value && Math.floor(minutesFromTime(template.startTime) / 60) === hour,
                      );
                      const occurrencesForCell = weekOccurrences.filter(
                        (occurrence) => occurrence.scheduledDate === date && Math.floor(minutesFromTime(occurrence.startTime) / 60) === hour,
                      );
                      const eventsForCell = mode === "template" ? templatesForCell : occurrencesForCell;
                      const roster = rosters[date];

                      return (
                        <div
                          key={`${day.value}:${hour}`}
                          onDragOver={(dragEvent) => {
                            dragEvent.preventDefault();
                            dragEvent.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(dropEvent) => void handleDrop(dropEvent, day.value, date, hour)}
                          className="space-y-2 border-l border-[var(--app-border)] bg-[var(--app-surface)] p-2"
                        >
                          {eventsForCell.map((entry) =>
                            "scheduleTemplateId" in entry
                              ? renderEventBlock(entry, `grid-template:${entry.scheduleTemplateId}`, {
                                  kind: "template",
                                  templateId: entry.scheduleTemplateId,
                                })
                              : renderEventBlock(entry, `grid-occurrence:${entry.scheduleOccurrenceId}`, {
                                  kind: "occurrence",
                                  occurrenceId: entry.scheduleOccurrenceId,
                                }),
                          )}
                          {mode === "week" && roster && eventsForCell.length > 0 && (
                            <label className="block text-[11px] font-medium text-[var(--app-text-muted)]">
                              Staff
                              <select
                                className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2 py-1 text-xs text-[var(--app-text)]"
                                defaultValue=""
                                disabled
                              >
                                <option value="">
                                  {staffOptions.length > 0 ? "Assign in roster" : "No staff available"}
                                </option>
                              </select>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UnitScheduler;
