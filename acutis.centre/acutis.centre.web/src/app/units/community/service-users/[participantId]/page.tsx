"use client";

import { useParams } from "next/navigation";
import AmbulatoryWorkspace from "@/areas/ambulatory/AmbulatoryWorkspace";

export default function CommunityServiceUserRecordPage() {
  const params = useParams<{ participantId: string }>();

  return <AmbulatoryWorkspace programme="community" recordParticipantId={params.participantId} />;
}
