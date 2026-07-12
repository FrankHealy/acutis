import type { CSSProperties } from "react";

type ShapeBaseProps = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type RectShapeProps = ShapeBaseProps & {
  fill?: string;
  border?: string;
};

type LineShapeProps = ShapeBaseProps & {
  stroke?: string;
  rotation: number;
};

type DiamondShapeProps = ShapeBaseProps & {
  fill?: string;
  border?: string;
};

const baseStyle = (shape: ShapeBaseProps): CSSProperties => ({
  position: "absolute",
  left: `${shape.left}px`,
  top: `${shape.top}px`,
  width: `${shape.width}px`,
  height: `${shape.height}px`,
});

export function DetoxRect({ left, top, width, height, fill = "transparent", border = "none" }: RectShapeProps) {
  return (
    <div
      style={{
        ...baseStyle({ left, top, width, height }),
        background: fill,
        border,
      }}
    />
  );
}

export function DetoxLine({ left, top, width, height, stroke = "#000", rotation }: LineShapeProps) {
  return (
    <div
      style={{
        ...baseStyle({ left, top, width, height }),
        background: stroke,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top left",
      }}
    />
  );
}

export function DetoxDiamond({ left, top, width, height, fill = "#D9D9D9", border = "1px solid #000" }: DiamondShapeProps) {
  return (
    <div
      style={{
        ...baseStyle({ left, top, width, height }),
        background: fill,
        border,
        transform: "rotate(45deg)",
        transformOrigin: "center",
      }}
    />
  );
}
