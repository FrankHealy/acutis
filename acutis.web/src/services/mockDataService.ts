export type Resident = {
  id: number;
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

const baseResidents: Resident[] = [
  {
    id: 1,
    firstName: "Michael",
    surname: "Ryan",
    nationality: "Irish",
    age: 39,
    weekNumber: 4,
    roomNumber: "A-205",
    unit: "alcohol",
    photo: null,
    fallbackPhoto: "https://i.pravatar.cc/150?img=11",
    psn: "ALC-1001",
    admissionDate: "2026-01-12",
    expectedCompletion: "2026-04-12",
    primaryAddiction: "Alcohol",
    isDrug: false,
    isGambeler: true,
    isPreviousResident: false,
    dietaryNeedsCode: 0,
    isSnorer: false,
    hasCriminalHistory: false,
    isOnProbation: false,
    argumentativeScale: 1,
    learningDifficultyScale: 2,
    literacyScale: 3,
  },
  {
    id: 2,
    firstName: "Sarah",
    surname: "Moran",
    nationality: "Irish",
    age: 31,
    weekNumber: 1,
    roomNumber: "D-101",
    unit: "detox",
    photo: null,
    fallbackPhoto: "https://i.pravatar.cc/150?img=21",
    psn: "DTX-2001",
    admissionDate: "2026-02-10",
    expectedCompletion: "2026-03-20",
    primaryAddiction: "Alcohol",
    isDrug: false,
    isGambeler: false,
    isPreviousResident: false,
    dietaryNeedsCode: 1,
    isSnorer: true,
    hasCriminalHistory: false,
    isOnProbation: false,
    argumentativeScale: 2,
    learningDifficultyScale: 1,
    literacyScale: 4,
  },
  {
    id: 3,
    firstName: "Ahmed",
    surname: "Latif",
    nationality: "Moroccan",
    age: 28,
    weekNumber: 5,
    roomNumber: "DR-110",
    unit: "drugs",
    photo: null,
    fallbackPhoto: "https://i.pravatar.cc/150?img=31",
    psn: "DRG-3001",
    admissionDate: "2025-12-15",
    expectedCompletion: "2026-03-10",
    primaryAddiction: "Substances",
    isDrug: true,
    isGambeler: false,
    isPreviousResident: true,
    dietaryNeedsCode: 0,
    isSnorer: false,
    hasCriminalHistory: true,
    isOnProbation: true,
    argumentativeScale: 3,
    learningDifficultyScale: 2,
    literacyScale: 2,
  },
  {
    id: 4,
    firstName: "Emma",
    surname: "Kelly",
    nationality: "Irish",
    age: 34,
    weekNumber: 3,
    roomNumber: "L-103",
    unit: "ladies",
    photo: null,
    fallbackPhoto: "https://i.pravatar.cc/150?img=41",
    psn: "LAD-4001",
    admissionDate: "2026-01-21",
    expectedCompletion: "2026-04-20",
    primaryAddiction: "Alcohol",
    isDrug: false,
    isGambeler: false,
    isPreviousResident: false,
    dietaryNeedsCode: 2,
    isSnorer: false,
    hasCriminalHistory: false,
    isOnProbation: false,
    argumentativeScale: 1,
    learningDifficultyScale: 1,
    literacyScale: 4,
  },
];

export const mockResidents = baseResidents;

