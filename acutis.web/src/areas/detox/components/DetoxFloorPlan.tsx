"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  clampScale,
  createFitViewport,
  createWallPolygonPoints,
  getDocumentBounds,
  isLabelVisible,
  mergeCollinearWallArtefacts,
  resolveAttachedOpeningLine,
  zoomAroundPoint,
} from "@/areas/config/mapDesigner/geometry";
import { sampleDetoxReferenceMap } from "@/areas/config/mapDesigner/sampleMap";
import type { MapArtefact, MapGeometry, ViewportState } from "@/areas/config/mapDesigner/types";

function getArtefactLabel(artefact: MapArtefact, t: (key: string) => string) {
  if (artefact.labelOverride) return artefact.labelOverride;
  if (artefact.labelKey) {
    const localized = t(artefact.labelKey);
    if (localized !== artefact.labelKey) return localized;
  }
  return artefact.id;
}

function getAnchor(artefact: MapArtefact) {
  if (artefact.geometry.kind === "point") return { x: artefact.geometry.x, y: artefact.geometry.y };
  if (artefact.geometry.kind === "line") return { x: (artefact.geometry.x1 + artefact.geometry.x2) / 2, y: (artefact.geometry.y1 + artefact.geometry.y2) / 2 };
  if (artefact.geometry.kind === "polygon") {
    return {
      x: artefact.geometry.points.reduce((sum, point) => sum + point.x, 0) / artefact.geometry.points.length,
      y: artefact.geometry.points.reduce((sum, point) => sum + point.y, 0) / artefact.geometry.points.length,
    };
  }
  return { x: artefact.geometry.x + artefact.geometry.width / 2, y: artefact.geometry.y + artefact.geometry.height / 2 };
}

function renderArtefactShape(artefact: MapArtefact, displayGeometry?: MapGeometry) {
  const geometry = displayGeometry ?? artefact.geometry;

  if (geometry.kind === "rect") {
    const fill =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 12%, white)"
        : artefact.type === "stair"
          ? "color-mix(in srgb, var(--app-text-muted) 10%, white)"
          : "color-mix(in srgb, var(--app-surface-muted) 72%, white)";
    const stroke =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 55%, var(--app-border))"
        : artefact.type === "stair"
          ? "var(--app-text)"
          : "var(--app-border)";

    if (artefact.type === "stair") {
      const stepCount = Math.max(4, Math.floor(Math.max(geometry.width, geometry.height) / 18));
      const isVertical = geometry.height >= geometry.width;
      return (
        <>
          <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={3} fill={fill} stroke={stroke} strokeWidth={2} />
          {Array.from({ length: stepCount }).map((_, index) => {
            if (isVertical) {
              const y = geometry.y + (geometry.height / (stepCount + 1)) * (index + 1);
              return <line key={`step_${index}`} x1={geometry.x + 5} y1={y} x2={geometry.x + geometry.width - 5} y2={y} stroke="var(--app-text-muted)" strokeWidth={2} />;
            }

            const x = geometry.x + (geometry.width / (stepCount + 1)) * (index + 1);
            return <line key={`step_${index}`} x1={x} y1={geometry.y + 5} x2={x} y2={geometry.y + geometry.height - 5} stroke="var(--app-text-muted)" strokeWidth={2} />;
          })}
        </>
      );
    }

    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={artefact.type === "zone" ? 0 : 4} fill={fill} stroke={stroke} strokeWidth={2} />;
  }

  if (geometry.kind === "polygon") {
    return <polygon points={geometry.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="color-mix(in srgb, var(--app-warning) 12%, white)" stroke="var(--app-border)" strokeWidth={2} />;
  }

  if (geometry.kind === "line") {
    if (artefact.type === "wall") return <polygon points={createWallPolygonPoints(geometry)} fill="var(--app-text)" />;
    if (artefact.type === "partition") return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="var(--app-text-muted)" strokeWidth={geometry.thickness ?? 6} strokeDasharray="10 6" strokeLinecap="round" />;
    if (artefact.type === "window") {
      return (
        <>
          <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 6} strokeLinecap="round" />
          <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="var(--app-primary)" strokeWidth={4} strokeLinecap="round" />
        </>
      );
    }
    if (artefact.type === "door") {
      return (
        <>
          <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="color-mix(in srgb, var(--app-canvas,#eef4fb) 100%, white)" strokeWidth={(geometry.thickness ?? 8) + 8} strokeLinecap="round" />
          <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="var(--app-accent)" strokeWidth={geometry.thickness ?? 8} strokeLinecap="round" />
        </>
      );
    }
    return <line x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2} stroke="var(--app-text)" strokeWidth={geometry.thickness ?? 8} strokeLinecap="round" />;
  }

  const size = geometry.size ?? 20;
  const radius = size / 2;
  if (artefact.type === "exit" || artefact.type === "fireExit") {
    const fill = artefact.type === "fireExit" ? "var(--app-danger)" : "var(--app-success)";
    return (
      <>
        <circle cx={geometry.x} cy={geometry.y} r={radius} fill={fill} stroke="white" strokeWidth={2} />
        <path d={`M ${geometry.x - 4} ${geometry.y + 5} L ${geometry.x + 6} ${geometry.y} L ${geometry.x - 4} ${geometry.y - 5}`} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  if (artefact.type === "roundel") return <circle cx={geometry.x} cy={geometry.y} r={radius} fill="white" stroke="var(--app-border)" strokeWidth={2} />;
  return <circle cx={geometry.x} cy={geometry.y} r={radius} fill="var(--app-primary)" />;
}

export default function DetoxFloorPlan() {
  const { loadKeys, t } = useLocalization();
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, panX: 32, panY: 32 });
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedViewportRef = useRef(false);

  useEffect(() => {
    void loadKeys([
      "room_assignments.zoom_out",
      "room_assignments.zoom_in",
      "config.map_designer.labels.show",
      "config.map_designer.labels.hide",
      "config.map_designer.zoom.fit",
      "config.map_designer.zoom.reset",
    ]);
  }, [loadKeys]);

  const documentBounds = useMemo(
    () => getDocumentBounds(sampleDetoxReferenceMap.artefacts, sampleDetoxReferenceMap.world.width, sampleDetoxReferenceMap.world.height),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextSurfaceSize = { width: entry.contentRect.width, height: entry.contentRect.height };
      setSurfaceSize(nextSurfaceSize);
      if (!hasInitializedViewportRef.current && nextSurfaceSize.width > 0 && nextSurfaceSize.height > 0) {
        setViewport(createFitViewport(documentBounds, nextSurfaceSize.width, nextSurfaceSize.height));
        hasInitializedViewportRef.current = true;
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [documentBounds]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const walls = useMemo(() => sampleDetoxReferenceMap.artefacts.filter((artefact) => artefact.type === "wall"), []);
  const wallsById = useMemo(() => new Map(walls.map((wall) => [wall.id, wall])), [walls]);
  const mergedWallGeometries = useMemo(() => mergeCollinearWallArtefacts(walls), [walls]);
  const nonWallArtefacts = useMemo(() => sampleDetoxReferenceMap.artefacts.filter((artefact) => artefact.type !== "wall" && artefact.visible !== false), []);

  const resetView = () => setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
  const zoomByFactor = (factor: number) => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) return;
    setViewport((current) => zoomAroundPoint(current, surfaceSize.width / 2, surfaceSize.height / 2, clampScale(current.scale * factor)));
  };

  return (
    <div className="app-card rounded-xl p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Detox Room Map</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Structured SVG map rendered from the new detox spatial model.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setLabelsVisible((current) => !current)} className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition">
            {labelsVisible ? text("config.map_designer.labels.hide", "Hide Labels") : text("config.map_designer.labels.show", "Show Labels")}
          </button>
          <button type="button" onClick={() => zoomByFactor(0.9)} className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => zoomByFactor(1.1)} className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition">
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={resetView} className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition">
            {text("config.map_designer.zoom.fit", "Fit")}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="h-[82vh] min-h-[760px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)]">
        <svg ref={surfaceRef} className="h-full w-full">
          <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
          <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`}>
            <rect x={0} y={0} width={sampleDetoxReferenceMap.world.width} height={sampleDetoxReferenceMap.world.height} fill="color-mix(in srgb, var(--app-surface-muted) 35%, white)" />
            {mergedWallGeometries.map((geometry, index) => (
              <polygon key={`merged_wall_${index}`} points={createWallPolygonPoints(geometry)} fill="var(--app-text)" />
            ))}
            {nonWallArtefacts.map((artefact) => {
              const displayGeometry = artefact.type === "door" || artefact.type === "window" ? resolveAttachedOpeningLine(artefact, wallsById) ?? artefact.geometry : artefact.geometry;
              return <g key={artefact.id}>{renderArtefactShape(artefact, displayGeometry)}</g>;
            })}
            {labelsVisible &&
              sampleDetoxReferenceMap.artefacts
                .filter((artefact) => artefact.visible !== false)
                .filter((artefact) => isLabelVisible(viewport.scale, artefact.type))
                .map((artefact) => {
                  if (!artefact.labelKey && !artefact.labelOverride) return null;
                  const anchor =
                    artefact.type === "door" || artefact.type === "window"
                      ? getAnchor({ ...artefact, geometry: resolveAttachedOpeningLine(artefact, wallsById) ?? artefact.geometry })
                      : getAnchor(artefact);
                  return (
                    <text key={`${artefact.id}_label`} x={anchor.x} y={anchor.y} textAnchor="middle" dominantBaseline="middle" fill="var(--app-text)" fontSize={artefact.type === "exit" || artefact.type === "fireExit" ? 15 : 17} fontWeight={artefact.type === "label" ? 700 : 600}>
                      {getArtefactLabel(artefact, t)}
                    </text>
                  );
                })}
          </g>
        </svg>
      </div>
    </div>
  );
}
