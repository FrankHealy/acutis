import { bootstrapDatabase } from "../../db";
import { executeSql, openEncryptedDatabase, queryAll } from "../../db/connection";

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
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  return queryAll<RollCallRecord>(
    db,
    "SELECT * FROM roll_call WHERE sessionId = ? ORDER BY updatedAtClient DESC",
    [sessionId]
  );
}

export async function getPendingRollCallSyncCount(sessionId: string): Promise<number> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM sync_queue WHERE action = ? AND status = 'pending' AND payload LIKE ?",
    ["roll-call.attendance-upsert", `%\"sessionId\":\"${sessionId}\"%`]
  );

  return rows[0]?.count ?? 0;
}

export async function upsertRollCallAttendance(
  sessionId: string,
  residentId: string,
  status: AttendanceStatus
): Promise<RollCallRecord> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();

  const existing = await queryAll<RollCallRecord>(
    db,
    "SELECT * FROM roll_call WHERE sessionId = ? AND residentId = ?",
    [sessionId, residentId]
  );

  const recordId = existing[0]?.id ?? `${sessionId}-${residentId}-${Date.now()}`;
  const capturedAtClient = existing[0]?.capturedAtClient ?? now;

  if (existing.length > 0) {
    await executeSql(
      db,
      "UPDATE roll_call SET status = ?, updatedAtClient = ? WHERE id = ?",
      [status, now, recordId]
    );
  } else {
    await executeSql(
      db,
      "INSERT INTO roll_call (id, sessionId, residentId, status, capturedAtClient, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?)",
      [recordId, sessionId, residentId, status, capturedAtClient, now]
    );
  }

  await executeSql(
    db,
    "INSERT INTO sync_queue (id, action, payload, status, attempts, createdAtClient, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      `sync-${recordId}-${Date.now()}`,
      "roll-call.attendance-upsert",
      JSON.stringify({
        sessionId,
        residentId,
        status,
        capturedAtClient,
        updatedAtClient: now,
      }),
      "pending",
      0,
      now,
      now,
    ]
  );

  return {
    id: recordId,
    sessionId,
    residentId,
    status,
    capturedAtClient,
    updatedAtClient: now,
  };
}
