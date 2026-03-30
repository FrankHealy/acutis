import { openEncryptedDatabase, runQuery } from "../../db/connection";

export type AttendanceStatus = "present" | "absent" | "unknown";

export interface RollCallRecord {
  id: string;
  sessionId: string;
  residentId: string;
  status: AttendanceStatus;
  capturedAtClient: string;
  updatedAtClient: string;
}

export async function getRollCallForSession(sessionId: string): Promise<RollCallRecord[]> {
  const db = await openEncryptedDatabase();
  return runQuery<RollCallRecord>(db, "SELECT * FROM roll_call WHERE sessionId = ?", [sessionId]);
}

export async function upsertRollCallAttendance(sessionId: string, residentId: string, status: AttendanceStatus): Promise<RollCallRecord> {
  const now = new Date().toISOString();
  const existing = await runQuery<RollCallRecord>(
    await openEncryptedDatabase(),
    "SELECT * FROM roll_call WHERE sessionId = ? AND residentId = ?",
    [sessionId, residentId]
  );

  const id = existing.length > 0 ? existing[0].id : `${sessionId}-${residentId}-${Date.now()}`; // local unique id, non-authoritative

  await runQuery(await openEncryptedDatabase(),
    existing.length > 0
      ? "UPDATE roll_call SET status = ?, updatedAtClient = ? WHERE id = ?"
      : "INSERT INTO roll_call (id, sessionId, residentId, status, capturedAtClient, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?)",
    existing.length > 0 ? [status, now, id] : [id, sessionId, residentId, status, now, now]
  );

  return { id, sessionId, residentId, status, capturedAtClient: existing.length > 0 ? existing[0].capturedAtClient : now, updatedAtClient: now };
}
