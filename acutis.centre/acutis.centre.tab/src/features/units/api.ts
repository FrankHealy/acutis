import { apiFetchJson } from "../../services/api/client";
import type { RollCallUnitId } from "../rollCall/units";

export type UnitIdentity = {
  unitId: string;
  unitCode: string;
  displayName: string;
  description: string;
  centreId: string;
  centreDisplayName: string;
  unitCapacity: number;
  currentOccupancy: number;
  freeBeds: number;
};

export async function resolveUnit(unitCode: RollCallUnitId): Promise<UnitIdentity> {
  return apiFetchJson<UnitIdentity>(`/api/units/resolve?unitCode=${encodeURIComponent(unitCode)}`);
}
