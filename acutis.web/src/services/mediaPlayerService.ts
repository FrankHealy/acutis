import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { createAuthHeaders } from "@/lib/authMode";

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

const noStoreFetchInit = (accessToken?: string | null): RequestInit => ({
  headers: createAuthHeaders(accessToken),
  cache: "no-store",
});

async function readEnvelope<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `Media API failed (${response.status})`;
    throw new Error(message);
  }

  return (body as ApiEnvelope<T>).data;
}

export const mediaPlayerService = {
  async getCatalog(unitId: UnitId, accessToken?: string | null): Promise<MediaPlayerCatalog> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/mediaplayer/catalog`,
      noStoreFetchInit(accessToken)
    );
    return readEnvelope<MediaPlayerCatalog>(response);
  },

  async sync(unitId: UnitId, reason?: string, accessToken?: string | null): Promise<number> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/mediaplayer/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...createAuthHeaders(accessToken) },
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
  }, accessToken?: string | null): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...createAuthHeaders(accessToken) },
      body: JSON.stringify(payload),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async markPlayed(assetId: string, reason?: string, accessToken?: string | null): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}/played`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...createAuthHeaders(accessToken) },
      body: JSON.stringify({ reason }),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async deactivate(assetId: string, reason?: string, accessToken?: string | null): Promise<MediaAsset> {
    const response = await fetch(`${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...createAuthHeaders(accessToken) },
      body: JSON.stringify({ reason }),
    });
    return readEnvelope<MediaAsset>(response);
  },

  async delete(assetId: string, deleteFile: boolean, reason?: string, accessToken?: string | null): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/api/mediaplayer/assets/${assetId}?deleteFile=${deleteFile ? "true" : "false"}${
        reason ? `&reason=${encodeURIComponent(reason)}` : ""
      }`,
      { method: "DELETE", headers: createAuthHeaders(accessToken) }
    );
    await readEnvelope<{ deleted: boolean }>(response);
  },

  buildStreamUrl(asset: MediaAsset): string {
    return asset.streamUrl.startsWith("http")
      ? asset.streamUrl
      : `${getApiBaseUrl()}${asset.streamUrl}`;
  },
};
