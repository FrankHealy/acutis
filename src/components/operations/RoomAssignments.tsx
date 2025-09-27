// src/components/operations/RoomAssignments.tsx
import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { alcoholRooms, mockAlcoholResidents } from '../../services/mockRoomService';

const RoomAssignments: React.FC = () => {
  const [rooms, setRooms] = useState(() =>
    alcoholRooms.map(r => ({ ...r, residents: [] }))
  );
  const [residents] = useState(mockAlcoholResidents);

  const handleDrop = (residentId: number, toRoomNumber: number) => {
    setRooms(prevRooms => {
      const newRooms = prevRooms.map(r => ({
        ...r,
        residents: r.residents.filter(res => res.id !== residentId),
      }));

      const resident = residents.find(r => r.id === residentId);
      return newRooms.map(r => {
        if (r.roomNumber === toRoomNumber && resident) {
          if (r.residents.length < r.capacity) {
            return { ...r, residents: [...r.residents, resident] };
          }
        }
        return r;
      });
    });
  };

  const autoAssignRooms = () => {
    const assignedRooms = alcoholRooms.map(r => ({ ...r, residents: [] }));

    for (const resident of residents) {
      const room = assignedRooms.find(r => r.residents.length < r.capacity);
      if (room) room.residents.push(resident);
    }

    setRooms(assignedRooms);
  };

  const renderRoom = (roomNumber: number, color: string) => {
    const room = rooms.find(r => r.roomNumber === roomNumber)!;
    return (
      <div
        key={roomNumber}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          const residentId = Number(e.dataTransfer?.getData('residentId'));
          if (residentId) handleDrop(residentId, roomNumber);
        }}
        className={`border rounded-md p-1 w-14 h-14 flex flex-col justify-between shadow-sm ${
          room.residents.length === 0 ? `${color} border-gray-200` : 'bg-white border-gray-300'
        }`}
      >
        <div className="text-[10px] font-medium text-center">{roomNumber}</div>
        <div className="flex flex-wrap justify-center gap-1">
          {room.residents.map(resident => (
            <div
              key={resident.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('residentId', String(resident.id))}
              className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 cursor-move"
              title={`${resident.firstName} ${resident.surname}`}
            >
              {resident.firstName[0]}
              {resident.surname[0]}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const topRooms = rooms.slice(0, 11);
  const rightRooms = rooms.slice(11, 22);
  const bottomRooms = rooms.slice(22, 33);
  const leftRooms = rooms.slice(33, 44);

  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Alcohol Unit – Room Assignments</h2>
        <button
          onClick={autoAssignRooms}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Shuffle className="h-4 w-4" />
          <span>Auto Assign Rooms</span>
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Top - Clocktower */}
        <div className="mb-1 text-sm font-semibold text-gray-700 text-center">
          Clocktower
        </div>
        <div className="flex space-x-1 mb-2">
          {topRooms.map(r => renderRoom(r.roomNumber, 'bg-blue-50'))}
        </div>

        <div className="flex items-center">
          {/* Left - Green Mile */}
          <div className="flex items-center space-x-2 mr-2">
            <div className="rotate-[-90deg] origin-center text-sm font-semibold text-gray-700 whitespace-nowrap">
              Green Mile
            </div>
            <div className="flex flex-col space-y-1">
              {leftRooms.map(r => renderRoom(r.roomNumber, 'bg-green-50'))}
            </div>
          </div>

          {/* Courtyard (taller, almost flush top/bottom) */}
          <div className="w-[600px] h-[720px] bg-green-100 flex items-center justify-center text-green-700 rounded-lg shadow-inner relative">
            Courtyard

            {/* Entrance marker (diamond shape) */}
            <div
              className="absolute -bottom-6 left-1/4 w-10 h-10 bg-gray-600 transform rotate-45 shadow-md"
              title="Main Entrance"
            />
          </div>

          {/* Right - Over Drug Unit */}
          <div className="flex items-center space-x-2 ml-2">
            <div className="flex flex-col space-y-1">
              {rightRooms.map(r => renderRoom(r.roomNumber, 'bg-purple-50'))}
            </div>
            <div className="rotate-90 origin-center text-sm font-semibold text-gray-700 whitespace-nowrap">
              Over Drug Unit
            </div>
          </div>
        </div>

        {/* Bottom - St Joseph’s Side */}
        <div className="flex flex-col items-center mt-1">
          <div className="flex space-x-1 mb-1">
            {bottomRooms.map(r => renderRoom(r.roomNumber, 'bg-amber-50'))}
          </div>
          <div className="text-sm font-semibold text-gray-700 text-center">
            St Joseph’s Side
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAssignments;
