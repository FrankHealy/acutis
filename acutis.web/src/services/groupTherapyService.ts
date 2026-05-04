import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type GroupTherapyDay = {
  dayNumber: number;
  questions: string[];
};

export type GroupTherapyWeek = {
  weekNumber: number;
  topic: string;
  introText: string;
  days: GroupTherapyDay[];
};

export type GroupTherapyProgram = {
  unitCode: string;
  programCode: string;
  weeks: GroupTherapyWeek[];
};

export type GroupTherapyResidentRemark = {
  id: string;
  residentId: number;
  moduleKey: string;
  noteLines: string[];
  freeText: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type GroupTherapyResidentObservation = {
  id: string;
  residentId: string;
  residentCaseId?: string | null;
  episodeId?: string | null;
  episodeEventId?: string | null;
  observerUserId: string;
  moduleKey: string;
  sessionNumber: number;
  observedAtUtc: string;
  selectedTerms: string[];
  notes?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type UpsertGroupTherapyResidentRemarkRequest = {
  unitId: UnitId;
  programCode: string;
  residentId: number;
  moduleKey: string;
  noteLines: string[];
  freeText: string;
};

export type UpsertGroupTherapyResidentObservationRequest = {
  unitId: UnitId;
  programCode: string;
  moduleKey: string;
  sessionNumber: number;
  residentId: string;
  residentCaseId?: string | null;
  episodeId?: string | null;
  episodeEventId?: string | null;
  observedAtUtc: string;
  selectedTerms: string[];
  notes?: string | null;
};

const noStoreFetchInit: RequestInit = {
  headers: { Accept: "application/json" },
  cache: "no-store",
};

export const groupTherapyService = {
  async getProgram(unitId: UnitId, programCode: string, accessToken?: string | null): Promise<GroupTherapyProgram | null> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/program?programCode=${encodeURIComponent(programCode)}`,
      {
        ...noStoreFetchInit,
        headers: createAuthHeaders(accessToken),
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Group therapy program API failed (${response.status})`);
    }

    return (await response.json()) as GroupTherapyProgram;
  },

  async getRemarks(
    unitId: UnitId,
    programCode: string,
    moduleKey: string,
    accessToken?: string | null
  ): Promise<GroupTherapyResidentRemark[]> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/remarks?programCode=${encodeURIComponent(programCode)}&moduleKey=${encodeURIComponent(moduleKey)}`,
      {
        ...noStoreFetchInit,
        headers: createAuthHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Group therapy remarks API failed (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentRemark[];
  },

  async upsertRemark(
    payload: UpsertGroupTherapyResidentRemarkRequest,
    accessToken?: string | null
  ): Promise<GroupTherapyResidentRemark> {
    const unitGuid = UNIT_GUIDS[payload.unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/remarks`, {
      method: "POST",
      headers: {
        ...createAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        programCode: payload.programCode,
        residentId: payload.residentId,
        moduleKey: payload.moduleKey,
        noteLines: payload.noteLines,
        freeText: payload.freeText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save group therapy remark (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentRemark;
  },

  async getObservations(
    unitId: UnitId,
    programCode: string,
    moduleKey: string,
    sessionNumber: number,
    accessToken?: string | null
  ): Promise<GroupTherapyResidentObservation[]> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/observations?programCode=${encodeURIComponent(programCode)}&moduleKey=${encodeURIComponent(moduleKey)}&sessionNumber=${encodeURIComponent(String(sessionNumber))}`,
      {
        ...noStoreFetchInit,
        headers: createAuthHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Group therapy observations API failed (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentObservation[];
  },

  async upsertObservation(
    payload: UpsertGroupTherapyResidentObservationRequest,
    accessToken?: string | null
  ): Promise<GroupTherapyResidentObservation> {
    const unitGuid = UNIT_GUIDS[payload.unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/observations`, {
      method: "POST",
      headers: {
        ...createAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        programCode: payload.programCode,
        moduleKey: payload.moduleKey,
        sessionNumber: payload.sessionNumber,
        residentId: payload.residentId,
        residentCaseId: payload.residentCaseId ?? null,
        episodeId: payload.episodeId ?? null,
        episodeEventId: payload.episodeEventId ?? null,
        observedAtUtc: payload.observedAtUtc,
        selectedTerms: payload.selectedTerms,
        notes: payload.notes ?? null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save group therapy observation (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentObservation;
  },
};
