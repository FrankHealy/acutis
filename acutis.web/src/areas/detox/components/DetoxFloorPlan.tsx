"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, User } from "lucide-react";
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
import type { RoomAssignmentOccupant, UnitRoomAssignment } from "@/services/operationsService";

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

function getRoomCodeForArtefact(artefact: MapArtefact) {
  const label = artefact.labelOverride?.trim();
  if (label && /^\d+$/.test(label)) {
    return label;
  }

  const roomMatch = artefact.id.match(/^room_(\d+)$/i);
  return roomMatch?.[1] ?? null;
}

function renderArtefactShape(
  artefact: MapArtefact,
  displayGeometry?: MapGeometry,
  options?: { emphasize?: boolean },
) {
  const geometry = displayGeometry ?? artefact.geometry;
  const emphasizedStroke = options?.emphasize ? "var(--app-primary)" : undefined;
  const emphasizedStrokeWidth = options?.emphasize ? 3 : 2;

  if (geometry.kind === "rect") {
    const fill =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 12%, white)"
        : artefact.type === "stair"
          ? "color-mix(in srgb, var(--app-text-muted) 10%, white)"
          : artefact.type === "room" && options?.emphasize
            ? "color-mix(in srgb, var(--app-primary) 12%, white)"
            : "color-mix(in srgb, var(--app-surface-muted) 72%, white)";
    const stroke =
      artefact.type === "zone"
        ? "color-mix(in srgb, var(--app-success) 55%, var(--app-border))"
        : artefact.type === "stair"
          ? "var(--app-text)"
          : emphasizedStroke ?? "var(--app-border)";

    if (artefact.type === "stair") {
      const stepCount = Math.max(4, Math.floor(Math.max(geometry.width, geometry.height) / 18));
      const isVertical = geometry.height >= geometry.width;
      return (
        <>
          <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={3} fill={fill} stroke={stroke} strokeWidth={emphasizedStrokeWidth} />
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

    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={artefact.type === "zone" ? 0 : 4} fill={fill} stroke={stroke} strokeWidth={emphasizedStrokeWidth} />;
  }

  if (geometry.kind === "polygon") {
    return <polygon points={geometry.points.map((point) => `${point.x},${point.y}`).join(" ")} fill={artefact.type === "room" && options?.emphasize ? "color-mix(in srgb, var(--app-primary) 12%, white)" : "color-mix(in srgb, var(--app-warning) 12%, white)"} stroke={emphasizedStroke ?? "var(--app-border)"} strokeWidth={emphasizedStrokeWidth} />;
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

type DetoxFloorPlanProps = {
  title?: string;
  description?: string;
  heightClassName?: string;
  roomAssignments?: UnitRoomAssignment[];
  bedAssignments?: Record<string, RoomAssignmentOccupant | null | undefined>;
  selectedBedCode?: string | null;
  selectableBedCodes?: string[];
  onBedSelect?: (bedCode: string) => void;
};

export default function DetoxFloorPlan({
  title = "Detox Room Map",
  description = "Structured SVG map rendered from the new detox spatial model.",
  heightClassName = "h-[82vh] min-h-[760px]",
  roomAssignments,
  bedAssignments,
  selectedBedCode,
  selectableBedCodes,
  onBedSelect,
}: DetoxFloorPlanProps = {}) {
  const { loadKeys, t } = useLocalization();
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, panX: 32, panY: 32 });
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
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
  const nonWallArtefacts = useMemo(() => sampleDetoxReferenceMap.artefacts.filter((artefact) => artefact.type !== "wall" && artefact.type !== "roundel" && artefact.visible !== false), []);
  const roomArtefacts = useMemo(() => sampleDetoxReferenceMap.artefacts.filter((artefact) => artefact.type === "room" && artefact.visible !== false), []);
  const roundels = useMemo(() => sampleDetoxReferenceMap.artefacts.filter((artefact) => artefact.type === "roundel" && artefact.visible !== false), []);
  const selectableBedCodeSet = useMemo(() => new Set(selectableBedCodes ?? []), [selectableBedCodes]);
  const roundelAssignments = useMemo(() => new Map(Object.entries(bedAssignments ?? {})), [bedAssignments]);

  const derivedRoomAssignments = useMemo<UnitRoomAssignment[]>(() => {
    if (roomAssignments?.length) {
      return roomAssignments;
    }

    if (!bedAssignments) {
      return [];
    }

    const parentRoomById = new Map(roomArtefacts.map((artefact) => [artefact.id, artefact]));
    const occupantsByRoomCode = new Map<string, RoomAssignmentOccupant[]>();

    roundels.forEach((artefact) => {
      const occupant = bedAssignments[artefact.id];
      if (!occupant || !artefact.parentId) {
        return;
      }

      const parentRoom = parentRoomById.get(artefact.parentId);
      if (!parentRoom) {
        return;
      }

      const roomCode = getRoomCodeForArtefact(parentRoom);
      if (!roomCode) {
        return;
      }

      const current = occupantsByRoomCode.get(roomCode) ?? [];
      occupantsByRoomCode.set(roomCode, [...current, occupant]);
    });

    return Array.from(occupantsByRoomCode.entries()).map(([roomCode, occupants]) => ({
      roomCode,
      storageRoomCode: roomCode,
      capacity: occupants.length,
      occupants,
      beds: [],
    }));
  }, [bedAssignments, roomArtefacts, roomAssignments, roundels]);

  const roomAssignmentByCode = useMemo(
    () => new Map(derivedRoomAssignments.map((assignment) => [assignment.roomCode.trim().toLowerCase(), assignment])),
    [derivedRoomAssignments],
  );

  const hoveredRoom = useMemo(() => {
    if (!hoveredRoomId) {
      return null;
    }

    const artefact = roomArtefacts.find((item) => item.id === hoveredRoomId);
    if (!artefact) {
      return null;
    }

    const roomCode = getRoomCodeForArtefact(artefact);
    if (!roomCode) {
      return null;
    }

    const roomAssignment = roomAssignmentByCode.get(roomCode.trim().toLowerCase());
    const anchor = getAnchor(artefact);

    return {
      label: getArtefactLabel(artefact, t),
      roomCode,
      occupants: roomAssignment?.occupants ?? [],
      anchorX: anchor.x * viewport.scale + viewport.panX,
      anchorY: anchor.y * viewport.scale + viewport.panY,
    };
  }, [hoveredRoomId, roomArtefacts, roomAssignmentByCode, t, viewport.panX, viewport.panY, viewport.scale]);

  const resetView = () => setViewport(createFitViewport(documentBounds, surfaceSize.width, surfaceSize.height));
  const zoomByFactor = (factor: number) => {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) return;
    setViewport((current) => zoomAroundPoint(current, surfaceSize.width / 2, surfaceSize.height / 2, clampScale(current.scale * factor)));
  };

  return (
    <div className="app-card rounded-xl p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">{title}</h2>
          <p className="text-sm text-[var(--app-text-muted)]">{description}</p>
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

      <div ref={containerRef} className={`relative ${heightClassName} overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-canvas,#eef4fb)]`}>
        <svg ref={surfaceRef} className="h-full w-full">
          <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
          <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`}>
            <rect x={0} y={0} width={sampleDetoxReferenceMap.world.width} height={sampleDetoxReferenceMap.world.height} fill="color-mix(in srgb, var(--app-surface-muted) 35%, white)" />
            {mergedWallGeometries.map((geometry, index) => (
              <polygon key={`merged_wall_${index}`} points={createWallPolygonPoints(geometry)} fill="var(--app-text)" />
            ))}
            {nonWallArtefacts.map((artefact) => {
              const displayGeometry = artefact.type === "door" || artefact.type === "window" ? resolveAttachedOpeningLine(artefact, wallsById) ?? artefact.geometry : artefact.geometry;
              const roomCode = artefact.type === "room" ? getRoomCodeForArtefact(artefact) : null;

              return (
                <g
                  key={artefact.id}
                  onMouseEnter={roomCode ? () => setHoveredRoomId(artefact.id) : undefined}
                  onMouseLeave={roomCode ? () => setHoveredRoomId((current) => (current === artefact.id ? null : current)) : undefined}
                >
                  {renderArtefactShape(artefact, displayGeometry, artefact.type === "room" ? { emphasize: hoveredRoomId === artefact.id } : undefined)}
                </g>
              );
            })}
            {roundels.map((artefact) => {
              if (artefact.geometry.kind !== "point") {
                return null;
              }

              const occupant = roundelAssignments.get(artefact.id) ?? null;
              const isSelected = selectedBedCode === artefact.id;
              const isSelectable = selectableBedCodeSet.size === 0 || selectableBedCodeSet.has(artefact.id);
              const radius = (artefact.geometry.size ?? 20) / 2;
              const fill = occupant
                ? "color-mix(in srgb, var(--app-danger) 16%, white)"
                : isSelected
                  ? "color-mix(in srgb, var(--app-primary) 18%, white)"
                  : isSelectable
                    ? "color-mix(in srgb, var(--app-success) 16%, white)"
                    : "white";
              const stroke = occupant
                ? "var(--app-danger)"
                : isSelected
                  ? "var(--app-primary)"
                  : isSelectable
                    ? "var(--app-success)"
                    : "var(--app-border)";

              return (
                <g
                  key={artefact.id}
                  onClick={isSelectable && onBedSelect ? () => onBedSelect(artefact.id) : undefined}
                  className={isSelectable && onBedSelect ? "cursor-pointer" : undefined}
                >
                  <circle cx={artefact.geometry.x} cy={artefact.geometry.y} r={radius} fill={fill} stroke={stroke} strokeWidth={isSelected ? 4 : 2} />
                  {occupant ? (
                    <text
                      x={artefact.geometry.x}
                      y={artefact.geometry.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--app-text)"
                      fontSize={12}
                      fontWeight={700}
                    >
                      {occupant.initials}
                    </text>
                  ) : null}
                </g>
              );
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
        {hoveredRoom ? (
          <div
            className="pointer-events-none absolute z-20 w-72 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"
            style={{
              left: `${Math.min(Math.max(hoveredRoom.anchorX + 18, 12), Math.max(surfaceSize.width - 300, 12))}px`,
              top: `${Math.min(Math.max(hoveredRoom.anchorY - 18, 12), Math.max(surfaceSize.height - 180, 12))}px`,
            }}
          >
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Room</p>
              <p className="text-sm font-semibold text-slate-900">{hoveredRoom.label}</p>
            </div>
            {hoveredRoom.occupants.length === 0 ? (
              <p className="text-sm text-slate-600">Vacant</p>
            ) : (
              <div className="space-y-3">
                {hoveredRoom.occupants.map((occupant) => (
                  <div key={`${hoveredRoom.roomCode}-${occupant.episodeId}-${occupant.bedCode ?? occupant.residentGuid}`} className="flex items-start gap-3">
                    {occupant.photoUrl ? (
                      <img
                        src={occupant.photoUrl}
                        alt={`${occupant.firstName} ${occupant.surname}`}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-2 ring-slate-100">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{occupant.firstName} {occupant.surname}</p>
                      <p className="text-xs text-slate-600">Week {occupant.weekNumber || "-"}</p>
                      <p className="text-xs text-slate-600">OT Role: {occupant.otRole?.trim() ? occupant.otRole : "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
