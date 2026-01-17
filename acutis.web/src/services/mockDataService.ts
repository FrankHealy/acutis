import rawResidentsData from '../data/mockResidents.json';

export type ResidentUnit = 'alcohol' | 'drugs' | 'ladies' | 'detox';

export interface Resident {
  id: number;
  psn: string;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number | null;
  roomNumber: string;
  photo: string | null;
  fallbackPhoto: string;
  present: boolean | null;
  extra?: boolean;
  unit: ResidentUnit;
  primaryAddiction: string;
  isDrug: boolean;
  isGambeler: boolean;
  isSnorer: boolean;
  dietaryNeedsCode: number;
  hasCriminalHistory: boolean;
  isOnProbation: boolean;
  argumentativeScale: number;
  learningDifficultyScale: number;
  literacyScale: number;
  isPreviousResident: boolean;
}

type RawResident = {
  id: string;
  psn: string;
  surname: string;
  firstName: string;
  photoURL: string;
  dob: string;
  weekNumber: number;
  roomNumber: number;
  nationality: string;
  primaryAddiction: string;
  isDrug: boolean;
  isGambeler: boolean;
  isSnorer: boolean;
  dietaryNeedsCode: number;
  hasCriminalHistory: boolean;
  isOnProbation: boolean;
  argumentativeScale: number;
  learningDifficultyScale: number;
  literacyScale: number;
  isPreviousResident: boolean;
};

const FALLBACK_IMAGE_COUNT = 70;
const DEFAULT_UNIT: ResidentUnit = 'alcohol';

let cachedResidents: Resident[] | null = null;

function computeAge(dob: string): number {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function mapResident(raw: RawResident, index: number): Resident {
  const roomNumber = raw.roomNumber != null ? String(raw.roomNumber) : '-';
  const fallbackPhoto = `https://i.pravatar.cc/150?img=${(index % FALLBACK_IMAGE_COUNT) + 1}`;
  const primaryPhoto = raw.photoURL && raw.photoURL.trim() !== '' ? raw.photoURL : fallbackPhoto;

  return {
    id: index + 1,
    psn: raw.psn,
    firstName: raw.firstName,
    surname: raw.surname,
    nationality: raw.nationality,
    age: computeAge(raw.dob),
    weekNumber: Number.isFinite(raw.weekNumber) ? raw.weekNumber : null,
    roomNumber,
    photo: primaryPhoto,
    fallbackPhoto,
    present: null,
    extra: raw.isPreviousResident,
    unit: DEFAULT_UNIT,
    primaryAddiction: raw.primaryAddiction,
    isDrug: !!raw.isDrug,
    isGambeler: !!raw.isGambeler,
    isSnorer: !!raw.isSnorer,
    dietaryNeedsCode: raw.dietaryNeedsCode ?? 0,
    hasCriminalHistory: !!raw.hasCriminalHistory,
    isOnProbation: !!raw.isOnProbation,
    argumentativeScale: Number.isFinite(raw.argumentativeScale) ? raw.argumentativeScale : 0,
    learningDifficultyScale: Number.isFinite(raw.learningDifficultyScale) ? raw.learningDifficultyScale : 0,
    literacyScale: Number.isFinite(raw.literacyScale) ? raw.literacyScale : 0,
    isPreviousResident: !!raw.isPreviousResident,
  };
}

function loadResidents(): Resident[] {
  if (!cachedResidents) {
    const data = rawResidentsData as unknown as RawResident[];
    cachedResidents = data.map((raw, index) => mapResident(raw, index));
  }
  return cachedResidents;
}

export const mockResidents: Resident[] = loadResidents();

export class MockDataService {
  static getResidentsByUnit(unit: ResidentUnit): Resident[] {
    return loadResidents().filter((resident) => resident.unit === unit);
  }

  static getResidentById(id: number): Resident | undefined {
    return loadResidents().find((resident) => resident.id === id);
  }

  static getRollCallResidents(unit: ResidentUnit): Resident[] {
    return this.getResidentsByUnit(unit).filter(
      (resident) =>
        (resident.weekNumber != null && resident.weekNumber >= 2 && resident.weekNumber <= 10) ||
        resident.extra
    );
  }
}
