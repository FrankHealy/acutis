// src/services/residentService.ts

import { type Resident, MockDataService } from './mockDataService';
import api from './apiClient';

export interface AttendanceRecord {
  residentId: number;
  present: boolean;
  reason?: string;
  description?: string;
  timestamp: string;
}

export interface ResidentService {
  getResidents(unit: Resident['unit']): Promise<Resident[]>;
  getRollCallResidents(unit: Resident['unit']): Promise<Resident[]>;
  saveAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]>;
  getResident(id: number): Promise<Resident | null>;
}

export type ResidentSource = 'api' | 'mock';
let currentResidentSource: ResidentSource = 'api';
export function getResidentSource(): ResidentSource {
  return currentResidentSource;
}

// API response shape for /api/Residents
type ApiResident = {
  id: string;
  socialSecurityNumber?: string | null;
  dateOfAdmission?: string | null;
  dateOfBirth?: string | null;
  firstName: string;
  middleName?: string | null;
  surname: string;
  alias?: string | null;
  isPreviousResident?: boolean;
  sex?: string;
  address?: string;
  country?: string;
  hasProbationRequirement?: boolean;
  hasMedicalCard?: boolean;
  hasPrivateInsurance?: boolean;
  hasMobilityIssue?: boolean;
  primaryAddiction?: string | null; // e.g. "Alcohol"
  secondaryAddictions?: string[];
  phoneNumber?: string | null;
  emailAddress?: string | null;
  photoUrl?: string | null;
  arrivalPhotoUrl?: string | null;
  dischargePhotoUrl?: string | null;
  photoDeclined?: boolean;
  admissionPhase?: string | null;
  dataQuality?: string | null;
  isAdmissionFormComplete?: boolean;
  roomNumber?: string | number | null;
  age?: number | null;
};

function computeAgeFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function computeWeekNumberFromAdmission(dateOfAdmission?: string | null): number | null {
  if (!dateOfAdmission) return null;
  const admission = new Date(dateOfAdmission);
  if (Number.isNaN(admission.getTime())) return null;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor((now.getTime() - admission.getTime()) / msPerDay));
  const week = Math.floor(days / 7) + 1; // Week 1 starts at admission
  return week;
}

function mapApiResidentsToUi(residents: ApiResident[]): Resident[] {
  return residents.map((r, index) => {
    const fallbackPhoto = `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;
    const unit: Resident['unit'] = (r.primaryAddiction || '').toLowerCase().includes('alcohol')
      ? 'alcohol'
      : 'drugs';

    const age = r.age ?? computeAgeFromDob(r.dateOfBirth) ?? 0;
    const weekNumber = computeWeekNumberFromAdmission(r.dateOfAdmission);
    const room = r.roomNumber != null && r.roomNumber !== '' ? String(r.roomNumber) : '-';

    return {
      id: index + 1, // map to numeric id for UI usage
      psn: r.socialSecurityNumber || 'N/A',
      firstName: r.firstName,
      surname: r.surname,
      nationality: r.country || 'Unknown',
      age,
      weekNumber,
      roomNumber: room,
      photo: r.photoUrl || null,
      fallbackPhoto,
      present: null,
      extra: !!r.isPreviousResident,
      unit,
      primaryAddiction: r.primaryAddiction || 'Unknown',
      isDrug: unit === 'drugs',
      isGambeler: false,
      isSnorer: false,
      dietaryNeedsCode: 0,
      hasCriminalHistory: false,
      isOnProbation: !!r.hasProbationRequirement,
      argumentativeScale: 0,
      learningDifficultyScale: 0,
      literacyScale: 0,
      isPreviousResident: !!r.isPreviousResident,
    } as Resident;
  });
}

class ApiResidentService implements ResidentService {
  private endpoint = '/api/Residents';

  private async fetchAll(): Promise<Resident[]> {
    // Prefer configured base URL when it matches, else fall back to absolute
    try {
      const url = this.endpoint;
      const { data } = await api.get<ApiResident[] | unknown>(url);
      if (!Array.isArray(data)) throw new Error('Invalid residents payload');
      const mapped = mapApiResidentsToUi(data as ApiResident[]);
      currentResidentSource = 'api';
      return mapped;
    } catch (e) {
      // Fallback to mock data if API is unavailable
      currentResidentSource = 'mock';
      return MockDataService.getResidentsByUnit('alcohol');
    }
  }

  async getResidents(_unit: Resident['unit']): Promise<Resident[]> {
    const mapped = await this.fetchAll();
    return mapped;
  }

  async getRollCallResidents(_unit: Resident['unit']): Promise<Resident[]> {
    const all = await this.fetchAll();
    return all.filter(
      (resident) =>
        (resident.weekNumber != null && resident.weekNumber >= 2 && resident.weekNumber <= 10) ||
        resident.extra === true,
    );
  }

  async saveAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]> {
    // No backend specified for attendance yet; keep local echo for now
    return records;
  }

  async getResident(id: number): Promise<Resident | null> {
    const all = await this.fetchAll();
    return all.find(r => r.id === id) ?? null;
  }
}

// Mock implementation retained for dev/test fallback
export class MockResidentService implements ResidentService {
  async getResidents(unit: Resident['unit']): Promise<Resident[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MockDataService.getResidentsByUnit(unit));
      }, 300);
    });
  }

  async getRollCallResidents(unit: Resident['unit']): Promise<Resident[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MockDataService.getRollCallResidents(unit));
      }, 200);
    });
  }

  async saveAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Attendance saved:', records);
        resolve(records); // return records for consistency with real API
      }, 500);
    });
  }

  async getResident(id: number): Promise<Resident | null> {
    return MockDataService.getResidentById(id) ?? null;
  }
}

// Use API-backed service by default. It will fall back to mock data on failure.
export const residentService: ResidentService = new ApiResidentService();
