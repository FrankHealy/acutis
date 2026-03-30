import { useEffect, useMemo, useState } from "react";
import { getRollCallForSession, upsertRollCallAttendance, RollCallRecord, AttendanceStatus } from "./repository";

export function useRollCall(sessionId: string) {
  const [records, setRecords] = useState<RollCallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getRollCallForSession(sessionId);
        if (active) {
          setRecords(data);
          setError(null);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const markAttendance = async (residentId: string, status: AttendanceStatus) => {
    try {
      const updated = await upsertRollCallAttendance(sessionId, residentId, status);
      setRecords((prev: RollCallRecord[]) => {
        const existingIndex = prev.findIndex((item: RollCallRecord) => item.residentId === residentId);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = updated;
          return next;
        }
        return [...prev, updated];
      });
      return updated;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };

  const countStatus = useMemo(() => {
    return records.reduce(
      (acc: { present: number; absent: number; unknown: number }, record: RollCallRecord) => {
        acc[record.status] = (acc[record.status] ?? 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, unknown: 0 }
    );
  }, [records]);

  return { records, loading, error, markAttendance, countStatus };
}
