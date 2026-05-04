import { createAuthHeaders } from "@/lib/authMode";
import { UNIT_GUIDS } from "@/services/unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
const DEFAULT_CENTRE_ID = "aaaaaaaa-1111-1111-1111-111111111111";

export type IntakeBacklogItem = {
  residentCaseId: string;
  residentId: string | null;
  residentName: string;
  caseIdentifier: string;
  unitName: string;
  caseStatus: string;
  priority: number;
  intakeSource: string;
  referralReceivedAtUtc?: string | null;
  openedAtUtc: string;
};

export type ScheduledIntakeItem = {
  scheduledIntakeId: string;
  residentCaseId: string;
  residentId: string | null;
  residentName: string;
  caseIdentifier: string;
  unitName: string;
  caseStatus: string;
  priority: number;
  status: string;
  intakeSource: string;
  notes?: string | null;
};

export type IntakeBucket = {
  scheduledDate: string;
  displayLabel: string;
  expectedCapacity: number;
  scheduledCount: number;
  remainingCapacity: number;
  assignments: ScheduledIntakeItem[];
};

export type IntakeBoard = {
  centreId: string;
  unitId: string;
  unitName: string;
  backlog: IntakeBacklogItem[];
  buckets: IntakeBucket[];
};

type ApiEnvelope<T> = {
  correlationId: string;
  serverTimeUtc: string;
  data: T;
};

async function request<T>(path: string, accessToken?: string | null, init?: RequestInit): Promise<T> {
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
    throw new Error(body || `Request failed (${response.status})`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const intakeSchedulingService = {
  getBoard(unitId: UnitId, accessToken?: string | null) {
    return request<IntakeBoard>(
      `/api/centres/${DEFAULT_CENTRE_ID}/therapy-scheduling/intakes?unitId=${encodeURIComponent(UNIT_GUIDS[unitId])}`,
      accessToken,
    );
  },

  assignCase(unitId: UnitId, residentCaseId: string, scheduledDate: string, accessToken?: string | null, notes?: string) {
    return request<ScheduledIntakeItem>(
      `/api/centres/${DEFAULT_CENTRE_ID}/therapy-scheduling/intakes`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          residentCaseId,
          unitId: UNIT_GUIDS[unitId],
          scheduledDate,
          notes,
        }),
      },
    );
  },

  updatePriority(residentCaseId: string, priority: number, accessToken?: string | null) {
    return request<IntakeBacklogItem>(
      `/api/centres/${DEFAULT_CENTRE_ID}/therapy-scheduling/intakes/backlog/priority`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify({
          residentCaseId,
          priority,
        }),
      },
    );
  },

  cancelScheduledIntake(scheduledIntakeId: string, accessToken?: string | null) {
    return request<ScheduledIntakeItem>(
      `/api/centres/${DEFAULT_CENTRE_ID}/therapy-scheduling/intakes/${encodeURIComponent(scheduledIntakeId)}`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "cancelled",
        }),
      },
    );
  },
};
