import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { throwApiError } from "@/lib/apiError";

export type PractitionerVideoContext = {
  appointmentId: string;
  clientName: string;
  practitionerName: string;
  startsAtUtc: string;
  endsAtUtc: string;
  status: string;
  canJoin: boolean;
  joinBlockedReason?: string | null;
};

export type ExternalVideoContext = {
  clientName: string;
  practitionerName: string;
  startsAtUtc: string;
  endsAtUtc: string;
  status: string;
};

export type LiveKitCredential = {
  server_url: string;
  participant_token: string;
};

export type VideoInvitation = {
  invitation_token: string;
  expires_at_utc: string;
};

async function request<T>(path: string, init?: RequestInit, accessToken?: string | null): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) await throwApiError(response);
  return (await response.json()) as T;
}

export const videoConsultationService = {
  getPractitionerContext(appointmentId: string, accessToken?: string | null) {
    return request<PractitionerVideoContext>(`/api/practitioner/appointments/${encodeURIComponent(appointmentId)}/video`, undefined, accessToken);
  },
  createPractitionerCredential(appointmentId: string, accessToken?: string | null) {
    return request<LiveKitCredential>(`/api/practitioner/appointments/${encodeURIComponent(appointmentId)}/video/join-credential`, { method: "POST" }, accessToken);
  },
  createInvitation(appointmentId: string, accessToken?: string | null) {
    return request<VideoInvitation>(`/api/practitioner/appointments/${encodeURIComponent(appointmentId)}/video/invitations`, { method: "POST" }, accessToken);
  },
  end(appointmentId: string, accessToken?: string | null) {
    return fetch(`${getApiBaseUrl()}/api/practitioner/appointments/${encodeURIComponent(appointmentId)}/video/end`, {
      method: "POST",
      cache: "no-store",
      headers: createAuthHeaders(accessToken),
    }).then(async (response) => {
      if (!response.ok) await throwApiError(response);
    });
  },
  getExternalContext(invitationToken: string) {
    return request<ExternalVideoContext>("/api/video-consultations/external/context", {
      method: "POST",
      body: JSON.stringify({ invitation_token: invitationToken }),
    });
  },
  createExternalCredential(invitationToken: string, displayName: string) {
    return request<LiveKitCredential>("/api/video-consultations/external/join-credential", {
      method: "POST",
      body: JSON.stringify({ invitation_token: invitationToken, display_name: displayName }),
    });
  },
};
