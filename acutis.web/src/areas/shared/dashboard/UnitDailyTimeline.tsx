"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Users,
  Briefcase,
  Bed,
  Coffee,
  Wrench,
  UtensilsCrossed,
  Brain,
  Target,
  Moon,
  BookOpen,
  HeartHandshake,
  Pill,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { getUnitTimeline, takeUnitTimelineEvent } from "@/services/unitTimelineService";
import { isAuthorizedClient } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

interface ScheduleEvent {
  key: string;
  time: string;
  timeMinutes: number;
  title: string;
  icon: LucideIcon;
  color: string;
  description?: string;
  days?: string;
  endTime?: string;
  stackPosition?: number;
  source: string;
  scheduledDate: string;
  assignedFacilitatorName: string;
  canTakeEvent: boolean;
}

type UnitDailyTimelineProps = {
  unitId: string;
  unitName: string;
  onOpenGroupTherapy: (moduleKey?: string) => void;
  onOpenRollCall: () => void;
};

type TimelineViewMode = "full" | "morning" | "evening";

const fullDayStartMinutes = 0;
const fullDayEndMinutes = 24 * 60;
const fullDayPixelsPerHour = 88;
const fullDayLabelWidth = 16;
const fullDayWidth = ((fullDayEndMinutes - fullDayStartMinutes) / 60) * fullDayPixelsPerHour;

const UnitDailyTimeline: React.FC<UnitDailyTimelineProps> = ({ unitId, unitName, onOpenGroupTherapy, onOpenRollCall }) => {
  const { data: session, status } = useSession();
  const { loadKeys, t } = useLocalization();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<TimelineViewMode>("full");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [takingEvent, setTakingEvent] = useState(false);
  const currentDateKey = currentTime.toISOString().slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadKeys([
      "dashboard.timeline.view.full_day",
      "dashboard.timeline.view.morning",
      "dashboard.timeline.view.evening",
      "dashboard.timeline.daily_title",
      "dashboard.timeline.no_items",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const iconForTitle = (title: string): LucideIcon => {
    switch (title) {
      case "Wake Up Bell":
        return Bell;
      case "Roll Call":
      case "AA/NA/GA":
        return Users;
      case "Works/Group":
        return Briefcase;
      case "Room Check":
        return Bed;
      case "Coffee":
        return Coffee;
      case "OT":
        return Wrench;
      case "Lunch":
      case "Tea":
        return UtensilsCrossed;
      case "Gambling Aware":
        return Brain;
      case "Doctor Visit":
        return Stethoscope;
      case "Medication Dispensation":
        return Pill;
      case "Focus Meeting":
      case "OT/Focus":
        return Target;
      case "Group A":
      case "Group B":
      case "Group C":
        return HeartHandshake;
      case "Rosary":
        return BookOpen;
      case "Bedtime":
        return Moon;
      default:
        return CalendarDays;
    }
  };

  const colorForTitle = (title: string): string => {
    switch (title) {
      case "Wake Up Bell":
        return "bg-orange-500";
      case "Roll Call":
        return "bg-blue-500";
      case "Works/Group":
        return "bg-purple-500";
      case "Room Check":
        return "bg-green-500";
      case "Coffee":
        return "bg-amber-600";
      case "OT":
        return "bg-teal-500";
      case "Lunch":
      case "Tea":
        return "bg-red-500";
      case "Gambling Aware":
        return "bg-indigo-500";
      case "Doctor Visit":
        return "bg-sky-600";
      case "Medication Dispensation":
        return "bg-lime-600";
      case "Focus Meeting":
      case "OT/Focus":
        return "bg-cyan-500";
      case "Group A":
        return "bg-pink-500";
      case "Group B":
        return "bg-purple-500";
      case "Group C":
        return "bg-blue-500";
      case "Rosary":
        return "bg-violet-500";
      case "AA/NA/GA":
        return "bg-emerald-500";
      case "Bedtime":
        return "bg-slate-600";
      default:
        return "bg-slate-500";
    }
  };

  const stackForTitle = (title: string): number => {
    switch (title) {
      case "Focus Meeting":
      case "Group B":
        return 1;
      case "Group C":
        return 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const loadTimeline = async () => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      try {
        setLoadError(null);
        const items = await getUnitTimeline(session?.accessToken, unitId, currentDateKey);
        setEvents(
          items.map((item) => ({
            key: item.key,
            time: item.time,
            timeMinutes: item.timeMinutes,
            title: item.title,
            icon: iconForTitle(item.title),
            color: colorForTitle(item.title),
            description: item.description,
            endTime: item.endTime || undefined,
            stackPosition: stackForTitle(item.title),
            source: item.source,
            scheduledDate: item.scheduledDate,
            assignedFacilitatorName: item.assignedFacilitatorName,
            canTakeEvent: item.canTakeEvent,
          })),
        );
      } catch (error) {
        setLoadError((error as Error).message);
        setEvents([]);
      }
    };

    void loadTimeline();
  }, [currentDateKey, session?.accessToken, status, unitId]);

  const morningSchedule = events.filter((event) => event.timeMinutes <= 750);
  const eveningSchedule = events.filter((event) => event.timeMinutes >= 840);

  const getCurrentSchedule = () => (viewMode === "morning" ? morningSchedule : eveningSchedule);
  const getFullDaySchedule = () => events.slice().sort((left, right) => left.timeMinutes - right.timeMinutes);

  const mapEventToModuleKey = (title: string): string | undefined => {
    switch (title) {
      case "Works/Group":
        return "spirituality";
      case "Group A":
        return "change";
      case "Group B":
        return "relapse-prevention";
      case "Group C":
        return "healing-the-hurts-of-the-past";
      default:
        return undefined;
    }
  };

  const handleEventClick = (event: ScheduleEvent) => {
    if (event.title === "Roll Call") {
      onOpenRollCall();
      return;
    }

    const moduleKey = mapEventToModuleKey(event.title);
    if (moduleKey) {
      onOpenGroupTherapy(moduleKey);
      return;
    }

    setSelectedEvent(event);
  };

  const handleTakeEvent = async () => {
    if (!selectedEvent) {
      return;
    }
    if (!isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    setTakingEvent(true);
    try {
      const updated = await takeUnitTimelineEvent(session?.accessToken, unitId, {
        key: selectedEvent.key,
        source: selectedEvent.source,
        scheduledDate: selectedEvent.scheduledDate,
      });
      setEvents((current) =>
        current.map((event) =>
          event.key === selectedEvent.key && event.source === selectedEvent.source
            ? {
                ...event,
                assignedFacilitatorName: updated.assignedFacilitatorName,
                canTakeEvent: updated.canTakeEvent,
                source: updated.source,
              }
            : event,
        ),
      );
      setSelectedEvent((current) =>
        current
          ? {
              ...current,
              assignedFacilitatorName: updated.assignedFacilitatorName,
            }
          : current,
      );
    } catch (error) {
      setLoadError((error as Error).message);
    } finally {
      setTakingEvent(false);
    }
  };

  const getCurrentMinutes = () => currentTime.getHours() * 60 + currentTime.getMinutes();

  const isCurrentEvent = (event: ScheduleEvent) => {
    const now = getCurrentMinutes();
    const endMinutes = event.endTime ? timeToMinutes(event.endTime) : event.timeMinutes + 30;
    return now >= event.timeMinutes && now < endMinutes;
  };

  const timeFromMinutes = (minutes: number): string => {
    const clamped = Math.max(0, Math.min(minutes, 23 * 60 + 59));
    const hours = Math.floor(clamped / 60);
    const mins = clamped % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const eventEndMinutes = (event: ScheduleEvent) => (event.endTime ? timeToMinutes(event.endTime) : event.timeMinutes + 30);

  const eventDurationMinutes = (event: ScheduleEvent) => Math.max(15, eventEndMinutes(event) - event.timeMinutes);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
  };

  const eventTone = (event: ScheduleEvent): "primary" | "success" | "warning" | "danger" | "text" => {
    if (event.color.includes("red")) return "danger";
    if (event.color.includes("green") || event.color.includes("emerald")) return "success";
    if (event.color.includes("orange") || event.color.includes("amber") || event.color.includes("lime")) return "warning";
    if (event.color.includes("blue") || event.color.includes("sky") || event.color.includes("cyan") || event.color.includes("teal")) return "primary";
    return "text";
  };

  const fullDayEventStyle = (event: ScheduleEvent, index: number): React.CSSProperties => {
    const tone = eventTone(event);
    const token = `var(--app-${tone})`;
    const start = Math.max(fullDayStartMinutes, event.timeMinutes);
    const end = Math.min(fullDayEndMinutes, Math.max(start + 15, eventEndMinutes(event)));
    return {
      left: ((start - fullDayStartMinutes) / 60) * fullDayPixelsPerHour,
      width: Math.max(46, ((end - start) / 60) * fullDayPixelsPerHour),
      top: 48 + index * 68,
      backgroundColor: `color-mix(in srgb, ${token} 10%, var(--app-surface))`,
      borderLeftColor: token,
      color: token,
    };
  };

  const getTimelinePosition = (minutes: number, index?: number) => {
    const schedule = getCurrentSchedule();
    const startMinutes = schedule[0].timeMinutes;
    const endMinutes = schedule[schedule.length - 1].timeMinutes;
    const totalMinutes = endMinutes - startMinutes;
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
    const safeEdge = 3;
    const basePosition = clamp(((minutes - startMinutes) / totalMinutes) * 100, safeEdge, 100 - safeEdge);

    if (typeof index !== "number") {
      return basePosition;
    }

    const event = schedule[index];
    if (!event) return basePosition;

    if (event.stackPosition && event.stackPosition > 0) return basePosition;

    if (event.title === "Coffee" && index > 0) {
      const roomCheckIndex = schedule.findIndex((e) => e.title === "Room Check");
      if (roomCheckIndex >= 0) {
        const roomCheckPosition = ((schedule[roomCheckIndex].timeMinutes - startMinutes) / totalMinutes) * 100;
        return clamp(roomCheckPosition + 8, safeEdge, 100 - safeEdge);
      }
    }

    if (event.title === "OT" && viewMode === "morning" && index > 0) {
      const coffeeIndex = schedule.findIndex((e) => e.title === "Coffee");
      if (coffeeIndex >= 0) {
        const coffeeEvent = schedule[coffeeIndex];
        const roomCheckIndex = schedule.findIndex((e) => e.title === "Room Check");
        const roomCheckPosition =
          roomCheckIndex >= 0
            ? ((schedule[roomCheckIndex].timeMinutes - startMinutes) / totalMinutes) * 100
            : ((coffeeEvent.timeMinutes - startMinutes) / totalMinutes) * 100 - 8;
        return clamp(roomCheckPosition + 16, safeEdge, 100 - safeEdge);
      }
    }

    return basePosition;
  };

  const currentMinutes = getCurrentMinutes();
  const schedule = viewMode === "full" ? getFullDaySchedule() : getCurrentSchedule();
  if (schedule.length === 0) {
    return (
      <div className="app-card overflow-hidden rounded-xl p-6" style={{ paddingBottom: 24 }}>
        <h2 className="mb-4 flex items-center text-lg font-semibold text-[var(--app-text)]">
          <CalendarDays className="mr-2 h-5 w-5 text-[var(--app-primary)]" />
          {unitName} {text("dashboard.timeline.daily_title", "Daily Timeline")}
        </h2>
        <p className="text-sm text-[var(--app-text-muted)]">
          {loadError ? `Unable to load timeline: ${loadError}` : text("dashboard.timeline.no_items", "No timeline items for this day.")}
        </p>
      </div>
    );
  }
  const maxStack = Math.max(0, ...schedule.map((e) => e.stackPosition ?? 0));
  const verticalSpacing = 132;
  const bubbleSize = 56;
  const labelHeight = 72;
  const baseTop = 6;
  const trackThickness = 8;
  const extraBottom = 32;
  const rows = maxStack + 1;
  const timelineHeight = baseTop + rows * verticalSpacing + bubbleSize + labelHeight + extraBottom;
  const shouldShowIndicator =
    viewMode === "morning" ? currentMinutes >= 390 && currentMinutes <= 750 : currentMinutes >= 840 && currentMinutes <= 1320;
  const currentPosition = shouldShowIndicator ? getTimelinePosition(currentMinutes) : 0;

  return (
    <div className="app-card overflow-hidden rounded-xl p-6" style={{ paddingBottom: 24 }}>
      <h2 className="mb-4 flex items-center text-lg font-semibold text-[var(--app-text)]">
        <CalendarDays className="mr-2 h-5 w-5 text-[var(--app-primary)]" />
        {unitName} {text("dashboard.timeline.daily_title", "Daily Timeline")}
      </h2>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setViewMode("full")}
          disabled={viewMode === "full"}
          className="rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50"
        >
          {text("dashboard.timeline.view.full_day", "Full Day")}
        </button>
        <button
          onClick={() => setViewMode("morning")}
          disabled={viewMode === "morning"}
          className="flex items-center space-x-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{text("dashboard.timeline.view.morning", "Morning")}</span>
        </button>

        <div className="min-w-40 flex-1 text-center">
          <p className="text-lg font-bold text-[var(--app-text)]">
            {viewMode === "full"
              ? text("dashboard.timeline.view.full_day", "Full Day")
              : viewMode === "morning"
                ? `${text("dashboard.timeline.view.morning", "Morning")} Schedule`
                : `${text("dashboard.timeline.view.evening", "Evening")} Schedule`}
          </p>
          <p className="text-sm text-[var(--app-text-muted)]">{viewMode === "full" ? "00:00 - 24:00" : viewMode === "morning" ? "06:30 - 12:30" : "14:00 - 22:00"}</p>
        </div>

        <button
          onClick={() => setViewMode("evening")}
          disabled={viewMode === "evening"}
          className="flex items-center space-x-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50"
        >
          <span>{text("dashboard.timeline.view.evening", "Evening")}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {viewMode === "full" ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="relative" style={{ width: fullDayWidth + fullDayLabelWidth, height: Math.max(300, 86 + schedule.length * 68) }}>
            <div className="sticky top-0 z-20 h-11 border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
              {Array.from({ length: 25 }, (_, hour) => (
                <div
                  key={`full-day-hour:${hour}`}
                  className="absolute top-0 h-full border-l border-dashed border-[var(--app-border)]"
                  style={{ left: fullDayLabelWidth + hour * fullDayPixelsPerHour }}
                >
                  {hour < 24 && <span className="absolute left-2 top-2 text-xs font-medium text-[var(--app-text-muted)]">{timeFromMinutes(hour * 60)}</span>}
                </div>
              ))}
            </div>
            <div
              className="absolute bottom-0 top-11"
              style={{
                left: fullDayLabelWidth,
                width: fullDayWidth,
                backgroundImage:
                  "linear-gradient(to right, color-mix(in srgb, var(--app-border) 72%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in srgb, var(--app-border) 38%, transparent) 1px, transparent 1px)",
                backgroundSize: `${fullDayPixelsPerHour}px 100%, ${fullDayPixelsPerHour / 4}px 100%`,
              }}
            >
              {currentMinutes >= fullDayStartMinutes && currentMinutes <= fullDayEndMinutes && (
                <div
                  className="pointer-events-none absolute inset-y-0 z-30"
                  style={{ left: ((currentMinutes - fullDayStartMinutes) / 60) * fullDayPixelsPerHour }}
                >
                  <span className="absolute -left-5 top-1 rounded bg-[var(--app-danger)] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {timeFromMinutes(currentMinutes)}
                  </span>
                  <div className="h-full w-px bg-[var(--app-danger)]" />
                </div>
              )}
              {schedule.map((event, index) => {
                const IconComponent = event.icon;
                const duration = eventDurationMinutes(event);
                return (
                  <button
                    key={event.key}
                    type="button"
                    onClick={() => handleEventClick(event)}
                    className="absolute overflow-hidden rounded-lg border border-l-4 border-[var(--app-border)] px-2 py-2 text-left shadow-sm transition-colors hover:border-[var(--app-primary)] hover:ring-2 hover:ring-[color:color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
                    style={fullDayEventStyle(event, index)}
                  >
                    <IconComponent className="pointer-events-none absolute bottom-1 right-1 h-10 w-10 opacity-10" />
                    <span className="relative block truncate text-xs font-semibold text-[var(--app-text)]">{event.title}</span>
                    <span className="relative mt-0.5 block truncate text-[11px] font-medium text-[var(--app-text-muted)]">
                      {event.time} · {formatDuration(duration)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
      <div className="relative" style={{ height: timelineHeight }}>
        <div className="absolute left-0 right-0 rounded-full bg-[var(--app-border)]" style={{ top: baseTop, height: trackThickness }} />

        {shouldShowIndicator && (
          <div className="pointer-events-none absolute z-40 -translate-x-1/2" style={{ left: `${currentPosition}%`, top: baseTop - 2 }}>
            <div className="h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)] px-2 py-0.5 text-xs font-semibold text-[var(--app-danger)] shadow-sm">NOW</span>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0" style={{ top: baseTop + 24 }}>
          {schedule.map((event, index) => {
            const position = getTimelinePosition(event.timeMinutes, index);
            const isCurrent = isCurrentEvent(event);
            const IconComponent = event.icon;
            const isSpecial = event.title === "Wake Up Bell" || event.title === "Bedtime";
            const topOffset = (event.stackPosition || 0) * verticalSpacing;

            return (
              <div
                key={event.key}
                className="absolute"
                style={{ left: `${position}%`, transform: "translateX(-50%)", top: `${topOffset}px` }}
              >
                <button
                  onClick={() => handleEventClick(event)}
                  className={`relative group transition-all duration-200 ${isCurrent ? "scale-125" : "hover:scale-110"}`}
                >
                  <div className={`h-14 w-14 ${event.color} flex items-center justify-center rounded-full shadow-lg ${isCurrent ? "ring-4 ring-[var(--app-warning)] ring-offset-2" : ""} ${isSpecial ? "ring-4 ring-[var(--app-border)] ring-offset-2" : ""}`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute left-1/2 top-16 w-32 -translate-x-1/2 text-center leading-tight">
                    <div className={`text-xs font-bold ${isCurrent ? "text-[var(--app-text)]" : "text-[var(--app-text-muted)]"}`}>{event.time}</div>
                    <div className={`mt-1 max-w-[120px] text-xs ${isCurrent ? "font-bold text-[var(--app-text)]" : "text-[var(--app-text-muted)]"}`}>{event.title}</div>
                    {event.days && <div className="mt-0.5 text-[10px] text-[color:color-mix(in_srgb,var(--app-text-muted)_70%,white)]">{event.days}</div>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedEvent(null)}>
          <div className="mx-4 w-full max-w-md rounded-xl bg-[var(--app-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center">
                <div className={`mr-3 flex h-12 w-12 items-center justify-center rounded-full ${selectedEvent.color}`}>
                  <selectedEvent.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--app-text)]">{selectedEvent.title}</h3>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    {selectedEvent.time}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-2xl leading-none text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                x
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[var(--app-text)]">{selectedEvent.description}</p>
              {selectedEvent.canTakeEvent && (
                <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[var(--app-primary-soft)] p-3">
                  <p className="text-sm font-medium text-[var(--app-primary-strong)]">
                    {selectedEvent.assignedFacilitatorName
                      ? `Assigned to ${selectedEvent.assignedFacilitatorName}`
                      : "No facilitator assigned yet"}
                  </p>
                </div>
              )}
              {selectedEvent.days && (
                <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[var(--app-primary-soft)] p-3">
                  <p className="text-sm font-medium text-[var(--app-primary-strong)]">{selectedEvent.days}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedEvent.canTakeEvent && (
                <button
                  onClick={() => void handleTakeEvent()}
                  disabled={takingEvent}
                  className="app-primary-button flex-1 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-60"
                >
                  {takingEvent ? "Taking..." : "Take Event"}
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="app-secondary-button flex-1 rounded-lg px-4 py-2 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDailyTimeline;
