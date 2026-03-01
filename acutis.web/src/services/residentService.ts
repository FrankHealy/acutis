import { mockResidents, type Resident } from "./mockDataService";

export type AttendanceRecord = {
  residentId: number;
  present: boolean;
  reason?: string;
  description?: string;
  timestamp: string;
};

const store: {
  attendance: AttendanceRecord[];
} = {
  attendance: [],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getResidentSource = (): "api" | "mock" => "mock";

export const residentService = {
  async getResidents(unit: Resident["unit"]): Promise<Resident[]> {
    await delay(50);
    return mockResidents.filter((resident) => resident.unit === unit);
  },

  async getRollCallResidents(unit: Resident["unit"]): Promise<Resident[]> {
    await delay(50);
    return mockResidents.filter((resident) => resident.unit === unit);
  },

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    await delay(50);
    store.attendance = [...store.attendance, ...records];
  },
};

