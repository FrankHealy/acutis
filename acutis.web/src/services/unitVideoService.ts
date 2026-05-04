import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type VideoDto = {
  id: string;
  key: string;
  title: string;
  url: string;
  playbackUrl: string;
  lengthSeconds: number;
  description?: string | null;
  source?: string | null;
  language: string;
  tags: string[];
  isActive: boolean;
  isDownloaded: boolean;
};

export const unitVideoService = {
  async getVideos(unitId: UnitId): Promise<VideoDto[]> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/videos`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load videos (${response.status})`);
    }

    return (await response.json()) as VideoDto[];
  },

  buildPlaybackUrl(video: VideoDto): string {
    const raw = video.playbackUrl?.trim() || video.url?.trim();
    if (!raw) {
      return "";
    }

    return raw.startsWith("http") ? raw : `${getApiBaseUrl()}${raw}`;
  },
};
