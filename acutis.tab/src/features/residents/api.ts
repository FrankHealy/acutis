import { apiFetchJson } from "../../services/api/client";
import type { RollCallUnitId } from "../rollCall/units";

export type ResidentListItem = {
  id: number;
  residentGuid: string;
  episodeId?: string | null;
  residentCaseId?: string | null;
  centreEpisodeCode?: string | null;
  programmeType?: string | null;
  participationMode?: string | null;
  caseStatus?: string | null;
  psn: string;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number;
  roomNumber: string;
  bedCode?: string | null;
  unitId: string;
  photoUrl?: string | null;
  admissionDate?: string | null;
  expectedCompletion?: string | null;
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

export async function fetchResidents(unitId: RollCallUnitId): Promise<ResidentListItem[]> {
  const residents = await apiFetchJson<ResidentListItem[]>(`/api/residents?unitId=${encodeURIComponent(unitId)}`);
  return residents.sort((left, right) => left.surname.localeCompare(right.surname) || left.firstName.localeCompare(right.firstName));
}
