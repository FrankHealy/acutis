import { Resident } from "../types";

export function mapResidentApiToModel(apiData: any): Resident {
  return {
    id: apiData.id,
    firstName: apiData.firstName ?? "",
    lastName: apiData.lastName ?? "",
    dateOfBirth: apiData.dateOfBirth ?? "",
    admissionDate: apiData.admissionDate ?? "",
    admissionPhase: apiData.admissionPhase ?? "Intake",
    countryId: apiData.countryId,
    primaryAddictionId: apiData.primaryAddictionId,
    createdAt: apiData.createdAt
  };
}

