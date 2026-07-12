"use client";

import { useParams } from "next/navigation";
import Header from "@/areas/shared/layout/Header";
import { PrintToolbar } from "@/areas/screening/print/PrintPrimitives";
import FullAssessmentPrintTemplate from "@/areas/screening/print/FullAssessmentPrintTemplate";
import ComprehensiveCarePlanPrintTemplate from "@/areas/screening/print/ComprehensiveCarePlanPrintTemplate";
import InitialCarePlanPrintTemplate from "@/areas/screening/print/InitialCarePlanPrintTemplate";

const TEMPLATES = {
  "full-assessment": { Component: FullAssessmentPrintTemplate, title: "HSE Full Assessment — Print Preview" },
  "comprehensive-care-plan": { Component: ComprehensiveCarePlanPrintTemplate, title: "Comprehensive Care Plan — Print Preview" },
  "initial-care-plan": { Component: InitialCarePlanPrintTemplate, title: "Initial Care Plan — Print Preview" },
} as const;

type TemplateKey = keyof typeof TEMPLATES;

export default function PrintPreviewPage() {
  const params = useParams<{ template: string }>();
  const entry = TEMPLATES[params.template as TemplateKey];

  return (
    <div className="app-page-shell min-h-screen">
      <Header showCapacity={false} unitName={entry?.title ?? "Print Preview"} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {entry ? (
          <>
            <PrintToolbar />
            <entry.Component answers={{}} />
          </>
        ) : (
          <p className="text-sm text-[var(--app-text-muted)]">
            Unknown print template &quot;{params.template}&quot;. Valid options: {Object.keys(TEMPLATES).join(", ")}.
          </p>
        )}
      </main>
    </div>
  );
}
