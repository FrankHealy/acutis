import React, { useState } from "react";
import DetoxFloorPlanForMerge from "@/areas/detox/components/DetoxFloorPlanForMerge";

const buttonStyle = {
  border: "1px solid #d1d5db",
  background: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  cursor: "pointer",
};

const BASE_STAGE_WIDTH = 2800;
const BASE_STAGE_HEIGHT = 1750;
const DETOX_STAGE_WIDTH = 1248;
const DETOX_STAGE_HEIGHT = 1092;
const DETOX_CROP_LEFT = 165;
const DETOX_CROP_TOP = 20;
const DETOX_VIEW_WIDTH = 930;
const DETOX_VIEW_HEIGHT = 980;
const DETOX_COMPONENT_SCALE = 1;
const GRID_SIZE = 40;
const GRID_TOP_OFFSET = 200;
const GRID_LEFT_OFFSET = 200;
const DETOX_OFFSET_X = 1120;
const DETOX_OFFSET_Y = 320;
const TEMP_WALL_THICKNESS = 6;
const TEMP_INTERNAL_WALL_THICKNESS = 2;
const TEMP_VERTICAL_TOP = { x: 23, y: 8, dx: 0, dy: 21 };
const TEMP_TOP_HORIZONTAL = { y: 8, dy: 21, width: 3 * GRID_SIZE + 4 };
const TEMP_BOTTOM_DOOR_OFFSET = 18;
const TEMP_BOTTOM_DOOR_WIDTH = 18;
const TEMP_UPPER_RECT_WIDTH = 38;
const TEMP_UPPER_RECT_HEIGHT = 44;

export default function MergedDloorplan() {
  const [zoom, setZoom] = useState(1);
  const [hoveredGrid, setHoveredGrid] = useState(null);
  const zoomPercent = Math.round(zoom * 100);
  const gridLeft = (cellX, offsetPx = 0) => GRID_LEFT_OFFSET + cellX * GRID_SIZE + offsetPx;
  const gridTop = (cellY, offsetPx = 0) => GRID_TOP_OFFSET + cellY * GRID_SIZE + offsetPx;
  const tempVerticalLeft = gridLeft(TEMP_VERTICAL_TOP.x, TEMP_VERTICAL_TOP.dx);
  const tempVerticalTop = gridTop(TEMP_VERTICAL_TOP.y, TEMP_VERTICAL_TOP.dy);
  const tempVerticalBottom = gridTop(17, 21);
  const tempVerticalHeight = tempVerticalBottom - tempVerticalTop + 4;
  const tempTopHorizontalLeft = tempVerticalLeft - TEMP_TOP_HORIZONTAL.width + TEMP_WALL_THICKNESS;
  const tempTopHorizontalTop = gridTop(TEMP_TOP_HORIZONTAL.y, TEMP_TOP_HORIZONTAL.dy);
  const tempLeftVerticalLeft = tempTopHorizontalLeft;
  const tempLeftVerticalTop = tempVerticalTop;
  const tempLeftVerticalHeight = tempVerticalHeight;
  const tempBottomHorizontalLeft = tempTopHorizontalLeft;
  const tempBottomHorizontalTop = tempVerticalBottom - TEMP_INTERNAL_WALL_THICKNESS + 4;
  const tempBottomHorizontalWidth = TEMP_TOP_HORIZONTAL.width;
  const tempBottomDoorLeft = tempBottomHorizontalLeft + TEMP_BOTTOM_DOOR_OFFSET;
  const tempBottomLeftWallWidth = TEMP_BOTTOM_DOOR_OFFSET;
  const tempBottomRightWallLeft = tempBottomDoorLeft + TEMP_BOTTOM_DOOR_WIDTH;
  const tempBottomRightWallWidth =
    tempBottomHorizontalLeft + tempBottomHorizontalWidth - tempBottomRightWallLeft;
  const tempUpperRectLeft = gridLeft(23) - 16;
  const tempUpperRectTop = gridTop(19) - 2;
  const tempUpperRectRight = tempUpperRectLeft + TEMP_UPPER_RECT_WIDTH - TEMP_WALL_THICKNESS;
  const tempUpperRectBottom = tempUpperRectTop + TEMP_UPPER_RECT_HEIGHT - TEMP_WALL_THICKNESS;
  const tempUpperRectLeftTop = tempUpperRectTop - 20;
  const tempUpperLeftHorizontalLeft = gridLeft(20);
  const tempUpperLeftHorizontalTop = tempUpperRectLeftTop;
  const tempUpperLeftHorizontalWidth = tempUpperRectLeft - tempUpperLeftHorizontalLeft + TEMP_WALL_THICKNESS;
  const tempUpperLeftVerticalLeft = tempUpperLeftHorizontalLeft;
  const tempUpperLeftVerticalTop = tempUpperLeftHorizontalTop;
  const tempUpperLeftVerticalHeight = gridTop(19) - tempUpperLeftVerticalTop;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
      }}
    >
      <style>{`
        .merged-floorplan__main > div > div,
        .merged-floorplan__detox > div > div {
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }

        .merged-floorplan__main > div > div,
        .merged-floorplan__detox > div > div {
          overflow: hidden !important;
        }

        .merged-floorplan__main > div > div > div:first-child,
        .merged-floorplan__detox > div > div > div:first-child {
          display: none !important;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          gap: 12,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          color: "#111827",
          marginBottom: 12,
          fontWeight: 600,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => setZoom((current) => Math.max(0.6, current - 0.1))} style={buttonStyle}>
            Zoom Out
          </button>
          <div style={{ minWidth: 46, textAlign: "center", fontSize: 12, color: "#4b5563" }}>{zoomPercent}%</div>
          <button type="button" onClick={() => setZoom((current) => Math.min(1.8, current + 0.1))} style={buttonStyle}>
            Zoom In
          </button>
          <button type="button" onClick={() => setZoom(1)} style={buttonStyle}>
            100%
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: "scroll",
          overflowY: "auto",
          borderRadius: 12,
          background: "#f8fafc",
          maxHeight: "calc(100vh - 220px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 80,
            height: 24,
            marginLeft: GRID_LEFT_OFFSET,
            width: BASE_STAGE_WIDTH - GRID_LEFT_OFFSET,
            background: "rgba(248,250,252,0.96)",
            borderBottom: "1px solid rgba(239,68,68,0.25)",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: Math.floor((BASE_STAGE_WIDTH - GRID_LEFT_OFFSET) / GRID_SIZE) + 1 }).map((_, index) => (
            <div
              key={`top-x-${index}`}
              style={{
                position: "absolute",
                left: index * GRID_SIZE + 4,
                top: 4,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 800,
                color: "rgba(127,29,29,0.95)",
                background: "rgba(255,255,255,0.9)",
                padding: "2px 4px",
                borderRadius: 3,
                lineHeight: 1,
              }}
            >
              X{index}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "sticky",
            left: 0,
            top: 24,
            zIndex: 80,
            width: 32,
            height: BASE_STAGE_HEIGHT - GRID_TOP_OFFSET,
            background: "rgba(248,250,252,0.96)",
            borderRight: "1px solid rgba(239,68,68,0.25)",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: Math.floor((BASE_STAGE_HEIGHT - GRID_TOP_OFFSET) / GRID_SIZE) + 1 }).map((_, index) => (
            <div
              key={`left-y-${index}`}
              style={{
                position: "absolute",
                left: 4,
                top: index * GRID_SIZE + 20,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 800,
                color: "rgba(127,29,29,0.95)",
                background: "rgba(255,255,255,0.9)",
                padding: "2px 4px",
                borderRadius: 3,
                lineHeight: 1,
              }}
            >
              Y{index}
            </div>
          ))}
        </div>
        <div
          style={{
            width: Math.round(BASE_STAGE_WIDTH * zoom),
            height: Math.round(BASE_STAGE_HEIGHT * zoom),
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: BASE_STAGE_WIDTH,
              height: BASE_STAGE_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: GRID_LEFT_OFFSET,
                top: GRID_TOP_OFFSET,
                width: BASE_STAGE_WIDTH - GRID_LEFT_OFFSET,
                height: BASE_STAGE_HEIGHT - GRID_TOP_OFFSET,
                backgroundImage:
                  "linear-gradient(to right, rgba(239,68,68,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,68,68,0.28) 1px, transparent 1px)",
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                pointerEvents: "auto",
                zIndex: 50,
              }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const localX = event.clientX - rect.left;
                const localY = event.clientY - rect.top;
                const xIndex = Math.max(0, Math.floor(localX / GRID_SIZE));
                const yIndex = Math.max(0, Math.floor(localY / GRID_SIZE));

                setHoveredGrid({
                  xIndex,
                  yIndex,
                  left: localX + 12,
                  top: localY + 12,
                });
              }}
              onMouseLeave={() => setHoveredGrid(null)}
            >
              {hoveredGrid ? (
                <div
                  style={{
                    position: "absolute",
                    left: hoveredGrid.left,
                    top: hoveredGrid.top,
                    padding: "4px 6px",
                    background: "rgba(255,255,255,0.96)",
                    border: "1px solid rgba(127,29,29,0.45)",
                    borderRadius: 6,
                    fontFamily: "Arial, sans-serif",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "rgba(127,29,29,0.95)",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 60,
                  }}
                >
                  X{hoveredGrid.xIndex}, Y{hoveredGrid.yIndex}
                </div>
              ) : null}
            </div>

            <div
              className="merged-floorplan__detox"
              style={{
                position: "absolute",
                left: DETOX_OFFSET_X,
                top: DETOX_OFFSET_Y,
                width: DETOX_VIEW_WIDTH * DETOX_COMPONENT_SCALE,
                height: DETOX_VIEW_HEIGHT * DETOX_COMPONENT_SCALE,
                overflow: "hidden",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: DETOX_STAGE_WIDTH,
                  height: DETOX_STAGE_HEIGHT,
                  marginLeft: -DETOX_CROP_LEFT,
                  marginTop: -DETOX_CROP_TOP,
                  transform: `scale(${DETOX_COMPONENT_SCALE})`,
                  transformOrigin: "top left",
                }}
              >
                <DetoxFloorPlanForMerge />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: tempVerticalLeft,
                top: tempVerticalTop,
                width: TEMP_WALL_THICKNESS,
                height: tempVerticalHeight,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempTopHorizontalLeft,
                top: tempTopHorizontalTop,
                width: TEMP_TOP_HORIZONTAL.width,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftVerticalLeft,
                top: tempLeftVerticalTop,
                width: TEMP_WALL_THICKNESS,
                height: tempLeftVerticalHeight,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempUpperRectRight,
                top: tempUpperRectTop,
                width: TEMP_WALL_THICKNESS,
                height: TEMP_UPPER_RECT_HEIGHT,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempUpperRectLeft,
                top: tempUpperRectBottom,
                width: TEMP_UPPER_RECT_WIDTH,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempUpperRectLeft,
                top: tempUpperRectLeftTop,
                width: TEMP_WALL_THICKNESS,
                height: TEMP_UPPER_RECT_HEIGHT + 20,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempUpperLeftHorizontalLeft,
                top: tempUpperLeftHorizontalTop,
                width: tempUpperLeftHorizontalWidth,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempUpperLeftVerticalLeft,
                top: tempUpperLeftVerticalTop,
                width: TEMP_WALL_THICKNESS,
                height: tempUpperLeftVerticalHeight,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempBottomHorizontalLeft,
                top: tempBottomHorizontalTop,
                width: tempBottomLeftWallWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempBottomRightWallLeft,
                top: tempBottomHorizontalTop,
                width: tempBottomRightWallWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempBottomDoorLeft,
                top: tempBottomHorizontalTop - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempBottomDoorLeft + TEMP_BOTTOM_DOOR_WIDTH - 2,
                top: tempBottomHorizontalTop - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
