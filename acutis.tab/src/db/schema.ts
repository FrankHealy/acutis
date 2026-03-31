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
