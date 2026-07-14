"use client";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

export const defaultTokens = {
  surface: "#ffffff",
  text: "#0f172a",
  primary: "#2563eb",
  secondary: "#0891b2",
  success: "#0f9f6e",
  warning: "#d97706",
  danger: "#dc2626",
  border: "#d7e2f1",
} as const;

export function ProductShell({
  productName,
  organisationName,
  isDemo,
  direction,
  poweredByLabel,
  demoLabel,
  children,
}: {
  productName: string;
  organisationName: string;
  isDemo?: boolean;
  direction: "ltr" | "rtl";
  poweredByLabel: string;
  demoLabel: string;
  children: ReactNode;
}) {
  const style = {
    "--surface": defaultTokens.surface,
    "--text": defaultTokens.text,
    "--primary": defaultTokens.primary,
    "--border": defaultTokens.border,
  } as CSSProperties;
  return (
    <div
      dir={direction}
      style={{
        ...style,
        minHeight: "100vh",
        background: "var(--surface)",
        color: "var(--text)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>{organisationName}</strong>
          <div style={{ color: "var(--primary)" }}>
            {poweredByLabel} {productName}
          </div>
        </div>
        {isDemo && (
          <span
            role="status"
            style={{
              padding: ".4rem .7rem",
              border: "1px solid var(--border)",
              borderRadius: "999px",
            }}
          >
            {demoLabel}
          </span>
        )}
      </header>
      <main style={{ padding: "1.5rem" }}>{children}</main>
    </div>
  );
}

export type ScheduleItem = {
  id: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  deliveryMode: string;
  status: string;
  personName?: string;
  appointmentType?: string;
};
export function ScheduleCalendar({
  items,
  locale = "en-IE",
  onOpen,
  onCreate,
}: {
  items: ScheduleItem[];
  locale?: string;
  onOpen?: (item: ScheduleItem) => void;
  onCreate?: (start: Date) => void;
}) {
  const [mode, setMode] = useState<"day" | "week" | "month">("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const startDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const add = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const weekStart = (d: Date) => {
    const x = startDay(d),
      day = x.getDay();
    return add(x, day === 0 ? -6 : 1 - day);
  };
  const days = useMemo(() => {
    if (mode === "day") return [startDay(anchor)];
    if (mode === "week")
      return Array.from({ length: 5 }, (_, i) => add(weekStart(anchor), i));
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1),
      begin = add(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => add(begin, i));
  }, [anchor, mode]);
  const same = (value: string, d: Date) => {
    const x = new Date(value);
    return (
      x.getFullYear() === d.getFullYear() &&
      x.getMonth() === d.getMonth() &&
      x.getDate() === d.getDate()
    );
  };
  const step = mode === "month" ? 30 : mode === "week" ? 7 : 1;
  const appointment = (item: ScheduleItem) => (
    <button
      key={item.id}
      className={`schedule-event ${item.deliveryMode === "video" ? "video" : item.appointmentType?.includes("group") ? "group" : "individual"}`}
      onClick={() => onOpen?.(item)}
    >
      <span>
        {new Date(item.startsAtUtc).toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        {item.deliveryMode === "video" ? "● Video" : ""}
      </span>
      <strong>{item.title}</strong>
      <small>{item.personName ?? item.status}</small>
    </button>
  );
  return (
    <section className="schedule">
      <div className="schedule-toolbar">
        <div>
          <span className="eyebrow">Schedule</span>
          <h3>
            {mode === "month"
              ? anchor.toLocaleDateString(locale, {
                  month: "long",
                  year: "numeric",
                })
              : `${days[0].toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${days.at(-1)!.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`}
          </h3>
        </div>
        <div className="schedule-actions">
          <button
            onClick={() => setAnchor(add(anchor, -step))}
            aria-label="Previous"
          >
            ‹
          </button>
          <button onClick={() => setAnchor(new Date())}>Today</button>
          <button
            onClick={() => setAnchor(add(anchor, step))}
            aria-label="Next"
          >
            ›
          </button>
          <div className="segmented">
            {(["day", "week", "month"] as const).map((x) => (
              <button
                className={mode === x ? "selected" : ""}
                onClick={() => setMode(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => onCreate?.(anchor)}>
            + Appointment
          </button>
        </div>
      </div>
      {mode === "month" ? (
        <div className="month-grid">
          {days.map((d) => (
            <div
              className={`month-day ${d.getMonth() !== anchor.getMonth() ? "outside" : ""}`}
              key={d.toISOString()}
              onDoubleClick={() => onCreate?.(d)}
            >
              <header>
                <span>
                  {d.toLocaleDateString(locale, { weekday: "short" })}
                </span>
                <b>{d.getDate()}</b>
              </header>
              {items
                .filter((x) => same(x.startsAtUtc, d))
                .slice(0, 4)
                .map(appointment)}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="week-grid"
          style={{
            gridTemplateColumns: `72px repeat(${days.length},minmax(150px,1fr))`,
          }}
        >
          <div className="time-head">Time</div>
          {days.map((d) => (
            <div className="day-head" key={d.toISOString()}>
              <span>{d.toLocaleDateString(locale, { weekday: "short" })}</span>
              <b>{d.getDate()}</b>
            </div>
          ))}
          {Array.from({ length: 11 }, (_, h) => h + 8).flatMap((hour) => [
            <div className="time-cell" key={`t${hour}`}>
              {String(hour).padStart(2, "0")}:00
            </div>,
            ...days.map((d) => (
              <div
                className="slot"
                key={`${d.toISOString()}-${hour}`}
                onDoubleClick={() =>
                  onCreate?.(
                    new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour),
                  )
                }
              >
                {items
                  .filter(
                    (x) =>
                      same(x.startsAtUtc, d) &&
                      new Date(x.startsAtUtc).getHours() === hour,
                  )
                  .map(appointment)}
              </div>
            )),
          ])}
        </div>
      )}
    </section>
  );
}

type CalendarMode = "day" | "work-week" | "month";
const calendarMinutes = { start: 7 * 60, end: 20 * 60, slot: 30, height: 42 };

export function ClinicalCalendar({
  items,
  locale = "en-IE",
  onOpen,
  onCreate,
}: {
  items: ScheduleItem[];
  locale?: string;
  onOpen?: (item: ScheduleItem) => void;
  onCreate?: (start: Date) => void;
}) {
  const [mode, setMode] = useState<CalendarMode>("work-week");
  const [anchor, setAnchor] = useState(() => startOfLocalDay(new Date()));
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const copy = locale.startsWith("ar")
    ? { schedule: "الجدول", today: "اليوم", appointment: "موعد جديد", day: "يوم", week: "أسبوع العمل", month: "شهر", waiting: "لا توجد مواعيد", video: "فيديو" }
    : locale.startsWith("ga")
      ? { schedule: "Sceideal", today: "Inniu", appointment: "Coinne nua", day: "Lá", week: "Seachtain oibre", month: "Mí", waiting: "Níl aon choinní ann", video: "Físeán" }
      : { schedule: "Schedule", today: "Today", appointment: "New appointment", day: "Day", week: "Work week", month: "Month", waiting: "No appointments", video: "Video" };
  const days = useMemo(() => {
    if (mode === "day") return [startOfLocalDay(anchor)];
    if (mode === "work-week") {
      const monday = addCalendarDays(startOfLocalDay(anchor), anchor.getDay() === 0 ? -6 : 1 - anchor.getDay());
      return Array.from({ length: 5 }, (_, index) => addCalendarDays(monday, index));
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = addCalendarDays(first, -(first.getDay() || 7) + 1);
    return Array.from({ length: 42 }, (_, index) => addCalendarDays(gridStart, index));
  }, [anchor, mode]);
  const step = mode === "month" ? 30 : mode === "work-week" ? 7 : 1;
  const title = mode === "month"
    ? anchor.toLocaleDateString(locale, { month: "long", year: "numeric" })
    : `${days[0].toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${days.at(-1)!.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`;
  const slots = Array.from(
    { length: (calendarMinutes.end - calendarMinutes.start) / calendarMinutes.slot },
    (_, index) => calendarMinutes.start + index * calendarMinutes.slot,
  );
  const eventButton = (item: ScheduleItem, compact = false) => {
    const start = new Date(item.startsAtUtc);
    const end = new Date(item.endsAtUtc);
    return (
      <button
        key={item.id}
        type="button"
        className={`clinical-event ${item.deliveryMode === "video" ? "video" : item.appointmentType?.includes("group") ? "group" : "individual"} ${compact ? "compact" : ""}`}
        onClick={(event) => { event.stopPropagation(); onOpen?.(item); }}
        title={`${item.title} · ${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`}
      >
        <span>{start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}–{end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span>
        <strong>{item.title}</strong>
        {!compact && <small>{item.personName ?? item.status}{item.deliveryMode === "video" ? ` · ${copy.video}` : ""}</small>}
      </button>
    );
  };
  return (
    <section className="clinical-calendar" aria-label={copy.schedule}>
      <header className="clinical-calendar-toolbar">
        <div><span className="eyebrow">{copy.schedule}</span><h3>{title}</h3></div>
        <div className="clinical-calendar-actions">
          <button type="button" onClick={() => setAnchor(addCalendarDays(anchor, -step))} aria-label="Previous">‹</button>
          <button type="button" onClick={() => setAnchor(startOfLocalDay(new Date()))}>{copy.today}</button>
          <button type="button" onClick={() => setAnchor(addCalendarDays(anchor, step))} aria-label="Next">›</button>
          <div className="calendar-modes">
            {(["day", "work-week", "month"] as const).map((value) => (
              <button type="button" key={value} className={mode === value ? "selected" : ""} onClick={() => setMode(value)}>
                {value === "day" ? copy.day : value === "work-week" ? copy.week : copy.month}
              </button>
            ))}
          </div>
          <button type="button" className="primary" onClick={() => onCreate?.(anchor)}>+ {copy.appointment}</button>
        </div>
      </header>
      {mode === "month" ? (
        <div className="clinical-month">
          {days.map((day) => {
            const events = items.filter((item) => isSameLocalDay(new Date(item.startsAtUtc), day));
            return (
              <div key={day.toISOString()} className={`clinical-month-day ${day.getMonth() !== anchor.getMonth() ? "outside" : ""} ${isSameLocalDay(day, now) ? "today" : ""}`} onDoubleClick={() => onCreate?.(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9))}>
                <header><span>{day.toLocaleDateString(locale, { weekday: "short" })}</span><b>{day.getDate()}</b></header>
                {events.slice(0, 4).map((item) => eventButton(item, true))}
                {events.length > 4 && <small>+{events.length - 4}</small>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="clinical-timeline-scroll">
          <div className="clinical-timeline" style={{ gridTemplateColumns: `72px repeat(${days.length}, minmax(180px, 1fr))` }}>
            <div className="clinical-time-heading" />
            {days.map((day) => <div key={day.toISOString()} className={`clinical-day-heading ${isSameLocalDay(day, now) ? "today" : ""}`}><span>{day.toLocaleDateString(locale, { weekday: "short" })}</span><strong>{day.getDate()}</strong></div>)}
            <div className="clinical-time-axis" style={{ height: slots.length * calendarMinutes.height }}>
              {slots.map((minutes) => <span key={minutes} style={{ top: ((minutes - calendarMinutes.start) / calendarMinutes.slot) * calendarMinutes.height }}>{minutes % 60 === 0 ? `${String(Math.floor(minutes / 60)).padStart(2, "0")}:00` : ""}</span>)}
            </div>
            {days.map((day) => {
              const events = items.filter((item) => isSameLocalDay(new Date(item.startsAtUtc), day));
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              return (
                <div
                  key={day.toISOString()}
                  className={`clinical-day-column ${isSameLocalDay(day, now) ? "today" : ""}`}
                  style={{ height: slots.length * calendarMinutes.height }}
                  onDoubleClick={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const slot = Math.max(0, Math.min(slots.length - 1, Math.floor((event.clientY - bounds.top) / calendarMinutes.height)));
                    const minutes = calendarMinutes.start + slot * calendarMinutes.slot;
                    onCreate?.(new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60));
                  }}
                >
                  {isSameLocalDay(day, now) && nowMinutes >= calendarMinutes.start && nowMinutes <= calendarMinutes.end && <i className="clinical-now" style={{ top: ((nowMinutes - calendarMinutes.start) / calendarMinutes.slot) * calendarMinutes.height }} />}
                  {events.map((item) => {
                    const start = new Date(item.startsAtUtc), end = new Date(item.endsAtUtc);
                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const duration = Math.max(calendarMinutes.slot, (end.getTime() - start.getTime()) / 60000);
                    return <div key={item.id} className="clinical-event-position" style={{ top: ((startMinutes - calendarMinutes.start) / calendarMinutes.slot) * calendarMinutes.height, height: Math.max(38, (duration / calendarMinutes.slot) * calendarMinutes.height - 4) }}>{eventButton(item)}</div>;
                  })}
                  {events.length === 0 && mode === "day" && <span className="clinical-empty">{copy.waiting}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function startOfLocalDay(value: Date) { return new Date(value.getFullYear(), value.getMonth(), value.getDate()); }
function addCalendarDays(value: Date, amount: number) { const result = new Date(value); result.setDate(result.getDate() + amount); return result; }
function isSameLocalDay(left: Date, right: Date) { return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate(); }
