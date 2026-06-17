import { apiFetchJson } from "../../services/api/client";

export type CommunityCarePlan = {
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

export type CommunityAssessment = {
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

export type CommunityParticipant = {
  id: string;
  programmeType: string;
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
  currentCarePlan?: CommunityCarePlan | null;
  assessments: CommunityAssessment[];
};

export type CommunityAppointment = {
  id: string;
  programmeType: string;
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

export type CommunityProgrammeOffering = {
  code: string;
  name: string;
  category: string;
  cadence: string;
  facilitator: string;
  description: string;
  suitableFor: string;
  nextSessionLabel: string;
};

export type CommunityDashboard = {
  programmeType: string;
  programmeName: string;
  counsellorUserId: string;
  participants: CommunityParticipant[];
  appointments: CommunityAppointment[];
  programmeOfferings: CommunityProgrammeOffering[];
};

export async function fetchCommunityDashboard(): Promise<CommunityDashboard> {
  const dashboard = await apiFetchJson<CommunityDashboard>("/api/ambulatory/community/dashboard");

  return {
    ...dashboard,
    participants: dashboard.participants ?? [],
    appointments: dashboard.appointments ?? [],
    programmeOfferings: dashboard.programmeOfferings ?? [],
  };
}
