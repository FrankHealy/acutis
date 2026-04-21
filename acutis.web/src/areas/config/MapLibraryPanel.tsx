"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Map, Plus } from "lucide-react";
import type { MapDocument } from "@/areas/config/mapDesigner/types";

type StoredMapSummary = {
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

type MapLibraryPanelProps = {
  visible: boolean;
  onCreateMap: () => void;
  onOpenMap: (payload: { fileName: string; document: MapDocument }) => void;
};

export default function MapLibraryPanel({ visible, onCreateMap, onOpenMap }: MapLibraryPanelProps) {
  const [maps, setMaps] = useState<StoredMapSummary[]>([]);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const loadMaps = useCallback(async () => {
    setIsLoadingMaps(true);
    setLibraryError(null);
    try {
      const response = await fetch("/api/config/maps", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load maps.");
      }

      const payload = (await response.json()) as { maps: StoredMapSummary[] };
      setMaps(payload.maps);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Unable to load maps.");
    } finally {
      setIsLoadingMaps(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    void loadMaps();
  }, [loadMaps, visible]);

  const openMap = async (fileName: string) => {
    setIsLoadingDocument(true);
    setLibraryError(null);
    try {
      const response = await fetch(`/api/config/maps/${encodeURIComponent(fileName)}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load selected map.");
      }

      const payload = (await response.json()) as { fileName: string; document: MapDocument };
      onOpenMap(payload);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Unable to load selected map.");
    } finally {
      setIsLoadingDocument(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <section className="app-card mt-6 rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--app-border)] pb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Map Library</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Maps are loaded from the configured maps directory.</p>
        </div>
        <button
          type="button"
          onClick={onCreateMap}
          className="flex items-center gap-2 rounded-lg border border-[var(--app-primary)] bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span>New Map</span>
        </button>
      </div>

      <div className="mt-4">
        {libraryError && (
          <div className="mb-4 rounded-lg border border-[var(--app-danger)] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,white)] px-4 py-3 text-sm text-[var(--app-danger)]">
            {libraryError}
          </div>
        )}

        {isLoadingMaps ? (
          <div className="flex h-48 items-center justify-center text-[var(--app-text-muted)]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        ) : maps.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--app-border)] text-center">
            <Map className="h-8 w-8 text-[var(--app-text-muted)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">No maps found</p>
              <p className="text-sm text-[var(--app-text-muted)]">Create the first map to populate this library.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {maps.map((mapItem) => (
              <button
                key={mapItem.fileName}
                type="button"
                onClick={() => void openMap(mapItem.fileName)}
                className="rounded-lg border border-[var(--app-border)] p-4 text-left transition-colors hover:bg-[var(--app-surface-muted)]"
                disabled={isLoadingDocument}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--app-text)]">{mapItem.name}</h3>
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">{mapItem.description || "No description"}</p>
                  </div>
                  <span className="rounded bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                    v{mapItem.version}
                  </span>
                </div>
                <div className="mt-4 grid gap-1 text-xs text-[var(--app-text-muted)]">
                  <p>Created {new Date(mapItem.dateCreated).toLocaleString()}</p>
                  <p>Created by {mapItem.createdBy}</p>
                  <p>Updated {new Date(mapItem.updatedAt).toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
