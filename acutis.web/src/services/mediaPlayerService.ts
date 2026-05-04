import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type MediaAsset = {
  id: string;
  unitCode: string;
  assetType: "VoicedMeditation" | "MeditationMusic";
  shortName: string;
  fileName: string;
  lengthSeconds: number;
  lastPlayedAtUtc: string | null;
  isActive: boolean;
  streamUrl: string;
};

export type MediaPlayerCatalog = {
  unitCode: string;
  voicedMeditations: MediaAsset[];
  meditationMusic: MediaAsset[];
};

type ApiEnvelope<T> = {
  correlationId: string;
  serverTimeUtc: string;
  data: T;
};

const noStoreFetchInit: RequestInit = {
  headers: { Accept: "application/json" },
  cache: "no-store",
};

async function readEnvelope<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `Media API failed (${response.status})`;
    throw new Error(message);
  }

  return (body as ApiEnvelope<T>).data;
}

export const mediaPlayerService = {
  async getCatalog(unitId: UnitId): Promise<MediaPlayerCatalog> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/mediaplayer/catalog`,
      noStoreFetchInit
    );
    return readEnvelope<MediaPlayerCatalog>(response);
  },

  async sync(unitId: UnitId, reason?: string): Promise<number> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/mediaplayer/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await readEnvelope<{ added: number }>(response);
    return data.added;
  },

  async register(payload: {
    unitCode: string;
    assetType: "VoicedMeditation" | "MeditationMusic";
    shortName: string;
    fileName: string;
    lengthSeconds?: number;
    reason?: string;
  }): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async markPlayed(assetId: string, reason?: string): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}/played`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ reason }),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async deactivate(assetId: string, reason?: string): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ reason }),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async delete(assetId: string, deleteFile: boolean, reason?: string): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}?deleteFile=${deleteFile ? "true" : "false"}${
        reason ? `&reason=${encodeURIComponent(reason)}` : ""
      }`,
      { method: "DELETE", headers: { Accept: "application/json" } }
    );
    await readEnvelope<{ deleted: boolean }>(response);
  },

  buildStreamUrl(asset: MediaAsset): string {
    return asset.streamUrl.startsWith("http")
      ? asset.streamUrl
      : `${getApiBaseUrl()}${asset.streamUrl}`;
  },
};
