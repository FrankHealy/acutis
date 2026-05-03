"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, CalendarDays, RefreshCcw, ShieldPlus, Users } from "lucide-react";
import { isAuthorizationDisabled } from "@/lib/authMode";
import {
  staffRosterService,
  type UnitStaffRosterBoardDto,
  type UnitStaffRosterShiftDto,
} from "@/services/staffRosterService";
import { takeUnitTimelineEvent } from "@/services/unitTimelineService";

type UnitStaffRosterBoardProps = {
  unitCode: string;
  unitName: string;
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getShiftSegments(shift: UnitStaffRosterShiftDto) {
  const endMinutes = shift.endMinutes > 1440 ? 1440 : shift.endMinutes;
  const primaryLeft = (shift.startMinutes / 1440) * 100;
  const primaryWidth = ((endMinutes - shift.startMinutes) / 1440) * 100;
  const overnightWidth = shift.endMinutes > 1440 ? ((shift.endMinutes - 1440) / 1440) * 100 : 0;

  return {
    primaryLeft,
    primaryWidth,
    overnightWidth,
  };
}

const UnitStaffRosterBoard: React.FC<UnitStaffRosterBoardProps> = ({ unitCode, unitName }) => {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const [selectedDate, setSelectedDate] = useState(isoToday);
  const [board, setBoard] = useState<UnitStaffRosterBoardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!isAuthorizationDisabled && status === "unauthenticated") {
      setBoard(null);
      setLoading(false);
      return;
    }

    if (!isAuthorizationDisabled && status !== "authenticated") {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      setBoard(await staffRosterService.getBoard(accessToken, unitCode, selectedDate));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load staff roster.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedDate, status, unitCode]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const staffOptions = useMemo(() => board?.staff ?? [], [board]);

  const assignShift = async (shiftType: string, appUserId: string) => {
    setSaving(true);
    try {
      setError(null);
      setBoard(
        await staffRosterService.assignShift(accessToken, unitCode, {
          scheduledDate: selectedDate,
          shiftType,
          appUserId: appUserId || null,
        }),
      );
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Unable to update shift.");
    } finally {
      setSaving(false);
    }
  };

  const takeEvent = async (key: string, source: string) => {
    setSaving(true);
    try {
      setError(null);
      await takeUnitTimelineEvent(accessToken, unitCode, {
        key,
        source,
        scheduledDate: selectedDate,
      });
      await loadBoard();
    } catch (takeError) {
      setError(takeError instanceof Error ? takeError.message : "Unable to take event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-card rounded-xl p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--app-text)]">
            <ShieldPlus className="h-5 w-5 text-[var(--app-primary)]" />
            Staff Roster
          </h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Simplified daily roster for {unitName}: COD cover, nurse cover, night staff, and facilitator ownership for staffed events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)]">
            <CalendarDays className="h-4 w-4 text-[var(--app-primary)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadBoard()}
            disabled={loading || saving}
            className="app-secondary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[color:color-mix(in_srgb,var(--app-danger)_28%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,var(--app-surface))] px-4 py-3 text-sm text-[var(--app-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-6 text-sm text-[var(--app-text-muted)]">
          Loading staff roster...
        </div>
      ) : board ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.9fr)]">
            <section className="space-y-4">
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--app-text)]">Shift Coverage</h3>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      {formatDisplayDate(board.scheduledDate)} · 24-hour view
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary)]">
                    {board.shifts.filter((shift) => shift.isFilled).length}/{board.shifts.length} filled
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-6 gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
                  {["00", "04", "08", "12", "16", "20"].map((tick) => (
                    <span key={tick}>{tick}:00</span>
                  ))}
                </div>

                <div className="space-y-4">
                  {board.shifts.map((shift) => {
                    const segments = getShiftSegments(shift);
                    return (
                      <article key={shift.shiftType} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--app-text)]">{shift.label}</h4>
                            <p className="text-xs text-[var(--app-text-muted)]">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              shift.isFilled
                                ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                                : "bg-[color:color-mix(in_srgb,var(--app-warning)_14%,var(--app-surface))] text-[var(--app-warning)]"
                            }`}
                          >
                            {shift.isFilled ? shift.assignedStaffName : "Unassigned"}
                          </span>
                        </div>

                        <div className="relative mb-4 h-12 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                          <div className="absolute inset-y-0 left-1/3 w-px bg-[var(--app-border)]" />
                          <div className="absolute inset-y-0 left-2/3 w-px bg-[var(--app-border)]" />
                          <div
                            className={`absolute inset-y-1 rounded-full ${
                              shift.isFilled
                                ? "bg-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-primary-soft))]"
                                : "bg-[color:color-mix(in_srgb,var(--app-warning)_24%,var(--app-surface))]"
                            }`}
                            style={{ left: `${segments.primaryLeft}%`, width: `${segments.primaryWidth}%` }}
                          />
                          {segments.overnightWidth > 0 && (
                            <div
                              className={`absolute inset-y-1 left-0 rounded-full ${
                                shift.isFilled
                                  ? "bg-[color:color-mix(in_srgb,var(--app-primary)_12%,var(--app-primary-soft))]"
                                  : "bg-[color:color-mix(in_srgb,var(--app-warning)_16%,var(--app-surface))]"
                              }`}
                              style={{ width: `${segments.overnightWidth}%` }}
                            />
                          )}
                        </div>

                        <label className="block text-xs font-medium text-[var(--app-text-muted)]">
                          Assigned staff
                          <select
                            value={shift.assignedAppUserId ?? ""}
                            onChange={(event) => void assignShift(shift.shiftType, event.target.value)}
                            disabled={saving}
                            className="mt-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                          >
                            <option value="">Unassigned</option>
                            {staffOptions.map((staff) => (
                              <option key={staff.appUserId} value={staff.appUserId}>
                                {staff.displayName}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--app-primary)]" />
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">Facilitated Events</h3>
                </div>
                <div className="space-y-3">
                  {board.events.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-5 text-sm text-[var(--app-text-muted)]">
                      No staffed events on this date.
                    </div>
                  ) : (
                    board.events.map((event) => (
                      <article key={`${event.source}:${event.key}`} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
                              {event.time}
                              {event.endTime ? ` - ${event.endTime}` : ""}
                            </p>
                            <h4 className="mt-1 text-sm font-semibold text-[var(--app-text)]">{event.title}</h4>
                            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                              {event.assignedFacilitatorName || "No facilitator assigned"}
                            </p>
                          </div>
                          {event.canTakeEvent && (
                            <button
                              type="button"
                              onClick={() => void takeEvent(event.key, event.source)}
                              disabled={saving}
                              className="app-primary-button rounded-lg px-3 py-2 text-xs font-semibold"
                            >
                              Take Event
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--app-warning)]" />
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">Coverage Issues</h3>
                </div>
                <div className="space-y-2">
                  {board.issues.length === 0 ? (
                    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 text-sm text-[var(--app-text-muted)]">
                      No immediate gaps detected for this day.
                    </div>
                  ) : (
                    board.issues.map((issue) => (
                      <div
                        key={issue.code}
                        className="rounded-lg border border-[color:color-mix(in_srgb,var(--app-warning)_24%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-warning)_10%,var(--app-surface))] px-4 py-3 text-sm text-[var(--app-text)]"
                      >
                        {issue.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UnitStaffRosterBoard;
