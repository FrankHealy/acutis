import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

export type RoomAssignmentOccupant = {
  residentId: number;
  initials: string;
  firstName: string;
  surname: string;
};

export type UnitRoomAssignment = {
  roomCode: string;
  capacity: number;
  occupants: RoomAssignmentOccupant[];
};

export type UnitOperationsResident = {
  id: number;
  firstName: string;
  surname: string;
  age: number;
  nationality: string;
  roomNumber: string;
  photoUrl?: string | null;
};

export type UnitOtSession = {
  id: string;
  title: string;
  facilitator: string;
  room: string;
  residents: UnitOperationsResident[];
};

export type UnitOtDaySchedule = {
  day: string;
  sessions: UnitOtSession[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const operationsService = {
  async getRoomAssignments(unitId: UnitId): Promise<UnitRoomAssignment[]> {
    return fetchJson<UnitRoomAssignment[]>(`/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/room-assignments`);
  },

  async getOtSchedule(unitId: UnitId): Promise<UnitOtDaySchedule[]> {
    return fetchJson<UnitOtDaySchedule[]>(`/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/ot-schedule`);
  },
};
