"use client";

import React, { useEffect, useRef, useState } from "react";
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
  ClipboardCheck,
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

type FullDayTimelineEvent = ScheduleEvent & {
  lane: number;
};

type UnitDailyTimelineProps = {
  unitId: string;
  unitName: string;
  onOpenGroupTherapy: (moduleKey?: string) => void;
  onOpenRollCall: () => void;
  onOpenCarePlan: () => void;
};

const fullDayStartMinutes = 5 * 60;
const fullDayEndMinutes = 25 * 60;
const fullDayPixelsPerHour = 112;
const fullDayLabelWidth = 16;
const fullDayWidth = ((fullDayEndMinutes - fullDayStartMinutes) / 60) * fullDayPixelsPerHour;

const UnitDailyTimeline: React.FC<UnitDailyTimelineProps> = ({ unitId, unitName, onOpenGroupTherapy, onOpenRollCall, onOpenCarePlan }) => {
  const { data: session, status } = useSession();
  const { loadKeys, t } = useLocalization();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [takingEvent, setTakingEvent] = useState(false);
  const fullDayScrollRef = useRef<HTMLDivElement | null>(null);
  const currentDateKey = currentTime.toISOString().slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadKeys([
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
      case "Weekly Care Plan Capture":
      case "Careplan":
      case "Care Plan":
        return ClipboardCheck;
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
      case "Weekly Care Plan Capture":
      case "Careplan":
      case "Care Plan":
        return "bg-cyan-600";
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

  const normalizeTimelineMinutes = (minutes: number): number => minutes < fullDayStartMinutes ? minutes + 24 * 60 : minutes;

  const getTimelineSchedule = () =>
    events
      .filter((event) => {
        const start = normalizeTimelineMinutes(event.timeMinutes);
        return start >= fullDayStartMinutes && start <= fullDayEndMinutes;
      })
      .sort((left, right) => normalizeTimelineMinutes(left.timeMinutes) - normalizeTimelineMinutes(right.timeMinutes));

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

    if (event.title.toLowerCase().replace(/\s+/g, "").includes("careplan")) {
      onOpenCarePlan();
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

  const timeFromMinutes = (minutes: number): string => {
    const normalizedMinutes = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const clamped = Math.max(0, Math.min(normalizedMinutes, 23 * 60 + 59));
    const hours = Math.floor(clamped / 60);
    const mins = clamped % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const eventEndMinutes = (event: ScheduleEvent) => {
    const start = normalizeTimelineMinutes(event.timeMinutes);
    const end = event.endTime ? normalizeTimelineMinutes(timeToMinutes(event.endTime)) : start + 30;
    return end <= start ? end + 24 * 60 : end;
  };

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

  const buildFullDayLanes = (items: ScheduleEvent[]): FullDayTimelineEvent[] => {
    const laneEndMinutes: number[] = [];

    return items
      .slice()
      .sort((left, right) => normalizeTimelineMinutes(left.timeMinutes) - normalizeTimelineMinutes(right.timeMinutes) || eventEndMinutes(left) - eventEndMinutes(right))
      .map((event) => {
        const start = Math.max(fullDayStartMinutes, normalizeTimelineMinutes(event.timeMinutes));
        const end = Math.min(fullDayEndMinutes, Math.max(start + 15, eventEndMinutes(event)));
        const lane = laneEndMinutes.findIndex((laneEnd) => laneEnd <= start);
        const assignedLane = lane >= 0 ? lane : laneEndMinutes.length;

        laneEndMinutes[assignedLane] = end;

        return {
          ...event,
          lane: assignedLane,
        };
      });
  };

  const fullDayEventStyle = (event: FullDayTimelineEvent): React.CSSProperties => {
    const tone = eventTone(event);
    const token = `var(--app-${tone})`;
    const start = Math.max(fullDayStartMinutes, normalizeTimelineMinutes(event.timeMinutes));
    const end = Math.min(fullDayEndMinutes, Math.max(start + 15, eventEndMinutes(event)));
    return {
      left: ((start - fullDayStartMinutes) / 60) * fullDayPixelsPerHour,
      width: Math.max(46, ((end - start) / 60) * fullDayPixelsPerHour),
      top: 16 + event.lane * 68,
      backgroundColor: `color-mix(in srgb, ${token} 10%, var(--app-surface))`,
      borderLeftColor: token,
      color: token,
    };
  };

  const currentMinutes = getCurrentMinutes();
  const currentTimelineMinutes = normalizeTimelineMinutes(currentMinutes);
  const schedule = getTimelineSchedule();
  const fullDayEvents = buildFullDayLanes(schedule);
  const fullDayRows = Math.max(1, ...fullDayEvents.map((event) => event.lane + 1));
  const shouldShowIndicator = currentTimelineMinutes >= fullDayStartMinutes && currentTimelineMinutes <= fullDayEndMinutes;

  useEffect(() => {
    const scrollContainer = fullDayScrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const currentLineX = fullDayLabelWidth + ((currentTimelineMinutes - fullDayStartMinutes) / 60) * fullDayPixelsPerHour;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const centeredScrollLeft = currentLineX - scrollContainer.clientWidth / 2;
    scrollContainer.scrollLeft = Math.max(0, Math.min(centeredScrollLeft, maxScrollLeft));
  }, [currentTimelineMinutes, events.length]);

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
  const scrollTimeline = (direction: -1 | 1) => {
    const scrollContainer = fullDayScrollRef.current;
    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollBy({
      left: direction * Math.max(320, scrollContainer.clientWidth * 0.7),
      behavior: "smooth",
    });
  };

  return (
    <div className="app-card overflow-hidden rounded-xl p-6" style={{ paddingBottom: 24 }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center text-lg font-semibold text-[var(--app-text)]">
          <CalendarDays className="mr-2 h-5 w-5 text-[var(--app-primary)]" />
          {unitName} {text("dashboard.timeline.daily_title", "Daily Timeline")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTimeline(-1)}
            className="app-outline-button rounded-lg p-2 transition-colors"
            aria-label="Scroll timeline earlier"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollTimeline(1)}
            className="app-outline-button rounded-lg p-2 transition-colors"
            aria-label="Scroll timeline later"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={fullDayScrollRef} className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="relative" style={{ width: fullDayWidth + fullDayLabelWidth, height: Math.max(184, 70 + fullDayRows * 68) }}>
            <div className="sticky top-0 z-20 h-11 border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
              {Array.from({ length: (fullDayEndMinutes - fullDayStartMinutes) / 60 + 1 }, (_, index) => {
                const hour = fullDayStartMinutes / 60 + index;
                return (
                <div
                  key={`full-day-hour:${hour}`}
                  className="absolute top-0 h-full border-l border-dashed border-[var(--app-border)]"
                  style={{ left: fullDayLabelWidth + index * fullDayPixelsPerHour }}
                >
                  <span className="absolute left-2 top-2 text-xs font-medium text-[var(--app-text-muted)]">{timeFromMinutes(hour * 60)}</span>
                </div>
                );
              })}
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
              {shouldShowIndicator && (
                <div
                  className="pointer-events-none absolute inset-y-0 z-30"
                  style={{ left: ((currentTimelineMinutes - fullDayStartMinutes) / 60) * fullDayPixelsPerHour }}
                >
                  <span className="absolute -left-5 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {timeFromMinutes(currentMinutes)}
                  </span>
                  <div className="h-full w-0.5 bg-red-600" />
                </div>
              )}
              {fullDayEvents.map((event) => {
                const IconComponent = event.icon;
                const duration = eventDurationMinutes(event);
                return (
                  <button
                    key={event.key}
                    type="button"
                    onClick={() => handleEventClick(event)}
                    className="absolute overflow-hidden rounded-lg border border-l-4 border-[var(--app-border)] px-2 py-2 text-left shadow-sm transition-colors hover:border-[var(--app-primary)] hover:ring-2 hover:ring-[color:color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
                    style={fullDayEventStyle(event)}
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
