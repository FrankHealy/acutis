"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Headphones, Music2 } from "lucide-react";
import { mediaPlayerService, type MediaAsset, type MediaPlayerCatalog } from "@/services/mediaPlayerService";
import type { UnitId } from "./unit/unitTypes";

type MeditationSectionProps = {
  unitId: UnitId;
  unitName: string;
};

const emptyCatalog = (unitCode: string): MediaPlayerCatalog => ({
  unitCode,
  voicedMeditations: [],
  meditationMusic: [],
});

const MeditationSection: React.FC<MeditationSectionProps> = ({ unitId, unitName }) => {
  const [catalog, setCatalog] = useState<MediaPlayerCatalog>(emptyCatalog(unitId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaPlayerService.getCatalog(unitId);
      setCatalog(response);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCatalog();
  }, [unitId]);

  const playAndTrack = async (asset: MediaAsset) => {
    try {
      const updated = await mediaPlayerService.markPlayed(asset.id, "Playback started from meditation player");
      setCatalog((previous) => ({
        ...previous,
        voicedMeditations: previous.voicedMeditations.map((item) => (item.id === updated.id ? updated : item)),
        meditationMusic: previous.meditationMusic.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const sections = useMemo(
    () => [
      { title: "Voiced Meditation", icon: Headphones, items: catalog.voicedMeditations },
      { title: "Meditation Music", icon: Music2, items: catalog.meditationMusic },
    ],
    [catalog]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{unitName} Meditation Player</h2>
        <p className="text-sm text-gray-600">Playback only. Manage media in Unit Configuration.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">Loading media catalog...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <section.icon className="h-5 w-5 text-blue-600" />
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.items.length === 0 && <p className="text-sm text-gray-500">No media configured.</p>}
                {section.items.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{asset.shortName}</p>
                        <p className="text-xs text-gray-500">
                          {asset.fileName} | {asset.lengthSeconds > 0 ? `${asset.lengthSeconds}s` : "Length unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last played: {asset.lastPlayedAtUtc ? new Date(asset.lastPlayedAtUtc).toLocaleString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <audio
                      controls
                      preload="none"
                      className="w-full"
                      src={mediaPlayerService.buildStreamUrl(asset)}
                      onPlay={() => void playAndTrack(asset)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeditationSection;
