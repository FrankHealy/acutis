import { bootstrapDatabase } from "../../db";
import { executeSql, openEncryptedDatabase, queryAll } from "../../db/connection";

export type AdmissionDraftStatus = "draft" | "ready_to_submit" | "pending_sync" | "synced" | "sync_failed";
export type AdmissionSectionStatus = "not_started" | "in_progress" | "complete" | "needs_review";
export type AdmissionRoomAssignmentStatus = "draft" | "confirmed";

export interface AdmissionDraft {
  id: string;
  unitId: string;
  residentName: string;
  status: AdmissionDraftStatus;
  payload: Record<string, unknown>;
  createdAtClient: string;
  updatedAtClient: string;
}

type AdmissionDraftRow = Omit<AdmissionDraft, "payload"> & {
  payload: string;
};

export interface SaveAdmissionDraftInput {
  id?: string;
  unitId: string;
  residentName: string;
  status?: AdmissionDraftStatus;
  payload: Record<string, unknown>;
}

export interface AdmissionSectionRecord {
  id: string;
  draftId: string;
  sectionKey: string;
  status: AdmissionSectionStatus;
  payload: Record<string, unknown>;
  updatedAtClient: string;
}

type AdmissionSectionRow = Omit<AdmissionSectionRecord, "payload"> & {
  payload: string;
};

export interface AdmissionSignatureRecord {
  id: string;
  draftId: string;
  signerRole: "staff" | "service_user";
  signerName: string;
  signaturePayload: Record<string, unknown>;
  capturedAtClient: string;
}

export interface AdmissionRoomAssignmentRecord {
  id: string;
  draftId: string;
  unitId: string;
  roomId: string;
  bedId?: string | null;
  status: AdmissionRoomAssignmentStatus;
  assignedAtClient: string;
}

function createDraftId(unitId: string): string {
  return `admission-${unitId}-${Date.now()}`;
}

function mapDraftRow(row: AdmissionDraftRow): AdmissionDraft {
  return {
    ...row,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
  };
}

function mapSectionRow(row: AdmissionSectionRow): AdmissionSectionRecord {
  return {
    ...row,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
  };
}

export async function getAdmissionDraft(id: string): Promise<AdmissionDraft | null> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<AdmissionDraftRow>(db, "SELECT * FROM admission_drafts WHERE id = ?", [id]);
  return rows[0] ? mapDraftRow(rows[0]) : null;
}

export async function getAdmissionDraftsForUnit(unitId: string): Promise<AdmissionDraft[]> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<AdmissionDraftRow>(
    db,
    "SELECT * FROM admission_drafts WHERE unitId = ? ORDER BY updatedAtClient DESC",
    [unitId]
  );
  return rows.map(mapDraftRow);
}

export async function saveAdmissionDraft(input: SaveAdmissionDraftInput): Promise<AdmissionDraft> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();
  const id = input.id ?? createDraftId(input.unitId);
  const existing = await getAdmissionDraft(id);
  const status = input.status ?? existing?.status ?? "draft";
  const createdAtClient = existing?.createdAtClient ?? now;
  const payload = JSON.stringify(input.payload);

  if (existing) {
    await executeSql(
      db,
      "UPDATE admission_drafts SET unitId = ?, residentName = ?, status = ?, payload = ?, updatedAtClient = ? WHERE id = ?",
      [input.unitId, input.residentName, status, payload, now, id]
    );
  } else {
    await executeSql(
      db,
      "INSERT INTO admission_drafts (id, unitId, residentName, status, payload, createdAtClient, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, input.unitId, input.residentName, status, payload, createdAtClient, now]
    );
  }

  return {
    id,
    unitId: input.unitId,
    residentName: input.residentName,
    status,
    payload: input.payload,
    createdAtClient,
    updatedAtClient: now,
  };
}

export async function getAdmissionSections(draftId: string): Promise<AdmissionSectionRecord[]> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const rows = await queryAll<AdmissionSectionRow>(
    db,
    "SELECT * FROM admission_sections WHERE draftId = ? ORDER BY updatedAtClient DESC",
    [draftId]
  );
  return rows.map(mapSectionRow);
}

export async function saveAdmissionSection(
  draftId: string,
  sectionKey: string,
  payload: Record<string, unknown>,
  status: AdmissionSectionStatus
): Promise<AdmissionSectionRecord> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();
  const id = `${draftId}-${sectionKey}`;
  const existing = await queryAll<AdmissionSectionRow>(
    db,
    "SELECT * FROM admission_sections WHERE draftId = ? AND sectionKey = ?",
    [draftId, sectionKey]
  );
  const serializedPayload = JSON.stringify(payload);

  if (existing.length > 0) {
    await executeSql(
      db,
      "UPDATE admission_sections SET status = ?, payload = ?, updatedAtClient = ? WHERE id = ?",
      [status, serializedPayload, now, id]
    );
  } else {
    await executeSql(
      db,
      "INSERT INTO admission_sections (id, draftId, sectionKey, status, payload, updatedAtClient) VALUES (?, ?, ?, ?, ?, ?)",
      [id, draftId, sectionKey, status, serializedPayload, now]
    );
  }

  return { id, draftId, sectionKey, status, payload, updatedAtClient: now };
}

export async function saveAdmissionRoomAssignment(
  input: Omit<AdmissionRoomAssignmentRecord, "id" | "assignedAtClient">
): Promise<AdmissionRoomAssignmentRecord> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();
  const id = `${input.draftId}-room`;

  await executeSql(
    db,
    "INSERT OR REPLACE INTO admission_room_assignments (id, draftId, unitId, roomId, bedId, status, assignedAtClient) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, input.draftId, input.unitId, input.roomId, input.bedId ?? null, input.status, now]
  );

  return { ...input, id, assignedAtClient: now };
}

export async function saveAdmissionSignature(
  input: Omit<AdmissionSignatureRecord, "id" | "capturedAtClient">
): Promise<AdmissionSignatureRecord> {
  await bootstrapDatabase();
  const db = await openEncryptedDatabase();
  const now = new Date().toISOString();
  const id = `${input.draftId}-${input.signerRole}-signature`;

  await executeSql(
    db,
    "INSERT OR REPLACE INTO admission_signatures (id, draftId, signerRole, signerName, signaturePayload, capturedAtClient) VALUES (?, ?, ?, ?, ?, ?)",
    [id, input.draftId, input.signerRole, input.signerName, JSON.stringify(input.signaturePayload), now]
  );

  return { ...input, id, capturedAtClient: now };
}
