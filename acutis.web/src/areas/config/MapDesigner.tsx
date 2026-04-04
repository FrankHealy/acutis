"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CircleDot, DoorOpen, Eye, FilePlus2, FolderOpen, Hand, Info, MapPinned, Minus, MousePointer2, PanelRightOpen, Plus, RotateCcw, RotateCw, Save, ShieldAlert, Square, Type, X } from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
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

type WorldPoint = { x: number; y: number };
type PointerDragState =
  | { kind: "pan"; originClientX: number; originClientY: number; originPanX: number; originPanY: number }
  | { kind: "move"; artefactId: string; originWorld: WorldPoint; originalGeometry: MapGeometry; childGeometries: Array<{ id: string; geometry: MapGeometry }> }
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

const TOOL_ORDER: Array<{ id: MapTool; icon: React.ComponentType<{ className?: string }>; fallbackLabel: string }> = [
  { id: "select", icon: MousePointer2, fallbackLabel: "Select" },
  { id: "pan", icon: Hand, fallbackLabel: "Pan" },
  { id: "room", icon: Square, fallbackLabel: "Room" },
  { id: "wall", icon: PanelRightOpen, fallbackLabel: "Wall" },
  { id: "partition", icon: PanelRightOpen, fallbackLabel: "Partition" },
  { id: "stair", icon: PanelRightOpen, fallbackLabel: "Stair" },
  { id: "door", icon: DoorOpen, fallbackLabel: "Door" },
  { id: "window", icon: DoorOpen, fallbackLabel: "Window" },
  { id: "exit", icon: MapPinned, fallbackLabel: "Exit" },
  { id: "fireExit", icon: ShieldAlert, fallbackLabel: "Fire Exit" },
  { id: "roundel", icon: CircleDot, fallbackLabel: "Roundel" },
  { id: "label", icon: Type, fallbackLabel: "Label" },
];

const TOOL_LABEL_KEYS: Record<MapTool, string> = {
  select: "config.map_designer.tool.select",
  pan: "config.map_designer.tool.pan",
  room: "config.map_designer.tool.room",
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

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
const normalizeRect = (a: WorldPoint, b: WorldPoint) => ({ x: Math.round(Math.min(a.x, b.x)), y: Math.round(Math.min(a.y, b.y)), width: Math.round(Math.abs(b.x - a.x)), height: Math.round(Math.abs(b.y - a.y)) });
const MAP_ARTEFACT_TYPES = new Set(["room", "zone", "wall", "door", "window", "partition", "exit", "fireExit", "roundel", "label", "stair"]);
const DEFAULT_WORLD = { width: 1600, height: 1050 };
const SNAP_THRESHOLD = 16;

function createBlankMapDocument(name: string = "Untitled Map"): MapDocument {
  const timestamp = new Date().toISOString();
  return {
    id: `map_${crypto.randomUUID()}`,
    name,
    metadata: {
      createdAt: timestamp,
      updatedAt: timestamp,
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

function isValidMapDocument(candidate: unknown): candidate is MapDocument {
  if (!candidate || typeof candidate !== "object") return false;
  const documentCandidate = candidate as Record<string, unknown>;
  if (typeof documentCandidate.id !== "string" || typeof documentCandidate.name !== "string") return false;
  if (!documentCandidate.world || typeof documentCandidate.world !== "object") return false;
  const world = documentCandidate.world as Record<string, unknown>;
  if (typeof world.width !== "number" || typeof world.height !== "number") return false;
  if (!Array.isArray(documentCandidate.artefacts)) return false;

  return documentCandidate.artefacts.every((artefact) => {
    if (!artefact || typeof artefact !== "object") return false;
    const artefactCandidate = artefact as Record<string, unknown>;
    if (typeof artefactCandidate.id !== "string" || typeof artefactCandidate.type !== "string") return false;
    if (!MAP_ARTEFACT_TYPES.has(artefactCandidate.type)) return false;
    if (!artefactCandidate.geometry || typeof artefactCandidate.geometry !== "object") return false;
    const geometry = artefactCandidate.geometry as Record<string, unknown>;
    return typeof geometry.kind === "string";
  });
}

function sanitizeFilename(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned || "map_document";
}

function toPortableMapDocument(documentModel: MapDocument): MapDocument {
  const now = new Date().toISOString();
  const createdAt = documentModel.metadata?.createdAt ?? now;
  const updatedAt = now;

  return {
    id: documentModel.id,
    name: documentModel.name,
    metadata: {
      createdAt,
      updatedAt,
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
  return {
    id: documentCandidate.id,
    name: documentCandidate.name,
    metadata: {
      createdAt: documentCandidate.metadata?.createdAt,
      updatedAt: documentCandidate.metadata?.updatedAt,
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

function getAnchor(artefact: MapArtefact): WorldPoint {
  if (artefact.geometry.kind === "point") return { x: artefact.geometry.x, y: artefact.geometry.y };
  if (artefact.geometry.kind === "line") return { x: (artefact.geometry.x1 + artefact.geometry.x2) / 2, y: (artefact.geometry.y1 + artefact.geometry.y2) / 2 };
  if (artefact.geometry.kind === "polygon") return {
    x: artefact.geometry.points.reduce((sum, point) => sum + point.x, 0) / artefact.geometry.points.length,
    y: artefact.geometry.points.reduce((sum, point) => sum + point.y, 0) / artefact.geometry.points.length,
  };
  return { x: artefact.geometry.x + artefact.geometry.width / 2, y: artefact.geometry.y + artefact.geometry.height / 2 };
}

function getRectRotation(geometry: Extract<MapGeometry, { kind: "rect" }>) {
  return geometry.rotation ?? 0;
}

function renderArtefactShape(artefact: MapArtefact, selected: boolean, displayGeometry?: MapGeometry) {
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
    const isStructuredArea = artefact.type === "room" || artefact.type === "zone" || artefact.type === "stair";
    const baseFill =
      fillOverride ??
      (artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 12%, white)"
        : artefact.type === "stair"
          ? "color-mix(in srgb, var(--app-text-muted) 10%, white)"
          : "color-mix(in srgb, var(--app-surface-muted) 72%, white)");
    const stroke = borderOverride ??
      (artefact.type === "zone"
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
    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={artefact.type === "zone" ? 0 : 4} transform={rectTransform} fill={selected ? selectionFill : baseFill} stroke={selected ? selectionStroke : isStructuredArea ? "transparent" : stroke} strokeWidth={selected ? 4 : isStructuredArea ? 0 : 2} />;
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
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 6} strokeLinecap="round" />
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : borderOverride ?? "var(--app-primary)"} strokeWidth={selected ? 8 : 4} strokeLinecap="square" />
      </>;
    }
    if (artefact.type === "door") {
      return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + (selected ? 8 : 6)} strokeLinecap="square" />;
    }
    if (artefact.type === "exit" || artefact.type === "fireExit") {
      const accent = borderOverride ?? (artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)");
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 8} strokeLinecap="square" />
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

const MapDesigner: React.FC = () => {
  const { loadKeys, t } = useLocalization();
  const [documentModel, setDocumentModel] = useState<MapDocument>(sampleDetoxReferenceMap);
  const [ioError, setIoError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<MapTool>("select");
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [selectedArtefactId, setSelectedArtefactId] = useState<string | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, panX: 32, panY: 32 });
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<PointerDragState>(null);
  const [pendingWallStart, setPendingWallStart] = useState<WorldPoint | null>(null);
  const [wallPreviewPoint, setWallPreviewPoint] = useState<WorldPoint | null>(null);
  const [openingPreview, setOpeningPreview] = useState<OpeningPreview | null>(null);
  const [clipboard, setClipboard] = useState<MapClipboard | null>(null);
  const dragStateRef = useRef<PointerDragState>(null);
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const renderOrderedArtefacts = useMemo(() => {
    const groups: Record<MapArtefact["type"], MapArtefact[]> = { zone: [], room: [], wall: [], partition: [], stair: [], door: [], window: [], exit: [], fireExit: [], roundel: [], label: [] };
    documentModel.artefacts.forEach((artefact) => { if (artefact.visible !== false) groups[artefact.type].push(artefact); });
    return [...groups.zone, ...groups.room, ...groups.stair, ...groups.wall, ...groups.partition, ...groups.door, ...groups.window, ...groups.exit, ...groups.fireExit, ...groups.roundel, ...groups.label];
  }, [documentModel.artefacts]);
  const walls = useMemo(() => documentModel.artefacts.filter((artefact) => artefact.type === "wall"), [documentModel.artefacts]);
  const artefactsById = useMemo(() => new Map(documentModel.artefacts.map((artefact) => [artefact.id, artefact])), [documentModel.artefacts]);
  const mergedWallGeometries = useMemo(() => mergeCollinearWallArtefacts(walls), [walls]);
  const roomBoundaryGeometries = useMemo(() => getRoomBoundarySegments(documentModel.artefacts), [documentModel.artefacts]);
  const nonWallArtefacts = useMemo(() => renderOrderedArtefacts.filter((artefact) => artefact.type !== "wall"), [renderOrderedArtefacts]);
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

      if (event.key !== "Delete" || !selectedArtefactId) return;
      event.preventDefault();
      setDocumentModel((current) => ({
        ...current,
        artefacts: current.artefacts.filter((artefact) => !selectedClusterIds.has(artefact.id)),
      }));
      setSelectedArtefactId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clipboard, documentModel.artefacts, selectedArtefact, selectedArtefactId, selectedClusterIds]);

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
    const previewArtefact: MapArtefact = {
      id: `${type}_preview`,
      type,
      geometry: { kind: "point", x: point.x, y: point.y, size: 18 },
      wallAttachment: attachment,
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
    if (currentDragState?.kind === "room") {
      const draftRect = normalizeRect(currentDragState.originWorld, currentDragState.currentWorld);
      if (draftRect.width >= 12 && draftRect.height >= 12) {
        const nextArtefact: MapArtefact = {
          id: createId(activeTool === "stair" ? "stair" : "room"),
          type: activeTool === "stair" ? "stair" : "room",
          geometry: { kind: "rect", ...draftRect },
          labelOverride: activeTool === "stair" ? "Stairs" : "Room",
        };
        setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
        setSelectedArtefactId(nextArtefact.id);
      }
    }
    if (typeof pointerId === "number" && surfaceRef.current?.hasPointerCapture(pointerId)) {
      surfaceRef.current.releasePointerCapture(pointerId);
    }
    dragStateRef.current = null;
    setDragState(null);
    setOpeningPreview(null);
  }

  const placePointArtefact = (type: "roundel" | "label", point: WorldPoint) => {
    const snappedPoint = getAlignedPoint(point, { referencePoint: selectedArtefact?.type === "room" ? getAnchor(selectedArtefact) : null });
    const nextArtefact: MapArtefact = {
      id: createId(type),
      type,
      geometry: { kind: "point", x: snappedPoint.x, y: snappedPoint.y, size: type === "roundel" ? 28 : 18 },
      labelOverride: type === "label" ? "Label" : undefined,
      parentId:
        type === "roundel"
          ? selectedArtefact?.type === "room"
            ? selectedArtefact.id
            : undefined
          : selectedArtefact?.id,
    };
    setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
    setSelectedArtefactId(nextArtefact.id);
  };

  const handleArtefactPointerDown = (event: React.PointerEvent<SVGGElement>, artefact: MapArtefact) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedArtefactId(artefact.id);
    if (activeTool !== "select" || event.button !== 0 || !surfaceRef.current) return;
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    const nextDragState: PointerDragState = {
      kind: "move",
      artefactId: artefact.id,
      originWorld: worldPoint,
      originalGeometry: artefact.geometry,
      childGeometries: documentModel.artefacts
        .filter((candidate) => candidate.parentId === artefact.id || candidate.wallAttachment?.hostId === artefact.id || candidate.wallAttachment?.wallId === artefact.id)
        .map((candidate) => ({ id: candidate.id, geometry: candidate.geometry })),
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
    if ((activeTool === "room" || activeTool === "stair") && event.button === 0) {
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
      };
      setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
      setSelectedArtefactId(nextArtefact.id);
      return;
    }
    if (activeTool === "roundel" && event.button === 0) return void placePointArtefact("roundel", worldPoint);
    if (activeTool === "label" && event.button === 0) return void placePointArtefact("label", worldPoint);
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
  const handleNewMap = () => {
    setDocumentModel(createBlankMapDocument());
    setActiveTool("select");
    setSelectedArtefactId(null);
    setPropertiesOpen(false);
    setPendingWallStart(null);
    setWallPreviewPoint(null);
    setOpeningPreview(null);
    setIoError(null);
    setHasInitializedViewport(false);
  };
  const handleSave = () => {
    const payload = toPortableMapDocument(documentModel);
    setDocumentModel(payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFilename(payload.name)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleLoadClick = () => fileInputRef.current?.click();
  const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const textContent = await file.text();
      const parsed = JSON.parse(textContent) as unknown;
      if (!isValidMapDocument(parsed)) {
        setIoError(text("config.map_designer.io.invalid", "Invalid map file."));
        return;
      }
      const normalized = normalizeImportedMapDocument(parsed as MapDocument & Record<string, unknown>);
      setDocumentModel(normalized);
      setActiveTool("select");
      setSelectedArtefactId(null);
      setPropertiesOpen(false);
      setPendingWallStart(null);
      setWallPreviewPoint(null);
      setOpeningPreview(null);
      setIoError(null);
      setHasInitializedViewport(false);
    } catch {
      setIoError(text("config.map_designer.io.invalid", "Invalid map file."));
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="app-page-shell">
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative">
          <section className="app-card rounded-2xl p-3 sm:p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-[var(--app-text)]">{documentModel.name}</p>
              <p className="text-xs text-[var(--app-text-muted)]">{text("config.map_designer.surface_hint", "Phase 1/2: render, pan, zoom, select, delete, and global label visibility.")}</p>
            </div>

            <div ref={containerRef} className="relative h-[82vh] min-h-[760px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)]">
              <div className="pointer-events-none absolute left-5 right-5 top-5 z-10">
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-white/95 px-3 py-3 shadow-xl backdrop-blur">
                  <input
                    type="text"
                    value={documentModel.name}
                    onChange={(event) => setDocumentModel((current) => ({ ...current, name: event.target.value || "Untitled Map" }))}
                    className="w-[16rem] rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]"
                    aria-label={text("config.map_designer.io.name", "Map Name")}
                  />
                  <button type="button" onClick={handleNewMap} title={text("config.map_designer.io.new", "New Map")} aria-label={text("config.map_designer.io.new", "New Map")} className="rounded-xl border border-[var(--app-border)] bg-white p-2 text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <FilePlus2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleSave} title={text("config.map_designer.io.save", "Save")} aria-label={text("config.map_designer.io.save", "Save")} className="rounded-xl border border-[var(--app-border)] bg-white p-2 text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <Save className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleLoadClick} title={text("config.map_designer.io.load", "Load")} aria-label={text("config.map_designer.io.load", "Load")} className="rounded-xl border border-[var(--app-border)] bg-white p-2 text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <FolderOpen className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleLoadFile} className="hidden" />
                  <div className="mx-1 hidden h-8 w-px bg-[var(--app-border)] md:block" />
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
                          if (tool.id !== "door" && tool.id !== "window") {
                            setOpeningPreview(null);
                          }
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                          isActive ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                  <div className="mx-1 hidden h-8 w-px bg-[var(--app-border)] md:block" />
                  <button type="button" title={labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")} aria-label={labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")} onClick={() => setLabelsVisible((current) => !current)} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${labelsVisible ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"}`}>
                    <Type className="h-4 w-4" />
                  </button>
                  <button type="button" title={snapEnabled ? "Snap On" : "Snap Off"} aria-label={snapEnabled ? "Snap On" : "Snap Off"} onClick={() => setSnapEnabled((current) => !current)} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${snapEnabled ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"}`}>
                    <Square className="h-4 w-4" />
                  </button>
                  <button type="button" title="Zoom Out" aria-label="Zoom Out" onClick={() => zoomByFactor(0.9)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <Minus className="h-4 w-4" />
                  </button>
                  <button type="button" title="Zoom In" aria-label="Zoom In" onClick={() => zoomByFactor(1.1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button type="button" title={text("config.map_designer.zoom.fit", "Fit")} aria-label={text("config.map_designer.zoom.fit", "Fit")} onClick={resetView} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title={text("config.map_designer.properties.title", "Properties")}
                    aria-label={text("config.map_designer.properties.title", "Properties")}
                    onClick={() => setPropertiesOpen((current) => !current)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                      propertiesOpen ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                    }`}
                  >
                    <PanelRightOpen className="h-4 w-4" />
                  </button>
                  <div title={pendingWallStart ? text("config.map_designer.pending.wall", "Wall tool: click a second point to finish the segment.") : `${text("config.map_designer.field.active_tool", "Active tool")}: ${text(TOOL_LABEL_KEYS[activeTool], activeTool)}`} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]">
                    <Info className="h-4 w-4" />
                  </div>
                </div>
                {ioError && <div className="pointer-events-auto mt-2 max-w-sm rounded-2xl border border-[var(--app-danger)] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,white)] px-4 py-3 text-sm text-[var(--app-danger)] shadow-lg">{ioError}</div>}
              </div>
              <svg
                ref={surfaceRef}
                className={`h-full w-full ${activeTool === "pan" ? "cursor-grab" : activeTool === "room" ? "cursor-crosshair" : "cursor-default"}`}
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
                  {roomBoundaryGeometries.map((geometry, index) => (
                    <line
                      key={`room_boundary_${index}`}
                      x1={geometry.x1}
                      y1={geometry.y1}
                      x2={geometry.x2}
                      y2={geometry.y2}
                      stroke="var(--app-border)"
                      strokeWidth={geometry.thickness ?? 2}
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
                  {nonWallArtefacts.map((artefact) => {
                    const displayGeometry = artefact.type === "door" || artefact.type === "window" || artefact.type === "exit" || artefact.type === "fireExit" ? resolveAttachedOpeningLine(artefact, artefactsById) ?? artefact.geometry : artefact.geometry;
                    return (
                      <g key={artefact.id} data-artefact-id={artefact.id} className="cursor-pointer" onPointerDown={(event) => handleArtefactPointerDown(event, artefact)}>
                        {displayGeometry.kind === "line" && (artefact.type === "door" || artefact.type === "window" || artefact.type === "partition") && (
                          <line x1={displayGeometry.x1} y1={displayGeometry.y1} x2={displayGeometry.x2} y2={displayGeometry.y2} stroke="transparent" strokeWidth={18} strokeLinecap="round" />
                        )}
                        {renderArtefactShape(artefact, artefact.id === selectedArtefactId, displayGeometry)}
                      </g>
                    );
                  })}
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
                    return (
                      <g opacity={0.9}>
                        <line
                          x1={previewGeometry.x1}
                          y1={previewGeometry.y1}
                          x2={previewGeometry.x2}
                          y2={previewGeometry.y2}
                          stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)"
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
                    const anchor = artefact.type === "door" || artefact.type === "window" || artefact.type === "exit" || artefact.type === "fireExit" ? getAnchor({ ...artefact, geometry: resolveAttachedOpeningLine(artefact, artefactsById) ?? artefact.geometry }) : getAnchor(artefact);
                    return <text key={`${artefact.id}_label`} x={anchor.x} y={anchor.y} textAnchor="middle" dominantBaseline="middle" fill={getMetadataColor(artefact, "textColor") ?? "var(--app-text)"} fontSize={artefact.type === "exit" || artefact.type === "fireExit" ? 15 : 17} fontWeight={artefact.type === "label" ? 700 : 600} pointerEvents="none">{getArtefactLabel(artefact, t)}</text>;
                  })}
                </g>
              </svg>
            </div>
          </section>

          {selectedArtefact && propertiesOpen && (
            <aside className="pointer-events-none absolute right-5 top-5 z-10 w-[24rem] max-w-[calc(100%-7.5rem)]">
              <div className="pointer-events-auto max-h-[calc(82vh-2rem)] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{text("config.map_designer.properties.title", "Properties")}</h2>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">{selectedArtefact.id}</p>
                  </div>
                  <button type="button" onClick={() => setPropertiesOpen(false)} className="rounded-xl border border-[var(--app-border)] bg-white p-2 text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]" aria-label="Close properties" title="Close properties">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                    <div className="grid gap-3">
                      <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.type", "Type")}</p><p className="mt-1 text-[var(--app-text)]">{selectedArtefact.type}</p></div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.parent_id", "Parent ID")}</p>
                        <input type="text" value={selectedArtefact.parentId ?? ""} onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, parentId: event.target.value || undefined }))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.label_override", "Label Override")}</p>
                        <input type="text" value={selectedArtefact.labelOverride ?? ""} onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, labelOverride: event.target.value || undefined }))} placeholder={text("config.map_designer.field.label_override_placeholder", "Enter visible label")} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]" />
                      </div>
                      <label className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)]">
                        <input type="checkbox" checked={selectedArtefact.visible !== false} onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, visible: event.target.checked }))} />
                        <span>{text("config.map_designer.field.visible_toggle", "Visible")}</span>
                      </label>

                      {(selectedArtefact.type === "room" || selectedArtefact.type === "zone" || selectedArtefact.type === "stair") && selectedArtefact.geometry.kind === "rect" && (
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label={text("config.map_designer.field.x", "X")} value={selectedArtefact.geometry.x} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, x: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.y", "Y")} value={selectedArtefact.geometry.y} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, y: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.width", "Width")} value={selectedArtefact.geometry.width} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, width: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.height", "Height")} value={selectedArtefact.geometry.height} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, height: value } : geometry)} />
                            <NumberField label="Rotation" value={selectedArtefact.geometry.rotation ?? 0} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: value } : geometry)} />
                            <NumberField label="Border Thickness" value={typeof selectedArtefact.metadata?.borderThickness === "number" ? selectedArtefact.metadata.borderThickness : 2} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, metadata: { ...(artefact.metadata ?? {}), borderThickness: value } }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: (geometry.rotation ?? 0) - 90 } : geometry)}
                              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span>90°</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, rotation: (geometry.rotation ?? 0) + 90 } : geometry)}
                              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface-muted)]"
                            >
                              <RotateCw className="h-4 w-4" />
                              <span>90°</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {(selectedArtefact.type === "wall" || selectedArtefact.type === "partition") && selectedArtefact.geometry.kind === "line" && (
                        <div className="grid grid-cols-2 gap-2">
                          <NumberField label={text("config.map_designer.field.start_x", "Start X")} value={selectedArtefact.geometry.x1} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "line" ? { ...geometry, x1: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.start_y", "Start Y")} value={selectedArtefact.geometry.y1} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "line" ? { ...geometry, y1: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.end_x", "End X")} value={selectedArtefact.geometry.x2} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "line" ? { ...geometry, x2: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.end_y", "End Y")} value={selectedArtefact.geometry.y2} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "line" ? { ...geometry, y2: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.thickness", "Thickness")} value={selectedArtefact.geometry.thickness ?? 14} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "line" ? { ...geometry, thickness: value } : geometry)} />
                        </div>
                      )}

                      {(selectedArtefact.type === "exit" || selectedArtefact.type === "fireExit" || selectedArtefact.type === "roundel" || selectedArtefact.type === "label" || selectedArtefact.type === "door" || selectedArtefact.type === "window") && selectedArtefact.geometry.kind === "point" && (
                        <div className="grid grid-cols-2 gap-2">
                          <NumberField label={text("config.map_designer.field.x", "X")} value={selectedArtefact.geometry.x} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "point" ? { ...geometry, x: value } : geometry)} />
                          <NumberField label={text("config.map_designer.field.y", "Y")} value={selectedArtefact.geometry.y} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "point" ? { ...geometry, y: value } : geometry)} />
                        </div>
                      )}

                      {(selectedArtefact.type === "door" || selectedArtefact.type === "window" || selectedArtefact.type === "exit" || selectedArtefact.type === "fireExit") && (
                        <div className="grid gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">Host ID</p>
                            <input type="text" value={selectedArtefact.wallAttachment?.hostId ?? selectedArtefact.wallAttachment?.wallId ?? ""} onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: artefact.wallAttachment?.wallId, hostType: artefact.wallAttachment?.hostType, edge: artefact.wallAttachment?.edge, hostId: event.target.value, offset: artefact.wallAttachment?.offset ?? 0, width: artefact.wallAttachment?.width ?? 36 } }))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)]" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label={text("config.map_designer.field.offset", "Offset")} value={selectedArtefact.wallAttachment?.offset ?? 0} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: artefact.wallAttachment?.wallId, hostId: artefact.wallAttachment?.hostId, hostType: artefact.wallAttachment?.hostType, edge: artefact.wallAttachment?.edge, offset: value, width: artefact.wallAttachment?.width ?? 36 } }))} />
                            <NumberField label={text("config.map_designer.field.width", "Width")} value={selectedArtefact.wallAttachment?.width ?? 36} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: artefact.wallAttachment?.wallId, hostId: artefact.wallAttachment?.hostId, hostType: artefact.wallAttachment?.hostType, edge: artefact.wallAttachment?.edge, offset: artefact.wallAttachment?.offset ?? 0, width: value } }))} />
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2">
                        <ColorField label="Fill" value={getMetadataColor(selectedArtefact, "fillColor") ?? "#d9d9d9"} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => setArtefactColorMetadata(artefact, "fillColor", value))} />
                        <ColorField label="Border" value={getMetadataColor(selectedArtefact, "borderColor") ?? "#6b7280"} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => setArtefactColorMetadata(artefact, "borderColor", value))} />
                        <ColorField label="Text" value={getMetadataColor(selectedArtefact, "textColor") ?? "#111827"} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => setArtefactColorMetadata(artefact, "textColor", value))} />
                      </div>

                      {selectedArtefact.geometry.kind === "polygon" && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.points", "Points")}</p>
                          <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-3 text-xs text-[var(--app-text)]">{JSON.stringify(selectedArtefact.geometry.points, null, 2)}</pre>
                        </div>
                      )}

                      <details>
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.raw", "Raw")}</summary>
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-3 text-xs text-[var(--app-text)]">{JSON.stringify(selectedArtefact.geometry, null, 2)}</pre>
                      </details>
                    </div>
                  </div>

                  <button type="button" onClick={() => { setDocumentModel((current) => ({ ...current, artefacts: current.artefacts.filter((artefact) => artefact.id !== selectedArtefact.id) })); setSelectedArtefactId(null); }} className="w-full rounded-xl border border-[var(--app-danger)] px-4 py-2 text-sm font-semibold text-[var(--app-danger)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)]">
                    {text("config.map_designer.properties.delete", "Delete Selected")}
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapDesigner;
