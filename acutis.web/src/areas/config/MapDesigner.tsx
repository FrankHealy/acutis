"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MapIcon,
  BetweenVerticalStart,
  Blinds,
  BrickWall,
  CircleDot,
  Columns2,
  DoorOpen,
  Eye,
  FilePlus2,
  GripVertical,
  Hand,
  Info,
  MapPinned,
  Minus,
  MousePointer2,
  PanelsTopLeft,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  ShieldAlert,
  Square,
  Type,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { createClientId } from "@/lib/createClientId";
import {
  alignPointToArtefactAxes,
  clampScale,
  constrainDeltaToAxis,
  constrainPointToAxis,
  createFitViewport,
  createWallPolygonPoints,
  findNearestWallAttachment,
  getDocumentBounds,
  getRoomBoundarySegments,
  isLabelVisible,
  mergeCollinearWallArtefacts,
  resolveAttachedOpeningLine,
  snapWorldPoint,
  toWorldPoint,
  zoomAroundPoint,
} from "@/areas/config/mapDesigner/geometry";
import { sampleDetoxReferenceMap } from "@/areas/config/mapDesigner/sampleMap";
import type { MapArtefact, MapDocument, MapGeometry, MapTool, ViewportState } from "@/areas/config/mapDesigner/types";

type MapDesignerProps = {
  initialDocument?: MapDocument;
  initialFileName?: string | null;
  mode?: "page" | "modal";
  onRequestClose?: () => void;
  onRequestBrowseMaps?: () => void;
  onSaved?: (payload: { fileName: string; document: MapDocument }) => void;
};

type WorldPoint = { x: number; y: number };
type ResizeHandle = "right" | "bottom" | "bottomRight";
type PointerDragState =
  | { kind: "pan"; originClientX: number; originClientY: number; originPanX: number; originPanY: number }
  | {
      kind: "move";
      artefactId: string;
      originWorld: WorldPoint;
      originalGeometry: MapGeometry;
      movingGeometries: Array<{ id: string; geometry: MapGeometry }>;
      childGeometries: Array<{ id: string; geometry: MapGeometry }>;
    }
  | { kind: "resize"; artefactId: string; handle: ResizeHandle; originWorld: WorldPoint; originalGeometry: Extract<MapGeometry, { kind: "rect" }> }
  | { kind: "room"; originWorld: WorldPoint; currentWorld: WorldPoint }
  | null;

type OpeningPreview = {
  type: "door" | "window" | "exit" | "fireExit";
  point: WorldPoint;
  artefact: MapArtefact;
};

type MapClipboard = {
  artefacts: MapArtefact[];
  rootId: string;
  pasteCount: number;
};

type ToolbarPlacement = "top" | "right" | "bottom" | "left" | "floating";
type SaveDialogMode = "save" | "saveAs";

type RoomBatchDraft = {
  parentId: string;
  offsetX: number;
  offsetY: number;
  fillColor: string;
  borderColor: string;
  textColor: string;
  textSize: number;
  visible: boolean;
};

const TOOL_ORDER: Array<{ id: MapTool; icon: React.ComponentType<{ className?: string }>; fallbackLabel: string }> = [
  { id: "select", icon: MousePointer2, fallbackLabel: "Select" },
  { id: "pan", icon: Hand, fallbackLabel: "Pan" },
  { id: "room", icon: Square, fallbackLabel: "Room" },
  { id: "corridor", icon: MapIcon, fallbackLabel: "Corridor" },
  { id: "wall", icon: BrickWall, fallbackLabel: "Wall" },
  { id: "partition", icon: Columns2, fallbackLabel: "Partition" },
  { id: "stair", icon: BetweenVerticalStart, fallbackLabel: "Stair" },
  { id: "door", icon: DoorOpen, fallbackLabel: "Door" },
  { id: "window", icon: Blinds, fallbackLabel: "Window" },
  { id: "exit", icon: MapPinned, fallbackLabel: "Exit" },
  { id: "fireExit", icon: ShieldAlert, fallbackLabel: "Fire Exit" },
  { id: "roundel", icon: CircleDot, fallbackLabel: "Roundel" },
  { id: "label", icon: Type, fallbackLabel: "Label" },
];

const TOOL_LABEL_KEYS: Record<MapTool, string> = {
  select: "config.map_designer.tool.select",
  pan: "config.map_designer.tool.pan",
  room: "config.map_designer.tool.room",
  corridor: "config.map_designer.tool.corridor",
  wall: "config.map_designer.tool.wall",
  partition: "config.map_designer.tool.partition",
  stair: "config.map_designer.tool.stair",
  door: "config.map_designer.tool.door",
  window: "config.map_designer.tool.window",
  exit: "config.map_designer.tool.exit",
  fireExit: "config.map_designer.tool.fire_exit",
  roundel: "config.map_designer.tool.roundel",
  label: "config.map_designer.tool.label",
};

const createId = (prefix: string) => `${prefix}_${createClientId().slice(0, 8)}`;
const normalizeRect = (a: WorldPoint, b: WorldPoint) => ({ x: Math.round(Math.min(a.x, b.x)), y: Math.round(Math.min(a.y, b.y)), width: Math.round(Math.abs(b.x - a.x)), height: Math.round(Math.abs(b.y - a.y)) });
const DEFAULT_WORLD = { width: 1600, height: 1050 };
const SNAP_THRESHOLD = 16;

function getArtefactZOrder(artefact: MapArtefact): number {
  return typeof artefact.metadata?.zOrder === "number" ? artefact.metadata.zOrder : 0;
}

function getArtefactRenderArea(artefact: MapArtefact): number {
  if (artefact.geometry.kind === "rect") return artefact.geometry.width * artefact.geometry.height;
  if (artefact.geometry.kind === "polygon") {
    const xs = artefact.geometry.points.map((point) => point.x);
    const ys = artefact.geometry.points.map((point) => point.y);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  }
  return 0;
}

function getRectCornerRadius(artefact: MapArtefact): number {
  if (artefact.type === "zone") return 0;
  return artefact.metadata?.cornerStyle === "round" ? 14 : 0;
}

function getStructuredRectBorderThickness(artefact: MapArtefact, side: "top" | "right" | "bottom" | "left"): number {
  const specificKey =
    side === "top"
      ? "borderTopThickness"
      : side === "right"
        ? "borderRightThickness"
        : side === "bottom"
          ? "borderBottomThickness"
          : "borderLeftThickness";
  const specific = artefact.metadata?.[specificKey];
  if (typeof specific === "number" && Number.isFinite(specific) && specific >= 0) {
    return specific;
  }

  const overall = artefact.metadata?.borderThickness;
  if (typeof overall === "number" && Number.isFinite(overall) && overall >= 0) {
    return overall;
  }

  return 2;
}

function getArtefactTextSize(artefact: MapArtefact): number {
  const candidate = artefact.metadata?.textSize;
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }

  if (artefact.type === "exit" || artefact.type === "fireExit") return 12;
  if (artefact.type === "label") return 14;
  return 13;
}

function getDoorType(artefact: MapArtefact): "internal" | "external" {
  return artefact.metadata?.doorType === "external" ? "external" : "internal";
}

function getDoorTickSize(artefact: MapArtefact): number {
  const candidate = artefact.metadata?.doorTickSize;
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }

  return getDoorType(artefact) === "external" ? 8 : 5;
}

function getDoorTickThickness(artefact: MapArtefact): number {
  const candidate = artefact.metadata?.doorTickThickness;
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }

  return getDoorType(artefact) === "external" ? 4 : 2;
}

function getResizeHandlePositions(geometry: Extract<MapGeometry, { kind: "rect" }>) {
  return {
    right: { x: geometry.x + geometry.width, y: geometry.y + geometry.height / 2 },
    bottom: { x: geometry.x + geometry.width / 2, y: geometry.y + geometry.height },
    bottomRight: { x: geometry.x + geometry.width, y: geometry.y + geometry.height },
  } satisfies Record<ResizeHandle, WorldPoint>;
}

function createRoomBatchDraft(rooms: MapArtefact[]): RoomBatchDraft {
  return {
    parentId: rooms[0].parentId ?? "",
    offsetX: 0,
    offsetY: 0,
    fillColor: getMetadataColor(rooms[0], "fillColor") ?? (rooms[0].type === "corridor" ? "rgb(250,240,175)" : "rgb(215,215,215)"),
    borderColor: getMetadataColor(rooms[0], "borderColor") ?? "#475569",
    textColor: getMetadataColor(rooms[0], "textColor") ?? "#111827",
    textSize: getArtefactTextSize(rooms[0]),
    visible: rooms[0].visible !== false,
  };
}

function isContainedStructuredRect(candidate: MapArtefact, allArtefacts: MapArtefact[]): boolean {
  if (!(candidate.type === "corridor" || candidate.type === "zone" || candidate.type === "stair")) return false;
  if (candidate.geometry.kind !== "rect" || candidate.geometry.rotation) return false;
  const candidateRect = candidate.geometry;

  return allArtefacts.some((other) => {
    if (other.id === candidate.id || other.visible === false) return false;
    if (!(other.type === "corridor" || other.type === "zone" || other.type === "stair")) return false;
    if (other.geometry.kind !== "rect" || other.geometry.rotation) return false;
    const otherRect = other.geometry;

    return (
      candidateRect.x >= otherRect.x &&
      candidateRect.y >= otherRect.y &&
      candidateRect.x + candidateRect.width <= otherRect.x + otherRect.width &&
      candidateRect.y + candidateRect.height <= otherRect.y + otherRect.height &&
      (candidateRect.width < otherRect.width || candidateRect.height < otherRect.height)
    );
  });
}

function getStructuredRectContainmentRelation(left: MapArtefact, right: MapArtefact): number {
  if (left.geometry.kind !== "rect" || right.geometry.kind !== "rect") return 0;
  if (left.geometry.rotation || right.geometry.rotation) return 0;

  const leftContainsRight =
    left.geometry.x <= right.geometry.x &&
    left.geometry.y <= right.geometry.y &&
    left.geometry.x + left.geometry.width >= right.geometry.x + right.geometry.width &&
    left.geometry.y + left.geometry.height >= right.geometry.y + right.geometry.height &&
    (left.geometry.width > right.geometry.width || left.geometry.height > right.geometry.height);

  const rightContainsLeft =
    right.geometry.x <= left.geometry.x &&
    right.geometry.y <= left.geometry.y &&
    right.geometry.x + right.geometry.width >= left.geometry.x + left.geometry.width &&
    right.geometry.y + right.geometry.height >= left.geometry.y + left.geometry.height &&
    (right.geometry.width > left.geometry.width || right.geometry.height > left.geometry.height);

  if (leftContainsRight) return -1;
  if (rightContainsLeft) return 1;
  return 0;
}

function createBlankMapDocument(name: string = "Untitled Map", createdBy: string = "Unknown"): MapDocument {
  const timestamp = new Date().toISOString();
  return {
    id: `map_${createClientId()}`,
    name,
    descriptor: {
      name,
      description: "",
      version: 1,
      dateCreated: timestamp,
      createdBy,
      updatedAt: timestamp,
      updatedBy: createdBy,
    },
    metadata: {
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy,
      updatedBy: createdBy,
    },
    world: { ...DEFAULT_WORLD },
    artefacts: [],
  };
}

function cloneArtefact(artefact: MapArtefact): MapArtefact {
  return {
    ...artefact,
    geometry: JSON.parse(JSON.stringify(artefact.geometry)) as MapGeometry,
    wallAttachment: artefact.wallAttachment ? { ...artefact.wallAttachment } : undefined,
    metadata: artefact.metadata ? { ...artefact.metadata } : undefined,
  };
}

function offsetGeometry(geometry: MapGeometry, dx: number, dy: number): MapGeometry {
  if (geometry.kind === "rect") return { ...geometry, x: geometry.x + dx, y: geometry.y + dy };
  if (geometry.kind === "point") return { ...geometry, x: geometry.x + dx, y: geometry.y + dy };
  if (geometry.kind === "line") return { ...geometry, x1: geometry.x1 + dx, y1: geometry.y1 + dy, x2: geometry.x2 + dx, y2: geometry.y2 + dy };
  return { ...geometry, points: geometry.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function moveGeometry(geometry: MapGeometry, dx: number, dy: number): MapGeometry {
  if (geometry.kind === "rect") return { ...geometry, x: geometry.x + dx, y: geometry.y + dy };
  if (geometry.kind === "point") return { ...geometry, x: geometry.x + dx, y: geometry.y + dy };
  if (geometry.kind === "line") return { ...geometry, x1: geometry.x1 + dx, y1: geometry.y1 + dy, x2: geometry.x2 + dx, y2: geometry.y2 + dy };
  return { ...geometry, points: geometry.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-10 cursor-pointer rounded border border-[var(--app-border)] bg-white p-1"
      />
    </label>
  );
}

function BooleanField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)]">
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function toPortableMapDocument(documentModel: MapDocument, actor: string): MapDocument {
  const now = new Date().toISOString();
  const createdAt = documentModel.descriptor?.dateCreated ?? documentModel.metadata?.createdAt ?? now;
  const createdBy = documentModel.descriptor?.createdBy ?? documentModel.metadata?.createdBy ?? actor;
  const updatedAt = now;
  const updatedBy = actor;
  const descriptorVersion = documentModel.descriptor?.version ?? 1;

  return {
    id: documentModel.id,
    name: documentModel.name,
    descriptor: {
      name: documentModel.name,
      description: documentModel.descriptor?.description?.trim() ?? "",
      version: descriptorVersion,
      dateCreated: createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    },
    metadata: {
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
    },
    world: {
      width: documentModel.world.width,
      height: documentModel.world.height,
    },
    artefacts: documentModel.artefacts.map((artefact) => ({
      ...artefact,
    })),
  };
}

function normalizeImportedMapDocument(documentCandidate: MapDocument & Record<string, unknown>): MapDocument {
  const createdAt = documentCandidate.descriptor?.dateCreated ?? documentCandidate.metadata?.createdAt;
  const createdBy = documentCandidate.descriptor?.createdBy ?? documentCandidate.metadata?.createdBy;
  const updatedAt = documentCandidate.descriptor?.updatedAt ?? documentCandidate.metadata?.updatedAt;
  const updatedBy = documentCandidate.descriptor?.updatedBy ?? documentCandidate.metadata?.updatedBy;

  return {
    id: documentCandidate.id,
    name: documentCandidate.name,
    descriptor: {
      name: documentCandidate.descriptor?.name ?? documentCandidate.name,
      description: documentCandidate.descriptor?.description ?? "",
      version: documentCandidate.descriptor?.version ?? 1,
      dateCreated: createdAt ?? new Date().toISOString(),
      createdBy: createdBy ?? "Unknown",
      updatedAt,
      updatedBy,
    },
    metadata: {
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
    },
    world: {
      width: documentCandidate.world.width,
      height: documentCandidate.world.height,
    },
    artefacts: documentCandidate.artefacts.map((artefact) => ({
      ...artefact,
    })),
  };
}

function getArtefactLabel(artefact: MapArtefact, t: (key: string) => string) {
  if (artefact.labelOverride) return artefact.labelOverride;
  if (artefact.labelKey) {
    const localized = t(artefact.labelKey);
    if (localized !== artefact.labelKey) return localized;
  }
  return artefact.id;
}

function getMetadataColor(artefact: MapArtefact, key: "fillColor" | "borderColor" | "textColor"): string | null {
  const value = artefact.metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function setArtefactColorMetadata(artefact: MapArtefact, key: "fillColor" | "borderColor" | "textColor", value: string): MapArtefact {
  const nextMetadata = {
    ...(artefact.metadata ?? {}),
    [key]: value,
  };

  return {
    ...artefact,
    metadata: nextMetadata,
  };
}

function getDefaultRectFill(artefact: MapArtefact): string {
  if (artefact.type === "corridor") return "rgb(250,240,175)";
  if (artefact.type === "zone") return "color-mix(in srgb, var(--app-success) 12%, white)";
  if (artefact.type === "stair") return "color-mix(in srgb, var(--app-text-muted) 10%, white)";
  return "rgb(215,215,215)";
}

function getOpeningMaskStroke(artefact: MapArtefact, artefactsById?: Map<string, MapArtefact>): string {
  const hostId = artefact.wallAttachment?.hostId;
  if (hostId && artefactsById) {
    const hostArtefact = artefactsById.get(hostId);
    if (hostArtefact?.geometry.kind === "rect") {
      return getMetadataColor(hostArtefact, "fillColor") ?? getDefaultRectFill(hostArtefact);
    }
  }

  return "color-mix(in srgb, var(--app-surface-muted) 35%, white)";
}

function getAnchor(artefact: MapArtefact): WorldPoint {
  if (artefact.geometry.kind === "point") return { x: artefact.geometry.x, y: artefact.geometry.y };
  if (artefact.geometry.kind === "line") return { x: (artefact.geometry.x1 + artefact.geometry.x2) / 2, y: (artefact.geometry.y1 + artefact.geometry.y2) / 2 };
  if (artefact.geometry.kind === "polygon") return {
    x: artefact.geometry.points.reduce((sum, point) => sum + point.x, 0) / artefact.geometry.points.length,
    y: artefact.geometry.points.reduce((sum, point) => sum + point.y, 0) / artefact.geometry.points.length,
  };
  return { x: artefact.geometry.x + artefact.geometry.width / 2, y: artefact.geometry.y + artefact.geometry.height / 2 };
}

function getLabelPlacement(artefact: MapArtefact, artefactsById: Map<string, MapArtefact>) {
  const displayArtefact =
    artefact.type === "door" || artefact.type === "window" || artefact.type === "exit" || artefact.type === "fireExit"
      ? { ...artefact, geometry: resolveAttachedOpeningLine(artefact, artefactsById) ?? artefact.geometry }
      : artefact;

  if (
    (displayArtefact.type === "room" || displayArtefact.type === "corridor") &&
    displayArtefact.geometry.kind === "rect"
  ) {
    return {
      x: displayArtefact.geometry.x + displayArtefact.geometry.width - 8,
      y: displayArtefact.geometry.y + displayArtefact.geometry.height - 8,
      textAnchor: "end" as const,
      dominantBaseline: "auto" as const,
    };
  }

  const anchor = getAnchor(displayArtefact);
  return {
    x: anchor.x,
    y: anchor.y,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
  };
}

function getRectRotation(geometry: Extract<MapGeometry, { kind: "rect" }>) {
  return geometry.rotation ?? 0;
}

function renderArtefactShape(artefact: MapArtefact, selected: boolean, displayGeometry?: MapGeometry, artefactsById?: Map<string, MapArtefact>) {
  const selectionStroke = "var(--app-primary)";
  const selectionFill = "color-mix(in srgb, var(--app-primary) 14%, transparent)";
  const geometry = displayGeometry ?? artefact.geometry;
  const fillOverride = getMetadataColor(artefact, "fillColor");
  const borderOverride = getMetadataColor(artefact, "borderColor");
  if (geometry.kind === "rect") {
    const rotation = getRectRotation(geometry);
    const centerX = geometry.x + geometry.width / 2;
    const centerY = geometry.y + geometry.height / 2;
    const rectTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined;
    const isStructuredArea = artefact.type === "corridor" || artefact.type === "zone" || artefact.type === "stair";
    const baseFill = fillOverride ?? getDefaultRectFill(artefact);
    const stroke = borderOverride ??
      (artefact.type === "corridor"
        ? "var(--app-primary)"
        : artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 55%, var(--app-border))"
        : artefact.type === "stair"
          ? "var(--app-text)"
          : "var(--app-border)");
    if (artefact.type === "stair") {
      const stepCount = Math.max(4, Math.floor(Math.max(geometry.width, geometry.height) / 18));
      const isVertical = geometry.height >= geometry.width;
      return (
        <g transform={rectTransform}>
          <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={3} fill={selected ? selectionFill : baseFill} stroke={selected ? selectionStroke : isStructuredArea ? "transparent" : stroke} strokeWidth={selected ? 4 : isStructuredArea ? 0 : 2} />
          {Array.from({ length: stepCount }).map((_, index) => {
            if (isVertical) {
              const y = geometry.y + (geometry.height / (stepCount + 1)) * (index + 1);
              return <line key={`step_${index}`} x1={geometry.x + 5} y1={y} x2={geometry.x + geometry.width - 5} y2={y} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-text-muted)"} strokeWidth={2} />;
            }
            const x = geometry.x + (geometry.width / (stepCount + 1)) * (index + 1);
            return <line key={`step_${index}`} x1={x} y1={geometry.y + 5} x2={x} y2={geometry.y + geometry.height - 5} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-text-muted)"} strokeWidth={2} />;
          })}
        </g>
      );
    }
    if (isStructuredArea && rotation) {
      return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={getRectCornerRadius(artefact)} transform={rectTransform} fill={selected ? selectionFill : baseFill} stroke={selected ? selectionStroke : "transparent"} strokeWidth={selected ? 4 : 0} />;
    }
    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={getRectCornerRadius(artefact)} transform={rectTransform} fill={selected ? selectionFill : baseFill} stroke={selected ? selectionStroke : isStructuredArea ? "transparent" : stroke} strokeWidth={selected ? 4 : isStructuredArea ? 0 : 2} />;
  }
  if (geometry.kind === "polygon") {
    return <polygon points={geometry.points.map((point) => `${point.x},${point.y}`).join(" ")} fill={selected ? selectionFill : fillOverride ?? "color-mix(in srgb, var(--app-warning) 12%, white)"} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-border)"} strokeWidth={selected ? 4 : 2} />;
  }
  if (geometry.kind === "line") {
    if (artefact.type === "wall") return <polygon points={createWallPolygonPoints(geometry)} fill={selected ? selectionStroke : borderOverride ?? "var(--app-text)"} />;
    if (artefact.type === "partition") {
      return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-text-muted)"} strokeWidth={selected ? 8 : geometry.thickness ?? 6} strokeDasharray="10 6" strokeLinecap="round" />;
    }
    if (artefact.type === "window") {
      const openingMaskStroke = getOpeningMaskStroke(artefact, artefactsById);
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={openingMaskStroke} strokeWidth={(geometry.thickness ?? 8) + 6} strokeLinecap="round" />
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-primary)"} strokeWidth={selected ? 8 : 4} strokeLinecap="square" />
      </>;
    }
    if (artefact.type === "door") {
      const isVertical = geometry.x1 === geometry.x2;
      const accentStroke = borderOverride ?? "var(--app-text)";
      const tickSize = getDoorTickSize(artefact);
      const tickThickness = getDoorTickThickness(artefact);
      const openingMaskStroke = getOpeningMaskStroke(artefact, artefactsById);
      return (
        <>
          <line
            x1={geometry.x1}
            y1={geometry.y1}
            x2={geometry.x2}
            y2={geometry.y2}
            stroke={openingMaskStroke}
            strokeWidth={(geometry.thickness ?? 8) + (selected ? 8 : 6)}
            strokeLinecap="butt"
          />
          <line
            x1={isVertical ? geometry.x1 - tickSize : geometry.x1}
            y1={isVertical ? geometry.y1 : geometry.y1 - tickSize}
            x2={isVertical ? geometry.x1 + tickSize : geometry.x1}
            y2={isVertical ? geometry.y1 : geometry.y1 + tickSize}
            stroke={accentStroke}
            strokeWidth={tickThickness}
            strokeLinecap="square"
          />
          <line
            x1={isVertical ? geometry.x2 - tickSize : geometry.x2}
            y1={isVertical ? geometry.y2 : geometry.y2 - tickSize}
            x2={isVertical ? geometry.x2 + tickSize : geometry.x2}
            y2={isVertical ? geometry.y2 : geometry.y2 + tickSize}
            stroke={accentStroke}
            strokeWidth={tickThickness}
            strokeLinecap="square"
          />
        </>
      );
    }
    if (artefact.type === "exit" || artefact.type === "fireExit") {
      const accent = borderOverride ?? (artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)");
      const openingMaskStroke = getOpeningMaskStroke(artefact, artefactsById);
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={openingMaskStroke} strokeWidth={(geometry.thickness ?? 8) + 8} strokeLinecap="square" />
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : accent} strokeWidth={selected ? 8 : 4} strokeLinecap="square" />
      </>;
    }
    return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-text)"} strokeWidth={selected ? 6 : geometry.thickness ?? 8} strokeLinecap="round" />;
  }
  const size = geometry.size ?? 20;
  const radius = size / 2;
  if (artefact.type === "exit" || artefact.type === "fireExit") {
    const fill = fillOverride ?? (artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)");
    return <>
      <circle cx={geometry.x} cy={geometry.y} r={radius} fill={selected ? selectionStroke : fill} stroke={borderOverride ?? "white"} strokeWidth={2} />
      <path d={`M ${geometry.x - 4} ${geometry.y + 5} L ${geometry.x + 6} ${geometry.y} L ${geometry.x - 4} ${geometry.y - 5}`} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </>;
  }
  if (artefact.type === "roundel") return <circle cx={geometry.x} cy={geometry.y} r={radius} fill={fillOverride ?? "white"} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-border)"} strokeWidth={selected ? 4 : 2} />;
  return <circle cx={geometry.x} cy={geometry.y} r={selected ? radius + 2 : radius} fill={selected ? selectionStroke : fillOverride ?? "var(--app-primary)"} stroke={borderOverride ?? "transparent"} strokeWidth={borderOverride ? 2 : 0} />;
}

const MapDesigner: React.FC<MapDesignerProps> = ({
  initialDocument,
  initialFileName = null,
  mode = "page",
  onRequestClose,
  onRequestBrowseMaps,
  onSaved,
}) => {
  const { loadKeys, t } = useLocalization();
  const { data: session } = useSession();
  const currentActor = session?.username ?? session?.user?.name ?? session?.user?.email ?? "Unknown";
  const [documentModel, setDocumentModel] = useState<MapDocument>(() =>
    initialDocument
      ? normalizeImportedMapDocument(initialDocument as MapDocument & Record<string, unknown>)
      : mode === "modal"
        ? createBlankMapDocument("Untitled Map", currentActor)
        : sampleDetoxReferenceMap,
  );
  const [currentFileName, setCurrentFileName] = useState<string | null>(initialFileName);
  const [ioError, setIoError] = useState<string | null>(null);
  const [ioNotice, setIoNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTool, setActiveTool] = useState<MapTool>("select");
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [selectedArtefactId, setSelectedArtefactId] = useState<string | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [draftArtefact, setDraftArtefact] = useState<MapArtefact | null>(null);
  const [draftRoomBatch, setDraftRoomBatch] = useState<RoomBatchDraft | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, panX: 32, panY: 32 });
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<PointerDragState>(null);
  const [pendingWallStart, setPendingWallStart] = useState<WorldPoint | null>(null);
  const [wallPreviewPoint, setWallPreviewPoint] = useState<WorldPoint | null>(null);
  const [openingPreview, setOpeningPreview] = useState<OpeningPreview | null>(null);
  const [clipboard, setClipboard] = useState<MapClipboard | null>(null);
  const [toolbarPlacement, setToolbarPlacement] = useState<ToolbarPlacement>("top");
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ x: 24, y: 88 });
  const [saveDialogMode, setSaveDialogMode] = useState<SaveDialogMode | null>(null);
  const [saveDraftName, setSaveDraftName] = useState("");
  const [saveDraftDescription, setSaveDraftDescription] = useState("");
  const dragStateRef = useRef<PointerDragState>(null);
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarFrameRef = useRef<HTMLDivElement | null>(null);
  const toolbarBodyRef = useRef<HTMLDivElement | null>(null);

  const createDocumentWithDescriptorDraft = (nameValue: string, descriptionValue: string) => {
    const name = nameValue.trim() || "Untitled Map";
    return {
      ...documentModel,
      name,
      descriptor: {
        name,
        description: descriptionValue.trim(),
        version: documentModel.descriptor?.version ?? 1,
        dateCreated: documentModel.descriptor?.dateCreated ?? documentModel.metadata?.createdAt ?? new Date().toISOString(),
        createdBy: documentModel.descriptor?.createdBy ?? documentModel.metadata?.createdBy ?? currentActor,
        updatedAt: documentModel.descriptor?.updatedAt,
        updatedBy: documentModel.descriptor?.updatedBy,
      },
    };
  };

  const openSaveDialog = (modeValue: SaveDialogMode) => {
    setSaveDialogMode(modeValue);
    setSaveDraftName(modeValue === "saveAs" ? `${documentModel.name} Copy` : documentModel.name);
    setSaveDraftDescription(documentModel.descriptor?.description ?? "");
    setIoError(null);
  };

  const handleFloatingToolbarPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const workspaceElement = event.currentTarget.closest("[data-map-designer-workspace]") as HTMLElement | null;
    const parentRect = workspaceElement?.getBoundingClientRect();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const toolbarRect = toolbarBodyRef.current?.getBoundingClientRect() ?? toolbarFrameRef.current?.getBoundingClientRect();
    const originClientX = event.clientX;
    const originClientY = event.clientY;
    const originPosition =
      toolbarPlacement === "floating"
        ? floatingToolbarPosition
        : {
            x: buttonRect.left - (parentRect?.left ?? 0),
            y: buttonRect.top - (parentRect?.top ?? 0),
          };
    let currentPosition = originPosition;

    setToolbarPlacement("floating");
    setFloatingToolbarPosition(originPosition);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      currentPosition = {
        x: Math.max(8, originPosition.x + moveEvent.clientX - originClientX),
        y: Math.max(8, originPosition.y + moveEvent.clientY - originClientY),
      };
      setFloatingToolbarPosition(currentPosition);
    };

    const handlePointerUp = () => {
      const dockThreshold = 80;
      const workspaceRect = workspaceElement?.getBoundingClientRect();
      const toolbarWidth = toolbarRect?.width ?? 48;
      const toolbarHeight = toolbarRect?.height ?? 48;
      const workspaceWidth = workspaceRect?.width ?? window.innerWidth;
      const workspaceHeight = workspaceRect?.height ?? window.innerHeight;
      const distances: Array<{ placement: Exclude<ToolbarPlacement, "floating">; distance: number }> = [
        { placement: "top", distance: Math.max(0, currentPosition.y) },
        { placement: "right", distance: Math.max(0, workspaceWidth - (currentPosition.x + toolbarWidth)) },
        { placement: "bottom", distance: Math.max(0, workspaceHeight - (currentPosition.y + toolbarHeight)) },
        { placement: "left", distance: Math.max(0, currentPosition.x) },
      ];
      const nearestDock = distances
        .filter((candidate) => candidate.distance <= dockThreshold)
        .sort((left, right) => left.distance - right.distance)[0];

      if (nearestDock) {
        setToolbarPlacement(nearestDock.placement);
        setFloatingToolbarPosition({ x: 24, y: 88 });
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  useEffect(() => {
    void loadKeys([
      "config.map_designer.title","config.map_designer.description","config.map_designer.back",
      "config.map_designer.labels.show","config.map_designer.labels.hide","config.map_designer.zoom.fit","config.map_designer.zoom.reset",
      "config.map_designer.snap.on","config.map_designer.snap.off",
      "config.map_designer.toolbox.title","config.map_designer.properties.title","config.map_designer.properties.empty","config.map_designer.properties.delete",
      "config.map_designer.surface_hint","config.map_designer.selection.none","config.map_designer.selection.selected","config.map_designer.metadata.none",
      "config.map_designer.phase3_notice","config.map_designer.pending.wall","config.map_designer.field.id","config.map_designer.field.type",
      "config.map_designer.field.label_key","config.map_designer.field.label_override","config.map_designer.field.visible",
      "config.map_designer.field.geometry","config.map_designer.field.metadata","config.map_designer.field.active_tool",
      "config.map_designer.field.parent_id","config.map_designer.field.wall_id","config.map_designer.field.offset","config.map_designer.field.width",
      "config.map_designer.field.x","config.map_designer.field.y","config.map_designer.field.start_x","config.map_designer.field.start_y",
      "config.map_designer.field.end_x","config.map_designer.field.end_y","config.map_designer.field.height","config.map_designer.field.raw",
      "config.map_designer.field.thickness","config.map_designer.field.points","config.map_designer.field.label","config.map_designer.field.visible_toggle",
      "config.map_designer.field.label_override_placeholder",
      "config.map_designer.io.new","config.map_designer.io.name","config.map_designer.io.save","config.map_designer.io.load","config.map_designer.io.invalid",
      ...Object.values(TOOL_LABEL_KEYS),
    ]);
  }, [loadKeys]);

  useEffect(() => {
    if (!initialDocument) return;
    setDocumentModel(normalizeImportedMapDocument(initialDocument as MapDocument & Record<string, unknown>));
    setCurrentFileName(initialFileName);
    setIoError(null);
    setIoNotice(null);
    setHasInitializedViewport(false);
  }, [initialDocument, initialFileName]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSurfaceSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const documentBounds = useMemo(() => getDocumentBounds(documentModel.artefacts, documentModel.world.width, documentModel.world.height), [documentModel]);
  const selectedArtefact = useMemo(() => documentModel.artefacts.find((artefact) => artefact.id === selectedArtefactId) ?? null, [documentModel.artefacts, selectedArtefactId]);
  const editingArtefact = draftArtefact as MapArtefact;
  const selectedRooms = useMemo(
    () => documentModel.artefacts.filter((artefact) => (artefact.type === "room" || artefact.type === "corridor") && selectedRoomIds.includes(artefact.id)),
    [documentModel.artefacts, selectedRoomIds],
  );
  const isRoomBatchSelection = selectedRooms.length > 1;
  const renderOrderedArtefacts = useMemo(() => {
    const groups: Record<MapArtefact["type"], Array<{ artefact: MapArtefact; index: number }>> = { zone: [], corridor: [], room: [], wall: [], partition: [], stair: [], door: [], window: [], exit: [], fireExit: [], roundel: [], label: [] };
    documentModel.artefacts.forEach((artefact, index) => {
      if (artefact.visible !== false) groups[artefact.type].push({ artefact, index });
    });

    const sortGroup = (group: Array<{ artefact: MapArtefact; index: number }>) =>
      group
        .slice()
        .sort((left, right) => {
          const leftIsStructuredRect =
            (left.artefact.type === "corridor" || left.artefact.type === "room" || left.artefact.type === "zone" || left.artefact.type === "stair") &&
            left.artefact.geometry.kind === "rect";
          const rightIsStructuredRect =
            (right.artefact.type === "corridor" || right.artefact.type === "room" || right.artefact.type === "zone" || right.artefact.type === "stair") &&
            right.artefact.geometry.kind === "rect";

          if (leftIsStructuredRect && rightIsStructuredRect) {
            const containmentDiff = getStructuredRectContainmentRelation(left.artefact, right.artefact);
            if (containmentDiff !== 0) return containmentDiff;

            const areaDiff = getArtefactRenderArea(right.artefact) - getArtefactRenderArea(left.artefact);
            if (areaDiff !== 0) return areaDiff;

            const zDiff = getArtefactZOrder(left.artefact) - getArtefactZOrder(right.artefact);
            if (zDiff !== 0) return zDiff;
          } else {
            const zDiff = getArtefactZOrder(left.artefact) - getArtefactZOrder(right.artefact);
            if (zDiff !== 0) return zDiff;
          }

          return left.index - right.index;
        })
        .map((entry) => entry.artefact);

    return [
      ...sortGroup(groups.zone),
      ...sortGroup(groups.corridor),
      ...sortGroup(groups.room),
      ...sortGroup(groups.stair),
      ...sortGroup(groups.wall),
      ...sortGroup(groups.partition),
      ...sortGroup(groups.door),
      ...sortGroup(groups.window),
      ...sortGroup(groups.exit),
      ...sortGroup(groups.fireExit),
      ...sortGroup(groups.roundel),
      ...sortGroup(groups.label),
    ];
  }, [documentModel.artefacts]);
  const walls = useMemo(() => documentModel.artefacts.filter((artefact) => artefact.type === "wall"), [documentModel.artefacts]);
  const artefactsById = useMemo(() => new Map(documentModel.artefacts.map((artefact) => [artefact.id, artefact])), [documentModel.artefacts]);
  const mergedWallGeometries = useMemo(() => mergeCollinearWallArtefacts(walls), [walls]);
  const roomBoundaryGeometries = useMemo(() => getRoomBoundarySegments(documentModel.artefacts), [documentModel.artefacts]);
  const containedStructuredRects = useMemo(
    () =>
      renderOrderedArtefacts.filter(
        (artefact) =>
          artefact.visible !== false &&
          (artefact.type === "zone" || artefact.type === "stair") &&
          artefact.geometry.kind === "rect" &&
          !artefact.geometry.rotation &&
          isContainedStructuredRect(artefact, documentModel.artefacts),
      ),
    [documentModel.artefacts, renderOrderedArtefacts],
  );
  const backgroundArtefacts = useMemo(
    () => renderOrderedArtefacts.filter((artefact) => artefact.type === "room" || artefact.type === "corridor" || artefact.type === "zone" || artefact.type === "stair"),
    [renderOrderedArtefacts],
  );
  const foregroundArtefacts = useMemo(
    () => renderOrderedArtefacts.filter((artefact) => artefact.type !== "wall" && artefact.type !== "room" && artefact.type !== "corridor" && artefact.type !== "zone" && artefact.type !== "stair"),
    [renderOrderedArtefacts],
  );
  const selectedClusterIds = useMemo(() => {
    if (!selectedArtefactId) return new Set<string>();
    return new Set(
      documentModel.artefacts
        .filter((artefact) => artefact.id === selectedArtefactId || artefact.parentId === selectedArtefactId || artefact.wallAttachment?.hostId === selectedArtefactId || artefact.wallAttachment?.wallId === selectedArtefactId)
        .map((artefact) => artefact.id),
    );
  }, [documentModel.artefacts, selectedArtefactId]);

  useEffect(() => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0 || hasInitializedViewport) return;
    setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
    setHasInitializedViewport(true);
  }, [documentBounds, hasInitializedViewport, surfaceSize.height, surfaceSize.width]);

  useEffect(() => {
    if (!dragState) return;

    const handleWindowPointerMove = (event: PointerEvent) => {
      applyDragMove(event.clientX, event.clientY, event.shiftKey);
    };

    const handleWindowPointerUp = (event: PointerEvent) => {
      finishDrag(event.pointerId);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [dragState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "F4") {
        event.preventDefault();
        if (selectedArtefactId) {
          if (propertiesOpen) {
            closeProperties();
          } else {
            openProperties();
          }
        }
        return;
      }

      const metaPressed = event.ctrlKey || event.metaKey;
      if (metaPressed && selectedArtefact && event.key.toLowerCase() === "c") {
        event.preventDefault();
        const cluster = documentModel.artefacts
          .filter((artefact) => selectedClusterIds.has(artefact.id))
          .map((artefact) => cloneArtefact(artefact));
        setClipboard({ artefacts: cluster, rootId: selectedArtefact.id, pasteCount: 0 });
        return;
      }

      if (metaPressed && selectedArtefact && event.key.toLowerCase() === "x") {
        event.preventDefault();
        const clusterIds = new Set(selectedClusterIds);
        const cluster = documentModel.artefacts
          .filter((artefact) => clusterIds.has(artefact.id))
          .map((artefact) => cloneArtefact(artefact));
        setClipboard({ artefacts: cluster, rootId: selectedArtefact.id, pasteCount: 0 });
        setDocumentModel((current) => ({
          ...current,
          artefacts: current.artefacts.filter((artefact) => !clusterIds.has(artefact.id)),
        }));
        setSelectedArtefactId(null);
        return;
      }

      if (metaPressed && clipboard && event.key.toLowerCase() === "v") {
        event.preventDefault();
        const offset = 24 * (clipboard.pasteCount + 1);
        const idMap = new Map<string, string>();
        clipboard.artefacts.forEach((artefact) => {
          idMap.set(artefact.id, createId(artefact.type));
        });

        const pastedArtefacts = clipboard.artefacts.map((artefact) => ({
          ...cloneArtefact(artefact),
          id: idMap.get(artefact.id) ?? createId(artefact.type),
          geometry: offsetGeometry(artefact.geometry, offset, offset),
          parentId: artefact.parentId ? idMap.get(artefact.parentId) ?? artefact.parentId : undefined,
          wallAttachment: artefact.wallAttachment
            ? {
                ...artefact.wallAttachment,
                wallId: artefact.wallAttachment.wallId ? idMap.get(artefact.wallAttachment.wallId) ?? artefact.wallAttachment.wallId : undefined,
                hostId: artefact.wallAttachment.hostId ? idMap.get(artefact.wallAttachment.hostId) ?? artefact.wallAttachment.hostId : undefined,
              }
            : undefined,
        }));

        setDocumentModel((current) => ({
          ...current,
          artefacts: [...current.artefacts, ...pastedArtefacts],
        }));
        setClipboard((current) =>
          current
            ? {
                ...current,
                pasteCount: current.pasteCount + 1,
              }
            : current,
        );
        setSelectedArtefactId(idMap.get(clipboard.rootId) ?? pastedArtefacts[0]?.id ?? null);
        return;
      }

      if (event.key !== "Delete" || (!selectedArtefactId && selectedRoomIds.length === 0)) return;
      event.preventDefault();
      const roomIds = new Set(selectedRoomIds);
      setDocumentModel((current) => ({
        ...current,
        artefacts: current.artefacts.filter((artefact) => !selectedClusterIds.has(artefact.id) && !((artefact.type === "room" || artefact.type === "corridor") && roomIds.has(artefact.id))),
      }));
      setSelectedArtefactId(null);
      setSelectedRoomIds([]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clipboard, documentModel.artefacts, selectedArtefact, selectedArtefactId, selectedClusterIds, selectedRoomIds]);

  const resetView = () => setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
  const zoomByFactor = (factor: number) => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) return;
    setViewport((current) => zoomAroundPoint(current, surfaceSize.width / 2, surfaceSize.height / 2, clampScale(current.scale * factor)));
  };
  const getWorldPointFromEvent = (event: React.PointerEvent<SVGSVGElement | SVGGElement>) => {
    const svgRect = surfaceRef.current?.getBoundingClientRect();
    return svgRect ? toWorldPoint(event.clientX, event.clientY, svgRect, viewport) : null;
  };
  const getWorldPointFromClient = (clientX: number, clientY: number) => {
    const svgRect = surfaceRef.current?.getBoundingClientRect();
    return svgRect ? toWorldPoint(clientX, clientY, svgRect, viewport) : null;
  };
  const getAlignedPoint = (point: WorldPoint, options?: { referencePoint?: WorldPoint | null; shiftLock?: boolean; ignoreArtefactId?: string | null }) => {
    if (!snapEnabled) {
      const basePoint = options?.shiftLock && options.referencePoint ? constrainPointToAxis(options.referencePoint, point) : point;
      return {
        x: Math.round(basePoint.x),
        y: Math.round(basePoint.y),
      };
    }

    const basePoint = options?.shiftLock && options.referencePoint ? constrainPointToAxis(options.referencePoint, point) : point;
    const referenceAligned = options?.referencePoint ? snapWorldPoint(basePoint, walls, options.referencePoint, SNAP_THRESHOLD) : snapWorldPoint(basePoint, walls, null, SNAP_THRESHOLD);
    const otherArtefacts = documentModel.artefacts.filter((artefact) => artefact.id !== options?.ignoreArtefactId && artefact.visible !== false);
    return alignPointToArtefactAxes(referenceAligned, otherArtefacts, SNAP_THRESHOLD);
  };

  const createAttachedOpeningPreview = (type: "door" | "window" | "exit" | "fireExit", point: WorldPoint): OpeningPreview | null => {
    const attachment = findNearestWallAttachment(point, documentModel.artefacts);
    if (!attachment) return null;
    const normalizedAttachment = type === "door" && attachment.hostType !== "wall" ? { ...attachment, width: 20 } : attachment;
    const previewArtefact: MapArtefact = {
      id: `${type}_preview`,
      type,
      geometry: { kind: "point", x: point.x, y: point.y, size: 18 },
      wallAttachment: normalizedAttachment,
      visible: true,
    };

    return {
      type,
      point,
      artefact: previewArtefact,
    };
  };

  function applyDragMove(clientX: number, clientY: number, shiftKey: boolean) {
    const currentDragState = dragStateRef.current;
    const worldPoint = getWorldPointFromClient(clientX, clientY);

    if (activeTool === "door" || activeTool === "window" || activeTool === "exit" || activeTool === "fireExit") {
      setOpeningPreview(worldPoint ? createAttachedOpeningPreview(activeTool, worldPoint) : null);
    }

    if (pendingWallStart && worldPoint && (activeTool === "wall" || activeTool === "partition")) {
      setWallPreviewPoint(getAlignedPoint(worldPoint, { referencePoint: pendingWallStart, shiftLock: shiftKey }));
    } else if (!currentDragState) {
      setWallPreviewPoint(null);
    }

    if (!currentDragState) return;
    if (currentDragState.kind === "pan") {
      setViewport((current) => ({ ...current, panX: currentDragState.originPanX + (clientX - currentDragState.originClientX), panY: currentDragState.originPanY + (clientY - currentDragState.originClientY) }));
      return;
    }
    if (!worldPoint) return;
    if (currentDragState.kind === "room") {
      const nextDragState = { ...currentDragState, currentWorld: getAlignedPoint(worldPoint, { referencePoint: currentDragState.originWorld, shiftLock: shiftKey }) };
      dragStateRef.current = nextDragState;
      setDragState(nextDragState);
      return;
    }
    if (currentDragState.kind === "resize") {
      const alignedPoint = getAlignedPoint(worldPoint, { referencePoint: currentDragState.originWorld, shiftLock: shiftKey, ignoreArtefactId: currentDragState.artefactId });
      const original = currentDragState.originalGeometry;
      const nextGeometry: Extract<MapGeometry, { kind: "rect" }> = { ...original };

      if (currentDragState.handle === "right" || currentDragState.handle === "bottomRight") {
        nextGeometry.width = Math.max(12, Math.round(alignedPoint.x - original.x));
      }
      if (currentDragState.handle === "bottom" || currentDragState.handle === "bottomRight") {
        nextGeometry.height = Math.max(12, Math.round(alignedPoint.y - original.y));
      }

      setDocumentModel((current) => ({
        ...current,
        artefacts: current.artefacts.map((artefact) => (artefact.id === currentDragState.artefactId ? { ...artefact, geometry: nextGeometry } : artefact)),
      }));
      return;
    }
    const alignedPoint = getAlignedPoint(worldPoint, { referencePoint: currentDragState.originWorld, shiftLock: shiftKey, ignoreArtefactId: currentDragState.artefactId });
    let deltaX = Math.round(alignedPoint.x - currentDragState.originWorld.x);
    let deltaY = Math.round(alignedPoint.y - currentDragState.originWorld.y);
    if (shiftKey) {
      const constrained = constrainDeltaToAxis(deltaX, deltaY);
      deltaX = constrained.x;
      deltaY = constrained.y;
    }

    const movingOpeningAttachment =
      selectedArtefact?.id === currentDragState.artefactId && (selectedArtefact.type === "door" || selectedArtefact.type === "window" || selectedArtefact.type === "exit" || selectedArtefact.type === "fireExit")
        ? createAttachedOpeningPreview(selectedArtefact.type, { x: currentDragState.originWorld.x + deltaX, y: currentDragState.originWorld.y + deltaY })?.artefact.wallAttachment ?? null
        : null;
    setDocumentModel((current) => ({
      ...current,
      artefacts: current.artefacts.map((artefact) => {
        const movingGeometry = currentDragState.movingGeometries.find((item) => item.id === artefact.id)?.geometry;
        if (movingGeometry) {
          return { ...artefact, geometry: moveGeometry(movingGeometry, deltaX, deltaY) };
        }
        if (artefact.id === currentDragState.artefactId) {
          return movingOpeningAttachment && (artefact.type === "door" || artefact.type === "window" || artefact.type === "exit" || artefact.type === "fireExit")
            ? {
                ...artefact,
                geometry: { kind: "point", x: currentDragState.originWorld.x + deltaX, y: currentDragState.originWorld.y + deltaY, size: artefact.geometry.kind === "point" ? artefact.geometry.size : 18 },
                wallAttachment: movingOpeningAttachment,
              }
            : { ...artefact, geometry: moveGeometry(currentDragState.originalGeometry, deltaX, deltaY) };
        }
        const childGeometry = currentDragState.childGeometries.find((child) => child.id === artefact.id)?.geometry;
        if (artefact.parentId === currentDragState.artefactId && childGeometry) {
          return { ...artefact, geometry: moveGeometry(childGeometry, deltaX, deltaY) };
        }
        if ((artefact.wallAttachment?.hostId === currentDragState.artefactId || artefact.wallAttachment?.wallId === currentDragState.artefactId) && childGeometry && artefact.geometry.kind === "point") {
          return { ...artefact, geometry: moveGeometry(childGeometry, deltaX, deltaY) };
        }
        return artefact;
      }),
    }));
  }

  function finishDrag(pointerId?: number) {
    const currentDragState = dragStateRef.current;
    let shouldReturnToSelect = false;
    if (currentDragState?.kind === "room") {
      const draftRect = normalizeRect(currentDragState.originWorld, currentDragState.currentWorld);
      if (draftRect.width >= 12 && draftRect.height >= 12) {
        const nextArtefact: MapArtefact = {
          id: createId(activeTool === "stair" ? "stair" : activeTool === "corridor" ? "corridor" : "room"),
          type: activeTool === "stair" ? "stair" : activeTool === "corridor" ? "corridor" : "room",
          geometry: { kind: "rect", ...draftRect },
          labelOverride: activeTool === "stair" ? "Stairs" : activeTool === "corridor" ? "Corridor" : "Room",
          metadata: {
            cornerStyle: "square",
            fillColor: activeTool === "stair" ? "#e7eefb" : activeTool === "corridor" ? "rgb(250,240,175)" : "rgb(215,215,215)",
            borderColor: activeTool === "corridor" ? "#2563eb" : "#475569",
            textColor: "#0f172a",
          },
        };
        setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
        setSelectedArtefactId(nextArtefact.id);
        shouldReturnToSelect = true;
      }
    }
    if (currentDragState?.kind === "move" || currentDragState?.kind === "resize") {
      shouldReturnToSelect = true;
    }
    if (typeof pointerId === "number" && surfaceRef.current?.hasPointerCapture(pointerId)) {
      surfaceRef.current.releasePointerCapture(pointerId);
    }
    dragStateRef.current = null;
    setDragState(null);
    setOpeningPreview(null);
    if (shouldReturnToSelect) {
      setActiveTool("select");
    }
  }

  const placePointArtefact = (type: "roundel" | "label", point: WorldPoint) => {
    const snappedPoint = getAlignedPoint(point, { referencePoint: selectedArtefact?.type === "room" || selectedArtefact?.type === "corridor" ? getAnchor(selectedArtefact) : null });
    const nextArtefact: MapArtefact = {
      id: createId(type),
      type,
      geometry: { kind: "point", x: snappedPoint.x, y: snappedPoint.y, size: type === "roundel" ? 28 : 18 },
      labelOverride: type === "label" ? "Label" : undefined,
      parentId:
        type === "roundel"
          ? selectedArtefact?.type === "room" || selectedArtefact?.type === "corridor"
            ? selectedArtefact.id
            : undefined
          : selectedArtefact?.id,
    };
    setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
    setPropertiesOpen(false);
    setSelectedArtefactId(nextArtefact.id);
    setActiveTool("select");
  };

  const handleArtefactPointerDown = (event: React.PointerEvent<SVGGElement>, artefact: MapArtefact) => {
    event.preventDefault();
    event.stopPropagation();
    closeProperties();
    if (event.shiftKey && (artefact.type === "room" || artefact.type === "corridor")) {
      setSelectedRoomIds((current) => {
        const exists = current.includes(artefact.id);
        const next = exists ? current.filter((id) => id !== artefact.id) : [...current, artefact.id];
        setSelectedArtefactId(next.length > 0 ? next[next.length - 1] : null);
        return next;
      });
    } else {
      setSelectedRoomIds(artefact.type === "room" || artefact.type === "corridor" ? [artefact.id] : []);
      setSelectedArtefactId(artefact.id);
    }
    if (activeTool !== "select" || event.button !== 0 || !surfaceRef.current) return;
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    const movingSelectionIds =
      (artefact.type === "room" || artefact.type === "corridor") && selectedRoomIds.includes(artefact.id) && selectedRoomIds.length > 1
        ? selectedRoomIds
        : artefact.type === "room" || artefact.type === "corridor"
          ? [artefact.id]
          : [];

    const nextDragState: PointerDragState = {
      kind: "move",
      artefactId: artefact.id,
      originWorld: worldPoint,
      originalGeometry: artefact.geometry,
      movingGeometries: documentModel.artefacts
        .filter((candidate) => (candidate.type === "room" || candidate.type === "corridor") && movingSelectionIds.includes(candidate.id))
        .map((candidate) => ({ id: candidate.id, geometry: candidate.geometry })),
      childGeometries: documentModel.artefacts
        .filter((candidate) => candidate.parentId === artefact.id || candidate.wallAttachment?.hostId === artefact.id || candidate.wallAttachment?.wallId === artefact.id)
        .map((candidate) => ({ id: candidate.id, geometry: candidate.geometry })),
    };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
    surfaceRef.current.setPointerCapture(event.pointerId);
  };

  const handleResizeHandlePointerDown = (event: React.PointerEvent<SVGCircleElement>, artefact: MapArtefact, handle: ResizeHandle) => {
    event.preventDefault();
    event.stopPropagation();
    if (activeTool !== "select" || event.button !== 0 || !surfaceRef.current || artefact.geometry.kind !== "rect") return;
    setPropertiesOpen(false);
    setSelectedArtefactId(artefact.id);
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    const nextDragState: PointerDragState = {
      kind: "resize",
      artefactId: artefact.id,
      handle,
      originWorld: worldPoint,
      originalGeometry: artefact.geometry,
    };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
    surfaceRef.current.setPointerCapture(event.pointerId);
  };

  const handleSurfacePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (!surfaceRef.current) return;
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    setOpeningPreview(null);
    if (activeTool === "pan" || event.button === 1) {
      const nextDragState: PointerDragState = { kind: "pan", originClientX: event.clientX, originClientY: event.clientY, originPanX: viewport.panX, originPanY: viewport.panY };
      dragStateRef.current = nextDragState;
      setDragState(nextDragState);
      surfaceRef.current.setPointerCapture(event.pointerId);
      return;
    }
    if ((activeTool === "room" || activeTool === "corridor" || activeTool === "stair") && event.button === 0) {
      setPropertiesOpen(false);
      setSelectedArtefactId(null);
      const snappedPoint = getAlignedPoint(worldPoint);
      const nextDragState: PointerDragState = { kind: "room", originWorld: snappedPoint, currentWorld: snappedPoint };
      dragStateRef.current = nextDragState;
      setDragState(nextDragState);
      surfaceRef.current.setPointerCapture(event.pointerId);
      return;
    }
    if ((activeTool === "wall" || activeTool === "partition") && event.button === 0) {
      const snappedPoint = getAlignedPoint(worldPoint, { referencePoint: pendingWallStart, shiftLock: event.shiftKey });
      if (!pendingWallStart) {
        setPropertiesOpen(false);
        setPendingWallStart(snappedPoint);
        setWallPreviewPoint(null);
        setSelectedArtefactId(null);
      } else {
        const nextArtefact: MapArtefact = {
          id: createId(activeTool),
          type: activeTool,
          geometry: { kind: "line", x1: pendingWallStart.x, y1: pendingWallStart.y, x2: snappedPoint.x, y2: snappedPoint.y, thickness: activeTool === "partition" ? 6 : 14 },
          labelOverride: activeTool === "partition" ? "Partition" : undefined,
        };
        setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
        setSelectedArtefactId(nextArtefact.id);
        setPendingWallStart(null);
        setWallPreviewPoint(null);
        setActiveTool("select");
      }
      return;
    }
    if ((activeTool === "door" || activeTool === "window" || activeTool === "exit" || activeTool === "fireExit") && event.button === 0) {
      const preview = createAttachedOpeningPreview(activeTool, worldPoint);
      if (!preview) return;
      const nextArtefact: MapArtefact = {
        id: createId(activeTool),
        type: activeTool,
        geometry: { kind: "point", x: Math.round(preview.point.x), y: Math.round(preview.point.y), size: 18 },
        wallAttachment: preview.artefact.wallAttachment,
        metadata:
          activeTool === "door"
            ? {
                doorType: preview.artefact.wallAttachment?.hostType === "wall" ? "external" : "internal",
              }
            : undefined,
      };
      setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
      setPropertiesOpen(false);
      setSelectedArtefactId(nextArtefact.id);
      setActiveTool("select");
      return;
    }
    if (activeTool === "roundel" && event.button === 0) return void placePointArtefact("roundel", worldPoint);
    if (activeTool === "label" && event.button === 0) return void placePointArtefact("label", worldPoint);
    setPropertiesOpen(false);
    setSelectedArtefactId(null);
  };

  const handleSurfacePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    applyDragMove(event.clientX, event.clientY, event.shiftKey);
  };

  const handleSurfacePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    finishDrag(event.pointerId);
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const svgRect = surfaceRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const factor = event.deltaY < 0 ? 1.1 : 0.92;
    setViewport((current) => zoomAroundPoint(current, event.clientX - svgRect.left, event.clientY - svgRect.top, current.scale * factor));
  };

  const roomDraft = dragState?.kind === "room" ? normalizeRect(dragState.originWorld, dragState.currentWorld) : null;
  const updateArtefact = (artefactId: string, updater: (artefact: MapArtefact) => MapArtefact) => {
    setDocumentModel((current) => ({
      ...current,
      artefacts: current.artefacts.map((artefact) => (artefact.id === artefactId ? updater(artefact) : artefact)),
    }));
  };
  const updateSelectedGeometry = (updater: (geometry: MapGeometry) => MapGeometry) => {
    if (!selectedArtefact) return;
    updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, geometry: updater(artefact.geometry) }));
  };
  const updateDraftGeometry = (updater: (geometry: MapGeometry) => MapGeometry) => {
    setDraftArtefact((current) => (current ? { ...current, geometry: updater(current.geometry) } : current));
  };
  const openProperties = () => {
    if (selectedRooms.length > 1) {
      setDraftRoomBatch(createRoomBatchDraft(selectedRooms));
      setDraftArtefact(null);
      setPropertiesOpen(true);
      return;
    }
    if (!selectedArtefact) return;
    setDraftArtefact(cloneArtefact(selectedArtefact));
    setDraftRoomBatch(null);
    setPropertiesOpen(true);
  };
  const closeProperties = () => {
    setPropertiesOpen(false);
    setDraftArtefact(null);
    setDraftRoomBatch(null);
  };
  const saveProperties = () => {
    if (selectedRooms.length > 1 && draftRoomBatch) {
      const roomIds = new Set(selectedRoomIds);
      setDocumentModel((current) => ({
        ...current,
        artefacts: current.artefacts.map((artefact) =>
          (artefact.type === "room" || artefact.type === "corridor") && roomIds.has(artefact.id)
            ? {
                ...artefact,
                parentId: draftRoomBatch.parentId || undefined,
                visible: draftRoomBatch.visible,
                geometry:
                  artefact.geometry.kind === "rect"
                    ? {
                        ...artefact.geometry,
                        x: artefact.geometry.x + draftRoomBatch.offsetX,
                        y: artefact.geometry.y + draftRoomBatch.offsetY,
                      }
                    : artefact.geometry,
                metadata: {
                  ...(artefact.metadata ?? {}),
                  fillColor: draftRoomBatch.fillColor,
                  borderColor: draftRoomBatch.borderColor,
                  textColor: draftRoomBatch.textColor,
                  textSize: draftRoomBatch.textSize,
                },
              }
            : artefact,
        ),
      }));
      closeProperties();
      return;
    }
    if (!selectedArtefactId || !draftArtefact) return;
    setDocumentModel((current) => ({
      ...current,
      artefacts: current.artefacts.map((artefact) => (artefact.id === selectedArtefactId ? draftArtefact : artefact)),
    }));
    closeProperties();
  };
  const adjustSelectedArtefactZOrder = (direction: "forward" | "backward") => {
    if (!draftArtefact) return;
    setDraftArtefact((current) =>
      current
        ? {
            ...current,
            metadata: {
              ...(current.metadata ?? {}),
              zOrder: getArtefactZOrder(current) + (direction === "forward" ? 1 : -1),
            },
          }
        : current,
    );
  };
  const handleNewMap = () => {
    setDocumentModel(createBlankMapDocument("Untitled Map", currentActor));
    setCurrentFileName(null);
    setActiveTool("select");
    setSelectedArtefactId(null);
    setSelectedRoomIds([]);
    setPropertiesOpen(false);
    setPendingWallStart(null);
    setWallPreviewPoint(null);
    setOpeningPreview(null);
    setIoError(null);
    setIoNotice(null);
    setHasInitializedViewport(false);
  };
  const handleSave = async (options?: { document?: MapDocument; saveAs?: boolean }) => {
    const payload = toPortableMapDocument(options?.document ?? documentModel, currentActor);
    setIsSaving(true);
    setIoError(null);
    setIoNotice(null);
    try {
      const response = await fetch("/api/config/maps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: options?.saveAs ? null : currentFileName,
          actor: currentActor,
          document: payload,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to save map.");
      }

      const saved = (await response.json()) as { fileName: string; document: MapDocument };
      const normalized = normalizeImportedMapDocument(saved.document as MapDocument & Record<string, unknown>);
      setCurrentFileName(saved.fileName);
      setDocumentModel(normalized);
      setIoNotice(`Saved ${saved.fileName}`);
      onSaved?.({ fileName: saved.fileName, document: normalized });
    } catch (error) {
      setIoError(error instanceof Error ? error.message : "Unable to save map.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDialogSubmit = async () => {
    if (!saveDialogMode) return;
    const nextDocument = createDocumentWithDescriptorDraft(saveDraftName, saveDraftDescription);
    setDocumentModel(nextDocument);
    setSaveDialogMode(null);
    await handleSave({ document: nextDocument, saveAs: saveDialogMode === "saveAs" });
  };

  const descriptor = documentModel.descriptor;
  const createdLabel = descriptor?.dateCreated ? new Date(descriptor.dateCreated).toLocaleString() : "Not saved yet";
  const authorLabel = descriptor?.createdBy ?? currentActor;
  const toolbarIsVertical = toolbarPlacement === "left" || toolbarPlacement === "right" || toolbarPlacement === "floating";
  const toolbarFrameClass =
    toolbarPlacement === "top"
      ? `sticky ${mode === "modal" ? "top-0" : "top-[148px]"} z-30 mb-3`
      : toolbarPlacement === "bottom"
        ? "sticky bottom-0 z-30 mt-3"
        : toolbarPlacement === "left"
          ? "absolute left-4 top-4 z-30"
          : toolbarPlacement === "right"
            ? "absolute right-4 top-4 z-30"
            : "absolute z-40";
  const toolbarFrameStyle =
    toolbarPlacement === "floating"
      ? {
          left: floatingToolbarPosition.x,
          top: floatingToolbarPosition.y,
        }
      : undefined;

  return (
    <div className={mode === "modal" ? "fixed inset-0 z-[90] bg-black/35 p-4" : "app-page-shell"}>
      <main className={mode === "modal" ? "flex h-full flex-col overflow-hidden rounded-lg bg-[var(--app-surface)] shadow-2xl" : "px-4 py-6 sm:px-6 lg:px-8"}>
        {mode === "modal" && (
          <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] px-4 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--app-text)]">{documentModel.name}</p>
              <p className="truncate text-xs text-[var(--app-text-muted)]">{currentFileName ?? "Unsaved map"}</p>
            </div>
            <div className="flex items-center gap-2">
              {onRequestBrowseMaps && (
                <button
                  type="button"
                  onClick={onRequestBrowseMaps}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                >
                  Maps
                </button>
              )}
              {onRequestClose && (
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                  aria-label="Close map designer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        <div data-map-designer-workspace className={`relative ${mode === "modal" ? "flex-1 overflow-auto p-4" : ""}`}>
          <div ref={toolbarFrameRef} className={toolbarFrameClass} style={toolbarFrameStyle}>
            <div ref={toolbarBodyRef} className={`${toolbarIsVertical ? "inline-flex max-h-[calc(100vh-12rem)] flex-col overflow-y-auto" : "inline-flex flex-wrap"} items-center gap-1 rounded-2xl border border-[var(--app-border)] bg-white/95 p-1.5 shadow-xl backdrop-blur`}>
              <button
                type="button"
                onPointerDown={handleFloatingToolbarPointerDown}
                title="Drag toolbar. Drop near an edge to dock."
                aria-label="Drag toolbar. Drop near an edge to dock."
                className="flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className={`${toolbarIsVertical ? "my-1 h-px w-8" : "mx-1 h-8 w-px"} bg-[var(--app-border)]`} />
              <button type="button" onClick={handleNewMap} title={text("config.map_designer.io.new", "New Map")} aria-label={text("config.map_designer.io.new", "New Map")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                <FilePlus2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => openSaveDialog("save")} disabled={isSaving} title={text("config.map_designer.io.save", "Save")} aria-label={text("config.map_designer.io.save", "Save")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)] disabled:cursor-wait disabled:opacity-60">
                <Save className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => openSaveDialog("saveAs")} disabled={isSaving} title="Save As" aria-label="Save As" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[10px] font-bold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)] disabled:cursor-wait disabled:opacity-60">
                As
              </button>
              <div className={`${toolbarIsVertical ? "my-1 h-px w-8" : "mx-1 h-8 w-px"} bg-[var(--app-border)]`} />
              {TOOL_ORDER.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    title={text(TOOL_LABEL_KEYS[tool.id], tool.fallbackLabel)}
                    aria-label={text(TOOL_LABEL_KEYS[tool.id], tool.fallbackLabel)}
                    onClick={() => {
                      setActiveTool(tool.id);
                      if (tool.id !== "wall" && tool.id !== "partition") {
                        setPendingWallStart(null);
                        setWallPreviewPoint(null);
                      }
                      if (tool.id !== "door" && tool.id !== "window" && tool.id !== "exit" && tool.id !== "fireExit") {
                        setOpeningPreview(null);
                      }
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                      isActive ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
              <div className={`${toolbarIsVertical ? "my-1 h-px w-8" : "mx-1 h-8 w-px"} bg-[var(--app-border)]`} />
              <button type="button" title={labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")} aria-label={labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")} onClick={() => setLabelsVisible((current) => !current)} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${labelsVisible ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"}`}>
                <Type className="h-4 w-4" />
              </button>
              <button type="button" title={snapEnabled ? "Snap On" : "Snap Off"} aria-label={snapEnabled ? "Snap On" : "Snap Off"} onClick={() => setSnapEnabled((current) => !current)} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${snapEnabled ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"}`}>
                <Square className="h-4 w-4" />
              </button>
              <button type="button" title="Zoom Out" aria-label="Zoom Out" onClick={() => zoomByFactor(0.9)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                <Minus className="h-4 w-4" />
              </button>
              <button type="button" title="Zoom In" aria-label="Zoom In" onClick={() => zoomByFactor(1.1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" title={text("config.map_designer.zoom.fit", "Fit")} aria-label={text("config.map_designer.zoom.fit", "Fit")} onClick={resetView} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                title={text("config.map_designer.properties.title", "Properties")}
                aria-label={text("config.map_designer.properties.title", "Properties")}
                onClick={() => {
                  if (propertiesOpen) {
                    closeProperties();
                  } else {
                    openProperties();
                  }
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                  propertiesOpen ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                }`}
              >
                <PanelsTopLeft className="h-4 w-4" />
              </button>
              <div title={pendingWallStart ? text("config.map_designer.pending.wall", "Wall tool: click a second point to finish the segment.") : `${text("config.map_designer.field.active_tool", "Active tool")}: ${text(TOOL_LABEL_KEYS[activeTool], activeTool)}`} className={`${toolbarIsVertical ? "" : "ml-auto"} flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]`}>
                <Info className="h-4 w-4" />
              </div>
            </div>
            {ioError && <div className="mt-2 max-w-sm rounded-2xl border border-[var(--app-danger)] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,white)] px-4 py-3 text-sm text-[var(--app-danger)] shadow-lg">{ioError}</div>}
            {ioNotice && <div className="mt-2 max-w-sm rounded-2xl border border-[var(--app-primary)] bg-[color:color-mix(in_srgb,var(--app-primary)_8%,white)] px-4 py-3 text-sm text-[var(--app-primary)] shadow-lg">{ioNotice}</div>}
          </div>

          <section className="app-card rounded-2xl p-3 sm:p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-[var(--app-text)]">{documentModel.name}</p>
              <p className="text-xs text-[var(--app-text-muted)]">{text("config.map_designer.surface_hint", "Phase 1/2: render, pan, zoom, select, delete, and global label visibility.")}</p>
            </div>

            <div ref={containerRef} className={`relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)] ${mode === "modal" ? "h-[72vh] min-h-[640px]" : "h-[82vh] min-h-[760px]"}`}>
              <svg
                ref={surfaceRef}
                className={`h-full w-full ${activeTool === "pan" ? "cursor-grab" : activeTool === "room" || activeTool === "corridor" ? "cursor-crosshair" : "cursor-default"}`}
                style={{ touchAction: "none", userSelect: "none" }}
                onPointerDown={handleSurfacePointerDown}
                onPointerMove={handleSurfacePointerMove}
                onPointerUp={handleSurfacePointerUp}
                onPointerLeave={handleSurfacePointerUp}
                onWheel={handleWheel}
              >
                <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
                <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`}>
                <rect x={0} y={0} width={documentModel.world.width} height={documentModel.world.height} fill="color-mix(in srgb, var(--app-surface-muted) 35%, white)" />
                  {backgroundArtefacts.map((artefact) => {
                    const isSelected = artefact.id === selectedArtefactId || ((artefact.type === "room" || artefact.type === "corridor") && selectedRoomIds.includes(artefact.id));
                    return (
                      <g key={artefact.id} data-artefact-id={artefact.id} className="cursor-pointer" onPointerDown={(event) => handleArtefactPointerDown(event, artefact)}>
                        {renderArtefactShape(artefact, isSelected, artefact.geometry, artefactsById)}
                      </g>
                    );
                  })}
                  {roomBoundaryGeometries.map((segment, index) => (
                    <line
                      key={`room_boundary_${index}`}
                      x1={segment.geometry.x1}
                      y1={segment.geometry.y1}
                      x2={segment.geometry.x2}
                      y2={segment.geometry.y2}
                      stroke={segment.stroke}
                      strokeWidth={segment.geometry.thickness ?? 2}
                      strokeLinecap="square"
                    />
                  ))}
                  {containedStructuredRects.map((artefact) => {
                    const geometry = artefact.geometry as Extract<MapGeometry, { kind: "rect" }>;
                    const stroke = getMetadataColor(artefact, "borderColor") ?? "var(--app-border)";
                    const top = getStructuredRectBorderThickness(artefact, "top");
                    const right = getStructuredRectBorderThickness(artefact, "right");
                    const bottom = getStructuredRectBorderThickness(artefact, "bottom");
                    const left = getStructuredRectBorderThickness(artefact, "left");

                    return (
                      <g key={`contained_border_${artefact.id}`}>
                        {top > 0 && <line x1={geometry.x} y1={geometry.y} x2={geometry.x + geometry.width} y2={geometry.y} stroke={stroke} strokeWidth={top} strokeLinecap="square" />}
                        {right > 0 && <line x1={geometry.x + geometry.width} y1={geometry.y} x2={geometry.x + geometry.width} y2={geometry.y + geometry.height} stroke={stroke} strokeWidth={right} strokeLinecap="square" />}
                        {bottom > 0 && <line x1={geometry.x} y1={geometry.y + geometry.height} x2={geometry.x + geometry.width} y2={geometry.y + geometry.height} stroke={stroke} strokeWidth={bottom} strokeLinecap="square" />}
                        {left > 0 && <line x1={geometry.x} y1={geometry.y} x2={geometry.x} y2={geometry.y + geometry.height} stroke={stroke} strokeWidth={left} strokeLinecap="square" />}
                      </g>
                    );
                  })}
                  {mergedWallGeometries.map((geometry, index) => (
                    <line
                      key={`merged_wall_${index}`}
                      x1={geometry.x1}
                      y1={geometry.y1}
                      x2={geometry.x2}
                      y2={geometry.y2}
                      stroke="var(--app-text)"
                      strokeWidth={geometry.thickness ?? 14}
                      strokeLinecap="square"
                    />
                  ))}
                  {walls.map((artefact) => (
                    <g key={artefact.id} data-artefact-id={artefact.id} className="cursor-pointer" onPointerDown={(event) => handleArtefactPointerDown(event, artefact)}>
                      <line
                        x1={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).x1}
                        y1={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).y1}
                        x2={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).x2}
                        y2={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).y2}
                        stroke={artefact.id === selectedArtefactId ? "var(--app-primary)" : "transparent"}
                        strokeWidth={((artefact.geometry as Extract<MapGeometry, { kind: "line" }>).thickness ?? 14) + 4}
                        strokeLinecap="square"
                      />
                      <line
                        x1={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).x1}
                        y1={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).y1}
                        x2={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).x2}
                        y2={(artefact.geometry as Extract<MapGeometry, { kind: "line" }>).y2}
                        stroke="transparent"
                        strokeWidth={((artefact.geometry as Extract<MapGeometry, { kind: "line" }>).thickness ?? 14) + 14}
                        strokeLinecap="square"
                      />
                    </g>
                  ))}
                  {foregroundArtefacts.map((artefact) => {
                    const displayGeometry = artefact.type === "door" || artefact.type === "window" || artefact.type === "exit" || artefact.type === "fireExit" ? resolveAttachedOpeningLine(artefact, artefactsById) ?? artefact.geometry : artefact.geometry;
                    const isSelected = artefact.id === selectedArtefactId || ((artefact.type === "room" || artefact.type === "corridor") && selectedRoomIds.includes(artefact.id));
                    return (
                      <g key={artefact.id} data-artefact-id={artefact.id} className="cursor-pointer" onPointerDown={(event) => handleArtefactPointerDown(event, artefact)}>
                        {displayGeometry.kind === "line" && (artefact.type === "door" || artefact.type === "window" || artefact.type === "partition") && (
                          <line x1={displayGeometry.x1} y1={displayGeometry.y1} x2={displayGeometry.x2} y2={displayGeometry.y2} stroke="transparent" strokeWidth={18} strokeLinecap="round" />
                        )}
                        {renderArtefactShape(artefact, isSelected, displayGeometry, artefactsById)}
                      </g>
                    );
                  })}
                  {activeTool === "select" && selectedArtefact?.geometry.kind === "rect" && (() => {
                    const handles = getResizeHandlePositions(selectedArtefact.geometry);
                    return (
                      <g>
                        {(["right", "bottom", "bottomRight"] as ResizeHandle[]).map((handle) => {
                          const point = handles[handle];
                          const cursor = handle === "right" ? "ew-resize" : handle === "bottom" ? "ns-resize" : "nwse-resize";
                          return (
                            <circle
                              key={`resize_${handle}`}
                              cx={point.x}
                              cy={point.y}
                              r={7}
                              fill="white"
                              stroke="var(--app-primary)"
                              strokeWidth={2}
                              style={{ cursor }}
                              onPointerDown={(event) => handleResizeHandlePointerDown(event, selectedArtefact, handle)}
                            />
                          );
                        })}
                      </g>
                    );
                  })()}
                  {roomDraft && <rect x={roomDraft.x} y={roomDraft.y} width={roomDraft.width} height={roomDraft.height} fill="color-mix(in srgb, var(--app-primary) 12%, white)" stroke="var(--app-primary)" strokeWidth={2} strokeDasharray="10 8" />}
                  {pendingWallStart && <circle cx={pendingWallStart.x} cy={pendingWallStart.y} r={10} fill="var(--app-primary)" opacity={0.85} />}
                  {pendingWallStart && wallPreviewPoint && (
                    <line
                      x1={pendingWallStart.x}
                      y1={pendingWallStart.y}
                      x2={wallPreviewPoint.x}
                      y2={wallPreviewPoint.y}
                      stroke="var(--app-primary)"
                      strokeWidth={activeTool === "partition" ? 6 : 14}
                      strokeLinecap="square"
                      strokeDasharray={activeTool === "partition" ? "10 6" : undefined}
                      opacity={0.85}
                    />
                  )}
                  {openingPreview && (() => {
                    const previewGeometry = resolveAttachedOpeningLine(openingPreview.artefact, artefactsById);
                    if (!previewGeometry) return null;
                    const openingMaskStroke = getOpeningMaskStroke(openingPreview.artefact, artefactsById);
                    return (
                      <g opacity={0.9}>
                        <line
                          x1={previewGeometry.x1}
                          y1={previewGeometry.y1}
                          x2={previewGeometry.x2}
                          y2={previewGeometry.y2}
                          stroke={openingMaskStroke}
                          strokeWidth={(previewGeometry.thickness ?? 8) + 8}
                          strokeLinecap="square"
                        />
                        {(openingPreview.type === "window" || openingPreview.type === "exit" || openingPreview.type === "fireExit") && (
                          <line
                            x1={previewGeometry.x1}
                            y1={previewGeometry.y1}
                            x2={previewGeometry.x2}
                            y2={previewGeometry.y2}
                            stroke={openingPreview.type === "window" ? "var(--app-primary)" : openingPreview.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)"}
                            strokeWidth={4}
                            strokeLinecap="square"
                          />
                        )}
                      </g>
                    );
                  })()}
                  {labelsVisible && renderOrderedArtefacts.filter((artefact) => isLabelVisible(viewport.scale, artefact.type)).map((artefact) => {
                    if (!artefact.labelKey && !artefact.labelOverride) return null;
                    const placement = getLabelPlacement(artefact, artefactsById);
                    return <text key={`${artefact.id}_label`} x={placement.x} y={placement.y} textAnchor={placement.textAnchor} dominantBaseline={placement.dominantBaseline} fill={getMetadataColor(artefact, "textColor") ?? "var(--app-text)"} fontSize={getArtefactTextSize(artefact)} fontWeight={artefact.type === "label" ? 700 : 600} pointerEvents="none">{getArtefactLabel(artefact, t)}</text>;
                  })}
                </g>
              </svg>
            </div>
          </section>

          {(editingArtefact || (draftRoomBatch && isRoomBatchSelection)) && propertiesOpen && (
            <aside className="pointer-events-none absolute right-5 top-5 z-10 w-[20rem] max-w-[calc(100%-7.5rem)]">
              <div className="pointer-events-auto max-h-[calc(82vh-2rem)] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-white/95 p-3 shadow-xl backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{text("config.map_designer.properties.title", "Properties")}</h2>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">{isRoomBatchSelection ? `${selectedRooms.length} selected` : editingArtefact?.id}</p>
                  </div>
                  <button type="button" onClick={closeProperties} className="rounded-xl border border-[var(--app-border)] bg-white p-2 text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]" aria-label="Close properties" title="Close properties">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-[var(--app-border)] bg-white p-3">
                    <div className="grid gap-2">
                      {isRoomBatchSelection && draftRoomBatch ? (
                        <>
                          <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.type", "Type")}</p><p className="mt-1 text-[var(--app-text)]">room batch</p></div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.parent_id", "Parent ID")}</p>
                            <input type="text" value={draftRoomBatch.parentId} onChange={(event) => setDraftRoomBatch((current) => (current ? { ...current, parentId: event.target.value } : current))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-2 py-1.5 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label="Offset X" value={draftRoomBatch.offsetX} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, offsetX: value } : current))} />
                            <NumberField label="Offset Y" value={draftRoomBatch.offsetY} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, offsetY: value } : current))} />
                          </div>
                          <NumberField label="Text Size" value={draftRoomBatch.textSize} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, textSize: value } : current))} />
                          <BooleanField label={text("config.map_designer.field.visible_toggle", "Visible")} value={draftRoomBatch.visible} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, visible: value } : current))} />
                          <div className="grid gap-2">
                            <ColorField label="Fill" value={draftRoomBatch.fillColor} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, fillColor: value } : current))} />
                            <ColorField label="Border" value={draftRoomBatch.borderColor} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, borderColor: value } : current))} />
                            <ColorField label="Text" value={draftRoomBatch.textColor} onChange={(value) => setDraftRoomBatch((current) => (current ? { ...current, textColor: value } : current))} />
                          </div>
                        </>
                      ) : (
                        <>
                      <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.type", "Type")}</p><p className="mt-1 text-[var(--app-text)]">{editingArtefact.type}</p></div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.parent_id", "Parent ID")}</p>
                        <input type="text" value={editingArtefact.parentId ?? ""} onChange={(event) => setDraftArtefact((current) => (current ? { ...current, parentId: event.target.value || undefined } : current))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-2 py-1.5 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.label_override", "Label Override")}</p>
                        <input type="text" value={editingArtefact.labelOverride ?? ""} onChange={(event) => setDraftArtefact((current) => (current ? { ...current, labelOverride: event.target.value || undefined } : current))} placeholder={text("config.map_designer.field.label_override_placeholder", "Enter visible label")} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-2 py-1.5 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]" />
                      </div>
                      <NumberField
                        label="Text Size"
                        value={getArtefactTextSize(editingArtefact)}
                        onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), textSize: value } } : current))}
                      />
                      <BooleanField label={text("config.map_designer.field.visible_toggle", "Visible")} value={editingArtefact.visible !== false} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, visible: value } : current))} />
                      <NumberField
                        label="Z Order"
                        value={getArtefactZOrder(editingArtefact)}
                        onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), zOrder: value } } : current))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => adjustSelectedArtefactZOrder("backward")}
                          className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                        >
                          Send Back
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustSelectedArtefactZOrder("forward")}
                          className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                        >
                          Bring Forward
                        </button>
                      </div>

                      {(editingArtefact.type === "room" || editingArtefact.type === "corridor" || editingArtefact.type === "zone" || editingArtefact.type === "stair") && editingArtefact.geometry.kind === "rect" && (
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label={text("config.map_designer.field.x", "X")} value={editingArtefact.geometry.x} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, x: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.y", "Y")} value={editingArtefact.geometry.y} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, y: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.width", "Width")} value={editingArtefact.geometry.width} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, width: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.height", "Height")} value={editingArtefact.geometry.height} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, height: value } : geometry)} />
                            <NumberField label="Rotation" value={editingArtefact.geometry.rotation ?? 0} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: value } : geometry)} />
                            {(editingArtefact.type === "corridor" || editingArtefact.type === "zone" || editingArtefact.type === "stair") && (
                              <>
                                <NumberField label="Border Thickness" value={typeof editingArtefact.metadata?.borderThickness === "number" ? editingArtefact.metadata.borderThickness : 2} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), borderThickness: value } } : current))} />
                                <NumberField label="Top Border" value={typeof editingArtefact.metadata?.borderTopThickness === "number" ? editingArtefact.metadata.borderTopThickness : (typeof editingArtefact.metadata?.borderThickness === "number" ? editingArtefact.metadata.borderThickness : 2)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), borderTopThickness: value } } : current))} />
                                <NumberField label="Right Border" value={typeof editingArtefact.metadata?.borderRightThickness === "number" ? editingArtefact.metadata.borderRightThickness : (typeof editingArtefact.metadata?.borderThickness === "number" ? editingArtefact.metadata.borderThickness : 2)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), borderRightThickness: value } } : current))} />
                                <NumberField label="Bottom Border" value={typeof editingArtefact.metadata?.borderBottomThickness === "number" ? editingArtefact.metadata.borderBottomThickness : (typeof editingArtefact.metadata?.borderThickness === "number" ? editingArtefact.metadata.borderThickness : 2)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), borderBottomThickness: value } } : current))} />
                                <NumberField label="Left Border" value={typeof editingArtefact.metadata?.borderLeftThickness === "number" ? editingArtefact.metadata.borderLeftThickness : (typeof editingArtefact.metadata?.borderThickness === "number" ? editingArtefact.metadata.borderThickness : 2)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), borderLeftThickness: value } } : current))} />
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), cornerStyle: "square" } } : current))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                (editingArtefact.metadata?.cornerStyle ?? "square") === "square"
                                  ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                                  : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                              }`}
                            >
                              Square Corners
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), cornerStyle: "round" } } : current))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                editingArtefact.metadata?.cornerStyle === "round"
                                  ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                                  : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                              }`}
                            >
                              Round Corners
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: (geometry.rotation ?? 0) - 90 } : geometry)}
                              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span>90°</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateDraftGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: (geometry.rotation ?? 0) + 90 } : geometry)}
                              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                            >
                              <RotateCw className="h-4 w-4" />
                              <span>90°</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {(editingArtefact.type === "wall" || editingArtefact.type === "partition") && editingArtefact.geometry.kind === "line" && (
                        <div className="grid grid-cols-2 gap-2">
                          <NumberField label={text("config.map_designer.field.start_x", "Start X")} value={editingArtefact.geometry.x1} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "line" ? { ...geometry, x1: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.start_y", "Start Y")} value={editingArtefact.geometry.y1} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "line" ? { ...geometry, y1: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.end_x", "End X")} value={editingArtefact.geometry.x2} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "line" ? { ...geometry, x2: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.end_y", "End Y")} value={editingArtefact.geometry.y2} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "line" ? { ...geometry, y2: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.thickness", "Thickness")} value={editingArtefact.geometry.thickness ?? 14} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "line" ? { ...geometry, thickness: value } : geometry)} />
                        </div>
                      )}

                      {(editingArtefact.type === "exit" || editingArtefact.type === "fireExit" || editingArtefact.type === "roundel" || editingArtefact.type === "label" || editingArtefact.type === "door" || editingArtefact.type === "window") && editingArtefact.geometry.kind === "point" && (
                        <div className="grid grid-cols-2 gap-2">
                          <NumberField label={text("config.map_designer.field.x", "X")} value={editingArtefact.geometry.x} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "point" ? { ...geometry, x: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.y", "Y")} value={editingArtefact.geometry.y} onChange={(value) => updateDraftGeometry((geometry) => geometry.kind === "point" ? { ...geometry, y: value } : geometry)} />
                        </div>
                      )}

                      {(editingArtefact.type === "door" || editingArtefact.type === "window" || editingArtefact.type === "exit" || editingArtefact.type === "fireExit") && (
                        <div className="grid gap-2">
                          {editingArtefact.type === "door" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), doorType: "internal" } } : current))}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                  getDoorType(editingArtefact) === "internal"
                                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                                    : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                                }`}
                              >
                                Internal Door
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), doorType: "external" } } : current))}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                  getDoorType(editingArtefact) === "external"
                                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                                    : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                                }`}
                              >
                                External Door
                              </button>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">Host ID</p>
                            <input type="text" value={editingArtefact.wallAttachment?.hostId ?? editingArtefact.wallAttachment?.wallId ?? ""} onChange={(event) => setDraftArtefact((current) => (current ? { ...current, wallAttachment: { wallId: current.wallAttachment?.wallId, hostType: current.wallAttachment?.hostType, edge: current.wallAttachment?.edge, hostId: event.target.value, offset: current.wallAttachment?.offset ?? 0, width: current.wallAttachment?.width ?? 20 } } : current))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-2 py-1.5 text-sm text-[var(--app-text)]" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label={text("config.map_designer.field.offset", "Offset")} value={editingArtefact.wallAttachment?.offset ?? 0} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, wallAttachment: { wallId: current.wallAttachment?.wallId, hostId: current.wallAttachment?.hostId, hostType: current.wallAttachment?.hostType, edge: current.wallAttachment?.edge, offset: value, width: current.wallAttachment?.width ?? 20 } } : current))} />
                            <NumberField label={editingArtefact.type === "door" ? text("config.map_designer.field.door_height", "Door Height") : text("config.map_designer.field.width", "Width")} value={editingArtefact.wallAttachment?.width ?? 20} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, wallAttachment: { wallId: current.wallAttachment?.wallId, hostId: current.wallAttachment?.hostId, hostType: current.wallAttachment?.hostType, edge: current.wallAttachment?.edge, offset: current.wallAttachment?.offset ?? 0, width: value } } : current))} />
                          </div>
                          {editingArtefact.type === "door" && (
                            <div className="grid grid-cols-2 gap-2">
                              <NumberField label={text("config.map_designer.field.tick_size", "Tick Size")} value={getDoorTickSize(editingArtefact)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), doorTickSize: value } } : current))} />
                              <NumberField label={text("config.map_designer.field.tick_thickness", "Tick Thickness")} value={getDoorTickThickness(editingArtefact)} onChange={(value) => setDraftArtefact((current) => (current ? { ...current, metadata: { ...(current.metadata ?? {}), doorTickThickness: value } } : current))} />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid gap-2">
                        <ColorField label="Fill" value={getMetadataColor(editingArtefact, "fillColor") ?? "#d9d9d9"} onChange={(value) => setDraftArtefact((current) => (current ? setArtefactColorMetadata(current, "fillColor", value) : current))} />
                        <ColorField label="Border" value={getMetadataColor(editingArtefact, "borderColor") ?? "#6b7280"} onChange={(value) => setDraftArtefact((current) => (current ? setArtefactColorMetadata(current, "borderColor", value) : current))} />
                        <ColorField label="Text" value={getMetadataColor(editingArtefact, "textColor") ?? "#111827"} onChange={(value) => setDraftArtefact((current) => (current ? setArtefactColorMetadata(current, "textColor", value) : current))} />
                      </div>

                      {editingArtefact.geometry.kind === "polygon" && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.points", "Points")}</p>
                          <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-2 text-xs text-[var(--app-text)]">{JSON.stringify(editingArtefact.geometry.points, null, 2)}</pre>
                        </div>
                      )}

                      <details>
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.raw", "Raw")}</summary>
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-2 text-xs text-[var(--app-text)]">{JSON.stringify(editingArtefact.geometry, null, 2)}</pre>
                      </details>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={closeProperties} className="w-full rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                      Cancel
                    </button>
                    <button type="button" onClick={saveProperties} className="w-full rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90">
                      Save
                    </button>
                  </div>
                  <button type="button" onClick={() => { setDocumentModel((current) => ({ ...current, artefacts: current.artefacts.filter((artefact) => isRoomBatchSelection ? !((artefact.type === "room" || artefact.type === "corridor") && selectedRoomIds.includes(artefact.id)) : artefact.id !== editingArtefact?.id) })); setSelectedArtefactId(null); setSelectedRoomIds([]); closeProperties(); }} className="w-full rounded-xl border border-[var(--app-danger)] px-4 py-2 text-sm font-semibold text-[var(--app-danger)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)]">
                    {text("config.map_designer.properties.delete", "Delete Selected")}
                  </button>
                </div>
              </div>
            </aside>
          )}

          {saveDialogMode && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveDialogSubmit();
                }}
                className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-white p-4 shadow-2xl"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--app-text)]">{saveDialogMode === "saveAs" ? "Save Map As" : "Save Map"}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--app-text-muted)]">
                      <span>{saveDialogMode === "saveAs" ? "New file" : currentFileName ?? "Unsaved map"}</span>
                      <span>Version {descriptor?.version ?? 1}</span>
                      <span>Created {createdLabel}</span>
                      <span>Author {authorLabel}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSaveDialogMode(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                    aria-label="Close save dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">Map Name</span>
                    <input
                      type="text"
                      value={saveDraftName}
                      onChange={(event) => setSaveDraftName(event.target.value)}
                      className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]"
                      autoFocus
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">Description</span>
                    <textarea
                      value={saveDraftDescription}
                      onChange={(event) => setSaveDraftDescription(event.target.value)}
                      className="min-h-24 w-full resize-y rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setSaveDialogMode(null)} className="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                    {isSaving ? "Saving..." : saveDialogMode === "saveAs" ? "Save As" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapDesigner;
