import { createAuthHeaders } from "@/lib/authMode";
import type { AppAccess } from "@/lib/adminAccess";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { throwApiError } from "@/lib/apiError";

export const appAccessService = {
  async getCurrent(accessToken?: string): Promise<AppAccess> {
    const response = await fetch(`${getApiBaseUrl()}/api/auth-test/access`, {
      cache: "no-store",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      await throwApiError(response);
    }

    return (await response.json()) as AppAccess;
  },
};
