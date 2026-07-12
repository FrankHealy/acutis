import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { throwApiError } from "@/lib/apiError";

export type ConsultationContext = { clientName: string; practitionerName: string; startsAtUtc: string; endsAtUtc: string; status: string };
export type JoinCredential = { server_url: string; participant_token: string };

async function request<T>(path: string, accessToken?: string | null, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init, cache: "no-store", credentials: "same-origin",
    headers: { ...createAuthHeaders(accessToken), ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  if (!response.ok) await throwApiError(response);
  return response.status === 204 ? undefined as T : await response.json() as T;
}

const root = "/api/video-consultations";
export const videoConsultationService = {
  practitionerContext: (id: string, token?: string | null) => request<ConsultationContext>(`${root}/appointments/${encodeURIComponent(id)}`, token),
  practitionerCredential: (id: string, token?: string | null) => request<JoinCredential>(`${root}/appointments/${encodeURIComponent(id)}/credentials`, token, { method: "POST" }),
  clientContext: (invitation: string) => request<ConsultationContext>(`${root}/invitations/${encodeURIComponent(invitation)}`),
  clientCredential: (invitation: string, displayName: string) => request<JoinCredential>(`${root}/invitations/${encodeURIComponent(invitation)}/credentials`, undefined, { method: "POST", body: JSON.stringify({ displayName }) }),
  end: (id: string, token?: string | null) => request<void>(`${root}/appointments/${encodeURIComponent(id)}/end`, token, { method: "POST" }),
};
