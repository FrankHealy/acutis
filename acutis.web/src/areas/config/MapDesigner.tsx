"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleDot, DoorOpen, Hand, Info, Map as MapIcon, MapPinned, Minus, MousePointer2, PanelRightOpen, Plus, ShieldAlert, Square, Type } from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { clampScale, createFitViewport, createWallPolygonPoints, findNearestWallAttachment, getDocumentBounds, isLabelVisible, mergeCollinearWallArtefacts, resolveAttachedOpeningLine, snapWorldPoint, toWorldPoint, zoomAroundPoint } from "@/areas/config/mapDesigner/geometry";
import { sampleDetoxReferenceMap } from "@/areas/config/mapDesigner/sampleMap";
import type { MapArtefact, MapDocument, MapGeometry, MapTool, ViewportState } from "@/areas/config/mapDesigner/types";

type WorldPoint = { x: number; y: number };
type PointerDragState =
  | { kind: "pan"; originClientX: number; originClientY: number; originPanX: number; originPanY: number }
  | { kind: "move"; artefactId: string; originWorld: WorldPoint; originalGeometry: MapGeometry }
  | { kind: "room"; originWorld: WorldPoint; currentWorld: WorldPoint }
  | null;

const TOOL_ORDER: Array<{ id: MapTool; icon: React.ComponentType<{ className?: string }>; fallbackLabel: string }> = [
  { id: "select", icon: MousePointer2, fallbackLabel: "Select" },
  { id: "pan", icon: Hand, fallbackLabel: "Pan" },
  { id: "room", icon: Square, fallbackLabel: "Room" },
  { id: "wall", icon: PanelRightOpen, fallbackLabel: "Wall" },
  { id: "partition", icon: PanelRightOpen, fallbackLabel: "Partition" },
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
  door: "config.map_designer.tool.door",
  window: "config.map_designer.tool.window",
  exit: "config.map_designer.tool.exit",
  fireExit: "config.map_designer.tool.fire_exit",
  roundel: "config.map_designer.tool.roundel",
  label: "config.map_designer.tool.label",
};

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
const normalizeRect = (a: WorldPoint, b: WorldPoint) => ({ x: Math.round(Math.min(a.x, b.x)), y: Math.round(Math.min(a.y, b.y)), width: Math.round(Math.abs(b.x - a.x)), height: Math.round(Math.abs(b.y - a.y)) });

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

function getArtefactLabel(artefact: MapArtefact, t: (key: string) => string) {
  if (artefact.labelOverride) return artefact.labelOverride;
  if (artefact.labelKey) {
    const localized = t(artefact.labelKey);
    if (localized !== artefact.labelKey) return localized;
  }
  return artefact.id;
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

function renderArtefactShape(artefact: MapArtefact, selected: boolean, displayGeometry?: MapGeometry) {
  const selectionStroke = "var(--app-primary)";
  const selectionFill = "color-mix(in srgb, var(--app-primary) 14%, transparent)";
  const geometry = displayGeometry ?? artefact.geometry;
  if (geometry.kind === "rect") {
    const baseFill = artefact.type === "zone" ? "color-mix(in srgb, var(--app-success) 12%, white)" : "color-mix(in srgb, var(--app-surface-muted) 72%, white)";
    const stroke = artefact.type === "zone" ? "color-mix(in srgb, var(--app-success) 55%, var(--app-border))" : "var(--app-border)";
    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={artefact.type === "zone" ? 0 : 4} fill={selected ? selectionFill : baseFill} stroke={selected ? selectionStroke : stroke} strokeWidth={selected ? 4 : 2} />;
  }
  if (geometry.kind === "polygon") {
    return <polygon points={geometry.points.map((point) => `${point.x},${point.y}`).join(" ")} fill={selected ? selectionFill : "color-mix(in srgb, var(--app-warning) 12%, white)"} stroke={selected ? selectionStroke : "var(--app-border)"} strokeWidth={selected ? 4 : 2} />;
  }
  if (geometry.kind === "line") {
    if (artefact.type === "wall") return <polygon points={createWallPolygonPoints(geometry)} fill={selected ? selectionStroke : "var(--app-text)"} />;
    if (artefact.type === "partition") {
      return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : "var(--app-text-muted)"} strokeWidth={selected ? 8 : geometry.thickness ?? 6} strokeDasharray="10 6" strokeLinecap="round" />;
    }
    if (artefact.type === "window") {
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 6} strokeLinecap="round" />
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : "var(--app-primary)"} strokeWidth={selected ? 8 : 4} strokeLinecap="round" />
      </>;
    }
    if (artefact.type === "door") {
      return <>
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 8} strokeLinecap="round" />
        <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : "var(--app-accent)"} strokeWidth={selected ? 6 : geometry.thickness ?? 8} strokeLinecap="round" />
      </>;
    }
    return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke={selected ? selectionStroke : "var(--app-text)"} strokeWidth={selected ? 6 : geometry.thickness ?? 8} strokeLinecap="round" />;
  }
  const size = geometry.size ?? 20;
  const radius = size / 2;
  if (artefact.type === "exit" || artefact.type === "fireExit") {
    const fill = artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)";
    return <>
      <circle cx={geometry.x} cy={geometry.y} r={radius} fill={selected ? selectionStroke : fill} stroke="white" strokeWidth={2} />
      <path d={`M ${geometry.x - 4} ${geometry.y + 5} L ${geometry.x + 6} ${geometry.y} L ${geometry.x - 4} ${geometry.y - 5}`} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </>;
  }
  if (artefact.type === "roundel") return <circle cx={geometry.x} cy={geometry.y} r={radius} fill="white" stroke={selected ? selectionStroke : "var(--app-border)"} strokeWidth={selected ? 4 : 2} />;
  return <circle cx={geometry.x} cy={geometry.y} r={selected ? radius + 2 : radius} fill={selected ? selectionStroke : "var(--app-primary)"} />;
}

const MapDesigner: React.FC = () => {
  const router = useRouter();
  const { loadKeys, t } = useLocalization();
  const [documentModel, setDocumentModel] = useState<MapDocument>(sampleDetoxReferenceMap);
  const [activeTool, setActiveTool] = useState<MapTool>("select");
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [selectedArtefactId, setSelectedArtefactId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, panX: 32, panY: 32 });
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<PointerDragState>(null);
  const [pendingWallStart, setPendingWallStart] = useState<WorldPoint | null>(null);
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadKeys([
      "config.map_designer.title","config.map_designer.description","config.map_designer.back",
      "config.map_designer.labels.show","config.map_designer.labels.hide","config.map_designer.zoom.fit","config.map_designer.zoom.reset",
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
    const groups: Record<MapArtefact["type"], MapArtefact[]> = { zone: [], room: [], wall: [], partition: [], door: [], window: [], exit: [], fireExit: [], roundel: [], label: [] };
    documentModel.artefacts.forEach((artefact) => { if (artefact.visible !== false) groups[artefact.type].push(artefact); });
    return [...groups.zone, ...groups.room, ...groups.wall, ...groups.partition, ...groups.door, ...groups.window, ...groups.exit, ...groups.fireExit, ...groups.roundel, ...groups.label];
  }, [documentModel.artefacts]);
  const walls = useMemo(() => documentModel.artefacts.filter((artefact) => artefact.type === "wall"), [documentModel.artefacts]);
  const wallsById = useMemo(() => new Map(walls.map((wall) => [wall.id, wall])), [walls]);
  const mergedWallGeometries = useMemo(() => mergeCollinearWallArtefacts(walls), [walls]);
  const nonWallArtefacts = useMemo(() => renderOrderedArtefacts.filter((artefact) => artefact.type !== "wall"), [renderOrderedArtefacts]);

  useEffect(() => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0 || hasInitializedViewport) return;
    setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
    setHasInitializedViewport(true);
  }, [documentBounds, hasInitializedViewport, surfaceSize.height, surfaceSize.width]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" || !selectedArtefactId) return;
      event.preventDefault();
      setDocumentModel((current) => ({ ...current, artefacts: current.artefacts.filter((artefact) => artefact.id !== selectedArtefactId) }));
      setSelectedArtefactId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArtefactId]);

  const resetView = () => setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
  const zoomByFactor = (factor: number) => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) return;
    setViewport((current) => zoomAroundPoint(current, surfaceSize.width / 2, surfaceSize.height / 2, clampScale(current.scale * factor)));
  };
  const getWorldPointFromEvent = (event: React.PointerEvent<SVGSVGElement | SVGGElement>) => {
    const svgRect = surfaceRef.current?.getBoundingClientRect();
    return svgRect ? toWorldPoint(event.clientX, event.clientY, svgRect, viewport) : null;
  };

  const placePointArtefact = (type: "roundel" | "label", point: WorldPoint) => {
    const snappedPoint = snapWorldPoint(point, walls, selectedArtefact?.type === "room" ? getAnchor(selectedArtefact) : null);
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
    event.stopPropagation();
    setSelectedArtefactId(artefact.id);
    if (activeTool !== "select" || event.button !== 0 || !surfaceRef.current) return;
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    setDragState({ kind: "move", artefactId: artefact.id, originWorld: worldPoint, originalGeometry: artefact.geometry });
    surfaceRef.current.setPointerCapture(event.pointerId);
  };

  const handleSurfacePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!surfaceRef.current) return;
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    if (activeTool === "pan" || event.button === 1) {
      setDragState({ kind: "pan", originClientX: event.clientX, originClientY: event.clientY, originPanX: viewport.panX, originPanY: viewport.panY });
      surfaceRef.current.setPointerCapture(event.pointerId);
      return;
    }
    if (activeTool === "room" && event.button === 0) {
      setSelectedArtefactId(null);
      const snappedPoint = snapWorldPoint(worldPoint, walls);
      setDragState({ kind: "room", originWorld: snappedPoint, currentWorld: snappedPoint });
      surfaceRef.current.setPointerCapture(event.pointerId);
      return;
    }
    if ((activeTool === "wall" || activeTool === "partition") && event.button === 0) {
      const snappedPoint = snapWorldPoint(worldPoint, walls, pendingWallStart);
      if (!pendingWallStart) {
        setPendingWallStart(snappedPoint);
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
      }
      return;
    }
    if ((activeTool === "door" || activeTool === "window") && event.button === 0) {
      const attachment = findNearestWallAttachment(worldPoint, walls);
      if (!attachment) return;
      const nextArtefact: MapArtefact = {
        id: createId(activeTool),
        type: activeTool,
        geometry: { kind: "point", x: Math.round(worldPoint.x), y: Math.round(worldPoint.y), size: 18 },
        wallAttachment: attachment,
      };
      setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
      setSelectedArtefactId(nextArtefact.id);
      return;
    }
    if (activeTool === "exit" && event.button === 0) {
      const snappedPoint = snapWorldPoint(worldPoint, walls);
      const nextArtefact: MapArtefact = {
        id: createId("exit"),
        type: "exit",
        geometry: { kind: "point", x: snappedPoint.x, y: snappedPoint.y, size: 26 },
        labelOverride: "Exit",
      };
      setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
      setSelectedArtefactId(nextArtefact.id);
      return;
    }
    if (activeTool === "fireExit" && event.button === 0) {
      const snappedPoint = snapWorldPoint(worldPoint, walls);
      const nextArtefact: MapArtefact = {
        id: createId("fireExit"),
        type: "fireExit",
        geometry: { kind: "point", x: snappedPoint.x, y: snappedPoint.y, size: 26 },
        labelOverride: "Fire Exit",
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
    if (!dragState) return;
    if (dragState.kind === "pan") {
      setViewport((current) => ({ ...current, panX: dragState.originPanX + (event.clientX - dragState.originClientX), panY: dragState.originPanY + (event.clientY - dragState.originClientY) }));
      return;
    }
    const worldPoint = getWorldPointFromEvent(event);
    if (!worldPoint) return;
    if (dragState.kind === "room") {
      setDragState({ ...dragState, currentWorld: snapWorldPoint(worldPoint, walls, dragState.originWorld) });
      return;
    }
    const snappedPoint = snapWorldPoint(worldPoint, walls, dragState.originWorld);
    const deltaX = Math.round(snappedPoint.x - dragState.originWorld.x);
    const deltaY = Math.round(snappedPoint.y - dragState.originWorld.y);
    const movingOpeningAttachment =
      selectedArtefact?.id === dragState.artefactId && (selectedArtefact.type === "door" || selectedArtefact.type === "window")
        ? findNearestWallAttachment(snappedPoint, walls)
        : null;
    setDocumentModel((current) => ({
      ...current,
      artefacts: current.artefacts.map((artefact) => {
        if (artefact.id === dragState.artefactId) {
          return movingOpeningAttachment && (artefact.type === "door" || artefact.type === "window")
            ? {
                ...artefact,
                geometry: { kind: "point", x: snappedPoint.x, y: snappedPoint.y, size: artefact.geometry.kind === "point" ? artefact.geometry.size : 18 },
                wallAttachment: movingOpeningAttachment,
              }
            : { ...artefact, geometry: moveGeometry(dragState.originalGeometry, deltaX, deltaY) };
        }
        if (artefact.parentId === dragState.artefactId) {
          return { ...artefact, geometry: moveGeometry(artefact.geometry, deltaX, deltaY) };
        }
        return artefact;
      }),
    }));
  };

  const handleSurfacePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragState?.kind === "room") {
      const draftRect = normalizeRect(dragState.originWorld, dragState.currentWorld);
      if (draftRect.width >= 12 && draftRect.height >= 12) {
        const nextArtefact: MapArtefact = { id: createId("room"), type: "room", geometry: { kind: "rect", ...draftRect }, labelOverride: "Room" };
        setDocumentModel((current) => ({ ...current, artefacts: [...current.artefacts, nextArtefact] }));
        setSelectedArtefactId(nextArtefact.id);
      }
    }
    if (dragState && surfaceRef.current?.hasPointerCapture(event.pointerId)) {
      surfaceRef.current.releasePointerCapture(event.pointerId);
    }
    setDragState(null);
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

  return (
    <div className="app-page-shell">
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => router.push("/units/config")} className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]">
            <ArrowLeft className="h-5 w-5" />
            <span>{text("config.map_designer.back", "Back to Configuration")}</span>
          </button>
          <div className="flex items-center gap-3">
            <MapIcon className="h-7 w-7 text-[var(--app-primary)]" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--app-text)]">{text("config.map_designer.title", "Map Designer")}</h1>
              <p className="text-[var(--app-text-muted)]">{text("config.map_designer.description", "Internal SVG map editor MVP using structured world-coordinate artefacts.")}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <section className="app-card rounded-2xl p-3 sm:p-4">
            <div className="mb-3 pl-0 md:pl-[22rem]">
              <p className="text-sm font-semibold text-[var(--app-text)]">{documentModel.name}</p>
              <p className="text-xs text-[var(--app-text-muted)]">{text("config.map_designer.surface_hint", "Phase 1/2: render, pan, zoom, select, delete, and global label visibility.")}</p>
            </div>

            <div ref={containerRef} className="h-[82vh] min-h-[760px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)]">
              <svg ref={surfaceRef} className={`h-full w-full ${activeTool === "pan" ? "cursor-grab" : activeTool === "room" ? "cursor-crosshair" : "cursor-default"}`} onPointerDown={handleSurfacePointerDown} onPointerMove={handleSurfacePointerMove} onPointerUp={handleSurfacePointerUp} onPointerLeave={handleSurfacePointerUp} onWheel={handleWheel}>
                <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
                <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`}>
                  <rect x={0} y={0} width={documentModel.world.width} height={documentModel.world.height} fill="color-mix(in srgb, var(--app-surface-muted) 35%, white)" />
                  {mergedWallGeometries.map((geometry, index) => (
                    <polygon key={`merged_wall_${index}`} points={createWallPolygonPoints(geometry)} fill="var(--app-text)" />
                  ))}
                  {walls.map((artefact) => (
                    <g key={artefact.id} data-artefact-id={artefact.id} className="cursor-pointer" onPointerDown={(event) => handleArtefactPointerDown(event, artefact)}>
                      <polygon points={createWallPolygonPoints(artefact.geometry as Extract<MapGeometry, { kind: "line" }>)} fill={artefact.id === selectedArtefactId ? "var(--app-primary)" : "transparent"} opacity={artefact.id === selectedArtefactId ? 1 : 0} />
                      <polygon points={createWallPolygonPoints(artefact.geometry as Extract<MapGeometry, { kind: "line" }>)} fill="transparent" />
                    </g>
                  ))}
                  {nonWallArtefacts.map((artefact) => {
                    const displayGeometry = artefact.type === "door" || artefact.type === "window" ? resolveAttachedOpeningLine(artefact, wallsById) ?? artefact.geometry : artefact.geometry;
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
                  {labelsVisible && renderOrderedArtefacts.filter((artefact) => isLabelVisible(viewport.scale, artefact.type)).map((artefact) => {
                    if (!artefact.labelKey && !artefact.labelOverride) return null;
                    const anchor = artefact.type === "door" || artefact.type === "window" ? getAnchor({ ...artefact, geometry: resolveAttachedOpeningLine(artefact, wallsById) ?? artefact.geometry }) : getAnchor(artefact);
                    return <text key={`${artefact.id}_label`} x={anchor.x} y={anchor.y} textAnchor="middle" dominantBaseline="middle" fill="var(--app-text)" fontSize={artefact.type === "exit" || artefact.type === "fireExit" ? 15 : 17} fontWeight={artefact.type === "label" ? 700 : 600} pointerEvents="none">{getArtefactLabel(artefact, t)}</text>;
                  })}
                </g>
              </svg>
            </div>
          </section>

          <aside className="pointer-events-none absolute left-5 top-5 z-10 w-[19rem] max-w-[calc(100%-2.5rem)]">
            <div className="pointer-events-auto max-h-[calc(82vh-2rem)] min-h-[520px] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-white/95 p-4 shadow-xl backdrop-blur">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{text("config.map_designer.toolbox.title", "Toolbox")}</h2>
              <div className="grid gap-2">
                {TOOL_ORDER.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  const isImplemented =
                    tool.id === "select" ||
                    tool.id === "pan" ||
                    tool.id === "room" ||
                    tool.id === "wall" ||
                    tool.id === "partition" ||
                    tool.id === "door" ||
                    tool.id === "window" ||
                    tool.id === "exit" ||
                    tool.id === "fireExit" ||
                    tool.id === "roundel" ||
                    tool.id === "label";
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => { setActiveTool(tool.id); if (tool.id !== "wall") setPendingWallStart(null); }}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${isActive ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"}`}
                    >
                      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /><span>{text(TOOL_LABEL_KEYS[tool.id], tool.fallbackLabel)}</span></span>
                      {!isImplemented && <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">P4</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
                <div className="grid gap-2">
                  <button type="button" onClick={() => setLabelsVisible((current) => !current)} className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
                    {labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")}
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    <button type="button" onClick={() => zoomByFactor(0.9)} className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)]"><Minus className="mx-auto h-4 w-4" /></button>
                    <button type="button" onClick={() => zoomByFactor(1.1)} className="rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--app-text)]"><Plus className="mx-auto h-4 w-4" /></button>
                    <button type="button" onClick={resetView} className="rounded-lg border border-[var(--app-border)] bg-white px-2 py-2 text-xs font-semibold text-[var(--app-text)]">{text("config.map_designer.zoom.fit", "Fit")}</button>
                    <button type="button" onClick={resetView} className="rounded-lg border border-[var(--app-border)] bg-white px-2 py-2 text-xs font-semibold text-[var(--app-text)]">{text("config.map_designer.zoom.reset", "Reset")}</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm text-[var(--app-text-muted)]">
                <div className="mb-2 flex items-center gap-2 font-semibold text-[var(--app-text)]"><Info className="h-4 w-4" /><span>{text("config.map_designer.phase3_notice", "Phase 3 status")}</span></div>
                <p>{text("config.map_designer.field.active_tool", "Active tool")}: <span className="font-semibold text-[var(--app-text)]">{text(TOOL_LABEL_KEYS[activeTool], activeTool)}</span></p>
                <p className="mt-2">{selectedArtefact ? `${text("config.map_designer.selection.selected", "Selected")}: ${selectedArtefact.id}` : text("config.map_designer.selection.none", "No artefact selected.")}</p>
                {pendingWallStart && <p className="mt-2 text-[var(--app-primary)]">{text("config.map_designer.pending.wall", "Wall tool: click a second point to finish the segment.")}</p>}
              </div>

              <div className="mt-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">{text("config.map_designer.properties.title", "Properties")}</h2>
                {!selectedArtefact ? (
                  <div className="rounded-xl border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">{text("config.map_designer.properties.empty", "Select an artefact to inspect its basic properties.")}</div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                      <div className="grid gap-3">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.id", "ID")}</p><p className="mt-1 font-mono text-[var(--app-text)]">{selectedArtefact.id}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.type", "Type")}</p><p className="mt-1 text-[var(--app-text)]">{selectedArtefact.type}</p></div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.parent_id", "Parent ID")}</p>
                          <input
                            type="text"
                            value={selectedArtefact.parentId ?? ""}
                            onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, parentId: event.target.value || undefined }))}
                            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]"
                          />
                        </div>
                        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.label_key", "Label Key")}</p><p className="mt-1 break-all text-[var(--app-text)]">{selectedArtefact.labelKey ?? "--"}</p></div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.label_override", "Label Override")}</p>
                          <input
                            type="text"
                            value={selectedArtefact.labelOverride ?? ""}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              setDocumentModel((current) => ({
                                ...current,
                                artefacts: current.artefacts.map((artefact) =>
                                  artefact.id === selectedArtefact.id
                                    ? { ...artefact, labelOverride: nextValue.length > 0 ? nextValue : undefined }
                                    : artefact,
                                ),
                              }));
                            }}
                            placeholder={text("config.map_designer.field.label_override_placeholder", "Enter visible label")}
                            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-primary)]"
                          />
                        </div>
                        <label className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)]">
                          <input
                            type="checkbox"
                            checked={selectedArtefact.visible !== false}
                            onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, visible: event.target.checked }))}
                          />
                          <span>{text("config.map_designer.field.visible_toggle", "Visible")}</span>
                        </label>
                        {(selectedArtefact.type === "room" || selectedArtefact.type === "zone") && selectedArtefact.geometry.kind === "rect" && (
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField label={text("config.map_designer.field.x", "X")} value={selectedArtefact.geometry.x} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, x: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.y", "Y")} value={selectedArtefact.geometry.y} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, y: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.width", "Width")} value={selectedArtefact.geometry.width} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, width: value } : geometry)} />
                            <NumberField label={text("config.map_designer.field.height", "Height")} value={selectedArtefact.geometry.height} onChange={(value) => updateSelectedGeometry((geometry) => geometry.kind === "rect" ? { ...geometry, height: value } : geometry)} />
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
                        {selectedArtefact.type === "door" && (
                          <div className="grid gap-2">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.wall_id", "Wall ID")}</p><input type="text" value={selectedArtefact.wallAttachment?.wallId ?? ""} onChange={(event) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: event.target.value, offset: artefact.wallAttachment?.offset ?? 0, width: artefact.wallAttachment?.width ?? 36 } }))} className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-text)]" /></div>
                            <div className="grid grid-cols-2 gap-2">
                              <NumberField label={text("config.map_designer.field.offset", "Offset")} value={selectedArtefact.wallAttachment?.offset ?? 0} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: artefact.wallAttachment?.wallId ?? "", offset: value, width: artefact.wallAttachment?.width ?? 36 } }))} />
                              <NumberField label={text("config.map_designer.field.width", "Width")} value={selectedArtefact.wallAttachment?.width ?? 36} onChange={(value) => updateArtefact(selectedArtefact.id, (artefact) => ({ ...artefact, wallAttachment: { wallId: artefact.wallAttachment?.wallId ?? "", offset: artefact.wallAttachment?.offset ?? 0, width: value } }))} />
                            </div>
                          </div>
                        )}
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
                        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">{text("config.map_designer.field.metadata", "Metadata")}</p><pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-3 text-xs text-[var(--app-text)]">{JSON.stringify(selectedArtefact.metadata ?? text("config.map_designer.metadata.none", "None"), null, 2)}</pre></div>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setDocumentModel((current) => ({ ...current, artefacts: current.artefacts.filter((artefact) => artefact.id !== selectedArtefact.id) })); setSelectedArtefactId(null); }} className="w-full rounded-xl border border-[var(--app-danger)] px-4 py-2 text-sm font-semibold text-[var(--app-danger)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)]">
                      {text("config.map_designer.properties.delete", "Delete Selected")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MapDesigner;
