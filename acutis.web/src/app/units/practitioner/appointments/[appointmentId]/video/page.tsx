"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Copy, Link2 } from "lucide-react";
import VideoConsultationExperience from "@/areas/ambulatory/video/VideoConsultationExperience";
import {
  videoConsultationService,
  type PractitionerVideoContext,
} from "@/services/videoConsultationService";

export default function PractitionerVideoConsultationPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [context, setContext] = useState<PractitionerVideoContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    void videoConsultationService
      .getPractitionerContext(params.appointmentId, session.accessToken)
      .then(setContext)
      .catch((reason) => setError((reason as Error).message));
  }, [params.appointmentId, session?.accessToken, status]);

  const createInvitation = async () => {
    if (!session?.accessToken) return;
    try {
      setError(null);
      const invitation = await videoConsultationService.createInvitation(params.appointmentId, session.accessToken);
      setInvitationUrl(`${window.location.origin}/vc/join/${encodeURIComponent(invitation.invitation_token)}`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  if (error && !context) return <PageMessage title="Unable to open consultation" detail={error} />;
  if (!context) return <PageMessage title="Opening consultation" detail="Loading appointment and device controls…" />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => router.push("/units/practitioner")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back to Practitioner
          </button>
          <button type="button" onClick={() => void createInvitation()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800">
            <Link2 className="h-4 w-4" /> Create client invitation
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {invitationUrl && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-indigo-950">Private client invitation</p>
              <p className="mt-1 truncate text-sm text-indigo-800">{invitationUrl}</p>
            </div>
            <button type="button" onClick={() => void navigator.clipboard.writeText(invitationUrl)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-300 bg-white px-3 text-sm font-semibold text-indigo-800 hover:bg-indigo-100">
              <Copy className="h-4 w-4" /> Copy
            </button>
          </div>
        )}

        <VideoConsultationExperience
          summary={context}
          displayName={context.practitionerName}
          blockedReason={context.canJoin ? null : context.joinBlockedReason}
          issueCredential={() => videoConsultationService.createPractitionerCredential(params.appointmentId, session?.accessToken)}
          onEnd={() => videoConsultationService.end(params.appointmentId, session?.accessToken)}
        />
      </div>
    </main>
  );
}

function PageMessage({ title, detail }: { title: string; detail: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Acutis Practitioner</p><h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1><p className="mt-3 text-sm text-slate-600">{detail}</p></div></main>;
}
