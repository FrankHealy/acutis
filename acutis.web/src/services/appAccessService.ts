import { createAuthHeaders } from "@/lib/authMode";
import type { AppAccess } from "@/lib/adminAccess";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

export const appAccessService = {
  async getCurrent(accessToken?: string): Promise<AppAccess> {
    const response = await fetch(`${API_BASE_URL}/api/auth-test/access`, {
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
