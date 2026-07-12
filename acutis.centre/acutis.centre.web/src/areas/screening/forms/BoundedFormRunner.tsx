"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { isAuthorizedClient } from "@/lib/authMode";
import {
  getActiveForm,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
  type SaveProgressResponse,
  type SaveResponse,
} from "./ApiClient";

type BoundedFormRunnerProps = {
  formCode: string;
  subjectType: "anonymous_call" | "resident" | "admission" | "participant";
  subjectId?: string | null;
  title?: string;
  description?: string;
  renderMode?: "accordion" | "wizard" | "inline";
  submitLabel?: string;
  submittedLabel?: string;
};

export default function BoundedFormRunner({
  formCode,
  subjectType,
  subjectId = null,
  title,
  description,
  renderMode = "accordion",
  submitLabel = "Submit form",
  submittedLabel = "Form submitted.",
}: BoundedFormRunnerProps) {
  const { data: session, status } = useSession();
  const { locale, mergeTranslations } = useLocalization();
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        if (active) setLoading(status === "loading");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getActiveForm(session?.accessToken, locale, subjectType, subjectId ?? null, formCode);
        if (!active) return;
        mergeTranslations(response.translations);
        setFormData(response);
      } catch (nextError) {
        if (!active) return;
        setFormData(null);
        setError(nextError instanceof Error ? nextError.message : "Unable to load form.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [formCode, locale, mergeTranslations, session?.accessToken, status, subjectId, subjectType]);

  const handleSaveProgress = async (payload: { submissionId: string | null; answers: Record<string, JsonValue> }): Promise<SaveProgressResponse> => {
    if (!formData) {
      throw new Error("No form is loaded.");
    }

    return saveProgress(session?.accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType,
      subjectId: subjectId ?? null,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
  };

  const handleSave = async (payload: { submissionId: string | null; answers: Record<string, JsonValue> }): Promise<SaveResponse> => {
    if (!formData) {
      throw new Error("No form is loaded.");
    }

    const response = await save(session?.accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType,
      subjectId: subjectId ?? null,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
    return response;
  };

  const heading = title ?? formData?.form.titleKey ?? formCode;
  const summary = description ?? formData?.form.descriptionKey;

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-primary)]">Bounded HSE Form</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">{heading}</h1>
        {summary && <p className="mt-2 max-w-3xl text-sm text-[var(--app-text-muted)]">{summary}</p>}
      </header>

      {loading && <p className="text-sm text-[var(--app-text-muted)]">Loading form...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {formData && (
        <DynamicFormRenderer
          form={formData.form}
          optionSets={formData.optionSets}
          locale={locale}
          initialSubmissionId={formData.submissionId}
          initialSubmissionStatus={formData.submissionStatus}
          initialAnswers={formData.draftAnswers}
          subjectType={subjectType}
          subjectId={subjectId ?? null}
          renderMode={renderMode}
          onSaveProgress={handleSaveProgress}
          onSave={handleSave}
          submitLabel={submitLabel}
          submittingLabel="Submitting..."
          submittedLabel={submittedLabel}
        />
      )}
    </section>
  );
}
