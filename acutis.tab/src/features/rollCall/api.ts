import { apiFetchJson } from "../../services/api/client";
import type { RollCallUnitId } from "./units";

export type RollCallResident = {
  id: string;
  residentGuid: string;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number;
  roomNumber: string;
  photoUrl?: string | null;
  caseStatus?: string | null;
  programmeType?: string | null;
  participationMode?: string | null;
  centreEpisodeCode?: string | null;
};

type ResidentListItemDto = {
  id: number;
  residentGuid: string;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number;
  roomNumber: string;
  photoUrl?: string | null;
  caseStatus?: string | null;
  programmeType?: string | null;
  participationMode?: string | null;
  centreEpisodeCode?: string | null;
};

export async function fetchRollCallResidents(unitId: RollCallUnitId): Promise<RollCallResident[]> {
  const residents = await apiFetchJson<ResidentListItemDto[]>(`/api/residents?unitId=${encodeURIComponent(unitId)}`);

  return residents
    .map((resident) => ({
      id: String(resident.id),
      residentGuid: resident.residentGuid,
      firstName: resident.firstName,
      surname: resident.surname,
      nationality: resident.nationality,
      age: resident.age,
      weekNumber: resident.weekNumber,
      roomNumber: resident.roomNumber,
      photoUrl: resident.photoUrl ?? null,
      caseStatus: resident.caseStatus ?? null,
      programmeType: resident.programmeType ?? null,
      participationMode: resident.participationMode ?? null,
      centreEpisodeCode: resident.centreEpisodeCode ?? null,
    }))
    .sort((left, right) => left.surname.localeCompare(right.surname) || left.firstName.localeCompare(right.firstName));
}
