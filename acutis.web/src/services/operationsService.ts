import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

export type RoomAssignmentOccupant = {
  residentId: number;
  residentGuid: string;
  episodeId: string;
  residentCaseId?: string | null;
  initials: string;
  firstName: string;
  surname: string;
  weekNumber: number;
  photoUrl?: string | null;
  otRole?: string | null;
  bedCode?: string | null;
};

export type RoomAssignmentBed = {
  bedCode: string;
  occupant?: RoomAssignmentOccupant | null;
};

export type UnitRoomAssignment = {
  roomCode: string;
  storageRoomCode: string;
  capacity: number;
  occupants: RoomAssignmentOccupant[];
  beds: RoomAssignmentBed[];
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

export type UnitOtRoleAssignment = {
  id: string;
  roleId: string;
  residentGuid: string;
  episodeId: string;
  residentCaseId?: string | null;
  residentId: number;
  firstName: string;
  surname: string;
  weekNumber: number;
  roomNumber: string;
  photoUrl?: string | null;
  assignedAtUtc: string;
  notes?: string | null;
};

export type UnitOtRoleDefinition = {
  id: string;
  name: string;
  roleType: string;
  capacity?: number | null;
  requiresTraining: boolean;
  staffMemberInChargeId?: string | null;
  isActive: boolean;
  occupiedCount: number;
  availableSlots?: number | null;
  assignments: UnitOtRoleAssignment[];
};

export type AssignUnitOtRoleRequest = {
  episodeId: string;
  roleId: string;
  notes?: string | null;
};

export type AssignUnitBedRequest = {
  episodeId: string;
  roomCode: string;
  bedCode: string;
};

export type AssignUnitBedResponse = {
  residentId: string;
  episodeId: string;
  residentCaseId?: string | null;
  roomCode: string;
  storageRoomCode: string;
  bedCode: string;
};

async function fetchJson<T>(path: string, accessToken?: string | null, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: init?.method ?? "GET",
    ...init,
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(bodyText ? `Request failed (${response.status}): ${bodyText}` : `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const operationsService = {
  async getRoomAssignments(unitId: UnitId, accessToken?: string | null): Promise<UnitRoomAssignment[]> {
    return fetchJson<UnitRoomAssignment[]>(`/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/room-assignments`, accessToken);
  },

  async getOtSchedule(unitId: UnitId, accessToken?: string | null): Promise<UnitOtDaySchedule[]> {
    return fetchJson<UnitOtDaySchedule[]>(`/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/ot-schedule`, accessToken);
  },

  async getOtRoles(unitId: UnitId, accessToken?: string | null): Promise<UnitOtRoleDefinition[]> {
    return fetchJson<UnitOtRoleDefinition[]>(`/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/ot-roles`, accessToken);
  },

  async assignOtRole(unitId: UnitId, payload: AssignUnitOtRoleRequest, accessToken?: string | null): Promise<UnitOtRoleAssignment> {
    return fetchJson<UnitOtRoleAssignment>(
      `/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/ot-role-assignments`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async releaseOtRole(unitId: UnitId, assignmentId: string, accessToken?: string | null): Promise<void> {
    await fetchJson<void>(
      `/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/ot-role-assignments/${encodeURIComponent(assignmentId)}`,
      accessToken,
      {
        method: "DELETE",
      },
    );
  },

  async assignBed(unitId: UnitId, payload: AssignUnitBedRequest, accessToken?: string | null): Promise<AssignUnitBedResponse> {
    return fetchJson<AssignUnitBedResponse>(
      `/api/units/${encodeURIComponent(UNIT_GUIDS[unitId])}/bed-assignments`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};
