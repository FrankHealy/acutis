import { bootstrapDatabase } from "../../db";
import { executeSql, openEncryptedDatabase, queryAll } from "../../db/connection";

export type GroupTherapySessionStatus = "planned" | "in_progress" | "ready_to_sync" | "pending_sync" | "synced" | "sync_failed";

export interface GroupTherapySessionPayload {
  facilitatorName?: string;
  themeKeys: string[];
  currentSpeakerResidentId?: string;
  previousSpeakerResidentId?: string;
  attendance: Record<string, "present" | "absent" | "unknown">;
  followUpResidentIds: string[];
  handoverNotes?: string;
}

export interface GroupTherapySessionRecord {
  id: string;
  unitId: string;
  sessionDate: string;
  status: GroupTherapySessionStatus;
  payload: GroupTherapySessionPayload;
  createdAtClient: string;
  updatedAtClient: string;
}

type GroupTherapySessionRow = Omit<GroupTherapySessionRecord, "payload"> & {
  payload: string;
};

function mapSessionRow(row: GroupTherapySessionRow): GroupTherapySessionRecord {
  return {
    ...row,
    payload: JSON.parse(row.payload) as GroupTherapySessionPayload,
  };
}

export async function getGroupTherapySession(id: string): Promise<GroupTherapySessionRecord | null> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<GroupTherapySessionRow>(db, "SELECT * FROM group_therapy_sessions WHERE id = ?", [id]);
  return rows[0] ? mapSessionRow(rows[0]) : null;
}

export async function getGroupTherapySessionsForDate(
  unitId: string,
  sessionDate: string
): Promise<GroupTherapySessionRecord[]> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<GroupTherapySessionRow>(
    db,
    "SELECT * FROM group_therapy_sessions WHERE unitId = ? AND sessionDate = ? ORDER BY updatedAtClient DESC",
    [unitId, sessionDate]
  );
  return rows.map(mapSessionRow);
}

export async function saveGroupTherapySession(
  input: Omit<GroupTherapySessionRecord, "createdAtClient" | "updatedAtClient"> &
    Partial<Pick<GroupTherapySessionRecord, "createdAtClient">>
): Promise<GroupTherapySessionRecord> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();
  const existing = await getGroupTherapySession(input.id);
  const createdAtClient = existing?.createdAtClient ?? input.createdAtClient ?? now;
  const payload = JSON.stringify(input.payload);

  if (existing) {
    await executeSql(
      db,
      "UPDATE group_therapy_sessions SET unitId = ?, sessionDate = ?, status = ?, payload = ?, updatedAtClient = ? WHERE id = ?",
      [input.unitId, input.sessionDate, input.status, payload, now, input.id]
    );
  } else {
    await executeSql(
      db,
      "INSERT INTO group_therapy_sessions (id, unitId, sessionDate, status, payload, createdAtClient, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [input.id, input.unitId, input.sessionDate, input.status, payload, createdAtClient, now]
    );
  }

  return { ...input, createdAtClient, updatedAtClient: now };
}
