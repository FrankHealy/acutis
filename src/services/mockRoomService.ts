// src/services/mockRoomService.ts
import type { Resident } from './mockDataService';

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
export const mockAlcoholResidents: Resident[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  firstName: `Test${i + 1}`,
  surname: `Resident`,
  nationality: 'Irish',
  age: 30 + i,
  weekNumber: (i % 12) + 1,
  roomNumber: '',
  photo: null,
  present: null,
  unit: 'alcohol',
}));
