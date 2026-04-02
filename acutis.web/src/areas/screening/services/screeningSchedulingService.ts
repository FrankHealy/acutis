import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

export type ScreeningSchedulingAwaitingItem = {
  caseId: string;
  callId: string | null;
  surname: string;
  name: string;
  phoneNumber: string;
  queueType: string;
  completedAt: string;
};

export type ScreeningSchedulingAssignment = {
  scheduledIntakeId: string;
  caseId: string;
  callId: string | null;
  surname: string;
  name: string;
  phoneNumber: string;
  queueType: string;
  status: string;
};

export type ScreeningSchedulingSlot = {
  slotId: string;
  scheduledDate: string;
  displayLabel: string;
  assignmentCount: number;
  assignments: ScreeningSchedulingAssignment[];
};

export type ScreeningSchedulingBoard = {
  centreId: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  awaiting: ScreeningSchedulingAwaitingItem[];
  slots: ScreeningSchedulingSlot[];
};

type ApiError = Error & {
  status?: number;
  payload?: unknown;
};

const request = async <T>(
  path: string,
  accessToken?: string | null,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const error = new Error(bodyText || `Request failed (${response.status}).`) as ApiError;
    error.status = response.status;

    if (bodyText) {
      try {
        error.payload = JSON.parse(bodyText) as unknown;
      } catch {
        error.payload = bodyText;
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const screeningSchedulingService = {
  getBoard(unitId: UnitId, accessToken?: string | null) {
    return request<ScreeningSchedulingBoard>(
      `/api/screenings/scheduling-board?unitId=${encodeURIComponent(unitId)}`,
      accessToken,
    );
  },

  createSlot(unitId: UnitId, scheduledDate: string, accessToken?: string | null) {
    return request<ScreeningSchedulingSlot>(
      "/api/screenings/scheduling-slots",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          unitCode: unitId,
          scheduledDate,
        }),
      },
    );
  },

  updateSlot(
    slotId: string,
    unitId: UnitId,
    scheduledDate: string,
    accessToken?: string | null,
    force = false,
  ) {
    return request<ScreeningSchedulingSlot>(
      `/api/screenings/scheduling-slots/${encodeURIComponent(slotId)}`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({
          unitCode: unitId,
          scheduledDate,
          force,
        }),
      },
    );
  },

  deleteSlot(slotId: string, accessToken?: string | null, force = false) {
    return request<void>(
      `/api/screenings/scheduling-slots/${encodeURIComponent(slotId)}?force=${force ? "true" : "false"}`,
      accessToken,
      {
        method: "DELETE",
      },
    );
  },

  assignToSlot(slotId: string, caseId: string, accessToken?: string | null, notes?: string) {
    return request<ScreeningSchedulingAssignment>(
      `/api/screenings/scheduling-slots/${encodeURIComponent(slotId)}/assign`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          caseId,
          notes,
        }),
      },
    );
  },

  unscheduleAssignment(scheduledIntakeId: string, accessToken?: string | null) {
    return request<void>(
      `/api/screenings/scheduling-assignments/${encodeURIComponent(scheduledIntakeId)}/unschedule`,
      accessToken,
      {
        method: "POST",
      },
    );
  },

  cancelAwaitingCase(caseId: string, reason: string, accessToken?: string | null) {
    return request<void>(
      `/api/screenings/scheduling-cases/${encodeURIComponent(caseId)}/cancel`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          reason,
        }),
      },
    );
  },
};

export type { ApiError as ScreeningSchedulingApiError };
