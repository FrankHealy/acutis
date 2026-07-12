import { openEncryptedDatabase, queryAll } from "./connection";

export async function initializeSchema(): Promise<void> {
  const db = await openEncryptedDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      createdAtClient TEXT NOT NULL,
      updatedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sync_queue_status
      ON sync_queue (status, createdAtClient);

    CREATE TABLE IF NOT EXISTS roll_call (
      id TEXT PRIMARY KEY NOT NULL,
      sessionId TEXT NOT NULL,
      residentId TEXT NOT NULL,
      status TEXT NOT NULL,
      capturedAtClient TEXT NOT NULL,
      updatedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_roll_call_session_resident
      ON roll_call (sessionId, residentId);

    CREATE TABLE IF NOT EXISTS admission_drafts (
      id TEXT PRIMARY KEY NOT NULL,
      unitId TEXT NOT NULL,
      residentName TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAtClient TEXT NOT NULL,
      updatedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admission_drafts_unit_status
      ON admission_drafts (unitId, status, updatedAtClient);

    CREATE TABLE IF NOT EXISTS admission_sections (
      id TEXT PRIMARY KEY NOT NULL,
      draftId TEXT NOT NULL,
      sectionKey TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      updatedAtClient TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_admission_sections_draft_section
      ON admission_sections (draftId, sectionKey);

    CREATE TABLE IF NOT EXISTS admission_signatures (
      id TEXT PRIMARY KEY NOT NULL,
      draftId TEXT NOT NULL,
      signerRole TEXT NOT NULL,
      signerName TEXT NOT NULL,
      signaturePayload TEXT NOT NULL,
      capturedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admission_signatures_draft
      ON admission_signatures (draftId, signerRole);

    CREATE TABLE IF NOT EXISTS admission_room_assignments (
      id TEXT PRIMARY KEY NOT NULL,
      draftId TEXT NOT NULL,
      unitId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      bedId TEXT,
      status TEXT NOT NULL,
      assignedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admission_room_assignments_draft
      ON admission_room_assignments (draftId, status);

    CREATE TABLE IF NOT EXISTS group_therapy_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      unitId TEXT NOT NULL,
      sessionDate TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAtClient TEXT NOT NULL,
      updatedAtClient TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_group_therapy_sessions_unit_date
      ON group_therapy_sessions (unitId, sessionDate);
  `);
}

export async function getSyncQueueEntries() {
  const db = await openEncryptedDatabase();
  return queryAll<{
    id: string;
    action: string;
    payload: string;
    status: string;
    attempts: number;
    createdAtClient: string;
    updatedAtClient: string;
  }>(db, "SELECT * FROM sync_queue ORDER BY createdAtClient ASC");
}
