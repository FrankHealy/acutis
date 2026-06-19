import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { throwApiError } from "@/lib/apiError";

export type AmbulatoryProgramme = "community" | "practitioner";
export type AmbulatoryProgrammeType = "Community" | "Practitioner";

export type AmbulatoryAssessment = {
  id: string;
  participantId: string;
  assessmentType: string;
  presentingNeeds: string;
  riskSummary: string;
  strengths: string;
  substanceOrBehaviourSummary: string;
  goalsDiscussed: string;
  outcome: string;
  completedAtUtc: string;
};

export type AmbulatoryCarePlan = {
  id: string;
  participantId: string;
  status: string;
  needs: string;
  strengths: string;
  risks: string;
  goals: string;
  actions: string;
  reviewNotes: string;
  reviewDate?: string | null;
  updatedAtUtc: string;
};

export type AmbulatoryParticipant = {
  id: string;
  internalIdentifier?: string | null;
  programmeType: AmbulatoryProgrammeType;
  displayName: string;
  preferredName?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  photo?: string | null;
  referralSource?: string | null;
  status: string;
  counsellorUserId: string;
  counsellorDisplayName: string;
  currentCarePlan?: AmbulatoryCarePlan | null;
  carePlans?: AmbulatoryCarePlan[];
  assessments: AmbulatoryAssessment[];
};

export type AmbulatoryAppointment = {
  id: string;
  programmeType: AmbulatoryProgrammeType;
  participantId?: string | null;
  participantName?: string | null;
  counsellorUserId: string;
  counsellorDisplayName: string;
  appointmentType: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  deliveryMode: string;
  status: string;
  notes?: string | null;
  avProvider?: string | null;
  avRoomName?: string | null;
  avJoinUrl?: string | null;
  isFixed: boolean;
};

export type AmbulatoryDashboard = {
  programmeType: AmbulatoryProgrammeType;
  programmeName: string;
  counsellorUserId: string;
  participants: AmbulatoryParticipant[];
  appointments: AmbulatoryAppointment[];
  programmeOfferings: AmbulatoryProgrammeOffering[];
};

export type AmbulatoryProgrammeOffering = {
  code: string;
  name: string;
  category: string;
  cadence: string;
  facilitator: string;
  description: string;
  suitableFor: string;
  nextSessionLabel: string;
};

export type CreateAmbulatoryParticipantRequest = {
  displayName: string;
  preferredName?: string;
  phone?: string;
  email?: string;
  referralSource?: string;
};

export type UpsertAmbulatoryAssessmentRequest = {
  assessmentType: "initial" | "full";
  presentingNeeds: string;
  riskSummary: string;
  strengths: string;
  substanceOrBehaviourSummary: string;
  goalsDiscussed: string;
  outcome: string;
};

export type UpsertAmbulatoryCarePlanRequest = {
  status: string;
  needs: string;
  strengths: string;
  risks: string;
  goals: string;
  actions: string;
  reviewNotes: string;
  reviewDate?: string | null;
};

export type UpsertAmbulatoryAppointmentRequest = {
  participantId?: string | null;
  appointmentType: "initial-assessment" | "full-assessment" | "individual-therapy" | "group-meeting";
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  deliveryMode: "in-person" | "video";
  status?: string;
  notes?: string;
};

async function request<T>(path: string, accessToken?: string | null, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as T;
}

export const ambulatoryService = {
  getDashboard(programme: AmbulatoryProgramme, accessToken?: string | null) {
    return request<AmbulatoryDashboard>(`/api/ambulatory/${programme}/dashboard`, accessToken);
  },

  createParticipant(programme: AmbulatoryProgramme, payload: CreateAmbulatoryParticipantRequest, accessToken?: string | null) {
    return request<AmbulatoryParticipant>(`/api/ambulatory/${programme}/participants`, accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  addAssessment(programme: AmbulatoryProgramme, participantId: string, payload: UpsertAmbulatoryAssessmentRequest, accessToken?: string | null) {
    return request<AmbulatoryAssessment>(`/api/ambulatory/${programme}/participants/${encodeURIComponent(participantId)}/assessments`, accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  upsertCarePlan(programme: AmbulatoryProgramme, participantId: string, payload: UpsertAmbulatoryCarePlanRequest, accessToken?: string | null) {
    return request<AmbulatoryCarePlan>(`/api/ambulatory/${programme}/participants/${encodeURIComponent(participantId)}/care-plan`, accessToken, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  createAppointment(programme: AmbulatoryProgramme, payload: UpsertAmbulatoryAppointmentRequest, accessToken?: string | null) {
    return request<AmbulatoryAppointment>(`/api/ambulatory/${programme}/appointments`, accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateAppointment(programme: AmbulatoryProgramme, appointmentId: string, payload: UpsertAmbulatoryAppointmentRequest, accessToken?: string | null) {
    return request<AmbulatoryAppointment>(`/api/ambulatory/${programme}/appointments/${encodeURIComponent(appointmentId)}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
