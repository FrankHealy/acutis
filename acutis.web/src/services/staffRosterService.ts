import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type UnitStaffRosterStaffDto = {
  appUserId: string;
  displayName: string;
  email: string;
};

export type UnitStaffRosterShiftDto = {
  shiftType: string;
  label: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  assignedAppUserId?: string | null;
  assignedStaffName: string;
  notes: string;
  isFilled: boolean;
};

export type UnitStaffRosterIssueDto = {
  code: string;
  message: string;
};

export type UnitStaffRosterEventDto = {
  key: string;
  title: string;
  description: string;
  category: string;
  time: string;
  timeMinutes: number;
  endTime: string;
  source: string;
  scheduledDate: string;
  requiresFacilitator: boolean;
  canTakeEvent: boolean;
  assignedFacilitatorUserId?: string | null;
  assignedFacilitatorName: string;
};

export type UnitStaffRosterBoardDto = {
  unitCode: string;
  unitName: string;
  scheduledDate: string;
  currentAppUserId?: string | null;
  staff: UnitStaffRosterStaffDto[];
  shifts: UnitStaffRosterShiftDto[];
  events: UnitStaffRosterEventDto[];
  issues: UnitStaffRosterIssueDto[];
};

export type AssignUnitStaffRosterShiftRequest = {
  scheduledDate: string;
  shiftType: string;
  appUserId?: string | null;
  notes?: string | null;
};

async function request<T>(accessToken: string | undefined, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const staffRosterService = {
  getBoard(accessToken: string | undefined, unitCode: string, date: string) {
    const params = new URLSearchParams({ date });
    return request<UnitStaffRosterBoardDto>(accessToken, `/api/units/${encodeURIComponent(unitCode)}/staff-roster?${params.toString()}`);
  },
  assignShift(accessToken: string | undefined, unitCode: string, payload: AssignUnitStaffRosterShiftRequest) {
    return request<UnitStaffRosterBoardDto>(accessToken, `/api/units/${encodeURIComponent(unitCode)}/staff-roster/assign-shift`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
