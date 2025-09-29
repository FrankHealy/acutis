// src/components/operations/RoomAssignments.tsx

import React from "react";

type Resident = {
  id: string;
  initials: string;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateInitials = (): string => {
  const first = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const second = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return `${first}${second}`;
};

const shuffleArray = <T,>(input: T[]): T[] => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const RoomAssignments: React.FC = () => {
  const totalRooms = 44;
  const capacityPerRoom = 2;
  const totalResidents = 40;

  const sideLength = totalRooms / 4; // 11 rooms per edge
  const gridSize = sideLength + 2; // 13 grid cells including corners

  const rooms = React.useMemo(
    () => Array.from({ length: totalRooms }, (_, i) => i + 1),
    [totalRooms]
  );

  const residents = React.useMemo<Resident[]>(
    () =>
      Array.from({ length: totalResidents }, (_, index) => ({
        id: `resident-${index + 1}`,
        initials: generateInitials(),
      })),
    [totalResidents]
  );

  const initialAssignments = React.useMemo<Record<number, Resident[]>>(() => {
    const assignments = rooms.reduce<Record<number, Resident[]>>((acc, room) => {
      acc[room] = [];
      return acc;
    }, {});

    const availableSlots = shuffleArray(
      rooms.flatMap((room) =>
        Array.from({ length: capacityPerRoom }, () => room)
      )
    );

    residents.forEach((resident, index) => {
      const roomNumber = availableSlots[index];
      if (!roomNumber) {
        return;
      }
      assignments[roomNumber] = [...assignments[roomNumber], resident];
    });

    return assignments;
  }, [capacityPerRoom, residents, rooms]);

  const [roomOccupants, setRoomOccupants] = React.useState<Record<number, Resident[]>>(initialAssignments);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const corridorPadding = 40;
  const cellSizeRem = 3.5;
  const cellSizePx = 56; // assumes 16px root font-size for rem conversion
  const receptionSizePx = cellSizePx * 2;
  const intersectionX = cellSizePx; // between left rooms and courtyard
  const intersectionY = cellSizePx * 3; // between rooms 42/43 and courtyard wall
  const courtyardBorderInset = 4; // match courtyard border thickness

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
    "relative w-full h-full bg-gray-100 text-xs font-medium text-gray-700 overflow-hidden rounded-md shadow-sm";

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
    backgroundColor: "#f8fafc",
    border: "1px solid #94a3b8",
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
    backgroundColor: "#f8fafc",
    border: "1px solid #94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  };

  const receptionLabelStyle: React.CSSProperties = {
    transform: "rotate(-45deg)",
    color: "#1f2937",
    fontWeight: 600,
    fontSize: "0.75rem",
  };

  const handleDragStart = React.useCallback(
    (residentId: string, fromRoom: number) =>
      (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({ residentId, fromRoom })
        );
        event.dataTransfer.effectAllowed = "move";
        setDraggingId(residentId);
      },
    []
  );

  const handleDragEnd = React.useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDragOver = React.useCallback(
    (room: number) => (event: React.DragEvent<HTMLDivElement>) => {
      const occupants = roomOccupants[room] ?? [];
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
    [capacityPerRoom, draggingId, roomOccupants]
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

        setRoomOccupants((prev) => {
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
    [capacityPerRoom]
  );

  const renderRoom = (num: number) => {
    const occupants = roomOccupants[num] ?? [];

    const slotPositions: Array<React.CSSProperties> = [
      { top: "0.45rem", right: "0.45rem" },
      { bottom: "0.45rem", left: "0.45rem" },
    ];

    const baseClasses =
      "absolute w-6 h-6 rounded-full uppercase flex items-center justify-center text-[9px] font-semibold";

    return (
      <div
        className={roomCellClass}
        style={{ boxShadow: "0 0 0 1px #cbd5f5 inset" }}
        onDragOver={handleDragOver(num)}
        onDrop={handleDrop(num)}
      >
        <span className="absolute top-1 left-1 text-[11px] font-semibold text-gray-700">
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
                className={`${baseClasses} bg-blue-500 text-white cursor-grab active:cursor-grabbing select-none`}
                style={dragStyle}
              >
                {resident.initials}
              </div>
            );
          }

          return (
            <div
              key={`placeholder-${num}-${index}`}
              className={`${baseClasses} border border-dashed border-slate-300/80 bg-blue-200/20 text-transparent pointer-events-none`}
              style={styleConfig}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 flex justify-center">
      <div
        className="relative inline-flex items-center justify-center border-4 border-gray-300 rounded-lg bg-yellow-100"
        style={{ padding: `${corridorPadding}px` }}
      >
        <div style={roomsPerimeterStyle}>
          {/* Top row */}
          {rooms.slice(0, sideLength).map((num, index) => (
            <div key={num} style={{ gridColumn: index + 2, gridRow: 1 }}>
              {renderRoom(num)}
            </div>
          ))}

          {/* Right column */}
          {rooms.slice(sideLength, sideLength * 2).map((num, index) => (
            <div key={num} style={{ gridColumn: gridSize, gridRow: index + 2 }}>
              {renderRoom(num)}
            </div>
          ))}

          {/* Bottom row */}
          {rooms.slice(sideLength * 2, sideLength * 3).map((num, index) => (
            <div
              key={num}
              style={{ gridColumn: gridSize - 1 - index, gridRow: gridSize }}
            >
              {renderRoom(num)}
            </div>
          ))}

          {/* Left column */}
          {rooms.slice(sideLength * 3, totalRooms).map((num, index) => (
            <div
              key={num}
              style={{ gridColumn: 1, gridRow: gridSize - 1 - index }}
            >
              {renderRoom(num)}
            </div>
          ))}

          {/* Courtyard */}
          <div
            style={{ gridColumn: `2 / ${gridSize}`, gridRow: `2 / ${gridSize}` }}
            className="border-4 border-gray-300 bg-green-200/70 flex items-center justify-center text-green-700 text-sm font-semibold rounded-lg"
          >
            Courtyard
          </div>

          {/* Reception connector */}
          <div style={corridorStyle} />

          {/* Reception */}
          <div style={receptionStyle}>
            <span style={receptionLabelStyle}>Reception</span>
          </div>

          {/* Corridor labels */}
          <div
            className="absolute text-sm font-semibold text-gray-700"
            style={{ top: `${corridorPadding / 2}px`, left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
          >
            Clocktower
          </div>
          <div
            className="absolute text-sm font-semibold text-gray-700"
            style={{ bottom: `${corridorPadding / 2}px`, left: "50%", transform: "translate(-50%, 50%)", pointerEvents: "none" }}
          >
            St Joseph's Side
          </div>
          <div
            className="absolute text-sm font-semibold text-gray-700"
            style={{ left: `${corridorPadding / 2}px`, top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", pointerEvents: "none" }}
          >
            Green Mile
          </div>
          <div
            className="absolute text-sm font-semibold text-gray-700"
            style={{ right: `${corridorPadding / 2}px`, top: "50%", transform: "translate(50%, -50%) rotate(90deg)", pointerEvents: "none" }}
          >
            Over Drug Unit
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAssignments;
