"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VideoConsultationExperience from "@/areas/ambulatory/video/VideoConsultationExperience";
import {
  videoConsultationService,
  type ExternalVideoContext,
} from "@/services/videoConsultationService";

export default function ExternalVideoConsultationPage() {
  const params = useParams<{ invitationToken: string }>();
  const invitationToken = decodeURIComponent(params.invitationToken);
  const [context, setContext] = useState<ExternalVideoContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void videoConsultationService
      .getExternalContext(invitationToken)
      .then(setContext)
      .catch((reason) => setError((reason as Error).message));
  }, [invitationToken]);

  if (error) return <ExternalStatus title="Invitation unavailable" detail={error} />;
  if (!context) return <ExternalStatus title="Checking invitation" detail="Please wait while Acutis verifies your consultation link." />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <VideoConsultationExperience
        summary={context}
        displayName={context.clientName}
        requireDisplayName
        issueCredential={(displayName) => videoConsultationService.createExternalCredential(invitationToken, displayName)}
      />
      <p className="mx-auto mt-5 max-w-3xl text-center text-xs text-slate-500">
        This secure video consultation is not an emergency service. Contact local emergency services if immediate help is required.
      </p>
    </main>
  );
}

function ExternalStatus({ title, detail }: { title: string; detail: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><img src="/acutis-icon.svg" alt="Acutis" className="mx-auto h-14 w-14" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Acutis Practitioner</p><h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1><p className="mt-3 text-sm text-slate-600">{detail}</p></div></main>;
}
