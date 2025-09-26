// src/services/residentService.ts

import { type Resident, MockDataService } from './mockDataService';

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

// Mock implementation (will be replaced with real API later)
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

export const residentService: ResidentService = new MockResidentService();
