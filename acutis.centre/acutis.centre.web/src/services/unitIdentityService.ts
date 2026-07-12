import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { throwApiError } from "@/lib/apiError";

export type UnitIdentityDto = {
  unitId: string;
  unitCode: string;
  displayName: string;
  description: string;
  centreId: string;
  centreCode: string;
  centreDisplayName: string;
  brandName: string;
  brandSubtitle: string;
  brandLogoUrl: string;
  browserTitle: string;
  faviconUrl: string;
  themeKey: string;
  unitCapacity: number;
  currentOccupancy: number;
  freeBeds: number;
  capacityWarningThreshold: number;
  displayOrder: number;
  isActive: boolean;
};

async function request<T>(path: string, accessToken?: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as T;
}

export const unitIdentityService = {
  resolveByCode(unitCode: string, accessToken?: string) {
    return request<UnitIdentityDto>(`/api/units/resolve?unitCode=${encodeURIComponent(unitCode)}`, accessToken);
  },
};
