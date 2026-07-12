"use client";

import MapDesigner from "@/areas/config/MapDesigner";
import type { MapDocument } from "@/areas/config/mapDesigner/types";

type MapDesignerModalProps = {
  open: boolean;
  document?: MapDocument;
  fileName?: string | null;
  onClose: () => void;
  onSaved?: (payload: { fileName: string; document: MapDocument }) => void;
};

export default function MapDesignerModal({ open, document, fileName = null, onClose, onSaved }: MapDesignerModalProps) {
  if (!open) {
    return null;
  }

  return (
    <MapDesigner
      key={fileName ?? document?.id ?? "new-map"}
      mode="modal"
      initialDocument={document}
      initialFileName={fileName}
      onRequestClose={onClose}
      onSaved={onSaved}
    />
  );
}
