import type { MapArtefact, MapGeometry, ViewportState, WorldBounds } from "@/areas/config/mapDesigner/types";

const DEFAULT_PADDING = 48;

export function getGeometryBounds(geometry: MapGeometry): WorldBounds {
  if (geometry.kind === "rect") {
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
  wallsById: Map<string, MapArtefact>,
): Extract<MapGeometry, { kind: "line" }> | null {
  if (!opening.wallAttachment) {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const wall = wallsById.get(opening.wallAttachment.wallId);
  if (!wall || wall.geometry.kind !== "line") {
    return opening.geometry.kind === "line" ? opening.geometry : null;
  }

  const wallLine = wall.geometry;
  const length = getLineLength(wallLine);
  if (length === 0) {
    return null;
  }

  const doorWidth = opening.wallAttachment.width || 36;
  const centerRatio = opening.wallAttachment.offset / length;
  const centerX = wallLine.x1 + (wallLine.x2 - wallLine.x1) * centerRatio;
  const centerY = wallLine.y1 + (wallLine.y2 - wallLine.y1) * centerRatio;
  const dx = wallLine.x2 - wallLine.x1;
  const dy = wallLine.y2 - wallLine.y1;
  const normalX = -dy / length;
  const normalY = dx / length;
  const half = doorWidth / 2;

  return {
    kind: "line",
    x1: Math.round(centerX - normalX * half),
    y1: Math.round(centerY - normalY * half),
    x2: Math.round(centerX + normalX * half),
    y2: Math.round(centerY + normalY * half),
    thickness: 8,
  };
}

export function findNearestWallAttachment(point: { x: number; y: number }, walls: MapArtefact[]): { wallId: string; offset: number; width: number } | null {
  type Candidate = { wallId: string; offset: number; width: number; distance: number };
  let best: Candidate | null = null;

  walls.forEach((wall) => {
    if (wall.geometry.kind !== "line") {
      return;
    }

    const line = wall.geometry;
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
        wallId: wall.id,
        offset: Math.round(clamped * length),
        width: 36,
        distance,
      };
    }
  });

  if (!best) {
    return null;
  }

  const resolved = best as Candidate;
  return { wallId: resolved.wallId, offset: resolved.offset, width: resolved.width };
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
