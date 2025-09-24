export interface Resident {
  id: number;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number | null;
  roomNumber: string;
  photo: string | null;
  present: boolean | null;
  extra?: boolean;
  unit: 'alcohol' | 'drugs' | 'ladies' | 'detox';
}

export const mockResidents: Resident[] = [
  { id: 1, firstName: 'Michael', surname: 'OSullivan', nationality: 'Irish', age: 34, weekNumber: 3, roomNumber: 'A-201', photo: null, present: null, unit: 'alcohol' },
  { id: 2, firstName: 'Sarah', surname: 'Murphy', nationality: 'Irish', age: 28, weekNumber: 7, roomNumber: 'A-105', photo: null, present: null, unit: 'alcohol' },
  // ... all residents with proper typing
];

export class MockDataService {
  static getResidentsByUnit(unit: string): Resident[] {
    return mockResidents.filter(resident => resident.unit === unit);
  }

  static getResidentById(id: number): Resident | undefined {
    return mockResidents.find(resident => resident.id === id);
  }

  static getRollCallResidents(unit: string): Resident[] {
    const unitResidents = this.getResidentsByUnit(unit);
    return unitResidents.filter(resident => 
      (resident.weekNumber && resident.weekNumber >= 2 && resident.weekNumber <= 10) || resident.extra
    );
  }
}