"use client";

import { useState } from "react";
import MapDesignerModal from "@/areas/config/MapDesignerModal";
import MapLibraryPanel from "@/areas/config/MapLibraryPanel";
import type { MapDocument } from "@/areas/config/mapDesigner/types";

export default function MapLibraryPage() {
  const [mapDesignerOpen, setMapDesignerOpen] = useState(false);
  const [activeMapDocument, setActiveMapDocument] = useState<MapDocument | undefined>(undefined);
  const [activeMapFileName, setActiveMapFileName] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="app-card rounded-xl p-6">
        <h1 className="text-xl font-semibold text-[var(--app-text)]">Map Library</h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">
          Browse saved maps, open an existing layout, or start a new map. The editor opens in a modal over this page.
        </p>
      </section>

      <MapLibraryPanel
        visible
        onCreateMap={() => {
          setActiveMapDocument(undefined);
          setActiveMapFileName(null);
          setMapDesignerOpen(true);
        }}
        onOpenMap={({ fileName, document }) => {
          setActiveMapFileName(fileName);
          setActiveMapDocument(document);
          setMapDesignerOpen(true);
        }}
      />

      <MapDesignerModal
        open={mapDesignerOpen}
        fileName={activeMapFileName}
        document={activeMapDocument}
        onClose={() => setMapDesignerOpen(false)}
        onSaved={({ fileName, document }) => {
          setActiveMapFileName(fileName);
          setActiveMapDocument(document);
        }}
      />
    </div>
  );
}
