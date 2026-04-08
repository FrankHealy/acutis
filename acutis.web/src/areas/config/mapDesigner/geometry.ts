import type { MapArtefact, MapGeometry, ViewportState, WorldBounds } from "@/areas/config/mapDesigner/types";

const DEFAULT_PADDING = 48;

function getRectCenter(geometry: Extract<MapGeometry, { kind: "rect" }>) {
  return {
    x: geometry.x + geometry.width / 2,
    y: geometry.y + geometry.height / 2,
  };
}

function getRotatedRectPoints(geometry: Extract<MapGeometry, { kind: "rect" }>) {
  const rotation = geometry.rotation ?? 0;
  const center = getRectCenter(geometry);
  const corners = [
    { x: geometry.x, y: geometry.y },
    { x: geometry.x + geometry.width, y: geometry.y },
    { x: geometry.x + geometry.width, y: geometry.y + geometry.height },
    { x: geometry.x, y: geometry.y + geometry.height },
  ];

  if (!rotation) {
    return corners;
  }

  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return corners.map((corner) => {
    const dx = corner.x - center.x;
    const dy = corner.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  });
}

export function getGeometryBounds(geometry: MapGeometry): WorldBounds {
  if (geometry.kind === "rect") {
    if (geometry.rotation) {
      const points = getRotatedRectPoints(geometry);
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }
    return {
      minX: geometry.x,
      minY: geometry.y,
      maxX: geometry.x + geometry.width,
      maxY: geometry.y + geometry.height,
      width: geometry.width,
      height: geometry.height,
    };
  }

  if (geometry.kind === "point") {
    const size = geometry.size ?? 18;
    const radius = size / 2;
    return {
      minX: geometry.x - radius,
      minY: geometry.y - radius,
      maxX: geometry.x + radius,
      maxY: geometry.y + radius,
      width: size,
      height: size,
    };
  }

  if (geometry.kind === "line") {
    const thickness = geometry.thickness ?? 12;
    const half = thickness / 2;
    return {
      minX: Math.min(geometry.x1, geometry.x2) - half,
      minY: Math.min(geometry.y1, geometry.y2) - half,
      maxX: Math.max(geometry.x1, geometry.x2) + half,
      maxY: Math.max(geometry.y1, geometry.y2) + half,
      width: Math.abs(geometry.x2 - geometry.x1) + thickness,
      height: Math.abs(geometry.y2 - geometry.y1) + thickness,
    };
  }

  const xs = geometry.points.map((point) => point.x);
  const ys = geometry.points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getDocumentBounds(artefacts: MapArtefact[], worldWidth: number, worldHeight: number): WorldBounds {
  if (artefacts.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: worldWidth,
      maxY: worldHeight,
      width: worldWidth,
      height: worldHeight,
    };
  }

  const bounds = artefacts
    .filter((artefact) => artefact.visible !== false)
    .map((artefact) => getGeometryBounds(artefact.geometry));

  const minX = Math.min(...bounds.map((bound) => bound.minX), 0);
  const minY = Math.min(...bounds.map((bound) => bound.minY), 0);
  const maxX = Math.max(...bounds.map((bound) => bound.maxX), worldWidth);
  const maxY = Math.max(...bounds.map((bound) => bound.maxY), worldHeight);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function createFitViewport(
  bounds: WorldBounds,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = DEFAULT_PADDING,
): ViewportState {
  if (viewportWidth <= 0 || viewportHeight <= 0 || bounds.width <= 0 || bounds.height <= 0) {
    return {
      scale: 1,
      panX: padding,
      panY: padding,
    };
  }

  const scaleX = (viewportWidth - padding * 2) / bounds.width;
  const scaleY = (viewportHeight - padding * 2) / bounds.height;
  const scale = Math.max(0.1, Math.min(scaleX, scaleY));
  const contentWidth = bounds.width * scale;
  const contentHeight = bounds.height * scale;

  return {
    scale,
    panX: (viewportWidth - contentWidth) / 2 - bounds.minX * scale,
    panY: (viewportHeight - contentHeight) / 2 - bounds.minY * scale,
  };
}

export function clampScale(scale: number): number {
  return Math.max(0.2, Math.min(4, scale));
}

export function zoomAroundPoint(
  viewport: ViewportState,
  screenX: number,
  screenY: number,
  nextScale: number,
): ViewportState {
  const scale = clampScale(nextScale);
  const worldX = (screenX - viewport.panX) / viewport.scale;
  const worldY = (screenY - viewport.panY) / viewport.scale;

  return {
    scale,
    panX: screenX - worldX * scale,
    panY: screenY - worldY * scale,
  };
}

export function toWorldPoint(
  clientX: number,
  clientY: number,
  svgRect: DOMRect,
  viewport: ViewportState,
): { x: number; y: number } {
  return {
    x: (clientX - svgRect.left - viewport.panX) / viewport.scale,
    y: (clientY - svgRect.top - viewport.panY) / viewport.scale,
  };
}

export function createWallPolygonPoints(geometry: Extract<MapGeometry, { kind: "line" }>): string {
  const thickness = geometry.thickness ?? 12;
  const dx = geometry.x2 - geometry.x1;
  const dy = geometry.y2 - geometry.y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * (thickness / 2);
  const ny = (dx / length) * (thickness / 2);

  return [
    `${geometry.x1 + nx},${geometry.y1 + ny}`,
    `${geometry.x2 + nx},${geometry.y2 + ny}`,
    `${geometry.x2 - nx},${geometry.y2 - ny}`,
    `${geometry.x1 - nx},${geometry.y1 - ny}`,
  ].join(" ");
}

export function constrainPointToAxis(origin: { x: number; y: number }, point: { x: number; y: number }): { x: number; y: number } {
  const deltaX = point.x - origin.x;
  const deltaY = point.y - origin.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return { x: point.x, y: origin.y };
  }

  return { x: origin.x, y: point.y };
}

export function constrainDeltaToAxis(deltaX: number, deltaY: number): { x: number; y: number } {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return { x: deltaX, y: 0 };
  }

  return { x: 0, y: deltaY };
}

function isAxisAlignedLine(geometry: Extract<MapGeometry, { kind: "line" }>): boolean {
  return geometry.x1 === geometry.x2 || geometry.y1 === geometry.y2;
}

function getLineLength(geometry: Extract<MapGeometry, { kind: "line" }>): number {
  return Math.hypot(geometry.x2 - geometry.x1, geometry.y2 - geometry.y1);
}

export function mergeCollinearWallArtefacts(walls: MapArtefact[]): Array<Extract<MapGeometry, { kind: "line" }>> {
  const lineWalls = walls
    .filter((artefact): artefact is MapArtefact & { geometry: Extract<MapGeometry, { kind: "line" }> } => artefact.geometry.kind === "line")
    .map((artefact) => artefact.geometry);

  const horizontal = new Map<string, Array<{ start: number; end: number; thickness: number }>>();
  const vertical = new Map<string, Array<{ start: number; end: number; thickness: number }>>();
  const passthrough: Array<Extract<MapGeometry, { kind: "line" }>> = [];

  lineWalls.forEach((line) => {
    if (!isAxisAlignedLine(line)) {
      passthrough.push(line);
      return;
    }

    const thickness = line.thickness ?? 12;
    if (line.y1 === line.y2) {
      const key = `${line.y1}:${thickness}`;
      const bucket = horizontal.get(key) ?? [];
      bucket.push({ start: Math.min(line.x1, line.x2), end: Math.max(line.x1, line.x2), thickness });
      horizontal.set(key, bucket);
      return;
    }

    const key = `${line.x1}:${thickness}`;
    const bucket = vertical.get(key) ?? [];
    bucket.push({ start: Math.min(line.y1, line.y2), end: Math.max(line.y1, line.y2), thickness });
    vertical.set(key, bucket);
  });

  const merged: Array<Extract<MapGeometry, { kind: "line" }>> = [];
  const mergeRanges = (ranges: Array<{ start: number; end: number; thickness: number }>) => {
    const sorted = [...ranges].sort((left, right) => left.start - right.start);
    const result: Array<{ start: number; end: number; thickness: number }> = [];
    sorted.forEach((range) => {
      const last = result[result.length - 1];
      if (!last || range.start > last.end) {
        result.push({ ...range });
        return;
      }

      last.end = Math.max(last.end, range.end);
    });
    return result;
  };

  horizontal.forEach((ranges, key) => {
    const [yValue, thicknessValue] = key.split(":").map(Number);
    mergeRanges(ranges).forEach((range) => {
      merged.push({
        kind: "line",
        x1: range.start,
        y1: yValue,
        x2: range.end,
        y2: yValue,
        thickness: thicknessValue,
      });
    });
  });

  vertical.forEach((ranges, key) => {
    const [xValue, thicknessValue] = key.split(":").map(Number);
    mergeRanges(ranges).forEach((range) => {
      merged.push({
        kind: "line",
        x1: xValue,
        y1: range.start,
        x2: xValue,
        y2: range.end,
        thickness: thicknessValue,
      });
    });
  });

  return [...merged, ...passthrough];
}

export function resolveAttachedOpeningLine(
  opening: MapArtefact,
  artefactsById: Map<string, MapArtefact>,
): Extract<MapGeometry, { kind: "line" }> | null {
  if (!opening.wallAttachment) {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const hostType = opening.wallAttachment.hostType ?? "wall";
  const hostId = opening.wallAttachment.hostId ?? opening.wallAttachment.wallId;
  if (!hostId) {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const host = artefactsById.get(hostId);
  if (!host) {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const openingWidth = opening.wallAttachment.width || 36;
  if (hostType === "wall" && host.geometry.kind === "line") {
    const wallLine = host.geometry;
    const length = getLineLength(wallLine);
    if (length === 0) {
      return null;
    }

    const centerRatio = opening.wallAttachment.offset / length;
    const centerX = wallLine.x1 + (wallLine.x2 - wallLine.x1) * centerRatio;
    const centerY = wallLine.y1 + (wallLine.y2 - wallLine.y1) * centerRatio;
    const dx = wallLine.x2 - wallLine.x1;
    const dy = wallLine.y2 - wallLine.y1;
    const tangentX = dx / length;
    const tangentY = dy / length;
    const half = openingWidth / 2;

    return {
      kind: "line",
      x1: Math.round(centerX - tangentX * half),
      y1: Math.round(centerY - tangentY * half),
      x2: Math.round(centerX + tangentX * half),
      y2: Math.round(centerY + tangentY * half),
      thickness: wallLine.thickness ?? 14,
    };
  }

  if (host.geometry.kind !== "rect") {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const rect = host.geometry;
  const edge = opening.wallAttachment.edge ?? "left";
  const offset = opening.wallAttachment.offset;
  const half = openingWidth / 2;
  if (edge === "top" || edge === "bottom") {
    const y = edge === "top" ? rect.y : rect.y + rect.height;
    const centerX = rect.x + offset;
    return {
      kind: "line",
      x1: Math.round(centerX - half),
      y1: Math.round(y),
      x2: Math.round(centerX + half),
      y2: Math.round(y),
      thickness: 8,
    };
  }

  const x = edge === "left" ? rect.x : rect.x + rect.width;
  const centerY = rect.y + offset;
  return {
    kind: "line",
    x1: Math.round(x),
    y1: Math.round(centerY - half),
    x2: Math.round(x),
    y2: Math.round(centerY + half),
    thickness: 8,
  };
}

export function findNearestWallAttachment(
  point: { x: number; y: number },
  walls: MapArtefact[],
): {
  wallId?: string;
  hostId?: string;
  hostType?: "wall" | "room" | "corridor" | "zone" | "stair";
  edge?: "top" | "right" | "bottom" | "left";
  offset: number;
  width: number;
} | null {
  type Candidate = {
    wallId?: string;
    hostId?: string;
    hostType?: "wall" | "room" | "corridor" | "zone" | "stair";
    edge?: "top" | "right" | "bottom" | "left";
    offset: number;
    width: number;
    distance: number;
  };
  let best: Candidate | null = null;

  walls.forEach((artefact) => {
    if (artefact.geometry.kind === "line") {
      const line = artefact.geometry;
      const length = getLineLength(line);
      if (length === 0) {
        return;
      }

      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const projection = ((point.x - line.x1) * dx + (point.y - line.y1) * dy) / (length * length);
      const clamped = Math.max(0, Math.min(1, projection));
      const snappedX = line.x1 + dx * clamped;
      const snappedY = line.y1 + dy * clamped;
      const distance = Math.hypot(point.x - snappedX, point.y - snappedY);

      if (distance > 20) {
        return;
      }

      if (!best || distance < best.distance) {
        best = {
          wallId: artefact.id,
          hostId: artefact.id,
          hostType: "wall",
          offset: Math.round(clamped * length),
          width: 36,
          distance,
        };
      }
      return;
    }

    if (artefact.geometry.kind !== "rect" || !(artefact.type === "room" || artefact.type === "corridor" || artefact.type === "zone" || artefact.type === "stair")) {
      return;
    }

    const rect = artefact.geometry;
    const candidates = [
      { edge: "top" as const, snappedX: Math.min(Math.max(point.x, rect.x), rect.x + rect.width), snappedY: rect.y, offset: Math.min(Math.max(point.x - rect.x, 0), rect.width) },
      { edge: "bottom" as const, snappedX: Math.min(Math.max(point.x, rect.x), rect.x + rect.width), snappedY: rect.y + rect.height, offset: Math.min(Math.max(point.x - rect.x, 0), rect.width) },
      { edge: "left" as const, snappedX: rect.x, snappedY: Math.min(Math.max(point.y, rect.y), rect.y + rect.height), offset: Math.min(Math.max(point.y - rect.y, 0), rect.height) },
      { edge: "right" as const, snappedX: rect.x + rect.width, snappedY: Math.min(Math.max(point.y, rect.y), rect.y + rect.height), offset: Math.min(Math.max(point.y - rect.y, 0), rect.height) },
    ];

    candidates.forEach((candidate) => {
      const distance = Math.hypot(point.x - candidate.snappedX, point.y - candidate.snappedY);
      if (distance > 20) {
        return;
      }

      if (!best || distance < best.distance) {
        best = {
          hostId: artefact.id,
          hostType: artefact.type as "room" | "corridor" | "zone" | "stair",
          edge: candidate.edge,
          offset: Math.round(candidate.offset),
          width: 36,
          distance,
        };
      }
    });
  });

  if (!best) {
    return null;
  }

  const resolved = best as Candidate;
  return {
    wallId: resolved.wallId,
    hostId: resolved.hostId,
    hostType: resolved.hostType,
    edge: resolved.edge,
    offset: resolved.offset,
    width: resolved.width,
  };
}

function getSnapCandidates(artefacts: MapArtefact[]): Array<{ x?: number; y?: number }> {
  const candidates: Array<{ x?: number; y?: number }> = [];

  artefacts.forEach((artefact) => {
    const geometry = artefact.geometry;
    if (geometry.kind === "point") {
      candidates.push({ x: geometry.x, y: geometry.y });
      return;
    }

    if (geometry.kind === "line") {
      candidates.push({ x: geometry.x1, y: geometry.y1 });
      candidates.push({ x: geometry.x2, y: geometry.y2 });
      candidates.push({ x: (geometry.x1 + geometry.x2) / 2, y: (geometry.y1 + geometry.y2) / 2 });
      return;
    }

    if (geometry.kind === "rect") {
      candidates.push({ x: geometry.x });
      candidates.push({ x: geometry.x + geometry.width / 2 });
      candidates.push({ x: geometry.x + geometry.width });
      candidates.push({ y: geometry.y });
      candidates.push({ y: geometry.y + geometry.height / 2 });
      candidates.push({ y: geometry.y + geometry.height });
      return;
    }

    geometry.points.forEach((point) => candidates.push({ x: point.x, y: point.y }));
  });

  return candidates;
}

export function alignPointToArtefactAxes(
  point: { x: number; y: number },
  artefacts: MapArtefact[],
  threshold: number = 8,
): { x: number; y: number } {
  const candidates = getSnapCandidates(artefacts);
  let snappedX = point.x;
  let snappedY = point.y;
  let bestX = threshold;
  let bestY = threshold;

  candidates.forEach((candidate) => {
    if (typeof candidate.x === "number") {
      const distance = Math.abs(point.x - candidate.x);
      if (distance <= bestX) {
        snappedX = candidate.x;
        bestX = distance;
      }
    }

    if (typeof candidate.y === "number") {
      const distance = Math.abs(point.y - candidate.y);
      if (distance <= bestY) {
        snappedY = candidate.y;
        bestY = distance;
      }
    }
  });

  return {
    x: Math.round(snappedX),
    y: Math.round(snappedY),
  };
}

export function snapWorldPoint(
  point: { x: number; y: number },
  walls: MapArtefact[],
  referencePoint?: { x: number; y: number } | null,
  threshold: number = 12,
): { x: number; y: number } {
  let snapped = { x: Math.round(point.x), y: Math.round(point.y) };

  if (referencePoint) {
    if (Math.abs(point.x - referencePoint.x) <= threshold) {
      snapped.x = Math.round(referencePoint.x);
    }

    if (Math.abs(point.y - referencePoint.y) <= threshold) {
      snapped.y = Math.round(referencePoint.y);
    }
  }

  let bestDistance = threshold;
  walls.forEach((wall) => {
    if (wall.geometry.kind !== "line") {
      return;
    }

    const candidates = [
      { x: wall.geometry.x1, y: wall.geometry.y1 },
      { x: wall.geometry.x2, y: wall.geometry.y2 },
    ];

    candidates.forEach((candidate) => {
      const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
      if (distance < bestDistance) {
        snapped = candidate;
        bestDistance = distance;
      }
    });
  });

  return snapped;
}

export function isLabelVisible(scale: number, type: MapArtefact["type"]): boolean {
  if (scale < 0.45) {
    return type === "exit" || type === "fireExit";
  }

  if (scale < 0.7) {
    return type !== "roundel" && type !== "door";
  }

  return true;
}

type AxisSegment = {
  orientation: "horizontal" | "vertical";
  fixed: number;
  start: number;
  end: number;
  thickness: number;
  stroke: string;
  zOrder: number;
  sourceArea: number;
};

export type RoomBoundarySegment = {
  geometry: Extract<MapGeometry, { kind: "line" }>;
  stroke: string;
};

function getRoomBoundaryThickness(artefact: MapArtefact): number {
  const candidate = artefact.metadata?.borderThickness;
  return typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0 ? candidate : 2;
}

function getRoomBoundarySideThickness(
  artefact: MapArtefact,
  side: "top" | "right" | "bottom" | "left",
): number {
  const key =
    side === "top"
      ? "borderTopThickness"
      : side === "right"
        ? "borderRightThickness"
        : side === "bottom"
          ? "borderBottomThickness"
          : "borderLeftThickness";
  const candidate = artefact.metadata?.[key];
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate >= 0) {
    return candidate;
  }

  return getRoomBoundaryThickness(artefact);
}

function getRoomBoundaryStroke(artefact: MapArtefact): string {
  const candidate = artefact.metadata?.borderColor;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : "var(--app-border)";
}

function getArtefactZOrder(artefact: MapArtefact): number {
  const candidate = artefact.metadata?.zOrder;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : 0;
}

function mergeAxisSegments(segments: AxisSegment[]): AxisSegment[] {
  const grouped = new Map<string, AxisSegment[]>();

  segments.forEach((segment) => {
    const key = `${segment.orientation}:${segment.fixed}:${segment.thickness}:${segment.stroke}:${segment.zOrder}:${segment.sourceArea}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(segment);
    grouped.set(key, bucket);
  });

  const merged: AxisSegment[] = [];

  grouped.forEach((bucket) => {
    const sorted = [...bucket].sort((left, right) => left.start - right.start);
    sorted.forEach((segment) => {
      const last = merged[merged.length - 1];
      if (
        last &&
        last.orientation === segment.orientation &&
        last.fixed === segment.fixed &&
        last.thickness === segment.thickness &&
        last.stroke === segment.stroke &&
        last.zOrder === segment.zOrder &&
        last.sourceArea === segment.sourceArea &&
        segment.start <= last.end
      ) {
        last.end = Math.max(last.end, segment.end);
        return;
      }

      merged.push({ ...segment });
    });
  });

  return merged;
}

export function getRoomBoundarySegments(artefacts: MapArtefact[]): RoomBoundarySegment[] {
  const edgeSegments = new Map<string, (AxisSegment & { artefactType: MapArtefact["type"] })[]>();

  artefacts
    .filter((artefact) => artefact.visible !== false)
    .filter((artefact) => artefact.type === "corridor" || artefact.type === "zone" || artefact.type === "stair")
    .forEach((artefact) => {
      if (artefact.geometry.kind !== "rect") {
        return;
      }

      if (artefact.geometry.rotation) {
        return;
      }

      const { x, y, width, height } = artefact.geometry;
      const stroke = getRoomBoundaryStroke(artefact);
      const zOrder = getArtefactZOrder(artefact);
      const sourceArea = width * height;
      const segments = [
        { orientation: "horizontal", fixed: y, start: x, end: x + width, thickness: getRoomBoundarySideThickness(artefact, "top"), stroke, zOrder, sourceArea, artefactType: artefact.type },
        { orientation: "horizontal", fixed: y + height, start: x, end: x + width, thickness: getRoomBoundarySideThickness(artefact, "bottom"), stroke, zOrder, sourceArea, artefactType: artefact.type },
        { orientation: "vertical", fixed: x, start: y, end: y + height, thickness: getRoomBoundarySideThickness(artefact, "left"), stroke, zOrder, sourceArea, artefactType: artefact.type },
        { orientation: "vertical", fixed: x + width, start: y, end: y + height, thickness: getRoomBoundarySideThickness(artefact, "right"), stroke, zOrder, sourceArea, artefactType: artefact.type },
      ] satisfies (AxisSegment & { artefactType: MapArtefact["type"] })[];

      segments.filter((segment) => segment.thickness > 0).forEach((segment) => {
        const key = `${segment.orientation}:${segment.fixed}:${segment.start}:${segment.end}`;
        const existing = edgeSegments.get(key) ?? [];
        existing.push(segment);
        edgeSegments.set(key, existing);
      });
    });

  const normalizedSegments = [...edgeSegments.values()]
    .flatMap((segments) => {
      const allCorridors = segments.every((segment) => segment.artefactType === "corridor");
      if (allCorridors && segments.length >= 2) {
        return [];
      }

      return [
        segments.reduce((best, candidate) => {
          const bestIsDefault = best.stroke === "var(--app-border)";
          const candidateIsDefault = candidate.stroke === "var(--app-border)";
          if (
            candidate.zOrder > best.zOrder ||
            (candidate.zOrder === best.zOrder && candidate.sourceArea < best.sourceArea) ||
            candidate.thickness > best.thickness ||
            (candidate.thickness === best.thickness && bestIsDefault && !candidateIsDefault)
          ) {
            return candidate;
          }

          return best;
        }),
      ];
    });

  return mergeAxisSegments(normalizedSegments).map((segment) => ({
    geometry:
      segment.orientation === "horizontal"
        ? {
            kind: "line",
            x1: segment.start,
            y1: segment.fixed,
            x2: segment.end,
            y2: segment.fixed,
            thickness: segment.thickness,
          }
        : {
            kind: "line",
            x1: segment.fixed,
            y1: segment.start,
            x2: segment.fixed,
            y2: segment.end,
            thickness: segment.thickness,
          },
    stroke: segment.stroke,
  }));
}
