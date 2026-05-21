"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Bed,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  Coffee,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Megaphone,
  MessageCircle,
  Moon,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Target,
  Trash2,
  UtensilsCrossed,
  Users,
  Wrench,
  X,
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
    }
  | {
      kind: "library";
      eventCode: string;
    }
  | {
      kind: "resize-template";
      templateId: string;
    }
  | {
      kind: "resize-occurrence";
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

type EventVisual = IconOption & {
  colorClass: string;
};

const iconOptions: IconOption[] = [
  { key: "morning-call", label: "Morning Call", Icon: Bell },
  { key: "roll-call", label: "Roll Call", Icon: Users },
  { key: "group-therapy", label: "Group Therapy", Icon: Users },
  { key: "meeting", label: "Meeting", Icon: ClipboardList },
  { key: "health", label: "Health", Icon: HeartPulse },
  { key: "exercise", label: "Exercise", Icon: Wrench },
  { key: "meal", label: "Meal", Icon: UtensilsCrossed },
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

type EventDraft = typeof emptyNewEvent;

type EventEditor =
  | { mode: "create" }
  | { mode: "template"; template: ScheduleTemplateDto }
  | { mode: "occurrence"; occurrence: ScheduleOccurrenceDto };

type SchedulerLibraryEvent = {
  code: string;
  name: string;
  description: string;
  category: EventIconKey;
  startTime: string;
  endTime: string;
  facilitatorType: string;
};

const standardEventLibrary: SchedulerLibraryEvent[] = [
  { code: "breakfast", name: "Breakfast", description: "Morning meal service", category: "meal", startTime: "08:00", endTime: "08:30", facilitatorType: "None" },
  { code: "lunch", name: "Lunch", description: "Midday meal service", category: "meal", startTime: "12:30", endTime: "13:00", facilitatorType: "None" },
  { code: "dinner", name: "Dinner", description: "Evening meal service", category: "meal", startTime: "17:30", endTime: "18:00", facilitatorType: "None" },
  { code: "roll-call", name: "Roll Call", description: "Resident attendance check", category: "roll-call", startTime: "07:15", endTime: "07:45", facilitatorType: "None" },
  { code: "meditation", name: "Meditation", description: "Guided meditation session", category: "morning-call", startTime: "07:30", endTime: "07:45", facilitatorType: "Staff" },
  { code: "group-therapy", name: "Group Therapy", description: "Facilitated group therapy session", category: "group-therapy", startTime: "10:00", endTime: "11:00", facilitatorType: "Staff" },
  { code: "aa-meeting", name: "AA Meeting", description: "Alcoholics Anonymous meeting", category: "meeting", startTime: "20:30", endTime: "21:30", facilitatorType: "External" },
  { code: "na-meeting", name: "NA Meeting", description: "Narcotics Anonymous meeting", category: "meeting", startTime: "20:30", endTime: "21:30", facilitatorType: "External" },
  { code: "ga-meeting", name: "GA Meeting", description: "Gamblers Anonymous meeting", category: "meeting", startTime: "20:30", endTime: "21:30", facilitatorType: "External" },
  { code: "mass", name: "Mass", description: "Mass or spiritual service", category: "meeting", startTime: "10:00", endTime: "11:00", facilitatorType: "External" },
  { code: "occupational-therapy", name: "Occupational Therapy", description: "Occupational therapy session", category: "exercise", startTime: "09:00", endTime: "10:00", facilitatorType: "Staff" },
  { code: "copywriting", name: "Copywriting", description: "Copywriting or written reflection session", category: "meeting", startTime: "14:00", endTime: "15:00", facilitatorType: "Staff" },
];

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

function timeFromMinutes(totalMinutes: number) {
  const clamped = Math.max(0, Math.min(totalMinutes, 23 * 60 + 45));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addMinutesToTime(value: string, minutes: number) {
  return timeFromMinutes(minutesFromTime(value) + minutes);
}

function durationMinutes(startTime: string, endTime: string | null | undefined) {
  const start = minutesFromTime(startTime);
  const end = minutesFromTime(endTime || "");
  return Math.max(15, end > start ? end - start : 60);
}

function dropStartMinutes(event: React.DragEvent<HTMLElement>, hour: number) {
  const rect = event.currentTarget.getBoundingClientRect();
  const relativeY = Math.max(0, Math.min(event.clientY - rect.top, rect.height - 1));
  const quarter = Math.floor(relativeY / (rect.height / 4)) * 15;
  return hour * 60 + quarter;
}

function dropEndMinutes(event: React.DragEvent<HTMLElement>, hour: number) {
  const rect = event.currentTarget.getBoundingClientRect();
  const relativeY = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  const quarter = Math.max(1, Math.round(relativeY / (rect.height / 4))) * 15;
  return hour * 60 + Math.min(quarter, 60);
}

function eventBlockStyle(startTime: string, endTime: string, index: number): React.CSSProperties {
  const quarter = Math.floor((minutesFromTime(startTime) % 60) / 15);
  const height = Math.max(42, Math.round((durationMinutes(startTime, endTime) / 60) * 88));
  return {
    marginTop: index === 0 ? quarter * 18 : 4,
    minHeight: height,
  };
}

function getCodName(roster?: UnitStaffRosterBoardDto, period?: "morning" | "evening") {
  const codShifts = roster?.shifts.filter((shift) => {
    const key = `${shift.shiftType} ${shift.label}`.toLowerCase();
    return key.includes("cod") || key.includes("counsellor on duty");
  }) ?? [];

  if (!period) {
    return codShifts[0]?.assignedStaffName;
  }

  const splitMinutes = 14 * 60;
  const matchingShift = codShifts.find((shift) =>
    period === "morning" ? shift.startMinutes < splitMinutes : shift.endMinutes > splitMinutes,
  );
  return matchingShift?.assignedStaffName ?? codShifts[0]?.assignedStaffName;
}

function replaceById<T>(items: T[], nextItem: T, getId: (item: T) => string) {
  const nextId = getId(nextItem);
  const found = items.some((item) => getId(item) === nextId);
  return found ? items.map((item) => (getId(item) === nextId ? nextItem : item)) : [...items, nextItem];
}

function getEventVisual(key: string | null | undefined, fallbackName?: string): EventVisual {
  const normalized = (key || fallbackName || "").trim().toLowerCase().replaceAll(" ", "-");
  const title = (fallbackName || "").trim();

  switch (title) {
    case "Wake Up Bell":
      return { key: "morning-call", label: "Morning Call", Icon: Bell, colorClass: "bg-orange-500" };
    case "Roll Call":
      return { key: "roll-call", label: "Roll Call", Icon: Users, colorClass: "bg-blue-500" };
    case "AA/NA/GA":
    case "AA Meeting":
    case "NA Meeting":
    case "GA Meeting":
      return { key: "roll-call", label: "Roll Call", Icon: Users, colorClass: "bg-emerald-500" };
    case "Works/Group":
      return { key: "meeting", label: "Meeting", Icon: Briefcase, colorClass: "bg-purple-500" };
    case "Room Check":
      return { key: "check-in", label: "Check In", Icon: Bed, colorClass: "bg-green-500" };
    case "Coffee":
      return { key: "meal", label: "Meal", Icon: Coffee, colorClass: "bg-amber-600" };
    case "OT":
    case "Occupational Therapy":
      return { key: "exercise", label: "Exercise", Icon: Wrench, colorClass: "bg-teal-500" };
    case "Lunch":
    case "Tea":
    case "Dinner":
    case "Breakfast":
      return { key: "meal", label: "Meal", Icon: UtensilsCrossed, colorClass: "bg-red-500" };
    case "Gambling Aware":
      return { key: "meeting", label: "Meeting", Icon: Brain, colorClass: "bg-indigo-500" };
    case "Focus Meeting":
    case "OT/Focus":
      return { key: "meeting", label: "Meeting", Icon: Target, colorClass: "bg-cyan-500" };
    case "Group A":
      return { key: "group-therapy", label: "Group Therapy", Icon: HeartHandshake, colorClass: "bg-pink-500" };
    case "Group B":
      return { key: "group-therapy", label: "Group Therapy", Icon: HeartHandshake, colorClass: "bg-purple-500" };
    case "Group C":
      return { key: "group-therapy", label: "Group Therapy", Icon: HeartHandshake, colorClass: "bg-blue-500" };
    case "Group Therapy":
      return { key: "group-therapy", label: "Group Therapy", Icon: HeartHandshake, colorClass: "bg-pink-500" };
    case "Rosary":
    case "Mass":
      return { key: "meeting", label: "Meeting", Icon: BookOpen, colorClass: "bg-violet-500" };
    case "Bedtime":
      return { key: "check-in", label: "Check In", Icon: Moon, colorClass: "bg-slate-600" };
    default:
      break;
  }

  const iconOption =
    iconOptions.find((option) => option.key === normalized) ??
    iconOptions.find((option) => normalized.includes(option.key)) ??
    iconOptions.find((option) => fallbackName?.toLowerCase().includes(option.label.toLowerCase())) ??
    iconOptions[2];

  return { ...iconOption, colorClass: "bg-slate-500" };
}

function getIconOption(key: string | null | undefined, fallbackName?: string) {
  return getEventVisual(key, fallbackName);
}

function makeCode(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return normalized || `event-${Date.now()}`;
}

function makeLibraryTemplate(
  event: SchedulerLibraryEvent,
  unit: UnitConfigurationDto,
  dayValue: number,
  startTime: string,
  endTime: string,
): UpsertScheduleTemplateRequest {
  return {
    centreId: unit.centreId,
    unitId: unit.unitId,
    programmeDefinitionId: unit.programmeDefinitionId ?? null,
    code: event.code,
    name: event.name,
    description: event.description,
    category: event.category,
    recurrenceType: "Weekly",
    weeklyDayOfWeek: dayValue,
    monthlyDayOfMonth: null,
    recurrenceStartDate: null,
    startTime,
    endTime,
    audienceType: "UnitResidents",
    facilitatorType: event.facilitatorType,
    facilitatorRole: "",
    externalResourceName: "",
    isActive: true,
  };
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
  const [eventEditor, setEventEditor] = useState<EventEditor | null>(null);
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

  const placedTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.isActive &&
          template.unitId === unit?.unitId &&
          template.recurrenceType === "Weekly",
      ),
    [templates, unit?.unitId],
  );

  const availableTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.isActive &&
          (!template.unitId || template.unitId !== unit?.unitId || template.recurrenceType !== "Weekly") &&
          ["Daily", "Weekly"].includes(template.recurrenceType) &&
          template.name !== "AA/NA/GA",
      ),
    [templates, unit?.unitId],
  );

  const toolbarEvents = useMemo(() => {
    const templateCodes = new Set(availableTemplates.map((template) => makeCode(template.name)));
    return standardEventLibrary.filter((event) => !templateCodes.has(makeCode(event.name)));
  }, [availableTemplates]);

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

  const openCreateEvent = () => {
    setNewEvent(emptyNewEvent);
    setEventEditor({ mode: "create" });
  };

  const openTemplateEditor = (template: ScheduleTemplateDto) => {
    setNewEvent({
      name: template.name,
      description: template.description || "",
      iconKey: getIconOption(template.category, template.name).key,
      startTime: template.startTime || "09:00",
      endTime: template.endTime || addMinutesToTime(template.startTime || "09:00", 60),
      facilitatorType: template.facilitatorType || "Staff",
    });
    setEventEditor({ mode: "template", template });
  };

  const openOccurrenceEditor = (occurrence: ScheduleOccurrenceDto) => {
    setNewEvent({
      name: occurrence.title,
      description: occurrence.description || "",
      iconKey: getIconOption(occurrence.category, occurrence.title).key,
      startTime: occurrence.startTime || "09:00",
      endTime: occurrence.endTime || addMinutesToTime(occurrence.startTime || "09:00", 60),
      facilitatorType: occurrence.facilitatorType || "Staff",
    });
    setEventEditor({ mode: "occurrence", occurrence });
  };

  const closeEventEditor = useCallback(() => {
    if (saving) return;
    setEventEditor(null);
    setNewEvent(emptyNewEvent);
  }, [saving]);

  useEffect(() => {
    if (!eventEditor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEventEditor();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeEventEditor, eventEditor]);

  const createTemplate = async (draft: EventDraft = newEvent) => {
    if (!unit || !draft.name.trim() || !isAuthorizedClient(status, accessToken)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const createdTemplate = await globalConfigurationService.createScheduleTemplate(accessToken, {
        centreId: unit.centreId,
        unitId: unit.unitId,
        programmeDefinitionId: unit.programmeDefinitionId ?? null,
        code: makeCode(draft.name),
        name: draft.name.trim(),
        description: draft.description.trim(),
        category: draft.iconKey,
        recurrenceType: "Weekly",
        weeklyDayOfWeek: 1,
        monthlyDayOfMonth: null,
        recurrenceStartDate: null,
        startTime: draft.startTime,
        endTime: draft.endTime,
        audienceType: "UnitResidents",
        facilitatorType: draft.facilitatorType,
        facilitatorRole: "",
        externalResourceName: "",
        isActive: true,
      });
      setTemplates((current) => replaceById(current, createdTemplate, (entry) => entry.scheduleTemplateId));
      setNewEvent(emptyNewEvent);
      setEventEditor(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create scheduler event.");
    } finally {
      setSaving(false);
    }
  };

  const saveEventEditor = async () => {
    if (!eventEditor) return;

    if (eventEditor.mode === "create") {
      await createTemplate(newEvent);
      return;
    }

    if (!newEvent.name.trim() || !isAuthorizedClient(status, accessToken)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (eventEditor.mode === "template") {
        const template = eventEditor.template;
        const updatedTemplate = await globalConfigurationService.updateScheduleTemplate(
          accessToken,
          template.scheduleTemplateId,
          {
            ...buildTemplatePayload(
              template,
              template.weeklyDayOfWeek ?? 1,
              newEvent.startTime,
              newEvent.endTime,
            ),
            name: newEvent.name.trim(),
            description: newEvent.description.trim(),
            category: newEvent.iconKey,
            facilitatorType: newEvent.facilitatorType,
          },
        );
        setTemplates((current) => replaceById(current, updatedTemplate, (entry) => entry.scheduleTemplateId));
      } else {
        const occurrence = eventEditor.occurrence;
        const updatedOccurrence = await globalConfigurationService.updateScheduleOccurrence(
          accessToken,
          occurrence.scheduleOccurrenceId,
          {
            ...buildOccurrencePayload(
              occurrence,
              occurrence.scheduledDate,
              newEvent.startTime,
              newEvent.endTime,
            ),
            title: newEvent.name.trim(),
            description: newEvent.description.trim(),
            category: newEvent.iconKey,
            facilitatorType: newEvent.facilitatorType,
          },
        );
        setOccurrences((current) => replaceById(current, updatedOccurrence, (entry) => entry.scheduleOccurrenceId));
      }

      setEventEditor(null);
      setNewEvent(emptyNewEvent);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save scheduler event.");
    } finally {
      setSaving(false);
    }
  };

  const archiveTemplate = async (templateId: string) => {
    setSaving(true);
    setError(null);
    try {
      await globalConfigurationService.archiveScheduleTemplate(accessToken, templateId);
      setTemplates((current) =>
        current.map((template) =>
          template.scheduleTemplateId === templateId ? { ...template, isActive: false } : template,
        ),
      );
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive scheduler event.");
    } finally {
      setSaving(false);
    }
  };

  const findPlacedTemplate = (name: string, dayValue: number, startTime: string) =>
    placedTemplates.find(
      (template) =>
        template.name === name &&
        template.weeklyDayOfWeek === dayValue &&
        template.startTime === startTime,
    );

  const findWeekOccurrence = (title: string, date: string, startTime: string) =>
    weekOccurrences.find(
      (occurrence) =>
        occurrence.title === title &&
        occurrence.scheduledDate === date &&
        occurrence.startTime === startTime,
    );

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
    const dropMinutes =
      payload.kind === "resize-template" || payload.kind === "resize-occurrence"
        ? dropEndMinutes(event, hour)
        : dropStartMinutes(event, hour);
    const startTime = timeFromMinutes(dropMinutes);

    setSaving(true);
    setError(null);
    try {
      if (payload.kind === "template") {
        const template = templates.find((entry) => entry.scheduleTemplateId === payload.templateId);
        if (!template) return;
        const endTime = addMinutesToTime(startTime, durationMinutes(template.startTime, template.endTime));

        if (mode === "template" && template.unitId === unit.unitId && template.recurrenceType === "Weekly") {
          const updatedTemplate = await globalConfigurationService.updateScheduleTemplate(
            accessToken,
            template.scheduleTemplateId,
            buildTemplatePayload(template, dayValue, startTime, endTime),
          );
          setTemplates((current) => replaceById(current, updatedTemplate, (entry) => entry.scheduleTemplateId));
        } else if (mode === "template") {
          const existingTemplate = findPlacedTemplate(template.name, dayValue, startTime);
          const templatePayload = {
            centreId: template.centreId,
            unitId: unit.unitId,
            programmeDefinitionId: template.programmeDefinitionId ?? unit.programmeDefinitionId ?? null,
            code: `${template.code}-${dayValue}-${startTime.replace(":", "")}`,
            name: template.name,
            description: template.description,
            category: template.category,
            recurrenceType: "Weekly",
            weeklyDayOfWeek: dayValue,
            monthlyDayOfMonth: null,
            recurrenceStartDate: null,
            startTime,
            endTime,
            audienceType: template.audienceType || "UnitResidents",
            facilitatorType: template.facilitatorType || "Staff",
            facilitatorRole: template.facilitatorRole,
            externalResourceName: template.externalResourceName,
            isActive: true,
          };
          const savedTemplate = existingTemplate
            ? await globalConfigurationService.updateScheduleTemplate(
                accessToken,
                existingTemplate.scheduleTemplateId,
                { ...templatePayload, code: existingTemplate.code },
              )
            : await globalConfigurationService.createScheduleTemplate(accessToken, templatePayload);
          setTemplates((current) => replaceById(current, savedTemplate, (entry) => entry.scheduleTemplateId));
        } else {
          const existingOccurrence = findWeekOccurrence(template.name, date, startTime);
          const occurrencePayload = {
            centreId: template.centreId,
            unitId: unit.unitId,
            programmeDefinitionId: template.programmeDefinitionId ?? unit.programmeDefinitionId ?? null,
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
          };
          const savedOccurrence = existingOccurrence
            ? await globalConfigurationService.updateScheduleOccurrence(
                accessToken,
                existingOccurrence.scheduleOccurrenceId,
                occurrencePayload,
              )
            : await globalConfigurationService.createScheduleOccurrence(accessToken, occurrencePayload);
          setOccurrences((current) => replaceById(current, savedOccurrence, (entry) => entry.scheduleOccurrenceId));
        }
      }

      if (payload.kind === "occurrence") {
        const occurrence = occurrences.find((entry) => entry.scheduleOccurrenceId === payload.occurrenceId);
        if (!occurrence) return;
        const endTime = addMinutesToTime(startTime, durationMinutes(occurrence.startTime, occurrence.endTime));
        const updatedOccurrence = await globalConfigurationService.updateScheduleOccurrence(
          accessToken,
          occurrence.scheduleOccurrenceId,
          buildOccurrencePayload(occurrence, date, startTime, endTime),
        );
        setOccurrences((current) => replaceById(current, updatedOccurrence, (entry) => entry.scheduleOccurrenceId));
      }

      if (payload.kind === "library") {
        const libraryEvent = standardEventLibrary.find((entry) => entry.code === payload.eventCode);
        if (!libraryEvent) return;
        const endTime = addMinutesToTime(startTime, durationMinutes(libraryEvent.startTime, libraryEvent.endTime));

        if (mode === "template") {
          const existingTemplate = findPlacedTemplate(libraryEvent.name, dayValue, startTime);
          const templatePayload = {
            ...makeLibraryTemplate(libraryEvent, unit, dayValue, startTime, endTime),
            code: `${libraryEvent.code}-${dayValue}-${startTime.replace(":", "")}`,
          };
          const savedTemplate = existingTemplate
            ? await globalConfigurationService.updateScheduleTemplate(
                accessToken,
                existingTemplate.scheduleTemplateId,
                { ...templatePayload, code: existingTemplate.code },
              )
            : await globalConfigurationService.createScheduleTemplate(accessToken, templatePayload);
          setTemplates((current) => replaceById(current, savedTemplate, (entry) => entry.scheduleTemplateId));
        } else {
          const existingOccurrence = findWeekOccurrence(libraryEvent.name, date, startTime);
          const occurrencePayload = {
            centreId: unit.centreId,
            unitId: unit.unitId,
            programmeDefinitionId: unit.programmeDefinitionId ?? null,
            templateId: null,
            title: libraryEvent.name,
            description: libraryEvent.description,
            category: libraryEvent.category,
            scheduledDate: date,
            startTime,
            endTime,
            audienceType: "UnitResidents",
            facilitatorType: libraryEvent.facilitatorType,
            facilitatorRole: "",
            externalResourceName: "",
            status: "Scheduled",
            notes: "",
          };
          const savedOccurrence = existingOccurrence
            ? await globalConfigurationService.updateScheduleOccurrence(
                accessToken,
                existingOccurrence.scheduleOccurrenceId,
                occurrencePayload,
              )
            : await globalConfigurationService.createScheduleOccurrence(accessToken, occurrencePayload);
          setOccurrences((current) => replaceById(current, savedOccurrence, (entry) => entry.scheduleOccurrenceId));
        }
      }

      if (payload.kind === "resize-template") {
        const template = templates.find((entry) => entry.scheduleTemplateId === payload.templateId);
        if (!template) return;
        const endTime = timeFromMinutes(Math.max(dropMinutes, minutesFromTime(template.startTime) + 15));
        const updatedTemplate = await globalConfigurationService.updateScheduleTemplate(
          accessToken,
          template.scheduleTemplateId,
          buildTemplatePayload(template, template.weeklyDayOfWeek ?? dayValue, template.startTime, endTime),
        );
        setTemplates((current) => replaceById(current, updatedTemplate, (entry) => entry.scheduleTemplateId));
      }

      if (payload.kind === "resize-occurrence") {
        const occurrence = occurrences.find((entry) => entry.scheduleOccurrenceId === payload.occurrenceId);
        if (!occurrence) return;
        const endTime = timeFromMinutes(Math.max(dropMinutes, minutesFromTime(occurrence.startTime) + 15));
        const updatedOccurrence = await globalConfigurationService.updateScheduleOccurrence(
          accessToken,
          occurrence.scheduleOccurrenceId,
          buildOccurrencePayload(occurrence, occurrence.scheduledDate, occurrence.startTime, endTime),
        );
        setOccurrences((current) => replaceById(current, updatedOccurrence, (entry) => entry.scheduleOccurrenceId));
      }
    } catch (dropError) {
      setError(dropError instanceof Error ? dropError.message : "Unable to update scheduler grid.");
    } finally {
      setSaving(false);
    }
  };

  const renderEventBlock = (
    entry: ScheduleTemplateDto | ScheduleOccurrenceDto,
    key: string,
    payload: DragPayload,
    variant: "toolbar" | "grid" = "grid",
    style?: React.CSSProperties,
  ) => {
    const title = "name" in entry ? entry.name : entry.title;
    const visual = getEventVisual(entry.category, title);
    const Icon = visual.Icon;
    const time = `${entry.startTime || "?"}${entry.endTime ? ` - ${entry.endTime}` : ""}`;
    const detail = entry.description ? `${title}: ${entry.description}` : title;
    const tooltip = variant === "toolbar" ? `${detail}${time ? ` (${time})` : ""}` : undefined;
    const openEditor = () => {
      if ("scheduleTemplateId" in entry) {
        openTemplateEditor(entry);
      } else {
        openOccurrenceEditor(entry);
      }
    };

    return (
      <article
        key={key}
        draggable
        onDragStart={(dragEvent) => {
          dragEvent.dataTransfer.setData("application/json", JSON.stringify(payload));
          dragEvent.dataTransfer.effectAllowed = "move";
        }}
        className={`group relative rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm ${
          variant === "toolbar" ? "flex h-10 w-10 shrink-0 items-center justify-center p-1" : "p-2 pb-3"
        }`}
        style={style}
        title={tooltip}
        aria-label={tooltip}
      >
        <div className={variant === "toolbar" ? "flex items-center justify-center" : "flex items-start gap-2"}>
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${visual.colorClass}`}>
            <Icon className="h-4 w-4 text-white" />
          </span>
          {variant === "grid" && (
            <>
              <button type="button" onClick={openEditor} className="min-w-0 flex-1 text-left">
                <h4 className="truncate text-xs font-semibold text-[var(--app-text)]">{title}</h4>
                <p className="truncate text-[11px] text-[var(--app-text-muted)]">{time}</p>
              </button>
              <button
                type="button"
                onClick={openEditor}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] opacity-0 hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] group-hover:opacity-100"
                aria-label={`Edit ${title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        {variant === "grid" && (
          <div
            draggable
            onDragStart={(dragEvent) => {
              dragEvent.stopPropagation();
              dragEvent.dataTransfer.setData(
                "application/json",
                JSON.stringify(
                  "scheduleTemplateId" in entry
                    ? ({ kind: "resize-template", templateId: entry.scheduleTemplateId } satisfies DragPayload)
                    : ({ kind: "resize-occurrence", occurrenceId: entry.scheduleOccurrenceId } satisfies DragPayload),
                ),
              );
              dragEvent.dataTransfer.effectAllowed = "move";
            }}
            className="absolute inset-x-2 bottom-1 h-2 cursor-ns-resize rounded-full bg-[var(--app-border)] opacity-0 group-hover:opacity-100"
            title="Drag to extend"
          />
        )}
      </article>
    );
  };

  const renderLibraryEventBlock = (entry: SchedulerLibraryEvent) => {
    const visual = getEventVisual(entry.category, entry.name);
    const Icon = visual.Icon;
    const tooltip = `${entry.name}: ${entry.description} (${entry.startTime} - ${entry.endTime})`;

    return (
      <article
        key={`library:${entry.code}`}
        draggable
        onDragStart={(dragEvent) => {
          dragEvent.dataTransfer.setData("application/json", JSON.stringify({ kind: "library", eventCode: entry.code } satisfies DragPayload));
          dragEvent.dataTransfer.effectAllowed = "copy";
        }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-1 shadow-sm"
        title={tooltip}
        aria-label={tooltip}
      >
        <div className="flex items-center justify-center">
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${visual.colorClass}`}>
            <Icon className="h-4 w-4 text-white" />
          </span>
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

      <section className="app-card rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h2 className="shrink-0 text-sm font-semibold text-[var(--app-text)]">Available Events</h2>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
              {availableTemplates.length === 0 && toolbarEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text-muted)]">
                  No events yet.
                </div>
              ) : (
                <>
                  {availableTemplates.map((template) =>
                    renderEventBlock(
                      template,
                      `toolbar:${template.scheduleTemplateId}`,
                      {
                        kind: "template",
                        templateId: template.scheduleTemplateId,
                      },
                      "toolbar",
                    ),
                  )}
                  {toolbarEvents.map(renderLibraryEventBlock)}
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateEvent}
            className="app-primary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <CirclePlus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </section>

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
            <div className="max-h-[68vh] overflow-auto">
              <div className="min-w-[820px]">
                <div className="sticky top-0 z-20 grid grid-cols-[64px_repeat(7,minmax(104px,1fr))] border-b border-[var(--app-border)] bg-[var(--app-surface-muted)] shadow-sm">
                  <div className="p-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">Time</div>
                  {dayColumns.map((day, index) => (
                    <div key={day.value} className="border-l border-[var(--app-border)] p-3">
                      <p className="text-sm font-semibold text-[var(--app-text)]">{day.label}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{weekDates[index]}</p>
                      <p className="mt-1 truncate text-[11px] font-semibold text-[var(--app-primary)]">
                        COD: {getCodName(rosters[weekDates[index]], "morning") || "Unassigned"}
                      </p>
                    </div>
                  ))}
                </div>
                {hourRows.map((hour) => (
                  <React.Fragment key={hour}>
                    {hour === 14 && (
                      <div className="sticky top-[84px] z-10 grid grid-cols-[64px_repeat(7,minmax(104px,1fr))] border-b border-[var(--app-border)] bg-[var(--app-surface-muted)] shadow-sm">
                        <div className="p-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
                          14:00
                        </div>
                        {dayColumns.map((day, index) => (
                          <div key={`evening:${day.value}`} className="border-l border-[var(--app-border)] p-3">
                            <p className="text-sm font-semibold text-[var(--app-text)]">Evening</p>
                            <p className="mt-1 truncate text-[11px] font-semibold text-[var(--app-primary)]">
                              COD: {getCodName(rosters[weekDates[index]], "evening") || "Unassigned"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid min-h-24 grid-cols-[64px_repeat(7,minmax(104px,1fr))] border-b border-[var(--app-border)]">
                      <div className="bg-[var(--app-surface-muted)] p-3 text-xs font-semibold text-[var(--app-text-muted)]">
                        {timeFromHour(hour)}
                    </div>
                    {dayColumns.map((day, index) => {
                      const date = weekDates[index];
                      const templatesForCell = placedTemplates.filter(
                        (template) =>
                          template.weeklyDayOfWeek === day.value &&
                          Math.floor(minutesFromTime(template.startTime) / 60) === hour,
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
                          className="space-y-2 border-l border-[var(--app-border)] bg-[var(--app-surface)] bg-repeat-x p-2"
                          style={{
                            backgroundImage:
                              "linear-gradient(to bottom, transparent calc(50% - 1px), color-mix(in srgb, var(--app-border) 55%, transparent) 50%, transparent calc(50% + 1px)), radial-gradient(circle, color-mix(in srgb, var(--app-border) 60%, transparent) 1px, transparent 1.5px), radial-gradient(circle, color-mix(in srgb, var(--app-border) 60%, transparent) 1px, transparent 1.5px)",
                            backgroundPosition: "0 0, 0 25%, 0 75%",
                            backgroundSize: "100% 100%, 8px 100%, 8px 100%",
                          }}
                        >
                          {eventsForCell.map((entry, entryIndex) =>
                            "scheduleTemplateId" in entry
                              ? renderEventBlock(
                                  entry,
                                  `grid-template:${entry.scheduleTemplateId}`,
                                  {
                                    kind: "template",
                                    templateId: entry.scheduleTemplateId,
                                  },
                                  "grid",
                                  eventBlockStyle(entry.startTime, entry.endTime, entryIndex),
                                )
                              : renderEventBlock(
                                  entry,
                                  `grid-occurrence:${entry.scheduleOccurrenceId}`,
                                  {
                                    kind: "occurrence",
                                    occurrenceId: entry.scheduleOccurrenceId,
                                  },
                                  "grid",
                                  eventBlockStyle(entry.startTime, entry.endTime, entryIndex),
                                ),
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
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </section>

      {eventEditor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onMouseDown={closeEventEditor}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
              <h2 className="text-base font-semibold text-[var(--app-text)]">
                {eventEditor.mode === "create" ? "New Event" : "Edit Event"}
              </h2>
              <button
                type="button"
                onClick={closeEventEditor}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                aria-label="Close event editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
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
                  className="mt-1 min-h-20 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                  Start
                  <input
                    type="time"
                    step={900}
                    value={newEvent.startTime}
                    onChange={(event) => setNewEvent((current) => ({ ...current, startTime: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                  />
                </label>
                <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                  End
                  <input
                    type="time"
                    step={900}
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
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--app-border)] px-5 py-4">
              {eventEditor.mode === "template" ? (
                <button
                  type="button"
                  onClick={() => void archiveTemplate(eventEditor.template.scheduleTemplateId).then(() => closeEventEditor())}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-danger)] hover:bg-[color:color-mix(in_srgb,var(--app-danger)_8%,var(--app-surface))] disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Archive
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEventEditor}
                  disabled={saving}
                  className="app-secondary-button rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveEventEditor()}
                  disabled={saving || !newEvent.name.trim()}
                  className="app-primary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {eventEditor.mode === "create" ? "Create Event" : "Save Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitScheduler;
