import { apiFetchJson } from "../../services/api/client";
import type { RollCallUnitId } from "../rollCall/units";
import { resolveUnit } from "../units/api";

export type IncidentScope = "resident" | "unit" | "centre";

export type IncidentType = {
  id: number;
  code: string;
  defaultName: string;
};

export type IncidentRecord = {
  id: string;
  incidentTypeId: number;
  incidentTypeCode: string;
  incidentTypeName: string;
  scope: IncidentScope | "unknown";
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

export type CreateIncidentInput = {
  incidentTypeId: number;
  scope: IncidentScope;
  residentId?: string | null;
  residentCaseId?: string | null;
  episodeId?: string | null;
  occurredAtUtc: string;
  summary: string;
  notes?: string | null;
  detailsJson?: string | null;
};

export async function fetchIncidentTypes(): Promise<IncidentType[]> {
  return apiFetchJson<IncidentType[]>("/api/incident-types");
}

export async function fetchIncidents(unitCode: RollCallUnitId): Promise<IncidentRecord[]> {
  const unit = await resolveUnit(unitCode);
  return apiFetchJson<IncidentRecord[]>(`/api/units/${unit.unitId}/incidents`);
}

export async function createIncident(unitCode: RollCallUnitId, input: CreateIncidentInput): Promise<IncidentRecord> {
  const unit = await resolveUnit(unitCode);
  return apiFetchJson<IncidentRecord>(`/api/units/${unit.unitId}/incidents`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
