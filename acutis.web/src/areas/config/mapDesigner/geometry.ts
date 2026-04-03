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

export function isLabelVisible(scale: number, type: MapArtefact["type"]): boolean {
  if (scale < 0.45) {
    return type === "exit" || type === "fireExit";
  }

  if (scale < 0.7) {
    return type !== "roundel";
  }

  return true;
}
