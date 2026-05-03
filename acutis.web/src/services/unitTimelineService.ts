import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type UnitTimelineItemDto = {
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

export type TakeUnitTimelineEventRequest = {
  key: string;
  source: string;
  scheduledDate: string;
};

export async function getUnitTimeline(accessToken: string | undefined, unitCode: string, date: string): Promise<UnitTimelineItemDto[]> {
  const params = new URLSearchParams({ date });
  const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitCode)}/timeline?${params.toString()}`, {
    cache: "no-store",
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return (await response.json()) as UnitTimelineItemDto[];
}

export async function takeUnitTimelineEvent(
  accessToken: string | undefined,
  unitCode: string,
  payload: TakeUnitTimelineEventRequest,
): Promise<UnitTimelineItemDto> {
  const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitCode)}/timeline/take-event`, {
    method: "POST",
    cache: "no-store",
    headers: {
      ...createAuthHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return (await response.json()) as UnitTimelineItemDto;
}
