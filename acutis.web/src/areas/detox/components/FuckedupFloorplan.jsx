import React, { useState } from "react";
import DetoxFloorPlanForMerge from "@/areas/detox/components/DetoxFloorPlanForMerge";
import MainhouseFloorPlanForMerge from "@/areas/detox/components/MainhouseFloorPlanForMerge";

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
const BASE_STAGE_HEIGHT = 2500;
const MAINHOUSE_STAGE_WIDTH = 1555;
const MAINHOUSE_STAGE_HEIGHT = 981;
const MAINHOUSE_CROP_LEFT = 40;
const MAINHOUSE_CROP_TOP = 20;
const MAINHOUSE_VIEW_WIDTH = 930;
const MAINHOUSE_VIEW_HEIGHT = 900;
const MAINHOUSE_COMPONENT_SCALE_X = 1.628;
const MAINHOUSE_COMPONENT_SCALE_Y = 1.628;
const DETOX_STAGE_WIDTH = 1248;
const DETOX_STAGE_HEIGHT = 1092;
const DETOX_CROP_LEFT = 165;
const DETOX_CROP_TOP = 20;
const DETOX_VIEW_WIDTH = 930;
const DETOX_VIEW_HEIGHT = 980;
const DETOX_COMPONENT_SCALE = 1;

// Join points are aligned on the existing detox scale:
// - Main House anchor point: top edge of the anchor-point protrusion
// - Detox join point: left end of the detox main corridor
const MAINHOUSE_OFFSET_X = 0;
const MAINHOUSE_OFFSET_Y = -196;
const DETOX_OFFSET_X = 1140;
const DETOX_OFFSET_Y = 110;

export default function MergedDloorplan() {
  const [zoom, setZoom] = useState(1);
  const zoomPercent = Math.round(zoom * 100);

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
          overflowX: "auto",
          overflowY: "auto",
          borderRadius: 12,
          background: "#f8fafc",
          maxHeight: "calc(100vh - 220px)",
        }}
      >
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
              className="merged-floorplan__main"
              style={{
                position: "absolute",
                left: MAINHOUSE_OFFSET_X,
                top: MAINHOUSE_OFFSET_Y,
                width: MAINHOUSE_VIEW_WIDTH * MAINHOUSE_COMPONENT_SCALE_X,
                height: MAINHOUSE_VIEW_HEIGHT * MAINHOUSE_COMPONENT_SCALE_Y,
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: MAINHOUSE_STAGE_WIDTH,
                  height: MAINHOUSE_STAGE_HEIGHT,
                  marginLeft: -MAINHOUSE_CROP_LEFT,
                  marginTop: -MAINHOUSE_CROP_TOP,
                  transform: `scale(${MAINHOUSE_COMPONENT_SCALE_X}, ${MAINHOUSE_COMPONENT_SCALE_Y})`,
                  transformOrigin: "top left",
                }}
              >
                <MainhouseFloorPlanForMerge />
              </div>
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
                left: 970,
                top: 845,
                padding: "6px 10px",
                background: "rgba(254,243,199,0.95)",
                border: "1px solid #f59e0b",
                borderRadius: 8,
                fontFamily: "Arial, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: "#92400e",
                pointerEvents: "none",
                zIndex: 20,
              }}
            >
              ANCHOR POINT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
