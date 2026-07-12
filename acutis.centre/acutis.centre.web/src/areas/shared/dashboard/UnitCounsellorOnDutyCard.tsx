"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldPlus } from "lucide-react";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { staffRosterService, type UnitStaffRosterBoardDto, type UnitStaffRosterShiftDto } from "@/services/staffRosterService";

type UnitCounsellorOnDutyCardProps = {
  unitCode: string;
  unitName: string;
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isActiveShift(shift: UnitStaffRosterShiftDto, currentMinutes: number) {
  const normalizedCurrentMinutes = currentMinutes < shift.startMinutes && shift.endMinutes > 1440
    ? currentMinutes + 1440
    : currentMinutes;
  return normalizedCurrentMinutes >= shift.startMinutes && normalizedCurrentMinutes < shift.endMinutes;
}

const UnitCounsellorOnDutyCard: React.FC<UnitCounsellorOnDutyCardProps> = ({ unitCode, unitName }) => {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const [board, setBoard] = useState<UnitStaffRosterBoardDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!isAuthorizationDisabled && status === "unauthenticated") {
      setBoard(null);
      return;
    }

    if (!isAuthorizationDisabled && status !== "authenticated") {
      return;
    }

    try {
      setError(null);
      setBoard(await staffRosterService.getBoard(accessToken, unitCode, isoToday()));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load counsellor on duty.");
    }
  }, [accessToken, status, unitCode]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await Promise.resolve();
      if (!cancelled) {
        await loadBoard();
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const codShifts = useMemo(() => {
    return (board?.shifts ?? []).filter(
      (shift) =>
        shift.shiftType === "CouncillorOnDutyMorning" ||
        shift.shiftType === "CouncillorOnDutyEvening",
    );
  }, [board]);

  const currentMinutes = getCurrentMinutes();

  return (
    <div className="app-card rounded-xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldPlus className="h-5 w-5 text-[var(--app-primary)]" />
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Counsellor On Duty</h2>
          <p className="text-sm text-[var(--app-text-muted)]">
            Today&apos;s COD cover for {unitName}.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--app-danger)_28%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,var(--app-surface))] px-4 py-3 text-sm text-[var(--app-danger)]">
          {error}
        </div>
      ) : codShifts.length === 0 ? (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm text-[var(--app-text-muted)]">
          No counsellor on duty shifts configured for today.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {codShifts.map((shift) => {
            const active = isActiveShift(shift, currentMinutes);
            return (
              <article
                key={shift.shiftType}
                className={`rounded-xl border px-4 py-4 ${
                  active
                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                    : "border-[var(--app-border)] bg-[var(--app-surface-muted)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--app-text)]">{shift.label}</h3>
                    <p className="mt-2 text-base font-semibold text-[var(--app-text)]">
                      {shift.assignedStaffName || "Unassigned"}
                    </p>
                  </div>
                  {active && (
                    <span className="rounded-full bg-[var(--app-primary)] px-2 py-1 text-xs font-semibold text-white">
                      Current
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnitCounsellorOnDutyCard;
