"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import VideoJoinScreen from "@/areas/video-consultation/VideoJoinScreen";
import { videoConsultationService } from "@/services/videoConsultationService";

export default function ClientVideoJoinPage() {
  const { invitationToken } = useParams<{ invitationToken: string }>();
  const load = useCallback(() => videoConsultationService.clientContext(invitationToken), [invitationToken]);
  const join = useCallback((displayName: string) => videoConsultationService.clientCredential(invitationToken, displayName), [invitationToken]);
  return <VideoJoinScreen loadContext={load} issueCredential={join} />;
}
