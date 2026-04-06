export type MapArtefactType =
  | "room"
  | "corridor"
  | "wall"
  | "window"
  | "partition"
  | "stair"
  | "door"
  | "exit"
  | "fireExit"
  | "roundel"
  | "label"
  | "zone";

export type MapGeometry =
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
    }
  | {
      kind: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      thickness?: number;
    }
  | {
      kind: "point";
      x: number;
      y: number;
      size?: number;
    }
  | {
      kind: "polygon";
      points: Array<{ x: number; y: number }>;
    };

export type MapArtefact = {
  id: string;
  type: MapArtefactType;
  geometry: MapGeometry;
  parentId?: string;
  wallAttachment?: {
    wallId?: string;
    hostId?: string;
    hostType?: "wall" | "room" | "corridor" | "zone" | "stair";
    edge?: "top" | "right" | "bottom" | "left";
    offset: number;
    width: number;
  };
  labelKey?: string;
  labelOverride?: string;
  visible?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
};

export type MapDocument = {
  id: string;
  name: string;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
  world: {
    width: number;
    height: number;
  };
  artefacts: MapArtefact[];
};

export type MapTool =
  | "select"
  | "pan"
  | "room"
  | "corridor"
  | "wall"
  | "window"
  | "partition"
  | "stair"
  | "door"
  | "exit"
  | "fireExit"
  | "roundel"
  | "label";

export type ViewportState = {
  scale: number;
  panX: number;
  panY: number;
};

export type WorldBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};
