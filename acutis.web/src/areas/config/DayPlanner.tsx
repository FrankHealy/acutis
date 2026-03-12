"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ArrowLeft,
  RotateCcw,
  Save,
  Users,
  Briefcase,
  HeartHandshake,
  Bed,
  Coffee,
  Wrench,
  UtensilsCrossed,
  Target,
  Brain,
  BookOpen,
  Church,
  Dice5,
  GlassWater,
  Pill,
  FileEdit,
  ClipboardCheck,
} from "lucide-react";

type UnitId = "alcohol" | "detox" | "drugs" | "ladies";
type PeriodId = "morning" | "evening";

type ScheduleItem = {
  id: string;
  title: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  durationSlots: number;
  locked?: boolean;
};

type DaySchedule = {
  morning: ScheduleItem[];
  evening: ScheduleItem[];
};

type WeekSchedule = Record<string, DaySchedule>;

const Weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Units: { id: UnitId; name: string; accent: string; chip: string }[] = [
  { id: "alcohol", name: "Alcohol Unit", accent: "text-[var(--app-warning)]", chip: "bg-[color:color-mix(in_srgb,var(--app-warning)_16%,white)] text-[var(--app-warning)]" },
  { id: "detox", name: "Detox Unit", accent: "text-[var(--app-primary)]", chip: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" },
  { id: "drugs", name: "Drugs Unit", accent: "text-[var(--app-success)]", chip: "bg-[color:color-mix(in_srgb,var(--app-success)_16%,white)] text-[var(--app-success)]" },
  { id: "ladies", name: "Ladies Unit", accent: "text-[var(--app-accent)]", chip: "bg-[var(--app-accent-soft)] text-[var(--app-accent)]" },
];

const EventBank: ScheduleItem[] = [
  { id: "roll-call", title: "Roll Call", time: "", icon: Users, durationSlots: 1 },
  { id: "works-meeting", title: "Works Meeting", time: "", icon: Briefcase, durationSlots: 1 },
  { id: "group-therapy", title: "Group Therapy", time: "", icon: HeartHandshake, durationSlots: 1 },
  { id: "room-check", title: "Room Check", time: "", icon: Bed, durationSlots: 1 },
  { id: "coffee", title: "Coffee", time: "", icon: Coffee, durationSlots: 1 },
  { id: "occupational-therapy", title: "Occupational Therapy", time: "", icon: Wrench, durationSlots: 1 },
  { id: "lunch", title: "Lunch", time: "", icon: UtensilsCrossed, durationSlots: 1 },
  { id: "focus-meeting", title: "Focus Meeting", time: "", icon: Target, durationSlots: 1 },
  { id: "gamblers-awareness", title: "Gamblers Awareness", time: "", icon: Brain, durationSlots: 1 },
  { id: "tea", title: "Tea", time: "", icon: UtensilsCrossed, durationSlots: 1 },
  { id: "rosary", title: "Rosary", time: "", icon: BookOpen, durationSlots: 1 },
  { id: "mass", title: "Mass", time: "", icon: Church, durationSlots: 1 },
  { id: "ga", title: "Gamblers Anonymous", time: "", icon: Dice5, durationSlots: 1 },
  { id: "aa", title: "Alcoholics Anonymous", time: "", icon: GlassWater, durationSlots: 1 },
  { id: "na", title: "Narcotics Anonymous", time: "", icon: Pill, durationSlots: 1 },
  { id: "copywriting", title: "Copywriting", time: "", icon: FileEdit, durationSlots: 1 },
  { id: "careplan", title: "Careplan", time: "", icon: ClipboardCheck, durationSlots: 1 },
];

const MorningRange = { start: "06:00", end: "13:00" };
const EveningRange = { start: "13:00", end: "22:00" };

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const buildSlots = (start: string, end: string, stepMinutes = 30) => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
};

const MorningSlots = buildSlots(MorningRange.start, MorningRange.end);
const EveningSlots = buildSlots(EveningRange.start, EveningRange.end);

const buildEmptyDay = (): DaySchedule => ({
  morning: [
    { id: "wakeup", title: "Wake Up", time: "06:00", icon: Coffee, durationSlots: 1, locked: true },
  ],
  evening: [
    { id: "bedtime", title: "Bedtime", time: "22:00", icon: Bed, durationSlots: 1, locked: true },
  ],
});

const buildWeekSchedule = (): WeekSchedule => {
  const schedule: WeekSchedule = {};
  Weekdays.forEach((day) => {
    schedule[day] = buildEmptyDay();
  });
  return schedule;
};

const buildUnitPlans = (): Record<UnitId, WeekSchedule> => ({
  alcohol: buildWeekSchedule(),
  detox: buildWeekSchedule(),
  drugs: buildWeekSchedule(),
  ladies: buildWeekSchedule(),
});

type DayPlannerProps = {
  embedded?: boolean;
  initialUnit?: UnitId;
  lockUnit?: boolean;
  title?: string;
};

const DayPlanner: React.FC<DayPlannerProps> = ({
  embedded = false,
  initialUnit = "alcohol",
  lockUnit = false,
  title = "Day Planner",
}) => {
  const router = useRouter();
  const [activeUnit, setActiveUnit] = useState<UnitId>(initialUnit);
  const [activeDay, setActiveDay] = useState<string>(Weekdays[0]);
  const [unitPlans, setUnitPlans] = useState<Record<UnitId, WeekSchedule>>(() => buildUnitPlans());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const resizeState = useRef<{
    itemId: string;
    period: PeriodId;
    startY: number;
    startDuration: number;
  } | null>(null);

  const activePlan = unitPlans[activeUnit]?.[activeDay];

  const activeUnitMeta = useMemo(
    () => Units.find((unit) => unit.id === activeUnit) ?? Units[0],
    [activeUnit],
  );

  const setScheduleForDay = (updater: (current: DaySchedule) => DaySchedule) => {
    setUnitPlans((prev) => ({
      ...prev,
      [activeUnit]: {
        ...prev[activeUnit],
        [activeDay]: updater(prev[activeUnit][activeDay]),
      },
    }));
  };

  const updateItemTime = (period: PeriodId, itemId: string, time: string) => {
    setScheduleForDay((current) => {
      const updated = current[period].map((item) =>
        item.id === itemId ? { ...item, time } : item,
      );
      return { ...current, [period]: updated };
    });
  };

  const addOrMoveItem = (period: PeriodId, item: ScheduleItem, time: string) => {
    setScheduleForDay((current) => {
      const nextMorning = current.morning.filter((entry) => entry.id !== item.id);
      const nextEvening = current.evening.filter((entry) => entry.id !== item.id);
      const targetList = period === "morning" ? nextMorning : nextEvening;
      targetList.push({ ...item, time, durationSlots: item.durationSlots || 1 });
      return { morning: nextMorning, evening: nextEvening };
    });
  };

  const updateItemDuration = (period: PeriodId, itemId: string, durationSlots: number) => {
    setScheduleForDay((current) => {
      const updated = current[period].map((item) =>
        item.id === itemId ? { ...item, durationSlots } : item,
      );
      return { ...current, [period]: updated };
    });
  };

  const handleGenerate = () => {
    setUnitPlans((prev) => ({
      ...prev,
      [activeUnit]: buildWeekSchedule(),
    }));
  };

  const handleSave = () => {
    setLastSaved(new Date());
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, payload: Record<string, string>) => {
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, period: PeriodId, time: string) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const payload = JSON.parse(raw) as { type: "bank" | "scheduled"; id: string };
    if (!payload?.id) return;

    if (payload.type === "scheduled") {
      const item =
        activePlan?.morning.find((entry) => entry.id === payload.id) ||
        activePlan?.evening.find((entry) => entry.id === payload.id);
      if (!item || item.locked) return;
      addOrMoveItem(period, item, time);
      return;
    }

    const template = EventBank.find((entry) => entry.id === payload.id);
    if (!template) return;
    addOrMoveItem(period, template, time);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const SLOT_HEIGHT = 52;

  const getSlotIndex = (time: string, slots: string[]) => slots.findIndex((slot) => slot === time);

  const startResize = (event: React.MouseEvent, period: PeriodId, item: ScheduleItem) => {
    event.preventDefault();
    resizeState.current = {
      itemId: item.id,
      period,
      startY: event.clientY,
      startDuration: item.durationSlots || 1,
    };
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeState.current) return;
      const delta = moveEvent.clientY - resizeState.current.startY;
      const steps = Math.round(delta / SLOT_HEIGHT);
      const nextDuration = Math.max(1, resizeState.current.startDuration + steps);
      const slots = period === "morning" ? MorningSlots : EveningSlots;
      const itemData =
        activePlan?.[period].find((entry) => entry.id === resizeState.current?.itemId) ?? null;
      if (!itemData) return;
      const startIndex = getSlotIndex(itemData.time, slots);
      if (startIndex < 0) return;
      const maxDuration = Math.max(1, slots.length - startIndex);
      updateItemDuration(period, itemData.id, Math.min(maxDuration, nextDuration));
    };
    const handleMouseUp = () => {
      resizeState.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const renderTimeline = (period: PeriodId, slots: string[], title: string) => {
    const items = activePlan?.[period] ?? [];
    const areaHeight = slots.length * SLOT_HEIGHT;

    return (
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
        <h2 className="mb-4 text-sm font-semibold text-[var(--app-text)]">{title}</h2>
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col">
            {slots.map((time) => (
              <div
                key={`${period}-time-${time}`}
                className="flex h-[52px] items-start pt-2 text-xs font-semibold text-[var(--app-text-muted)]"
              >
                {time}
              </div>
            ))}
          </div>
          <div className="relative" style={{ height: areaHeight }}>
            {slots.map((time) => (
              <div
                key={`${period}-slot-${time}`}
                onDrop={(event) => handleDrop(event, period, time)}
                onDragOver={handleDragOver}
                className="h-[52px] border-b border-[var(--app-border)]"
              >
                <div className="h-full" />
              </div>
            ))}
            {items.map((item) => {
              const startIndex = getSlotIndex(item.time, slots);
              if (startIndex < 0) return null;
              const sameStart = items.filter((entry) => entry.time === item.time);
              const laneIndex = sameStart.findIndex((entry) => entry.id === item.id) % 2;
              const width = "calc(50% - 6px)";
              const left = laneIndex === 0 ? "0%" : "calc(50% + 6px)";
              const height = Math.max(1, item.durationSlots) * SLOT_HEIGHT - 8;
              const top = startIndex * SLOT_HEIGHT + 4;
              return (
                <div
                  key={`${period}-item-${item.id}`}
                  draggable={!item.locked}
                  onDragStart={(event) => handleDragStart(event, { type: "scheduled", id: item.id })}
                  className={`absolute rounded-lg border px-3 py-2 text-sm font-medium ${
                    item.locked
                      ? "cursor-not-allowed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-surface-muted)_85%,white)] text-[var(--app-text-muted)]"
                      : "cursor-grab border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:shadow-sm"
                  }`}
                  style={{ top, left, width, height }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-[var(--app-text-muted)]" />
                      {item.title}
                    </span>
                    {item.locked && <span className="text-xs text-[var(--app-text-muted)]">Fixed</span>}
                  </div>
                  {!item.locked && (
                    <div
                      className="absolute bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 cursor-ns-resize rounded-full bg-[var(--app-border)]"
                      onMouseDown={(event) => startResize(event, period, item)}
                      title="Drag to extend duration"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={embedded ? "" : "app-page-shell"}>
      <main className={embedded ? "mx-auto max-w-6xl px-0 py-0" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"}>
        <div className="flex items-center gap-3 mb-6">
          {!embedded && (
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Configuration</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <CalendarClock className="h-7 w-7 text-[var(--app-primary)]" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--app-text)]">{title}</h1>
              <p className="text-[var(--app-text-muted)]">Drag events into morning and evening timelines.</p>
            </div>
          </div>
        </div>

        <div className="app-card space-y-6 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {lockUnit ? (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${activeUnitMeta.chip}`}>
                  {activeUnitMeta.name}
                </span>
              ) : (
                Units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setActiveUnit(unit.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeUnit === unit.id
                        ? "app-primary-button"
                        : "app-surface-muted border text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    }`}
                  >
                    {unit.name}
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                className="app-secondary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Reset day
              </button>
              <button
                onClick={handleSave}
                className="app-primary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <Save className="h-4 w-4" />
                Save changes
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Weekdays.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeDay === day ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Editing schedule for</p>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold ${activeUnitMeta.accent}`}>
                  {activeUnitMeta.name}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${activeUnitMeta.chip}`}>
                  {activeDay}
                </span>
              </div>
            </div>
            <div className="text-sm text-[var(--app-text-muted)]">
              {lastSaved
                ? `Last saved ${lastSaved.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}`
                : "Unsaved changes"}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-6">
              {renderTimeline("morning", MorningSlots, "Morning Timeline")}
              {renderTimeline("evening", EveningSlots, "Evening Timeline")}
            </div>

            <div className="app-card sticky top-6 h-fit rounded-xl p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--app-text)]">Daily Events</h2>
              <p className="mb-4 text-xs text-[var(--app-text-muted)]">Drag from here onto the timeline.</p>
              <div className="space-y-2">
                {EventBank.map((event) => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, { type: "bank", id: event.id })}
                    className="flex cursor-grab items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--app-text)] hover:brightness-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <event.icon className="h-4 w-4 text-[var(--app-text-muted)]" />
                      {event.title}
                    </span>
                    <span className="text-xs text-[var(--app-text-muted)]">Drag</span>
                  </div>
                ))}
                <div className="rounded-lg border border-dashed border-[var(--app-border)] px-3 py-2 text-xs text-[var(--app-text-muted)]">
                  Wake Up (06:00) and Bedtime (22:00) are fixed by default.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DayPlanner;
