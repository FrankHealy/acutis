import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

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

export type UpsertGroupTherapyResidentRemarkRequest = {
  unitId: UnitId;
  programCode: string;
  residentId: number;
  moduleKey: string;
  noteLines: string[];
  freeText: string;
};

const noStoreFetchInit: RequestInit = {
  headers: { Accept: "application/json" },
  cache: "no-store",
};

export const groupTherapyService = {
  async getProgram(unitId: UnitId, programCode: string): Promise<GroupTherapyProgram | null> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${API_BASE_URL}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/program?programCode=${encodeURIComponent(programCode)}`,
      noStoreFetchInit
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
    moduleKey: string
  ): Promise<GroupTherapyResidentRemark[]> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${API_BASE_URL}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/remarks?programCode=${encodeURIComponent(programCode)}&moduleKey=${encodeURIComponent(moduleKey)}`,
      noStoreFetchInit
    );

    if (!response.ok) {
      throw new Error(`Group therapy remarks API failed (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentRemark[];
  },

  async upsertRemark(
    payload: UpsertGroupTherapyResidentRemarkRequest
  ): Promise<GroupTherapyResidentRemark> {
    const unitGuid = UNIT_GUIDS[payload.unitId];
    const response = await fetch(`${API_BASE_URL}/api/units/${encodeURIComponent(unitGuid)}/grouptherapy/remarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
};
