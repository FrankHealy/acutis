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
  unitCode: string;
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
  async getProgram(unitCode: string, programCode: string): Promise<GroupTherapyProgram | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/grouptherapy/program?unitCode=${encodeURIComponent(unitCode)}&programCode=${encodeURIComponent(programCode)}`,
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
    unitCode: string,
    programCode: string,
    moduleKey: string
  ): Promise<GroupTherapyResidentRemark[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/grouptherapy/remarks?unitCode=${encodeURIComponent(unitCode)}&programCode=${encodeURIComponent(programCode)}&moduleKey=${encodeURIComponent(moduleKey)}`,
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
    const response = await fetch(`${API_BASE_URL}/api/grouptherapy/remarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save group therapy remark (${response.status})`);
    }

    return (await response.json()) as GroupTherapyResidentRemark;
  },
};
