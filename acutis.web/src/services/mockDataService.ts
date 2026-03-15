import seededResidents from "../data/mockResidents.json";

export type Resident = {
  id: number;
  residentGuid: string | null;
  episodeId?: string | null;
  residentCaseId?: string | null;
  centreEpisodeCode?: string | null;
  entryYear?: number | null;
  entryWeek?: number | null;
  entrySequence?: number | null;
  caseStatus?: string | null;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number;
  roomNumber: string;
  unit: "alcohol" | "detox" | "drugs" | "ladies";
  photo: string | null;
  fallbackPhoto: string;
  psn: string;
  admissionDate: string;
  expectedCompletion: string;
  primaryAddiction: string;
  isDrug: boolean;
  isGambeler: boolean;
  isPreviousResident: boolean;
  dietaryNeedsCode: number;
  isSnorer: boolean;
  hasCriminalHistory: boolean;
  isOnProbation: boolean;
  argumentativeScale: number;
  learningDifficultyScale: number;
  literacyScale: number;
};

type SeedResident = {
  id: string;
  psn: string;
  surname: string;
  firstName: string;
  photoURL?: string | null;
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

const toIsoDate = (value: Date): string => value.toISOString().slice(0, 10);

const addDays = (value: Date, days: number): Date => {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
};

const calculateAge = (dobIso: string): number => {
  const dob = new Date(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(16, age);
};

const normalizePhoto = (photoUrl: string | null | undefined): string | null => {
  if (!photoUrl) {
    return null;
  }

  const trimmed = photoUrl.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const deriveUnit = (seed: SeedResident, index: number): Resident["unit"] => {
  if (seed.isDrug) {
    return "drugs";
  }

  if ((seed.weekNumber ?? 0) <= 4) {
    return "detox";
  }

  // Keep a consistent slice for the ladies unit while source data has no explicit gender field.
  if (index % 9 === 0) {
    return "ladies";
  }

  return "alcohol";
};

const alcoholSeedResidents: Resident[] = (seededResidents as SeedResident[]).map((seed, index) => {
  const fallbackPhoto = `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;
  const weekNumber = seed.weekNumber ?? 1;
  const admissionDate = addDays(new Date(), -(weekNumber * 7));
  const expectedCompletion = addDays(admissionDate, 84);

  return {
    id: index + 1,
    residentGuid: null,
    firstName: seed.firstName,
    surname: seed.surname,
    nationality: seed.nationality,
    age: calculateAge(seed.dob),
    weekNumber: weekNumber,
    roomNumber: String(seed.roomNumber),
    unit: deriveUnit(seed, index),
    photo: normalizePhoto(seed.photoURL),
    fallbackPhoto,
    psn: seed.psn,
    admissionDate: toIsoDate(admissionDate),
    expectedCompletion: toIsoDate(expectedCompletion),
    primaryAddiction: seed.primaryAddiction ?? "Alcohol",
    isDrug: Boolean(seed.isDrug),
    isGambeler: Boolean(seed.isGambeler),
    isPreviousResident: Boolean(seed.isPreviousResident),
    dietaryNeedsCode: seed.dietaryNeedsCode ?? 0,
    isSnorer: Boolean(seed.isSnorer),
    hasCriminalHistory: Boolean(seed.hasCriminalHistory),
    isOnProbation: Boolean(seed.isOnProbation),
    argumentativeScale: seed.argumentativeScale ?? 0,
    learningDifficultyScale: seed.learningDifficultyScale ?? 0,
    literacyScale: seed.literacyScale ?? 0,
  };
});

export const mockResidents: Resident[] = alcoholSeedResidents;
