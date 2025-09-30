// src/services/mockRoomService.ts
import { mockResidents, type Resident } from './mockDataService';

export interface Room {
  roomNumber: number;
  unit: 'alcohol' | 'drugs' | 'ladies' | 'detox';
  capacity: number;
}

export interface RoomAssignment {
  roomNumber: number;
  residents: Resident[];
}

// Exactly 44 rooms, 11 per side of square layout
export const alcoholRooms: Room[] = Array.from({ length: 44 }, (_, i) => ({
  roomNumber: i + 1,
  unit: 'alcohol',
  capacity: 2,
}));

// Empty assignments for prototype
export const mockAssignments: RoomAssignment[] = alcoholRooms.map(r => ({
  roomNumber: r.roomNumber,
  residents: [],
}));

// Example residents for testing layout (10 for demo)
export const mockAlcoholResidents: Resident[] = mockResidents
  .filter((resident) => resident.unit === 'alcohol')
  .slice(0, 10)
  .map((resident, index) => ({
    ...resident,
    id: index + 1,
    roomNumber: '',
  }));
