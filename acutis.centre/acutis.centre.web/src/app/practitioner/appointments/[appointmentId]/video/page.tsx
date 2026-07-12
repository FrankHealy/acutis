"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import VideoJoinScreen from "@/areas/video-consultation/VideoJoinScreen";
import { videoConsultationService } from "@/services/videoConsultationService";

export default function PractitionerVideoPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data: session } = useSession();
  const load = useCallback(() => videoConsultationService.practitionerContext(appointmentId, session?.accessToken), [appointmentId, session?.accessToken]);
  const join = useCallback(() => videoConsultationService.practitionerCredential(appointmentId, session?.accessToken), [appointmentId, session?.accessToken]);
  const end = useCallback(() => videoConsultationService.end(appointmentId, session?.accessToken), [appointmentId, session?.accessToken]);
  return <VideoJoinScreen practitioner loadContext={load} issueCredential={join} onEnd={end} />;
}
