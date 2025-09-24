import { Resident, MockDataService } from './mockDataService';

export interface AttendanceRecord {
  residentId: number;
  present: boolean;
  reason?: string;
  description?: string;
  timestamp: string;
}

export interface ResidentService {
  getResidents(unit: string): Promise<Resident[]>;
  getRollCallResidents(unit: string): Promise<Resident[]>;
  saveAttendance(records: AttendanceRecord[]): Promise<void>;
  getResident(id: number): Promise<Resident>;
}

// Mock implementation (will be replaced with real API later)
export class MockResidentService implements ResidentService {
  async getResidents(unit: string): Promise<Resident[]> {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MockDataService.getResidentsByUnit(unit));
      }, 300);
    });
  }

  async getRollCallResidents(unit: string): Promise<Resident[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MockDataService.getRollCallResidents(unit));
      }, 200);
    });
  }

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Attendance saved:', records);
        resolve();
      }, 500);
    });
  }

  async getResident(id: number): Promise<Resident> {
    const resident = MockDataService.getResidentById(id);
    if (!resident) throw new Error(`Resident ${id} not found`);
    return resident;
  }
}

export const residentService = new MockResidentService();