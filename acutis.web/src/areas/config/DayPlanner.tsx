"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CalendarClock, RefreshCcw, TriangleAlert } from "lucide-react";
import { isAuthorizationDisabled } from "@/lib/authMode";
import type { UnitId as WorkspaceUnitId } from "@/areas/shared/unit/unitTypes";
import { intakeSchedulingService, type IntakeBacklogItem, type IntakeBoard } from "@/services/intakeSchedulingService";

type SchedulingUnitId = "alcohol" | "detox";

const Units: Array<{ id: SchedulingUnitId; name: string; accent: string; chip: string }> = [
  {
    id: "alcohol",
    name: "Alcohol & Gambling",
    accent: "text-[var(--app-warning)]",
    chip: "bg-[color:color-mix(in_srgb,var(--app-warning)_16%,white)] text-[var(--app-warning)]",
  },
  {
    id: "detox",
    name: "Detox",
    accent: "text-[var(--app-primary)]",
    chip: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
  },
];

type DayPlannerProps = {
  embedded?: boolean;
  initialUnit?: WorkspaceUnitId;
  lockUnit?: boolean;
  title?: string;
};

type DragPayload = {
  residentCaseId: string;
};

const DayPlanner: React.FC<DayPlannerProps> = ({
  embedded = false,
  initialUnit = "detox",
  lockUnit = false,
  title = "Detox Intake Scheduling",
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  const [activeUnit, setActiveUnit] = useState<SchedulingUnitId>(
    initialUnit === "alcohol" || initialUnit === "detox" ? initialUnit : "detox",
  );
  const [board, setBoard] = useState<IntakeBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const activeUnitMeta = useMemo(
    () => Units.find((unit) => unit.id === activeUnit) ?? Units[0],
    [activeUnit],
  );

  const loadBoard = useCallback(async () => {
    if (!isAuthorizationDisabled && status === "unauthenticated") {
      setLoading(false);
      setBoard(null);
      return;
    }

    if (!isAuthorizationDisabled && status !== "authenticated") {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nextBoard = await intakeSchedulingService.getBoard(activeUnit, accessToken);
      setBoard(nextBoard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load intake schedule.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, activeUnit, status]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const updatePriority = useCallback(
    async (item: IntakeBacklogItem, direction: "up" | "down") => {
      if (!board) return;

      const currentIndex = board.backlog.findIndex((entry) => entry.residentCaseId === item.residentCaseId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= board.backlog.length) return;

      const currentPriority = board.backlog[currentIndex].priority;
      const targetPriority = board.backlog[targetIndex].priority;

      setSaving(true);
      setError(null);
      try {
        await intakeSchedulingService.updatePriority(item.residentCaseId, targetPriority, accessToken);
        await intakeSchedulingService.updatePriority(board.backlog[targetIndex].residentCaseId, currentPriority, accessToken);
        await loadBoard();
        setLastSaved(new Date());
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : "Unable to update backlog priority.");
      } finally {
        setSaving(false);
      }
    },
    [accessToken, board, loadBoard],
  );

  const assignCase = useCallback(
    async (residentCaseId: string, scheduledDate: string) => {
      setSaving(true);
      setError(null);
      try {
        await intakeSchedulingService.assignCase(activeUnit, residentCaseId, scheduledDate, accessToken);
        await loadBoard();
        setLastSaved(new Date());
      } catch (assignError) {
        setError(assignError instanceof Error ? assignError.message : "Unable to assign intake date.");
      } finally {
        setSaving(false);
      }
    },
    [accessToken, activeUnit, loadBoard],
  );

  const cancelScheduledIntake = useCallback(
    async (scheduledIntakeId: string) => {
      setSaving(true);
      setError(null);
      try {
        await intakeSchedulingService.cancelScheduledIntake(scheduledIntakeId, accessToken);
        await loadBoard();
        setLastSaved(new Date());
      } catch (cancelError) {
        setError(cancelError instanceof Error ? cancelError.message : "Unable to remove scheduled intake.");
      } finally {
        setSaving(false);
      }
    },
    [accessToken, loadBoard],
  );

  const handleDragStart = (event: React.DragEvent<HTMLElement>, payload: DragPayload) => {
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (event: React.DragEvent<HTMLElement>, scheduledDate: string) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw) as DragPayload;
    if (!payload?.residentCaseId) return;
    await assignCase(payload.residentCaseId, scheduledDate);
  };

  if (!isAuthorizationDisabled && status === "unauthenticated") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Please sign in to access detox intake scheduling.
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "app-page-shell"}>
      <main className={embedded ? "mx-auto max-w-7xl px-0 py-0" : "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"}>
        <div className="mb-6 flex items-center gap-3">
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
              <p className="text-[var(--app-text-muted)]">
                Prioritise intake-ready backlog cases and assign them into upcoming Monday intake dates.
              </p>
            </div>
          </div>
        </div>

        <div className="app-card space-y-6 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {lockUnit ? (
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${activeUnitMeta.chip}`}>
                  {activeUnitMeta.name}
                </span>
              ) : (
                Units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setActiveUnit(unit.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
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
                onClick={() => void loadBoard()}
                className="app-secondary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                disabled={loading || saving}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
              <div className="text-sm text-[var(--app-text-muted)]">
                {saving
                  ? "Saving changes..."
                  : lastSaved
                    ? `Last saved ${lastSaved.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}`
                    : "Live scheduling board"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${activeUnitMeta.chip}`}>
                {activeUnitMeta.name}
              </span>
              <span className="text-sm text-[var(--app-text-muted)]">
                Upcoming intake tables are generated one month ahead using the configured intake day and Irish holiday shift logic.
              </span>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-6 text-sm text-[var(--app-text-muted)]">
              Loading intake backlog and scheduled dates...
            </div>
          ) : board ? (
            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              <section className="space-y-4">
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--app-text)]">Backlog</h2>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Drag a case into an intake date table. Use the arrows to change order.
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary)]">
                      {board.backlog.length} cases
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {board.backlog.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5 text-sm text-[var(--app-text-muted)]">
                      No intake-ready backlog cases are waiting for scheduling.
                    </div>
                  ) : (
                    board.backlog.map((item, index) => (
                      <article
                        key={item.residentCaseId}
                        draggable
                        onDragStart={(event) => handleDragStart(event, { residentCaseId: item.residentCaseId })}
                        className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                              Priority {index + 1}
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-[var(--app-text)]">{item.residentName}</h3>
                            <p className="text-sm text-[var(--app-text-muted)]">
                              {item.caseIdentifier} • {item.unitName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => void updatePriority(item, "up")}
                              disabled={saving || index === 0}
                              className="rounded-lg border border-[var(--app-border)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] disabled:opacity-40"
                            >
                              Up
                            </button>
                            <button
                              onClick={() => void updatePriority(item, "down")}
                              disabled={saving || index === board.backlog.length - 1}
                              className="rounded-lg border border-[var(--app-border)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] disabled:opacity-40"
                            >
                              Down
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-medium text-[var(--app-text-muted)]">
                            {item.caseStatus.replaceAll("_", " ")}
                          </span>
                          <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-medium text-[var(--app-text-muted)]">
                            {item.intakeSource.replaceAll("_", " ")}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                  <h2 className="text-sm font-semibold text-[var(--app-text)]">Upcoming Intake Dates</h2>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Expected capacity, current scheduled count, and remaining capacity are shown for each date table.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {board.buckets.map((bucket) => (
                    <div
                      key={bucket.scheduledDate}
                      onDragOver={handleDragOver}
                      onDrop={(event) => void handleDrop(event, bucket.scheduledDate)}
                      className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-[var(--app-text)]">{bucket.displayLabel}</h3>
                          <p className="text-xs text-[var(--app-text-muted)]">{bucket.scheduledDate}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--app-text-muted)]">
                          <p>Capacity {bucket.expectedCapacity}</p>
                          <p>Scheduled {bucket.scheduledCount}</p>
                          <p>Remaining {bucket.remainingCapacity}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {bucket.assignments.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-6 text-center text-sm text-[var(--app-text-muted)]">
                            Drop backlog case here
                          </div>
                        ) : (
                          bucket.assignments.map((assignment) => (
                            <article
                              key={assignment.scheduledIntakeId}
                              draggable
                              onDragStart={(event) => handleDragStart(event, { residentCaseId: assignment.residentCaseId })}
                              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-[var(--app-text)]">{assignment.residentName}</h4>
                                  <p className="text-xs text-[var(--app-text-muted)]">
                                    {assignment.caseIdentifier} • {assignment.unitName}
                                  </p>
                                </div>
                                <button
                                  onClick={() => void cancelScheduledIntake(assignment.scheduledIntakeId)}
                                  disabled={saving}
                                  className="rounded-lg border border-[var(--app-border)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] disabled:opacity-40"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
                                <span className="rounded-full bg-white px-2 py-1 font-medium">
                                  {assignment.caseStatus.replaceAll("_", " ")}
                                </span>
                                <span className="rounded-full bg-white px-2 py-1 font-medium">
                                  Priority {assignment.priority > 0 ? assignment.priority : "auto"}
                                </span>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-6 text-sm text-[var(--app-text-muted)]">
              No intake scheduling data is available for this unit.
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This pass is intentionally narrow: it supports backlog prioritisation and intake-date placement for detox intake scheduling, not a general rota or calendar engine.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DayPlanner;
