import { createAuthHeaders } from "@/lib/authMode";
import type { AppAccess } from "@/lib/adminAccess";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export const appAccessService = {
  async getCurrent(accessToken?: string): Promise<AppAccess> {
    const response = await fetch(`${getApiBaseUrl()}/api/auth-test/access`, {
      cache: "no-store",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(body || `Failed to load app access (${response.status})`);
    }

    return (await response.json()) as AppAccess;
  },
};
