"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleDot,
  DoorOpen,
  Hand,
  Info,
  Map as MapIcon,
  MapPinned,
  Minus,
  MousePointer2,
  PanelRightOpen,
  Plus,
  ShieldAlert,
  Square,
  Type,
} from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  clampScale,
  createFitViewport,
  createWallPolygonPoints,
  getDocumentBounds,
  isLabelVisible,
  zoomAroundPoint,
} from "@/areas/config/mapDesigner/geometry";
import { sampleDetoxReferenceMap } from "@/areas/config/mapDesigner/sampleMap";
import type { MapArtefact, MapDocument, MapTool, ViewportState } from "@/areas/config/mapDesigner/types";

type PointerDragState =
  | {
      kind: "pan";
      originClientX: number;
      originClientY: number;
      originPanX: number;
      originPanY: number;
    }
  | null;

const TOOL_ORDER: Array<{ id: MapTool; icon: React.ComponentType<{ className?: string }>; fallbackLabel: string }> = [
  { id: "select", icon: MousePointer2, fallbackLabel: "Select" },
  { id: "pan", icon: Hand, fallbackLabel: "Pan" },
  { id: "room", icon: Square, fallbackLabel: "Room" },
  { id: "wall", icon: PanelRightOpen, fallbackLabel: "Wall" },
  { id: "door", icon: DoorOpen, fallbackLabel: "Door" },
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
  door: "config.map_designer.tool.door",
  exit: "config.map_designer.tool.exit",
  fireExit: "config.map_designer.tool.fire_exit",
  roundel: "config.map_designer.tool.roundel",
  label: "config.map_designer.tool.label",
};

function getArtefactDisplayLabel(artefact: MapArtefact, t: (key: string) => string): string {
  if (artefact.labelOverride) {
    return artefact.labelOverride;
  }

  if (artefact.labelKey) {
    const localized = t(artefact.labelKey);
    if (localized !== artefact.labelKey) {
      return localized;
    }
  }

  return artefact.id;
}

function renderArtefactShape(
  artefact: MapArtefact,
  selected: boolean,
  onSelect: (event: React.MouseEvent<SVGGElement>) => void,
): React.ReactNode {
  const selectionStroke = "var(--app-primary)";
  const selectionFill = "color-mix(in srgb, var(--app-primary) 14%, transparent)";

  if (artefact.geometry.kind === "rect") {
    const baseFill =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 12%, white)"
        : "color-mix(in srgb, var(--app-surface-muted) 72%, white)";
    const stroke =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 55%, var(--app-border))"
        : "var(--app-border)";

    return (
      <g onClick={onSelect} className="cursor-pointer">
        <rect
          x={artefact.geometry.x}
          y={artefact.geometry.y}
          width={artefact.geometry.width}
          height={artefact.geometry.height}
          rx={artefact.type === "zone" ? 0 : 4}
          fill={selected ? selectionFill : baseFill}
          stroke={selected ? selectionStroke : stroke}
          strokeWidth={selected ? 4 : 2}
        />
      </g>
    );
  }

  if (artefact.geometry.kind === "polygon") {
    const points = artefact.geometry.points.map((point) => `${point.x},${point.y}`).join(" ");

    return (
      <g onClick={onSelect} className="cursor-pointer">
        <polygon
          points={points}
          fill={selected ? selectionFill : "color-mix(in srgb, var(--app-warning) 12%, white)"}
          stroke={selected ? selectionStroke : "var(--app-border)"}
          strokeWidth={selected ? 4 : 2}
        />
      </g>
    );
  }

  if (artefact.geometry.kind === "line") {
    if (artefact.type === "wall") {
      return (
        <g onClick={onSelect} className="cursor-pointer">
          <polygon
            points={createWallPolygonPoints(artefact.geometry)}
            fill={selected ? selectionStroke : "var(--app-text)"}
          />
        </g>
      );
    }

    return (
      <g onClick={onSelect} className="cursor-pointer">
        <line
          x1={artefact.geometry.x1}
          y1={artefact.geometry.y1}
          x2={artefact.geometry.x2}
          y2={artefact.geometry.y2}
          stroke={
            artefact.type === "door"
              ? selected
                ? selectionStroke
                : "var(--app-accent)"
              : selected
                ? selectionStroke
                : "var(--app-text)"
          }
          strokeWidth={selected ? 6 : artefact.geometry.thickness ?? 8}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const size = artefact.geometry.size ?? 20;
  const radius = size / 2;

  if (artefact.type === "exit" || artefact.type === "fireExit") {
    const fill = artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)";
    return (
      <g onClick={onSelect} className="cursor-pointer">
        <circle
          cx={artefact.geometry.x}
          cy={artefact.geometry.y}
          r={radius}
          fill={selected ? selectionStroke : fill}
          stroke="white"
          strokeWidth={2}
        />
        <path
          d={`M ${artefact.geometry.x - 4} ${artefact.geometry.y + 5} L ${artefact.geometry.x + 6} ${artefact.geometry.y} L ${artefact.geometry.x - 4} ${artefact.geometry.y - 5}`}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }

  if (artefact.type === "roundel") {
    return (
      <g onClick={onSelect} className="cursor-pointer">
        <circle
          cx={artefact.geometry.x}
          cy={artefact.geometry.y}
          r={radius}
          fill="white"
          stroke={selected ? selectionStroke : "var(--app-border)"}
          strokeWidth={selected ? 4 : 2}
        />
      </g>
    );
  }

  return (
    <g onClick={onSelect} className="cursor-pointer">
      <circle
        cx={artefact.geometry.x}
        cy={artefact.geometry.y}
        r={selected ? radius + 2 : radius}
        fill={selected ? selectionStroke : "var(--app-primary)"}
      />
    </g>
  );
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
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadKeys([
      "config.map_designer.title",
      "config.map_designer.description",
      "config.map_designer.back",
      "config.map_designer.labels.show",
      "config.map_designer.labels.hide",
      "config.map_designer.zoom.fit",
      "config.map_designer.zoom.reset",
      "config.map_designer.toolbox.title",
      "config.map_designer.properties.title",
      "config.map_designer.properties.empty",
      "config.map_designer.properties.delete",
      "config.map_designer.surface_hint",
      "config.map_designer.selection.none",
      "config.map_designer.selection.selected",
      "config.map_designer.metadata.none",
      "config.map_designer.phase2_notice",
      "config.map_designer.field.id",
      "config.map_designer.field.type",
      "config.map_designer.field.label_key",
      "config.map_designer.field.label_override",
      "config.map_designer.field.visible",
      "config.map_designer.field.geometry",
      "config.map_designer.field.metadata",
      "config.map_designer.field.active_tool",
      ...Object.values(TOOL_LABEL_KEYS),
    ]);
  }, [loadKeys]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setSurfaceSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const documentBounds = useMemo(
    () => getDocumentBounds(documentModel.artefacts, documentModel.world.width, documentModel.world.height),
    [documentModel],
  );

  useEffect(() => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0 || hasInitializedViewport) {
      return;
    }

    setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
    setHasInitializedViewport(true);
  }, [documentBounds, hasInitializedViewport, surfaceSize.height, surfaceSize.width]);

  const selectedArtefact = useMemo(
    () => documentModel.artefacts.find((artefact) => artefact.id === selectedArtefactId) ?? null,
    [documentModel.artefacts, selectedArtefactId],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" || !selectedArtefactId) {
        return;
      }

      event.preventDefault();
      setDocumentModel((current) => ({
        ...current,
        artefacts: current.artefacts.filter((artefact) => artefact.id !== selectedArtefactId),
      }));
      setSelectedArtefactId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArtefactId]);

  const resetView = () => {
    setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
  };

  const zoomByFactor = (factor: number) => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) {
      return;
    }

    setViewport((current) =>
      zoomAroundPoint(current, surfaceSize.width / 2, surfaceSize.height / 2, clampScale(current.scale * factor)),
    );
  };

  const handleSurfacePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!surfaceRef.current) {
      return;
    }

    if (activeTool === "pan" || event.button === 1) {
      setDragState({
        kind: "pan",
        originClientX: event.clientX,
        originClientY: event.clientY,
        originPanX: viewport.panX,
        originPanY: viewport.panY,
      });
      surfaceRef.current.setPointerCapture(event.pointerId);
      return;
    }

    const target = event.target as Element;
    if (target.closest("[data-artefact-id]")) {
      return;
    }

    setSelectedArtefactId(null);
  };

  const handleSurfacePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState || dragState.kind !== "pan") {
      return;
    }

    setViewport((current) => ({
      ...current,
      panX: dragState.originPanX + (event.clientX - dragState.originClientX),
      panY: dragState.originPanY + (event.clientY - dragState.originClientY),
    }));
  };

  const handleSurfacePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragState && surfaceRef.current?.hasPointerCapture(event.pointerId)) {
      surfaceRef.current.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();

    const svgRect = surfaceRef.current?.getBoundingClientRect();
    if (!svgRect) {
      return;
    }

    const factor = event.deltaY < 0 ? 1.1 : 0.92;
    const screenX = event.clientX - svgRect.left;
    const screenY = event.clientY - svgRect.top;
    setViewport((current) => zoomAroundPoint(current, screenX, screenY, current.scale * factor));
  };

  const renderOrderedArtefacts = useMemo(() => {
    const groups: Record<MapArtefact["type"], MapArtefact[]> = {
      zone: [],
      room: [],
      wall: [],
      door: [],
      exit: [],
      fireExit: [],
      roundel: [],
      label: [],
    };

    documentModel.artefacts.forEach((artefact) => {
      if (artefact.visible === false) {
        return;
      }

      groups[artefact.type].push(artefact);
    });

    return [
      ...groups.zone,
      ...groups.room,
      ...groups.wall,
      ...groups.door,
      ...groups.exit,
      ...groups.fireExit,
      ...groups.roundel,
      ...groups.label,
    ];
  }, [documentModel.artefacts]);

  return (
    <div className="app-page-shell">
      <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push("/units/config")}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{text("config.map_designer.back", "Back to Configuration")}</span>
          </button>
          <div className="flex items-center gap-3">
            <MapIcon className="h-7 w-7 text-[var(--app-primary)]" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--app-text)]">
                {text("config.map_designer.title", "Map Designer")}
              </h1>
              <p className="text-[var(--app-text-muted)]">
                {text(
                  "config.map_designer.description",
                  "Internal SVG map editor MVP using structured world-coordinate artefacts.",
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <section className="app-card rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
              {text("config.map_designer.toolbox.title", "Toolbox")}
            </h2>
            <div className="grid gap-2">
              {TOOL_ORDER.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                const isImplemented = tool.id === "select" || tool.id === "pan";

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                        : "border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{text(TOOL_LABEL_KEYS[tool.id], tool.fallbackLabel)}</span>
                    </span>
                    {!isImplemented && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        P3
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="app-card rounded-2xl p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--app-text)]">{documentModel.name}</p>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {text(
                    "config.map_designer.surface_hint",
                    "Phase 1/2: render, pan, zoom, select, delete, and global label visibility.",
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLabelsVisible((current) => !current)}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                >
                  {labelsVisible
                    ? text("config.map_designer.labels.hide", "Hide Labels")
                    : text("config.map_designer.labels.show", "Show Labels")}
                </button>
                <button
                  type="button"
                  onClick={() => zoomByFactor(0.9)}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomByFactor(1.1)}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                >
                  {text("config.map_designer.zoom.fit", "Fit")}
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                >
                  {text("config.map_designer.zoom.reset", "Reset")}
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="h-[760px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)]"
            >
              <svg
                ref={surfaceRef}
                className={`h-full w-full ${activeTool === "pan" ? "cursor-grab" : "cursor-default"}`}
                onPointerDown={handleSurfacePointerDown}
                onPointerMove={handleSurfacePointerMove}
                onPointerUp={handleSurfacePointerUp}
                onPointerLeave={handleSurfacePointerUp}
                onWheel={handleWheel}
              >
                <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
                <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`}>
                  <rect
                    x={0}
                    y={0}
                    width={documentModel.world.width}
                    height={documentModel.world.height}
                    fill="color-mix(in srgb, var(--app-surface-muted) 35%, white)"
                  />

                  {renderOrderedArtefacts.map((artefact) => (
                    <g key={artefact.id} data-artefact-id={artefact.id}>
                      {renderArtefactShape(artefact, artefact.id === selectedArtefactId, (event) => {
                        event.stopPropagation();
                        setSelectedArtefactId(artefact.id);
                      })}
                    </g>
                  ))}

                  {labelsVisible &&
                    renderOrderedArtefacts
                      .filter((artefact) => isLabelVisible(viewport.scale, artefact.type))
                      .map((artefact) => {
                        if (!artefact.labelKey && !artefact.labelOverride) {
                          return null;
                        }

                        const label = getArtefactDisplayLabel(artefact, t);
                        const anchor =
                          artefact.geometry.kind === "point"
                            ? { x: artefact.geometry.x, y: artefact.geometry.y }
                            : artefact.geometry.kind === "line"
                              ? {
                                  x: (artefact.geometry.x1 + artefact.geometry.x2) / 2,
                                  y: (artefact.geometry.y1 + artefact.geometry.y2) / 2,
                                }
                              : artefact.geometry.kind === "polygon"
                                ? {
                                    x:
                                      artefact.geometry.points.reduce((sum, point) => sum + point.x, 0) /
                                      artefact.geometry.points.length,
                                    y:
                                      artefact.geometry.points.reduce((sum, point) => sum + point.y, 0) /
                                      artefact.geometry.points.length,
                                  }
                                : {
                                    x: artefact.geometry.x + artefact.geometry.width / 2,
                                    y: artefact.geometry.y + artefact.geometry.height / 2,
                                  };

                        return (
                          <text
                            key={`${artefact.id}_label`}
                            x={anchor.x}
                            y={anchor.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--app-text)"
                            fontSize={artefact.type === "exit" || artefact.type === "fireExit" ? 15 : 17}
                            fontWeight={artefact.type === "label" ? 700 : 600}
                            pointerEvents="none"
                          >
                            {label}
                          </text>
                        );
                      })}
                </g>
              </svg>
            </div>
          </section>

          <aside className="app-card rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
              {text("config.map_designer.properties.title", "Properties")}
            </h2>

            {!selectedArtefact ? (
              <div className="rounded-xl border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
                {text("config.map_designer.properties.empty", "Select an artefact to inspect its basic properties.")}
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                  <div className="grid gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.id", "ID")}
                      </p>
                      <p className="mt-1 font-mono text-[var(--app-text)]">{selectedArtefact.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.type", "Type")}
                      </p>
                      <p className="mt-1 text-[var(--app-text)]">{selectedArtefact.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.label_key", "Label Key")}
                      </p>
                      <p className="mt-1 break-all text-[var(--app-text)]">{selectedArtefact.labelKey ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.label_override", "Label Override")}
                      </p>
                      <p className="mt-1 break-all text-[var(--app-text)]">{selectedArtefact.labelOverride ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.visible", "Visible")}
                      </p>
                      <p className="mt-1 text-[var(--app-text)]">{selectedArtefact.visible === false ? "false" : "true"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.geometry", "Geometry")}
                      </p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-3 text-xs text-[var(--app-text)]">
                        {JSON.stringify(selectedArtefact.geometry, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        {text("config.map_designer.field.metadata", "Metadata")}
                      </p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--app-surface-muted)] p-3 text-xs text-[var(--app-text)]">
                        {JSON.stringify(selectedArtefact.metadata ?? text("config.map_designer.metadata.none", "None"), null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDocumentModel((current) => ({
                      ...current,
                      artefacts: current.artefacts.filter((artefact) => artefact.id !== selectedArtefact.id),
                    }));
                    setSelectedArtefactId(null);
                  }}
                  className="w-full rounded-xl border border-[var(--app-danger)] px-4 py-2 text-sm font-semibold text-[var(--app-danger)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)]"
                >
                  {text("config.map_designer.properties.delete", "Delete Selected")}
                </button>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm text-[var(--app-text-muted)]">
              <div className="mb-2 flex items-center gap-2 font-semibold text-[var(--app-text)]">
                <Info className="h-4 w-4" />
                <span>{text("config.map_designer.phase2_notice", "Phase 2 status")}</span>
              </div>
              <p>
                {text("config.map_designer.field.active_tool", "Active tool")}:{" "}
                <span className="font-semibold text-[var(--app-text)]">{text(TOOL_LABEL_KEYS[activeTool], activeTool)}</span>
              </p>
              <p className="mt-2">
                {selectedArtefact
                  ? `${text("config.map_designer.selection.selected", "Selected")}: ${selectedArtefact.id}`
                  : text("config.map_designer.selection.none", "No artefact selected.")}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MapDesigner;
