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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

let residentSource: "api" | "mock" = "mock";

type ResidentListItemDto = {
  id: number;
  psn: string;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number;
  roomNumber: string;
  unitId: Resident["unit"];
  photoUrl?: string | null;
};

export const getResidentSource = (): "api" | "mock" => residentSource;

const mapApiResident = (dto: ResidentListItemDto): Resident => {
  const now = new Date();
  const admissionDate = new Date(now);
  admissionDate.setDate(now.getDate() - ((dto.weekNumber || 1) * 7));
  const expectedCompletion = new Date(admissionDate);
  expectedCompletion.setDate(admissionDate.getDate() + 84);

  return {
    id: dto.id,
    firstName: dto.firstName,
    surname: dto.surname,
    nationality: dto.nationality,
    age: dto.age,
    weekNumber: dto.weekNumber,
    roomNumber: dto.roomNumber,
    unit: dto.unitId,
    photo: dto.photoUrl?.trim() ? dto.photoUrl.trim() : null,
    fallbackPhoto: `https://i.pravatar.cc/150?img=${((dto.id - 1) % 70) + 1}`,
    psn: dto.psn,
    admissionDate: admissionDate.toISOString().slice(0, 10),
    expectedCompletion: expectedCompletion.toISOString().slice(0, 10),
    primaryAddiction: "Alcohol",
    isDrug: dto.unitId === "drugs",
    isGambeler: false,
    isPreviousResident: false,
    dietaryNeedsCode: 0,
    isSnorer: false,
    hasCriminalHistory: false,
    isOnProbation: false,
    argumentativeScale: 0,
    learningDifficultyScale: 0,
    literacyScale: 0,
  };
};

const fetchResidentsFromApi = async (unit: Resident["unit"]): Promise<Resident[]> => {
  const response = await fetch(`${API_BASE_URL}/api/residents?unitId=${encodeURIComponent(unit)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Residents API failed (${response.status})`);
  }

  const data = (await response.json()) as ResidentListItemDto[];
  return data.map(mapApiResident);
};

export const residentService = {
  async getResidents(unit: Resident["unit"]): Promise<Resident[]> {
    try {
      const residents = await fetchResidentsFromApi(unit);
      if (residents.length === 0) {
        await delay(50);
        residentSource = "mock";
        return mockResidents.filter((resident) => resident.unit === unit);
      }
      residentSource = "api";
      return residents;
    } catch {
      await delay(50);
      residentSource = "mock";
      return mockResidents.filter((resident) => resident.unit === unit);
    }
  },

  async getRollCallResidents(unit: Resident["unit"]): Promise<Resident[]> {
    return this.getResidents(unit);
  },

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    await delay(50);
    store.attendance = [...store.attendance, ...records];
  },
};
