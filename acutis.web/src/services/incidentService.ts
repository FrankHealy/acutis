import { createAuthHeaders } from "@/lib/authMode";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { UNIT_GUIDS } from "./unitIdentity";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type IncidentTypeRecord = {
  id: number;
  code: string;
  defaultName: string;
};

export type IncidentRecord = {
  id: string;
  incidentTypeId: number;
  incidentTypeCode: string;
  incidentTypeName: string;
  scope: "resident" | "unit" | "centre" | "unknown";
  residentId?: string | null;
  residentName?: string | null;
  residentCaseId?: string | null;
  episodeId?: string | null;
  centreId?: string | null;
  unitId?: string | null;
  occurredAtUtc: string;
  summary: string;
  detailsJson: string;
  notes?: string | null;
  createdAtUtc: string;
};

export type CreateIncidentPayload = {
  incidentTypeId: number;
  scope: "resident" | "unit" | "centre";
  residentId?: string | null;
  residentCaseId?: string | null;
  episodeId?: string | null;
  occurredAtUtc: string;
  summary: string;
  notes?: string | null;
  detailsJson?: string | null;
};

async function request<T>(path: string, accessToken?: string | null, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const incidentService = {
  getIncidentTypes(accessToken?: string | null) {
    return request<IncidentTypeRecord[]>("/api/incident-types", accessToken);
  },

  getIncidents(unitId: UnitId, accessToken?: string | null) {
    return request<IncidentRecord[]>(`/api/units/${UNIT_GUIDS[unitId]}/incidents`, accessToken);
  },

  createIncident(unitId: UnitId, payload: CreateIncidentPayload, accessToken?: string | null) {
    return request<IncidentRecord>(`/api/units/${UNIT_GUIDS[unitId]}/incidents`, accessToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
};
