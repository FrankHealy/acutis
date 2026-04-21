import { promises as fs } from "fs";
import path from "path";
import type { MapDocument } from "@/areas/config/mapDesigner/types";

export type StoredMapSummary = {
  fileName: string;
  path: string;
  documentId: string;
  name: string;
  description: string;
  version: number;
  dateCreated: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export function getMapsDirectory() {
  const configured = process.env.MAPS_DIRECTORY?.trim();
  if (configured) {
    return path.resolve(configured);
  }

  return path.resolve(process.cwd(), "..", "resources", "maps");
}

function sanitizeFileName(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned || "map_document";
}

function ensureJsonFileName(fileName: string) {
  return fileName.toLowerCase().endsWith(".json") ? fileName : `${fileName}.json`;
}

function buildDescriptor(documentModel: MapDocument, actor: string, existing?: MapDocument) {
  const now = new Date().toISOString();
  const existingDescriptor = existing?.descriptor;
  const existingMetadata = existing?.metadata;
  const createdAt = existingDescriptor?.dateCreated ?? existingMetadata?.createdAt ?? documentModel.descriptor?.dateCreated ?? documentModel.metadata?.createdAt ?? now;
  const createdBy = existingDescriptor?.createdBy ?? existingMetadata?.createdBy ?? documentModel.descriptor?.createdBy ?? documentModel.metadata?.createdBy ?? actor;
  const previousVersion = existingDescriptor?.version ?? documentModel.descriptor?.version ?? 0;

  return {
    name: documentModel.name,
    description: documentModel.descriptor?.description?.trim() ?? "",
    version: previousVersion + 1,
    dateCreated: createdAt,
    createdBy,
    updatedAt: now,
    updatedBy: actor,
  };
}

function normalizeDocument(documentModel: MapDocument, actor: string, existing?: MapDocument): MapDocument {
  const descriptor = buildDescriptor(documentModel, actor, existing);
  return {
    ...documentModel,
    name: descriptor.name,
    descriptor,
    metadata: {
      createdAt: descriptor.dateCreated,
      updatedAt: descriptor.updatedAt,
      createdBy: descriptor.createdBy,
      updatedBy: descriptor.updatedBy,
    },
  };
}

export async function ensureMapsDirectory() {
  await fs.mkdir(getMapsDirectory(), { recursive: true });
}

export async function listStoredMaps(): Promise<StoredMapSummary[]> {
  await ensureMapsDirectory();
  const directory = getMapsDirectory();
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const maps = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map(async (entry) => {
        const filePath = path.join(directory, entry.name);
        const content = await fs.readFile(filePath, "utf8");
        const documentModel = JSON.parse(content) as MapDocument;
        const descriptor = documentModel.descriptor;
        const stats = await fs.stat(filePath);

        return {
          fileName: entry.name,
          path: filePath,
          documentId: documentModel.id,
          name: descriptor?.name ?? documentModel.name,
          description: descriptor?.description ?? "",
          version: descriptor?.version ?? 1,
          dateCreated: descriptor?.dateCreated ?? documentModel.metadata?.createdAt ?? stats.birthtime.toISOString(),
          createdBy: descriptor?.createdBy ?? documentModel.metadata?.createdBy ?? "Unknown",
          updatedAt: descriptor?.updatedAt ?? documentModel.metadata?.updatedAt ?? stats.mtime.toISOString(),
          updatedBy: descriptor?.updatedBy ?? documentModel.metadata?.updatedBy ?? descriptor?.createdBy ?? documentModel.metadata?.createdBy ?? "Unknown",
        } satisfies StoredMapSummary;
      }),
  );

  return maps.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function loadStoredMap(fileName: string): Promise<MapDocument> {
  await ensureMapsDirectory();
  const targetPath = path.join(getMapsDirectory(), ensureJsonFileName(path.basename(fileName)));
  const content = await fs.readFile(targetPath, "utf8");
  return JSON.parse(content) as MapDocument;
}

export async function saveStoredMap(input: { fileName?: string; document: MapDocument; actor?: string }) {
  await ensureMapsDirectory();
  const actor = input.actor?.trim() || "Unknown";
  const existingFileName = input.fileName ? ensureJsonFileName(path.basename(input.fileName)) : null;
  const targetFileName = existingFileName ?? ensureJsonFileName(sanitizeFileName(input.document.name));
  const targetPath = path.join(getMapsDirectory(), targetFileName);

  let existing: MapDocument | undefined;
  try {
    existing = await loadStoredMap(targetFileName);
  } catch {
    existing = undefined;
  }

  const normalized = normalizeDocument(input.document, actor, existing);
  await fs.writeFile(targetPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  return {
    fileName: targetFileName,
    document: normalized,
  };
}
