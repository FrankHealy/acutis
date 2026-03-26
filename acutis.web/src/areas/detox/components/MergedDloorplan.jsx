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
const TEMP_ADMIN_BASE_RECT_WIDTH = 40;
const TEMP_ADMIN_BASE_RECT_HEIGHT = 150;
const TEMP_ADMIN_UPPER_RECT_HEIGHT = 39;
const TEMP_ADMIN_UPPER_RECT_BASE_OFFSET = 100;
const TEMP_CLOCK_TOWER_DOOR_HEIGHT = 16;
const TEMP_CLOCK_TOWER_STAIR_WIDTH = 28;
const TEMP_CLOCK_TOWER_STAIR_HEIGHT = 14;
const TEMP_CLOCK_TOWER_LOWER_RECT_HEIGHT = 106;
const TEMP_CLOCK_TOWER_LOWER_RECT_TOP_EXTENSION = 37;
const TEMP_UPPER_RECT_WIDTH = 38;
const TEMP_UPPER_RECT_HEIGHT = 44;
const TEMP_LOWER_VERTICAL = { x: 23, yStart: 20, yEnd: 23, dx: 17 };
const TEMP_LOWER_LEFT_VERTICAL = { x: 14, yStart: 19, yEnd: 23, dx: 16, dy: 11 };
const TEMP_MID_RECT = { x: 19, y: 17, dx: 7, dy: 18, width: 40, height: 120 };
const TEMP_RESIDENCE_DOOR_OFFSET = 8;
const TEMP_RESIDENCE_DOOR_SIZE = 22;
const TEMP_RESIDENTS_ENTRANCE_OFFSET = 10;
const TEMP_RESIDENTS_ENTRANCE_WIDTH = 20;
const TEMP_STACKED_ROOM_WIDTH = 34;
const TEMP_STACKED_ROOM_HEIGHT = 26;
const TEMP_STACKED_ROOM_OFFSET_X = -6;
const TEMP_STACKED_DOOR_OFFSET_Y = 7;
const TEMP_STACKED_DOOR_SIZE = 12;
const TEMP_NARROW_ROOM_OFFSET_X = 60;
const TEMP_NARROW_ROOM_WIDTH = 30;
const TEMP_NARROW_ROOM_DOOR_WIDTH = 14;
const TEMP_RESIDENCE_RECT_OFFSET_X = 10;
const TEMP_RESIDENCE_RECT_WIDTH = 60;
const TEMP_RESIDENCE_RECT_HEIGHT = 100;
const TEMP_LEFT_RECT_WIDTH = 80;
const TEMP_LEFT_RECT_HEIGHT = 120;
const TEMP_LEFT_RECT_DOOR_OFFSET_Y = 24;
const TEMP_LEFT_RECT_DOOR_HEIGHT = 18;
const TEMP_KITCHEN_LEFT_DOOR_OFFSET_Y = 92;
const TEMP_KITCHEN_LEFT_DOOR_HEIGHT = 16;
const TEMP_FAR_LEFT_RECT_WIDTH = 100;
const TEMP_FAR_LEFT_RECT_HEIGHT = 80;
const TEMP_FAR_LEFT_RECT_DOOR_WIDTH = 16;
const TEMP_STAFF_ADJACENT_ROOM_HEIGHT_INCREASE = 30;
const TEMP_MYSTERY_SIDE_RECT_WIDTH = 68;
const TEMP_MYSTERY_SIDE_RECT_HEIGHT = 80;
const TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH = 18;
const TEMP_MICRO_RECT_WIDTH = 143;
const TEMP_MICRO_RECT_HEIGHT = 40;
const TEMP_MICRO_RECT_FILL_LEFT_EXTENSION = 20;
const TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH = 52;
const TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT = 58;
const TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET = 6;
const TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_WIDTH = 14;
const TEMP_CONVENT_RECT_WIDTH = 90;
const TEMP_CONVENT_RECT_HEIGHT = 100;
const TEMP_CONVENT_ADJACENT_RECT_WIDTH = TEMP_CONVENT_RECT_WIDTH / 2;
const TEMP_CONVENT_ADJACENT_RECT_HEIGHT = TEMP_CONVENT_RECT_HEIGHT - 20;
const TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH = 90;
const TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT = 100;
const TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_HEIGHT = 18;
const TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_OFFSET_FROM_BOTTOM = 10;
const TEMP_DOWN_STAITS_OFFICE_WIDTH = 110;
const TEMP_DOWN_STAITS_OFFICE_HEIGHT = TEMP_CONVENT_ADJACENT_RECT_HEIGHT + 25;
const TEMP_ORATORY_RIGHT_ROOM_WIDTH = 85;
const TEMP_ORATORY_RIGHT_ROOM_HEIGHT = 60;
const TEMP_GUEST_TOILET_TOP_RECT_HEIGHT = 122;
const TEMP_DINING_EXTENSION = 40;
const TEMP_LOWER_LEFT_EXTENSION_WIDTH = 80;
const TEMP_LOWER_LEFT_EXTENSION_HEIGHT = 60;
const TEMP_SMALL_KITCHEN_DOOR_WIDTH = 16;
const TEMP_MICRO_BASE_GAP_WIDTH = 26;

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
  const tempAdminBaseRectLeft = tempBottomDoorLeft + TEMP_BOTTOM_DOOR_WIDTH - 31;
  const tempAdminBaseRectTop =
    tempBottomHorizontalTop - TEMP_ADMIN_BASE_RECT_HEIGHT + TEMP_INTERNAL_WALL_THICKNESS;
  const tempSuregeryCottidoorLabelLeft = tempAdminBaseRectLeft + 8;
  const tempSuregeryCottidoorLabelTop = tempAdminBaseRectTop + 8;
  const tempAdminUpperRectLeft = tempAdminBaseRectLeft + TEMP_ADMIN_BASE_RECT_WIDTH - 2;
  const tempAdminUpperRectTop =
    tempBottomHorizontalTop -
    TEMP_ADMIN_UPPER_RECT_BASE_OFFSET -
    TEMP_ADMIN_UPPER_RECT_HEIGHT +
    TEMP_INTERNAL_WALL_THICKNESS;
  const tempClockTowerStairWellLabelLeft = tempAdminUpperRectLeft + 8;
  const tempClockTowerStairWellLabelTop = tempAdminUpperRectTop + 8;
  const tempClockTowerDoorTop =
    tempAdminUpperRectTop +
    Math.round((TEMP_ADMIN_UPPER_RECT_HEIGHT - TEMP_CLOCK_TOWER_DOOR_HEIGHT) / 2) - 6;
  const tempClockTowerStairLeft = tempAdminUpperRectLeft + 3;
  const tempClockTowerStairTop =
    tempAdminUpperRectTop + TEMP_ADMIN_UPPER_RECT_HEIGHT - TEMP_CLOCK_TOWER_STAIR_HEIGHT - 2;
  const tempClockTowerLowerRectLeft = tempAdminUpperRectLeft;
  const tempClockTowerLowerRectTop =
    tempAdminUpperRectTop +
    TEMP_ADMIN_UPPER_RECT_HEIGHT +
    34 -
    TEMP_CLOCK_TOWER_LOWER_RECT_TOP_EXTENSION;
  const tempPaymentOfficeLabelLeft = tempClockTowerLowerRectLeft + 8;
  const tempPaymentOfficeLabelTop = tempClockTowerLowerRectTop + 8;
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
  const tempLowerVerticalLeft = gridLeft(TEMP_LOWER_VERTICAL.x, TEMP_LOWER_VERTICAL.dx);
  const tempLowerVerticalTop = gridTop(TEMP_LOWER_VERTICAL.yStart);
  const tempLowerVerticalHeight =
    gridTop(TEMP_LOWER_VERTICAL.yEnd) - tempLowerVerticalTop + TEMP_WALL_THICKNESS + 12;
  const tempAdminUpperRectWidth = tempLowerVerticalLeft - tempAdminUpperRectLeft + TEMP_WALL_THICKNESS - 20;
  const tempLowerHorizontalLeft = tempLowerVerticalLeft - 364 + TEMP_WALL_THICKNESS;
  const tempLowerHorizontalTop = tempLowerVerticalTop + tempLowerVerticalHeight - TEMP_WALL_THICKNESS;
  const tempLowerHorizontalWidth = 364;
  const tempLowerLeftVerticalLeft = gridLeft(TEMP_LOWER_LEFT_VERTICAL.x, TEMP_LOWER_LEFT_VERTICAL.dx);
  const tempLowerLeftVerticalBaseTop = gridTop(TEMP_LOWER_LEFT_VERTICAL.yStart, TEMP_LOWER_LEFT_VERTICAL.dy);
  const tempLowerLeftVerticalBottom =
    gridTop(TEMP_LOWER_LEFT_VERTICAL.yEnd, TEMP_LOWER_LEFT_VERTICAL.dy) + TEMP_WALL_THICKNESS;
  const tempMidRectLeft = gridLeft(TEMP_MID_RECT.x, TEMP_MID_RECT.dx);
  const tempMidRectTop = gridTop(TEMP_MID_RECT.y, TEMP_MID_RECT.dy);
  const tempMidRectBottomRight = tempMidRectLeft + TEMP_MID_RECT.width - 8;
  const tempMidRectBottomLeft = gridLeft(14) + 8;
  const tempMidRectBottomWidth = tempMidRectBottomRight - tempMidRectBottomLeft;
  const tempNewRectLeft = tempLowerLeftVerticalLeft;
  const tempNewRectBottom = tempLowerLeftVerticalBaseTop + 15;
  const tempNewRectTop = tempNewRectBottom - 40;
  const tempNewRectWidth = tempMidRectBottomWidth - 1;
  const tempResidenceDoorLeft = tempNewRectLeft + tempNewRectWidth - TEMP_WALL_THICKNESS;
  const tempResidenceDoorTop = tempNewRectTop + TEMP_RESIDENCE_DOOR_OFFSET;
  const tempCoffeeDockDoorLabelLeft = tempResidenceDoorLeft - 24;
  const tempCoffeeDockDoorLabelTop = tempResidenceDoorTop + TEMP_RESIDENCE_DOOR_SIZE + 8;
  const tempResidentsEntranceLeft = gridLeft(18, 55);
  const tempResidentsEntranceTop = gridTop(17, 17);
  const tempResidentsEntranceLabelLeft = tempResidentsEntranceLeft - 6;
  const tempResidentsEntranceLabelTop = gridTop(17, 17) - 28;
  const tempSingleCellFillLeft = gridLeft(21);
  const tempSingleCellFillTop = gridTop(19);
  const tempResidenceRectLeft = tempMidRectLeft + TEMP_RESIDENCE_RECT_OFFSET_X - 90;
  const tempResidenceRectTop = tempMidRectTop - 50;
  const tempLeftRectLeft = tempResidenceRectLeft - TEMP_LEFT_RECT_WIDTH;
  const tempLeftRectTop = tempResidenceRectTop + TEMP_RESIDENCE_RECT_HEIGHT - TEMP_LEFT_RECT_HEIGHT;
  const tempLeftRectDoorTop = tempLeftRectTop + TEMP_LEFT_RECT_DOOR_OFFSET_Y;
  const tempKitchenLeftDoorTop = tempLeftRectTop + TEMP_KITCHEN_LEFT_DOOR_OFFSET_Y;
  const tempFarLeftRectLeft = tempLeftRectLeft - TEMP_FAR_LEFT_RECT_WIDTH;
  const tempFarLeftRectTop = tempLeftRectTop + TEMP_LEFT_RECT_HEIGHT - TEMP_FAR_LEFT_RECT_HEIGHT - 40;
  const tempFarLeftRectDoorLeft =
    tempFarLeftRectLeft + TEMP_FAR_LEFT_RECT_WIDTH - TEMP_FAR_LEFT_RECT_DOOR_WIDTH - 10;
  const tempStaffAdjacentRoomWidth = TEMP_FAR_LEFT_RECT_WIDTH - 10;
  const tempStaffAdjacentRoomHeight =
    TEMP_FAR_LEFT_RECT_HEIGHT + TEMP_STAFF_ADJACENT_ROOM_HEIGHT_INCREASE - 1;
  const tempStaffAdjacentRoomLeft = tempFarLeftRectLeft - tempStaffAdjacentRoomWidth;
  const tempStaffAdjacentRoomTop =
    tempFarLeftRectTop + TEMP_FAR_LEFT_RECT_HEIGHT - tempStaffAdjacentRoomHeight;
  const tempMysterySideRectLeft = tempStaffAdjacentRoomLeft - TEMP_MYSTERY_SIDE_RECT_WIDTH + 5;
  const tempMysterySideRectBottom =
    tempStaffAdjacentRoomTop + tempStaffAdjacentRoomHeight;
  const tempMysteryRoomLabelLeft = tempStaffAdjacentRoomLeft + 8;
  const tempMysteryRoomLabelTop = tempStaffAdjacentRoomTop + 8;
  const tempKitchenLabelLeft = tempLeftRectLeft + 10;
  const tempKitchenLabelTop = tempLeftRectTop + 10;
  const tempSculleryLabelLeft = tempResidenceRectLeft + 10;
  const tempSculleryLabelTop = tempResidenceRectTop + 10;
  const tempMicroRectLeft = tempLeftRectLeft - TEMP_MICRO_RECT_WIDTH;
  const tempMicroRectTop = tempLeftRectTop + TEMP_LEFT_RECT_HEIGHT - TEMP_MICRO_RECT_HEIGHT;
  const tempSmallKitchenDoorLeft =
    tempMicroRectLeft + TEMP_MICRO_RECT_WIDTH - TEMP_SMALL_KITCHEN_DOOR_WIDTH;
  const tempLowerLeftExtensionLeft = tempMicroRectLeft - TEMP_LOWER_LEFT_EXTENSION_WIDTH + 118;
  const tempLowerLeftExtensionTop = tempMicroRectTop + TEMP_MICRO_RECT_HEIGHT;
  const tempStaffKitchenLabelLeft = tempFarLeftRectLeft + 8;
  const tempStaffKitchenLabelTop = tempFarLeftRectTop + 8;
  const tempStaffKitchenCorridorLabelLeft = tempLowerLeftExtensionLeft + 8;
  const tempStaffKitchenCorridorLabelTop = tempLowerLeftExtensionTop + 8;
  const tempOutsideDairyLabelLeft = tempMicroRectLeft + 8;
  const tempOutsideDairyLabelTop = tempMicroRectTop + 8;
  const tempConventAccessCorridoorLabelLeft = tempLowerLeftExtensionLeft + 8;
  const tempConventAccessCorridoorLabelTop = tempLowerLeftExtensionTop - 28;
  const tempOutsideDairySideRectLeft =
    tempMicroRectLeft - TEMP_MICRO_RECT_FILL_LEFT_EXTENSION - TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH + 52;
  const tempOutsideDairySideRectTop = tempLowerLeftExtensionTop;
  const tempOutsideDairyDoorRight =
    tempOutsideDairySideRectLeft +
    TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET +
    TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_WIDTH;
  const tempConventRectLeft = tempOutsideDairyDoorRight - 63;
  const tempConventRectTop =
    tempOutsideDairySideRectTop + TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS;
  const tempConventAdjacentRectLeft = tempConventRectLeft - TEMP_CONVENT_ADJACENT_RECT_WIDTH;
  const tempConventAdjacentRectTop = tempConventRectTop;
  const tempDownStairsOfficeTopRectLeft = tempConventAdjacentRectLeft;
  const tempDownStairsOfficeTopRectTop =
    tempConventAdjacentRectTop - TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT;
  const tempStaircaseHallCenterMarkerLeft =
    tempDownStairsOfficeTopRectLeft + Math.round(TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH / 2) - 1;
  const tempStaircaseHallCenterMarkerTop =
    tempDownStairsOfficeTopRectTop + Math.round((TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT - 20) / 2);
  const tempMainStaircaseLabelLeft = tempStaircaseHallCenterMarkerLeft - 6;
  const tempMainStaircaseLabelTop = tempStaircaseHallCenterMarkerTop - 24;
  const tempStaircaseHallLabelLeft = tempDownStairsOfficeTopRectLeft + 8;
  const tempStaircaseHallLabelTop = tempDownStairsOfficeTopRectTop + 8;
  const tempDownStairsOfficeTopRectDoorTop =
    tempDownStairsOfficeTopRectTop +
    TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT -
    TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_OFFSET_FROM_BOTTOM -
    TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_HEIGHT;
  const tempDownStaitsOfficeLeft = tempConventAdjacentRectLeft - TEMP_DOWN_STAITS_OFFICE_WIDTH;
  const tempDownStaitsOfficeTop =
    tempConventAdjacentRectTop + TEMP_CONVENT_ADJACENT_RECT_HEIGHT - TEMP_DOWN_STAITS_OFFICE_HEIGHT;
  const tempDownStaitsOfficeCenterX =
    tempDownStaitsOfficeLeft + Math.round(TEMP_DOWN_STAITS_OFFICE_WIDTH / 2);
  const tempDownStaitsOfficeCenterY =
    tempDownStaitsOfficeTop + Math.round(TEMP_DOWN_STAITS_OFFICE_HEIGHT / 2);
  const tempDownStaitsOfficeLabelLeft = tempDownStaitsOfficeLeft + 8;
  const tempDownStaitsOfficeLabelTop = tempDownStaitsOfficeTop + 8;
  const tempOratoryLabelLeft = tempDownStaitsOfficeLeft + 8;
  const tempOratoryLabelTop = tempDownStaitsOfficeTop + 28;
  const tempOratoryRightRoomLeft = tempDownStaitsOfficeLeft + TEMP_DOWN_STAITS_OFFICE_WIDTH - 85;
  const tempOratoryRightRoomTop = tempDownStaitsOfficeTop - 58;
  const tempGuestToiletTopRectLeft = tempOratoryRightRoomLeft;
  const tempGuestToiletTopRectTop = tempOratoryRightRoomTop - TEMP_GUEST_TOILET_TOP_RECT_HEIGHT;
  const tempMysterySideRectTop = tempGuestToiletTopRectTop;
  const tempMysterySideRectHeight = tempMysterySideRectBottom - tempMysterySideRectTop;
  const tempConventCorridorTopDoorLeft =
    tempMysterySideRectLeft +
    Math.round((TEMP_MYSTERY_SIDE_RECT_WIDTH - TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH) / 2);
  const tempConventCorridorLabelLeft = tempMysterySideRectLeft + 8;
  const tempConventCorridorLabelTop = tempMysterySideRectTop + 8;
  const tempGuestToiletLabelLeft = tempOratoryRightRoomLeft + 8;
  const tempGuestToiletLabelTop = tempOratoryRightRoomTop + 8;
  const tempLibraryLabelLeft = tempGuestToiletTopRectLeft + 8;
  const tempLibraryLabelTop = tempGuestToiletTopRectTop + 8;
  const tempCorridorDoorGapFillLeft = tempResidenceDoorLeft + TEMP_WALL_THICKNESS;
  const tempCorridorDoorGapFillWidth = tempSingleCellFillLeft - 35 - tempCorridorDoorGapFillLeft;
  const tempLowerLeftVerticalTop = tempNewRectTop;
  const tempLowerLeftVerticalHeight = tempLowerLeftVerticalBottom - tempLowerLeftVerticalTop;
  const tempStackedRoomsLeft =
    tempNewRectLeft + tempNewRectWidth - TEMP_STACKED_ROOM_WIDTH + TEMP_STACKED_ROOM_OFFSET_X;
  const tempStackedRoomsTop = tempNewRectBottom + TEMP_INTERNAL_WALL_THICKNESS;
  const tempTopStackedDoorTop = tempStackedRoomsTop + TEMP_STACKED_DOOR_OFFSET_Y;
  const tempBottomStackedDoorTop = tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT + TEMP_STACKED_DOOR_OFFSET_Y;
  const tempNewInternalLineTop =
    tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT * 2 - TEMP_INTERNAL_WALL_THICKNESS;
  const tempMensWcDropLeft = tempStackedRoomsLeft - 5;
  const tempMensWcDropTop = tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT * 2 - TEMP_INTERNAL_WALL_THICKNESS;
  const tempMensWcDropHeight = tempLowerHorizontalTop - tempMensWcDropTop + TEMP_WALL_THICKNESS;
  const tempDiningRoomFillLeft = tempNewRectLeft;
  const tempDiningRoomFillTop = tempNewRectBottom;
  const tempDiningRoomFillWidth = tempMensWcDropLeft - tempNewRectLeft;
  const tempDiningRoomFillHeight = tempLowerHorizontalTop - tempDiningRoomFillTop + 40;
  const tempCoffeeDockFillLeft = tempMensWcDropLeft;
  const tempCoffeeDockFillTop = tempNewRectBottom;
  const tempCoffeeDockFillWidth = tempLowerHorizontalLeft + tempLowerHorizontalWidth - tempCoffeeDockFillLeft;
  const tempCoffeeDockFillHeight = tempLowerHorizontalTop - tempCoffeeDockFillTop + TEMP_DINING_EXTENSION;
  const tempNarrowRoomLeft = tempNewRectLeft + TEMP_NARROW_ROOM_OFFSET_X;
  const tempNarrowRoomTop = tempNewRectBottom;
  const tempNarrowRoomHeight = tempNewInternalLineTop - tempNarrowRoomTop;
  const tempKitchenCorridorLeftRoomLeft = tempNewRectLeft;
  const tempKitchenCorridorLeftRoomTop = tempNarrowRoomTop;
  const tempKitchenCorridorLeftRoomWidth = tempNarrowRoomLeft - tempNewRectLeft;
  const tempKitchenCorridorLeftRoomHeight = tempNarrowRoomHeight;
  const tempWayUpRoomInnerLineTop =
    tempKitchenCorridorLeftRoomTop + tempKitchenCorridorLeftRoomHeight - 25;
  const tempNarrowRoomDoorLeft =
    tempNarrowRoomLeft + Math.round((TEMP_NARROW_ROOM_WIDTH - TEMP_NARROW_ROOM_DOOR_WIDTH) / 2);
  const tempKitchenCorridorLabelLeft = tempNarrowRoomLeft + 4;
  const tempKitchenCorridorLabelTop = tempNarrowRoomTop + 8;
  const tempWayUpRoomLabelLeft = tempKitchenCorridorLeftRoomLeft + 8;
  const tempWayUpRoomLabelTop = tempKitchenCorridorLeftRoomTop + 8;
  const tempFoodStoreRoomLeft = tempNarrowRoomLeft + TEMP_NARROW_ROOM_WIDTH;
  const tempFoodStoreRoomWidth = tempStackedRoomsLeft - tempFoodStoreRoomLeft;
  const tempDryFoodStoreLabelLeft = tempFoodStoreRoomLeft + 8;
  const tempDryFoodStoreLabelTop = tempNarrowRoomTop + 8;
  const tempServingAreaLabelLeft = tempFoodStoreRoomLeft + 8;
  const tempServingAreaLabelTop = tempWayUpRoomInnerLineTop + 8;
  const tempDiningRoomLabelLeft = tempDiningRoomFillLeft + 10;
  const tempDiningRoomLabelTop = tempWayUpRoomInnerLineTop + 10;
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
                left: tempTopHorizontalLeft + 12,
                top: tempVerticalTop + 140,
                padding: "4px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Admin and mdeical wing
            </div>
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
                left: tempAdminBaseRectLeft,
                top: tempAdminBaseRectTop,
                width: TEMP_ADMIN_BASE_RECT_WIDTH,
                height: TEMP_ADMIN_BASE_RECT_HEIGHT,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminBaseRectLeft,
                top:
                  tempAdminBaseRectTop +
                  TEMP_ADMIN_BASE_RECT_HEIGHT -
                  TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_ADMIN_BASE_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempSuregeryCottidoorLabelLeft,
                top: tempSuregeryCottidoorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Suregery cottidoor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempAdminBaseRectLeft,
                top: tempAdminBaseRectTop,
                width: TEMP_ADMIN_BASE_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempAdminBaseRectLeft +
                  TEMP_ADMIN_BASE_RECT_WIDTH -
                  TEMP_INTERNAL_WALL_THICKNESS,
                top: tempAdminBaseRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempAdminUpperRectTop - tempAdminBaseRectTop,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempAdminBaseRectLeft +
                  TEMP_ADMIN_BASE_RECT_WIDTH -
                  TEMP_INTERNAL_WALL_THICKNESS,
                top: tempAdminUpperRectTop + TEMP_ADMIN_UPPER_RECT_HEIGHT,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height:
                  tempAdminBaseRectTop +
                  TEMP_ADMIN_BASE_RECT_HEIGHT -
                  (tempAdminUpperRectTop + TEMP_ADMIN_UPPER_RECT_HEIGHT),
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top: tempAdminUpperRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempClockTowerDoorTop - tempAdminUpperRectTop,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top: tempClockTowerDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CLOCK_TOWER_DOOR_HEIGHT,
                background: "#FFFFFF",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft - 2,
                top: tempClockTowerDoorTop - 2,
                width: TEMP_INTERNAL_WALL_THICKNESS + 4,
                height: 2,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft - 2,
                top: tempClockTowerDoorTop + TEMP_CLOCK_TOWER_DOOR_HEIGHT,
                width: TEMP_INTERNAL_WALL_THICKNESS + 4,
                height: 2,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top: tempClockTowerDoorTop + TEMP_CLOCK_TOWER_DOOR_HEIGHT,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height:
                  tempAdminUpperRectTop +
                  TEMP_ADMIN_UPPER_RECT_HEIGHT -
                  (tempClockTowerDoorTop + TEMP_CLOCK_TOWER_DOOR_HEIGHT),
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top: tempAdminUpperRectTop,
                width: tempAdminUpperRectWidth,
                height: TEMP_ADMIN_UPPER_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top: tempAdminUpperRectTop,
                width: tempAdminUpperRectWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempAdminUpperRectLeft,
                top:
                  tempAdminUpperRectTop +
                  TEMP_ADMIN_UPPER_RECT_HEIGHT -
                  TEMP_INTERNAL_WALL_THICKNESS,
                width: tempAdminUpperRectWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempClockTowerStairWellLabelLeft,
                top: tempClockTowerStairWellLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Clock tower stair well
            </div>
            <div
              style={{
                position: "absolute",
                left: tempClockTowerStairLeft,
                top: tempClockTowerStairTop,
                width: TEMP_CLOCK_TOWER_STAIR_WIDTH,
                height: TEMP_CLOCK_TOWER_STAIR_HEIGHT,
                background:
                  "repeating-linear-gradient(to right, #4B5563 0 1px, #9CA3AF 1px 3px)",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempClockTowerLowerRectLeft,
                top: tempClockTowerLowerRectTop,
                width: tempAdminUpperRectWidth,
                height: TEMP_CLOCK_TOWER_LOWER_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempPaymentOfficeLabelLeft,
                top: tempPaymentOfficeLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Payment Office
            </div>
            <div
              style={{
                position: "absolute",
                left: tempClockTowerLowerRectLeft,
                top: tempClockTowerLowerRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CLOCK_TOWER_LOWER_RECT_HEIGHT,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempClockTowerLowerRectLeft +
                  tempAdminUpperRectWidth -
                  TEMP_INTERNAL_WALL_THICKNESS,
                top: tempClockTowerLowerRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CLOCK_TOWER_LOWER_RECT_HEIGHT,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerVerticalLeft,
                top: tempLowerVerticalTop,
                width: TEMP_WALL_THICKNESS,
                height: tempLowerVerticalHeight + TEMP_DINING_EXTENSION,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerHorizontalLeft,
                top: tempLowerHorizontalTop + TEMP_DINING_EXTENSION,
                width: tempLowerHorizontalWidth,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerLeftVerticalLeft,
                top: tempLowerLeftVerticalTop,
                width: TEMP_WALL_THICKNESS,
                height: tempLowerLeftVerticalHeight + TEMP_DINING_EXTENSION,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMidRectLeft,
                top: tempMidRectTop,
                width: TEMP_MID_RECT.width,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft,
                top: tempNewRectTop,
                width: tempNewRectWidth,
                height: tempNewRectBottom - tempNewRectTop,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft,
                top: tempNewRectTop,
                width: tempMidRectLeft - tempNewRectLeft,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidentsEntranceLeft,
                top: tempResidentsEntranceTop,
                width: TEMP_RESIDENTS_ENTRANCE_WIDTH,
                height: TEMP_WALL_THICKNESS,
                background: "#D9D9D9",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidentsEntranceLeft - 2,
                top: tempResidentsEntranceTop - 2,
                width: 3,
                height: TEMP_WALL_THICKNESS + 4,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidentsEntranceLeft + TEMP_RESIDENTS_ENTRANCE_WIDTH - 1,
                top: tempResidentsEntranceTop - 2,
                width: 3,
                height: TEMP_WALL_THICKNESS + 4,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMidRectLeft + TEMP_MID_RECT.width - TEMP_WALL_THICKNESS,
                top: tempMidRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_MID_RECT.height - 30,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMidRectLeft,
                top: tempMidRectTop,
                width: TEMP_MID_RECT.width,
                height: TEMP_MID_RECT.height - 30,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceRectLeft,
                top: tempResidenceRectTop,
                width: TEMP_RESIDENCE_RECT_WIDTH,
                height: TEMP_RESIDENCE_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceRectLeft + TEMP_RESIDENCE_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempResidenceRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_RESIDENCE_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceRectLeft,
                top: tempResidenceRectTop,
                width: TEMP_RESIDENCE_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceRectLeft,
                top: tempResidenceRectTop + TEMP_RESIDENCE_RECT_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_RESIDENCE_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft,
                top: tempLeftRectTop,
                width: TEMP_LEFT_RECT_WIDTH,
                height: TEMP_LEFT_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft,
                top: tempLeftRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_LEFT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft + TEMP_LEFT_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempLeftRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_LEFT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft + TEMP_LEFT_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempLeftRectDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_LEFT_RECT_DOOR_HEIGHT,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft + TEMP_LEFT_RECT_WIDTH - 3,
                top: tempLeftRectDoorTop - 2,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft + TEMP_LEFT_RECT_WIDTH - 3,
                top: tempLeftRectDoorTop + TEMP_LEFT_RECT_DOOR_HEIGHT,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft,
                top: tempLeftRectTop,
                width: TEMP_LEFT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft,
                top: tempLeftRectTop + TEMP_LEFT_RECT_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_LEFT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft,
                top: tempKitchenLeftDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_KITCHEN_LEFT_DOOR_HEIGHT,
                background: "#D9D9D9",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft - 2,
                top: tempKitchenLeftDoorTop - 2,
                width: TEMP_INTERNAL_WALL_THICKNESS + 4,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLeftRectLeft - 2,
                top: tempKitchenLeftDoorTop + TEMP_KITCHEN_LEFT_DOOR_HEIGHT,
                width: TEMP_INTERNAL_WALL_THICKNESS + 4,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft - TEMP_MICRO_RECT_FILL_LEFT_EXTENSION,
                top: tempMicroRectTop,
                width: TEMP_MICRO_RECT_WIDTH + TEMP_MICRO_RECT_FILL_LEFT_EXTENSION,
                height: TEMP_MICRO_RECT_HEIGHT,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft - TEMP_MICRO_RECT_FILL_LEFT_EXTENSION,
                top: tempMicroRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_MICRO_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairySideRectLeft,
                top: tempOutsideDairySideRectTop,
                width: TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH,
                height: TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairySideRectLeft,
                top: tempOutsideDairySideRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempOutsideDairySideRectLeft +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH -
                  TEMP_INTERNAL_WALL_THICKNESS,
                top: tempOutsideDairySideRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairySideRectLeft,
                top:
                  tempOutsideDairySideRectTop +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT -
                  TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairySideRectLeft + TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET - 1,
                top:
                  tempOutsideDairySideRectTop +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT -
                  TEMP_INTERNAL_WALL_THICKNESS -
                  2,
                width: TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_WIDTH + 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 3,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairySideRectLeft + TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET - 2,
                top: tempOutsideDairySideRectTop + TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT - 4,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempOutsideDairySideRectLeft +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_WIDTH,
                top:
                  tempOutsideDairySideRectTop +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT -
                  TEMP_INTERNAL_WALL_THICKNESS,
                width:
                  Math.floor(TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH / 2) -
                  (TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_OFFSET + TEMP_OUTSIDE_DAIRY_SIDE_RECT_DOOR_WIDTH),
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempOutsideDairySideRectLeft +
                  Math.floor(TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH / 2),
                top:
                  tempOutsideDairySideRectTop +
                  TEMP_OUTSIDE_DAIRY_SIDE_RECT_HEIGHT -
                  TEMP_WALL_THICKNESS,
                width: Math.ceil(TEMP_OUTSIDE_DAIRY_SIDE_RECT_WIDTH / 2),
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventRectLeft,
                top: tempConventRectTop,
                width: TEMP_CONVENT_RECT_WIDTH,
                height: TEMP_CONVENT_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventRectLeft,
                top: tempConventRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CONVENT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventRectLeft,
                top: tempConventRectTop,
                width: TEMP_CONVENT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventRectLeft + TEMP_CONVENT_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempConventRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CONVENT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventRectLeft,
                top: tempConventRectTop + TEMP_CONVENT_RECT_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_CONVENT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventAdjacentRectLeft,
                top: tempConventAdjacentRectTop,
                width: TEMP_CONVENT_ADJACENT_RECT_WIDTH,
                height: TEMP_CONVENT_ADJACENT_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventAdjacentRectLeft,
                top: tempConventAdjacentRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CONVENT_ADJACENT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventAdjacentRectLeft + TEMP_CONVENT_ADJACENT_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempConventAdjacentRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_CONVENT_ADJACENT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventAdjacentRectLeft,
                top: tempConventAdjacentRectTop,
                width: TEMP_CONVENT_ADJACENT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventAdjacentRectLeft,
                top: tempConventAdjacentRectTop + TEMP_CONVENT_ADJACENT_RECT_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_CONVENT_ADJACENT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLeft,
                top: tempDownStaitsOfficeTop,
                width: TEMP_DOWN_STAITS_OFFICE_WIDTH,
                height: TEMP_DOWN_STAITS_OFFICE_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLeft,
                top: tempDownStaitsOfficeTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_DOWN_STAITS_OFFICE_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLeft,
                top: tempDownStaitsOfficeTop,
                width: TEMP_DOWN_STAITS_OFFICE_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLeft + TEMP_DOWN_STAITS_OFFICE_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempDownStaitsOfficeTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_DOWN_STAITS_OFFICE_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLeft,
                top: tempDownStaitsOfficeTop + TEMP_DOWN_STAITS_OFFICE_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_DOWN_STAITS_OFFICE_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeCenterX - 1,
                top: tempDownStaitsOfficeCenterY - 14,
                width: 2,
                height: 28,
                background: "#333",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeCenterX - 10,
                top: tempDownStaitsOfficeCenterY - 1,
                width: 20,
                height: 2,
                background: "#333",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOratoryRightRoomLeft,
                top: tempOratoryRightRoomTop,
                width: TEMP_ORATORY_RIGHT_ROOM_WIDTH,
                height: TEMP_ORATORY_RIGHT_ROOM_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOratoryRightRoomLeft,
                top: tempOratoryRightRoomTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_ORATORY_RIGHT_ROOM_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOratoryRightRoomLeft,
                top: tempOratoryRightRoomTop,
                width: TEMP_ORATORY_RIGHT_ROOM_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOratoryRightRoomLeft + TEMP_ORATORY_RIGHT_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempOratoryRightRoomTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_ORATORY_RIGHT_ROOM_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempOratoryRightRoomLeft,
                top: tempOratoryRightRoomTop + TEMP_ORATORY_RIGHT_ROOM_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_ORATORY_RIGHT_ROOM_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempGuestToiletTopRectLeft,
                top: tempGuestToiletTopRectTop,
                width: TEMP_ORATORY_RIGHT_ROOM_WIDTH,
                height: TEMP_GUEST_TOILET_TOP_RECT_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempGuestToiletTopRectLeft,
                top: tempGuestToiletTopRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_GUEST_TOILET_TOP_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempGuestToiletTopRectLeft,
                top: tempGuestToiletTopRectTop,
                width: TEMP_ORATORY_RIGHT_ROOM_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempGuestToiletTopRectLeft + TEMP_ORATORY_RIGHT_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempGuestToiletTopRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_GUEST_TOILET_TOP_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDownStairsOfficeTopRectLeft,
                top: tempDownStairsOfficeTopRectTop,
                width: TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH,
                height: TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  TEMP_INTERNAL_WALL_THICKNESS,
                top: tempDownStairsOfficeTopRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  TEMP_INTERNAL_WALL_THICKNESS -
                  1,
                top: tempDownStairsOfficeTopRectDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS + 2,
                height: TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_HEIGHT,
                background: "#FFFFFF",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  4,
                top: tempDownStairsOfficeTopRectDoorTop - 2,
                width: 4,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  2,
                top: tempDownStairsOfficeTopRectDoorTop - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  4,
                top:
                  tempDownStairsOfficeTopRectDoorTop +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_HEIGHT,
                width: 4,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left:
                  tempDownStairsOfficeTopRectLeft +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_WIDTH -
                  2,
                top:
                  tempDownStairsOfficeTopRectDoorTop +
                  TEMP_DOWN_STAIRS_OFFICE_TOP_RECT_DOOR_HEIGHT -
                  2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerLeftExtensionLeft,
                top: tempLowerLeftExtensionTop,
                width: TEMP_LOWER_LEFT_EXTENSION_WIDTH,
                height: TEMP_LOWER_LEFT_EXTENSION_HEIGHT,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerLeftExtensionLeft - 8,
                top: tempLowerLeftExtensionTop,
                width: TEMP_WALL_THICKNESS,
                height: TEMP_LOWER_LEFT_EXTENSION_HEIGHT,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempLowerLeftExtensionLeft,
                top: tempLowerLeftExtensionTop + TEMP_LOWER_LEFT_EXTENSION_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_LOWER_LEFT_EXTENSION_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMysterySideRectLeft,
                top: tempMysterySideRectTop,
                width: TEMP_MYSTERY_SIDE_RECT_WIDTH,
                height: tempMysterySideRectHeight,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMysterySideRectLeft,
                top: tempMysterySideRectTop,
                width: tempConventCorridorTopDoorLeft - tempMysterySideRectLeft,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventCorridorTopDoorLeft - 1,
                top: tempMysterySideRectTop - 2,
                width: TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH + 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#FFFFFF",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventCorridorTopDoorLeft - 2,
                top: tempMysterySideRectTop - 3,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 6,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventCorridorTopDoorLeft + TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH,
                top: tempMysterySideRectTop - 3,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 6,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempConventCorridorTopDoorLeft + TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH,
                top: tempMysterySideRectTop,
                width:
                  tempMysterySideRectLeft +
                  TEMP_MYSTERY_SIDE_RECT_WIDTH -
                  (tempConventCorridorTopDoorLeft + TEMP_CONVENT_CORRIDOR_TOP_DOOR_WIDTH),
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMysterySideRectLeft + TEMP_MYSTERY_SIDE_RECT_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempMysterySideRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempMysterySideRectHeight,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaffAdjacentRoomLeft,
                top: tempStaffAdjacentRoomTop,
                width: tempStaffAdjacentRoomWidth,
                height: tempStaffAdjacentRoomHeight,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaffAdjacentRoomLeft,
                top: tempStaffAdjacentRoomTop,
                width: tempStaffAdjacentRoomWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaffAdjacentRoomLeft + tempStaffAdjacentRoomWidth - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempStaffAdjacentRoomTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempStaffAdjacentRoomHeight,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaffAdjacentRoomLeft,
                top: tempStaffAdjacentRoomTop + tempStaffAdjacentRoomHeight - TEMP_INTERNAL_WALL_THICKNESS,
                width: tempStaffAdjacentRoomWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectLeft,
                top: tempFarLeftRectTop,
                width: TEMP_FAR_LEFT_RECT_WIDTH,
                height: TEMP_FAR_LEFT_RECT_HEIGHT,
                background: "#86EFAC",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectLeft,
                top: tempFarLeftRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_FAR_LEFT_RECT_HEIGHT,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectLeft,
                top: tempFarLeftRectTop,
                width: TEMP_FAR_LEFT_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectDoorLeft - 1,
                top: tempFarLeftRectTop + TEMP_FAR_LEFT_RECT_HEIGHT - TEMP_WALL_THICKNESS,
                width: TEMP_FAR_LEFT_RECT_DOOR_WIDTH + 2,
                height: TEMP_WALL_THICKNESS + 1,
                background: "#86EFAC",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectDoorLeft - 2,
                top: tempFarLeftRectTop + TEMP_FAR_LEFT_RECT_HEIGHT - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFarLeftRectDoorLeft + TEMP_FAR_LEFT_RECT_DOOR_WIDTH,
                top: tempFarLeftRectTop + TEMP_FAR_LEFT_RECT_HEIGHT - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft,
                top: tempMicroRectTop,
                width: TEMP_MICRO_RECT_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft + 30,
                top: tempMicroRectTop + TEMP_MICRO_RECT_HEIGHT - TEMP_WALL_THICKNESS,
                width: TEMP_MICRO_RECT_WIDTH - 30,
                height: TEMP_WALL_THICKNESS,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft + TEMP_MICRO_RECT_WIDTH - TEMP_MICRO_BASE_GAP_WIDTH,
                top: tempMicroRectTop + TEMP_MICRO_RECT_HEIGHT - TEMP_WALL_THICKNESS,
                width: TEMP_MICRO_BASE_GAP_WIDTH,
                height: TEMP_WALL_THICKNESS,
                background: "#D9D9D9",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft + TEMP_MICRO_RECT_WIDTH - TEMP_MICRO_BASE_GAP_WIDTH - 2,
                top: tempMicroRectTop + TEMP_MICRO_RECT_HEIGHT - 2,
                width: 2,
                height: TEMP_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMicroRectLeft + TEMP_MICRO_RECT_WIDTH,
                top: tempMicroRectTop + TEMP_MICRO_RECT_HEIGHT - 2,
                width: 2,
                height: TEMP_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempCorridorDoorGapFillLeft,
                top: tempSingleCellFillTop - 20,
                width: tempCorridorDoorGapFillWidth,
                height: GRID_SIZE + 20,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempSingleCellFillLeft - 35,
                top: tempSingleCellFillTop - 20,
                width: GRID_SIZE + 58,
                height: GRID_SIZE + 20,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMidRectLeft,
                top: tempMidRectTop,
                width: TEMP_WALL_THICKNESS,
                height: TEMP_MID_RECT.height - 30 - 40,
                background: "#EF4444",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft,
                top: tempNewRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: 40 + TEMP_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft + tempNewRectWidth - TEMP_WALL_THICKNESS,
                top: tempNewRectTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: 40 + TEMP_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceDoorLeft,
                top: tempResidenceDoorTop,
                width: TEMP_WALL_THICKNESS,
                height: TEMP_RESIDENCE_DOOR_SIZE,
                background: "#D9D9D9",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceDoorLeft - 3,
                top: tempResidenceDoorTop - 3,
                width: TEMP_WALL_THICKNESS + 6,
                height: 3,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempResidenceDoorLeft - 3,
                top: tempResidenceDoorTop + TEMP_RESIDENCE_DOOR_SIZE,
                width: TEMP_WALL_THICKNESS + 6,
                height: 3,
                background: "#111",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft,
                top: tempNewRectBottom,
                width: tempNewRectWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#111",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempDiningRoomFillLeft,
                top: tempDiningRoomFillTop,
                width: tempDiningRoomFillWidth,
                height: tempDiningRoomFillHeight,
                background: "#D9D9D9",
                zIndex: 53,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempCoffeeDockFillLeft,
                top: tempCoffeeDockFillTop,
                width: tempCoffeeDockFillWidth,
                height: tempCoffeeDockFillHeight,
                background: "#D9D9D9",
                zIndex: 53,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft,
                top: tempStackedRoomsTop,
                width: TEMP_STACKED_ROOM_WIDTH,
                height: TEMP_STACKED_ROOM_HEIGHT * 2,
                background: "#D9D9D9",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft,
                top: tempStackedRoomsTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_STACKED_ROOM_HEIGHT * 2,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempStackedRoomsTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_STACKED_ROOM_HEIGHT * 2,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempTopStackedDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_STACKED_DOOR_SIZE,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - 3,
                top: tempTopStackedDoorTop - 2,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - 3,
                top: tempTopStackedDoorTop + TEMP_STACKED_DOOR_SIZE,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempBottomStackedDoorTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: TEMP_STACKED_DOOR_SIZE,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - 3,
                top: tempBottomStackedDoorTop - 2,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft + TEMP_STACKED_ROOM_WIDTH - 3,
                top: tempBottomStackedDoorTop + TEMP_STACKED_DOOR_SIZE,
                width: 6,
                height: 2,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft,
                top: tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_STACKED_ROOM_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStackedRoomsLeft,
                top: tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT * 2 - TEMP_INTERNAL_WALL_THICKNESS,
                width: TEMP_STACKED_ROOM_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft,
                top: tempStackedRoomsTop + TEMP_STACKED_ROOM_HEIGHT * 2 - TEMP_INTERNAL_WALL_THICKNESS,
                width: tempStackedRoomsLeft - tempNewRectLeft,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempFoodStoreRoomLeft,
                top: tempNewInternalLineTop - TEMP_INTERNAL_WALL_THICKNESS,
                width: tempFoodStoreRoomWidth,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background:
                  "repeating-linear-gradient(to right, #333 0 6px, transparent 6px 10px)",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempMensWcDropLeft,
                top: tempMensWcDropTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempMensWcDropHeight + 40,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempKitchenCorridorLeftRoomLeft,
                top: tempKitchenCorridorLeftRoomTop,
                width: tempKitchenCorridorLeftRoomWidth,
                height: tempKitchenCorridorLeftRoomHeight,
                background: "#F9A8D4",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempKitchenCorridorLeftRoomLeft + TEMP_WALL_THICKNESS,
                top:
                  tempKitchenCorridorLeftRoomTop +
                  tempKitchenCorridorLeftRoomHeight -
                  TEMP_INTERNAL_WALL_THICKNESS,
                width: tempKitchenCorridorLeftRoomWidth - TEMP_WALL_THICKNESS,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background:
                  "repeating-linear-gradient(to right, #333 0 6px, transparent 6px 10px)",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempKitchenCorridorLeftRoomLeft + TEMP_WALL_THICKNESS,
                top: tempWayUpRoomInnerLineTop,
                width: tempKitchenCorridorLeftRoomWidth - TEMP_WALL_THICKNESS,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomLeft + TEMP_NARROW_ROOM_WIDTH,
                top: tempWayUpRoomInnerLineTop,
                width: tempStackedRoomsLeft - (tempNarrowRoomLeft + TEMP_NARROW_ROOM_WIDTH),
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomLeft,
                top: tempNarrowRoomTop,
                width: TEMP_NARROW_ROOM_WIDTH,
                height: tempNarrowRoomHeight,
                background: "#FDE68A",
                zIndex: 54,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomLeft,
                top: tempNarrowRoomTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempNarrowRoomHeight,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomLeft + TEMP_NARROW_ROOM_WIDTH - TEMP_INTERNAL_WALL_THICKNESS,
                top: tempNarrowRoomTop,
                width: TEMP_INTERNAL_WALL_THICKNESS,
                height: tempNarrowRoomHeight,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomDoorLeft,
                top: tempNarrowRoomTop,
                width: TEMP_NARROW_ROOM_DOOR_WIDTH,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomDoorLeft - 2,
                top: tempNarrowRoomTop - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomDoorLeft + TEMP_NARROW_ROOM_DOOR_WIDTH,
                top: tempNarrowRoomTop - 2,
                width: 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 4,
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomLeft,
                top: tempNewInternalLineTop - TEMP_INTERNAL_WALL_THICKNESS,
                width: tempNarrowRoomDoorLeft - tempNarrowRoomLeft,
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomDoorLeft - 1,
                top: tempNewInternalLineTop - TEMP_INTERNAL_WALL_THICKNESS - 1,
                width: TEMP_NARROW_ROOM_DOOR_WIDTH + 2,
                height: TEMP_INTERNAL_WALL_THICKNESS + 2,
                background: "#FDE68A",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempNarrowRoomDoorLeft + TEMP_NARROW_ROOM_DOOR_WIDTH,
                top: tempNewInternalLineTop - TEMP_INTERNAL_WALL_THICKNESS,
                width:
                  tempNarrowRoomLeft + TEMP_NARROW_ROOM_WIDTH -
                  (tempNarrowRoomDoorLeft + TEMP_NARROW_ROOM_DOOR_WIDTH),
                height: TEMP_INTERNAL_WALL_THICKNESS,
                background: "#333",
                zIndex: 55,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempWayUpRoomLabelLeft,
                top: tempWayUpRoomLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              the way up room
            </div>
            <div
              style={{
                position: "absolute",
                left: tempDryFoodStoreLabelLeft,
                top: tempDryFoodStoreLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Dry Food Store
            </div>
            <div
              style={{
                position: "absolute",
                left: tempDiningRoomLabelLeft,
                top: tempDiningRoomLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Dinning Room
            </div>
            <div
              style={{
                position: "absolute",
                left: tempServingAreaLabelLeft,
                top: tempServingAreaLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Serving Area
            </div>
            <div
              style={{
                position: "absolute",
                left: tempKitchenCorridorLabelLeft,
                top: tempKitchenCorridorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Kitchen Corridor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempCoffeeDockDoorLabelLeft,
                top: tempCoffeeDockDoorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Coffee Dock Door
            </div>
            <div
              style={{
                position: "absolute",
                left: tempMainStaircaseLabelLeft,
                top: tempMainStaircaseLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Main Staircase
            </div>
            <div
              style={{
                position: "absolute",
                left: tempStaircaseHallLabelLeft,
                top: tempStaircaseHallLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Staircase Hall
            </div>
            <div
              style={{
                position: "absolute",
                left: tempConventCorridorLabelLeft,
                top: tempConventCorridorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Convent Corridor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempMysteryRoomLabelLeft,
                top: tempMysteryRoomLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Mystery room
            </div>
            <div
              style={{
                position: "absolute",
                left: tempKitchenLabelLeft,
                top: tempKitchenLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Kitchen
            </div>
            <div
              style={{
                position: "absolute",
                left: tempStaffKitchenLabelLeft,
                top: tempStaffKitchenLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Staff Kitchen
            </div>
            <div
              style={{
                position: "absolute",
                left: tempLibraryLabelLeft,
                top: tempLibraryLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              The Library
            </div>
            <div
              style={{
                position: "absolute",
                left: tempGuestToiletLabelLeft,
                top: tempGuestToiletLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Guest Toilet
            </div>
            <div
              style={{
                position: "absolute",
                left: tempDownStaitsOfficeLabelLeft,
                top: tempDownStaitsOfficeLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Down Staits Office
            </div>
            <div
              style={{
                position: "absolute",
                left: tempOratoryLabelLeft,
                top: tempOratoryLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              The Oratory
            </div>
            <div
              style={{
                position: "absolute",
                left: tempConventAccessCorridoorLabelLeft,
                top: tempConventAccessCorridoorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Convent Access Corridoor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempOutsideDairyLabelLeft,
                top: tempOutsideDairyLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Outside Dairy
            </div>
            <div
              style={{
                position: "absolute",
                left: tempStaffKitchenCorridorLabelLeft,
                top: tempStaffKitchenCorridorLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Staff Kitchen Corridor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempSculleryLabelLeft,
                top: tempSculleryLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Scullery
            </div>
            <div
              style={{
                position: "absolute",
                left: tempResidentsEntranceLabelLeft,
                top: tempResidentsEntranceLabelTop,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              Residents entrance
            </div>
            <div
              style={{
                position: "absolute",
                left: tempNewRectLeft + 10,
                top: tempNewRectTop + 12,
                padding: "4px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              dining room corridor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempMidRectLeft + 8,
                top: tempMidRectTop + 8,
                padding: "4px 8px",
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 6,
                fontFamily: "Arial, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#7F1D1D",
                zIndex: 56,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              residence entrance corridor
            </div>
            <div
              style={{
                position: "absolute",
                left: tempStaircaseHallCenterMarkerLeft,
                top: tempStaircaseHallCenterMarkerTop,
                width: 45,
                height: 20,
                background:
                  "repeating-linear-gradient(to right, #4B5563 0 1px, #9CA3AF 1px 3px)",
                zIndex: 56,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaircaseHallCenterMarkerLeft - 4,
                top: tempStaircaseHallCenterMarkerTop - 3,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: tempStaircaseHallCenterMarkerLeft - 4,
                top: tempStaircaseHallCenterMarkerTop + 16,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#333",
                zIndex: 57,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
