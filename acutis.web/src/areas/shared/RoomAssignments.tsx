// src/units/shared/operations/RoomAssignments.tsx

import React, { useEffect, useMemo, useState } from "react";
import DetoxFloorPlan from "@/areas/detox/components/DetoxFloorPlan";
import MainFloorPlanWithLabels from "@/areas/detox/components/MainFloorPlanWithLabels";
import MergedDloorplan from "@/areas/detox/components/MergedDloorplan";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { operationsService } from "@/services/operationsService";
import { residentService } from "@/services/residentService";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

type Resident = {
  id: string;
  initials: string;
};

interface RoomAssignmentsProps {
  unitId?: UnitId;
}

const toResidentInitials = (firstName: string, surname: string): string => {
  const first = firstName.trim()[0] ?? "?";
  const second = surname.trim()[0] ?? "?";
  return `${first}${second}`.toUpperCase();
};

const shuffleResidents = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const StandardRoomAssignments: React.FC<{ unitId: UnitId }> = ({ unitId }) => {
  const { loadKeys, t } = useLocalization();
  const [roomAssignments, setRoomAssignments] = useState<Record<number, Resident[]>>({});
  const [roomList, setRoomList] = useState<number[]>([]);
  const [capacityPerRoom, setCapacityPerRoom] = useState(2);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    void loadKeys([
      "room_assignments.title",
      "room_assignments.description",
      "room_assignments.zoom_out",
      "room_assignments.zoom_in",
      "room_assignments.loading",
      "room_assignments.unable_to_load",
      "room_assignments.courtyard",
      "room_assignments.reception",
      "room_assignments.clocktower",
      "room_assignments.st_josephs_side",
      "room_assignments.green_mile",
      "room_assignments.over_drug_unit",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const [rooms, residents] = await Promise.all([
          operationsService.getRoomAssignments(unitId),
          residentService.getResidents(unitId),
        ]);

        if (!active) {
          return;
        }

        const residentsById = new Map(
          residents.map((resident) => [
            resident.id,
            {
              id: String(resident.id),
              initials: toResidentInitials(resident.firstName, resident.surname),
            },
          ]),
        );

        const mappedAssignments = rooms.reduce<Record<number, Resident[]>>((acc, room) => {
          const numericRoom = Number(room.roomCode);
          if (!Number.isFinite(numericRoom)) {
            return acc;
          }

          acc[numericRoom] = room.occupants
            .map((occupant) => residentsById.get(occupant.residentId))
            .filter((resident): resident is Resident => resident !== undefined);

          return acc;
        }, {});

        const previewAssignments = { ...mappedAssignments };

        if (unitId === "alcohol") {
          const currentlyAssigned = Object.values(previewAssignments).reduce((total, occupants) => total + occupants.length, 0);
          const previewTarget = 30;

          if (currentlyAssigned < previewTarget) {
            const assignedIds = new Set(
              Object.values(previewAssignments)
                .flatMap((occupants) => occupants)
                .map((resident) => resident.id),
            );

            const previewPool = shuffleResidents(
              residents
                .filter((resident) => !assignedIds.has(String(resident.id)))
                .map((resident) => ({
                  id: String(resident.id),
                  initials: toResidentInitials(resident.firstName, resident.surname),
                })),
            );

            let remaining = Math.min(previewTarget - currentlyAssigned, previewPool.length);

            for (const room of rooms) {
              if (remaining <= 0) {
                break;
              }

              const numericRoom = Number(room.roomCode);
              if (!Number.isFinite(numericRoom)) {
                continue;
              }

              const occupants = previewAssignments[numericRoom] ?? [];
              const availableSlots = Math.max(0, room.capacity - occupants.length);
              if (availableSlots === 0) {
                continue;
              }

              const additions = previewPool.splice(0, Math.min(availableSlots, remaining));
              if (additions.length === 0) {
                continue;
              }

              previewAssignments[numericRoom] = [...occupants, ...additions];
              remaining -= additions.length;
            }
          }
        }

        setRoomList(
          rooms
            .map((room) => Number(room.roomCode))
            .filter((room): room is number => Number.isFinite(room))
            .sort((left, right) => left - right),
        );
        setCapacityPerRoom(Math.max(1, rooms[0]?.capacity ?? 2));
        setRoomAssignments(previewAssignments);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load room assignments.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [unitId]);

  const totalRooms = roomList.length;
  const sideLength = Math.max(1, totalRooms / 4);
  const gridSize = sideLength + 2;

  const corridorPadding = 40;
  const cellSizeRem = 3.5;
  const cellSizePx = 56;
  const receptionSizePx = cellSizePx * 2;
  const intersectionX = cellSizePx;
  const intersectionY = cellSizePx * 3;
  const courtyardBorderInset = 4;

  const receptionLeft =
    intersectionX - receptionSizePx / 2 + receptionSizePx / Math.SQRT2;
  const receptionTop = intersectionY - receptionSizePx / 2;
  const receptionCenterX = receptionLeft + receptionSizePx / 2;
  const receptionCenterY = receptionTop + receptionSizePx / 2;

  const corridorThickness = receptionSizePx / 2;
  const corridorLeft = intersectionX - courtyardBorderInset;
  const corridorRight = receptionCenterX;
  const corridorLength = corridorRight - corridorLeft;

  const roomCellClass =
    "relative h-full w-full overflow-hidden rounded-md bg-[var(--app-surface-muted)] text-xs font-medium text-[var(--app-text)] shadow-sm";

  const roomsPerimeterStyle: React.CSSProperties = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, ${cellSizeRem}rem)`,
    gridTemplateRows: `repeat(${gridSize}, ${cellSizeRem}rem)`,
  };

  const corridorStyle: React.CSSProperties = {
    position: "absolute",
    left: `${corridorLeft}px`,
    top: `${receptionCenterY - corridorThickness / 2}px`,
    width: `${corridorLength}px`,
    height: `${corridorThickness}px`,
    backgroundColor: "var(--app-surface-muted)",
    border: "1px solid var(--app-border)",
    borderLeft: "none",
    borderRadius: "0",
    pointerEvents: "none",
    zIndex: 1,
  };

  const receptionStyle: React.CSSProperties = {
    position: "absolute",
    width: `${receptionSizePx}px`,
    height: `${receptionSizePx}px`,
    left: `${receptionLeft}px`,
    top: `${receptionTop}px`,
    transformOrigin: "center",
    transform: "rotate(45deg)",
    backgroundColor: "var(--app-surface-muted)",
    border: "1px solid var(--app-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  };

  const receptionLabelStyle: React.CSSProperties = {
    transform: "rotate(-45deg)",
    color: "var(--app-text)",
    fontWeight: 600,
    fontSize: "0.75rem",
  };

  const handleDragStart = React.useCallback(
    (residentId: string, fromRoom: number) =>
      (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({ residentId, fromRoom }),
        );
        event.dataTransfer.effectAllowed = "move";
        setDraggingId(residentId);
      },
    [],
  );

  const handleDragEnd = React.useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDragOver = React.useCallback(
    (room: number) => (event: React.DragEvent<HTMLDivElement>) => {
      const occupants = roomAssignments[room] ?? [];
      const isResidentAlreadyHere =
        draggingId !== null &&
        occupants.some((resident) => resident.id === draggingId);

      if (!isResidentAlreadyHere && occupants.length >= capacityPerRoom) {
        event.dataTransfer.dropEffect = "none";
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [capacityPerRoom, draggingId, roomAssignments],
  );

  const handleDrop = React.useCallback(
    (room: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("application/json");
      setDraggingId(null);

      if (!payload) {
        return;
      }

      try {
        const { residentId, fromRoom } = JSON.parse(payload) as {
          residentId: string;
          fromRoom: number;
        };

        if (fromRoom === room) {
          return;
        }

        setRoomAssignments((prev) => {
          const source = prev[fromRoom] ?? [];
          const target = prev[room] ?? [];

          if (target.length >= capacityPerRoom) {
            return prev;
          }

          const movingResident = source.find((resident) => resident.id === residentId);
          if (!movingResident) {
            return prev;
          }

          const next: Record<number, Resident[]> = {
            ...prev,
            [fromRoom]: source.filter((resident) => resident.id !== residentId),
          };

          next[room] = [...target, movingResident];
          return next;
        });
      } catch {
        // ignore invalid payloads
      } finally {
        event.dataTransfer.clearData();
      }
    },
    [capacityPerRoom],
  );

  const renderRoom = (num: number) => {
    const occupants = roomAssignments[num] ?? [];

    const slotPositions: Array<React.CSSProperties> = [
      { top: "0.45rem", right: "0.45rem" },
      { bottom: "0.45rem", left: "0.45rem" },
    ];

    const baseClasses =
      "absolute w-6 h-6 rounded-full uppercase flex items-center justify-center text-[9px] font-semibold";

    return (
      <div
        className={roomCellClass}
        style={{ boxShadow: "0 0 0 1px var(--app-border) inset" }}
        onDragOver={handleDragOver(num)}
        onDrop={handleDrop(num)}
      >
        <span className="absolute left-1 top-1 text-[11px] font-semibold text-[var(--app-text)]">
          {num}
        </span>

        {slotPositions.map((styleConfig, index) => {
          const resident = occupants[index];

          if (resident) {
            const dragStyle =
              draggingId === resident.id
                ? { ...styleConfig, opacity: 0.45 }
                : styleConfig;

            return (
              <div
                key={resident.id}
                draggable
                onDragStart={handleDragStart(resident.id, num)}
                onDragEnd={handleDragEnd}
                className={`${baseClasses} cursor-grab select-none bg-[var(--app-primary)] text-white active:cursor-grabbing`}
                style={dragStyle}
              >
                {resident.initials}
              </div>
            );
          }

          return (
            <div
              key={`placeholder-${num}-${index}`}
              className={`${baseClasses} pointer-events-none border border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-primary-soft)_55%,transparent)] text-transparent`}
              style={styleConfig}
            />
          );
        })}
      </div>
    );
  };

  const topRooms = useMemo(() => roomList.slice(0, sideLength), [roomList, sideLength]);
  const rightRooms = useMemo(() => roomList.slice(sideLength, sideLength * 2), [roomList, sideLength]);
  const bottomRooms = useMemo(() => roomList.slice(sideLength * 2, sideLength * 3), [roomList, sideLength]);
  const leftRooms = useMemo(() => roomList.slice(sideLength * 3, totalRooms), [roomList, sideLength, totalRooms]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="app-card rounded-xl p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("room_assignments.title", "Room Assignments")}</h2>
          <p className="text-sm text-[var(--app-text-muted)]">{text("room_assignments.description", "Drag and drop resident initials between available room slots.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.6, current - 0.1))}
            className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition"
          >
            {text("room_assignments.zoom_out", "Zoom Out")}
          </button>
          <div className="min-w-16 text-center text-sm font-medium text-[var(--app-text-muted)]">{zoomPercent}%</div>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(1.8, current + 0.1))}
            className="app-outline-button rounded-md px-3 py-1.5 text-sm font-medium transition"
          >
            {text("room_assignments.zoom_in", "Zoom In")}
          </button>
        </div>
      </div>

      {loading ? <div className="mb-4 text-sm text-[var(--app-text-muted)]">{text("room_assignments.loading", "Loading room assignments...")}</div> : null}
      {error ? <div className="mb-4 text-sm text-[var(--app-danger)]">{error}</div> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto">
          <div className="min-w-[780px] py-2 flex justify-center">
            <div
              className="relative inline-flex items-center justify-center rounded-lg border-4 border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-warning)_16%,white)]"
              style={{ padding: `${corridorPadding}px`, transform: `scale(${zoom})`, transformOrigin: "center top" }}
            >
              <div style={roomsPerimeterStyle}>
                {topRooms.map((num, index) => (
                  <div key={num} style={{ gridColumn: index + 2, gridRow: 1 }}>
                    {renderRoom(num)}
                  </div>
                ))}

                {rightRooms.map((num, index) => (
                  <div key={num} style={{ gridColumn: gridSize, gridRow: index + 2 }}>
                    {renderRoom(num)}
                  </div>
                ))}

                {bottomRooms.map((num, index) => (
                  <div
                    key={num}
                    style={{ gridColumn: gridSize - 1 - index, gridRow: gridSize }}
                  >
                    {renderRoom(num)}
                  </div>
                ))}

                {leftRooms.map((num, index) => (
                  <div
                    key={num}
                    style={{ gridColumn: 1, gridRow: gridSize - 1 - index }}
                  >
                    {renderRoom(num)}
                  </div>
                ))}

                <div
                  style={{ gridColumn: `2 / ${gridSize}`, gridRow: `2 / ${gridSize}` }}
                  className="flex items-center justify-center rounded-lg border-4 border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-success)_18%,white)] text-sm font-semibold text-[var(--app-success)]"
                >
                  {text("room_assignments.courtyard", "Courtyard")}
                </div>

                <div style={corridorStyle} />

                <div style={receptionStyle}>
                  <span style={receptionLabelStyle}>{text("room_assignments.reception", "Reception")}</span>
                </div>

                <div
                  className="absolute text-sm font-semibold text-[var(--app-text)]"
                  style={{ top: "-27px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
                >
                  {text("room_assignments.clocktower", "Clocktower")}
                </div>
                <div
                  className="absolute text-sm font-semibold text-[var(--app-text)]"
                  style={{ bottom: "-27px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
                >
                  {text("room_assignments.st_josephs_side", "St Joseph's Side")}
                </div>
                <div
                  className="absolute text-sm font-semibold text-[var(--app-text)]"
                  style={{ left: "-56px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", pointerEvents: "none" }}
                >
                  {text("room_assignments.green_mile", "Green Mile")}
                </div>
                <div
                  className="absolute text-sm font-semibold text-[var(--app-text)]"
                  style={{ right: "-72px", top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }}
                >
                  {text("room_assignments.over_drug_unit", "Over Drug Unit")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const RoomAssignments: React.FC<RoomAssignmentsProps> = ({ unitId }) => {
  if (unitId === "detox") {
    return <DetoxFloorPlan />;
  }

  if (unitId === "drugs") {
    return <MainFloorPlanWithLabels />;
  }

  if (unitId === "ladies") {
    return <MergedDloorplan />;
  }

  return <StandardRoomAssignments unitId={unitId ?? "alcohol"} />;
};

export default RoomAssignments;
