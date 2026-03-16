"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  FormDefinitionDto,
  JsonValue,
  OptionSetDto,
  SaveProgressResponse,
  SaveResponse,
  UiGroupDto,
  UiSectionDto,
} from "./ApiClient";
import { applyRules } from "./RuleEngine";
import { validateAnswers, type ValidationErrors } from "./Validation";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

type DynamicFormRendererProps = {
  form: FormDefinitionDto;
  optionSets: OptionSetDto[];
  locale: string;
  initialSubmissionId: string | null;
  initialAnswers: Record<string, JsonValue>;
  subjectType: "anonymous_call" | "resident" | "admission";
  subjectId: string | null;
  onSaveProgress: (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }) => Promise<SaveProgressResponse>;
  onSave: (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }) => Promise<SaveResponse>;
};

const getInputType = (type: string, format?: string): string => {
  if (format === "email") return "email";
  if (format === "phone") return "tel";
  if (type === "date") return "date";
  if (type === "datetime") return "datetime-local";
  return "text";
};

const getFirstError = (errors: ValidationErrors, fieldKey: string): string | null => {
  return errors[fieldKey]?.[0] ?? null;
};

const parseValidationErrors = (error: unknown): ValidationErrors | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  try {
    const parsed = JSON.parse((error as Error & { bodyText?: string }).bodyText ?? "{}") as {
      errors?: Array<{ fieldKey: string; message: string }>;
    };

    if (!Array.isArray(parsed.errors)) {
      return null;
    }

    const serverErrors: ValidationErrors = {};
    for (const item of parsed.errors) {
      if (!serverErrors[item.fieldKey]) {
        serverErrors[item.fieldKey] = [];
      }

      serverErrors[item.fieldKey].push(item.message);
    }

    return serverErrors;
  } catch {
    return null;
  }
};

export default function DynamicFormRenderer({
  form,
  optionSets,
  locale,
  initialSubmissionId,
  initialAnswers,
  subjectType,
  subjectId,
  onSaveProgress,
  onSave,
}: DynamicFormRendererProps) {
  const { t } = useLocalization();
  const [answers, setAnswers] = useState<Record<string, JsonValue>>(initialAnswers);
  const [submissionId, setSubmissionId] = useState<string | null>(initialSubmissionId);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [lastSavedSignature, setLastSavedSignature] = useState<string>(JSON.stringify(initialAnswers ?? {}));
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);

  useEffect(() => {
    const initialRuleState = applyRules(form.rules, initialAnswers ?? {});
    setAnswers(initialRuleState.answers);
    setSubmissionId(initialSubmissionId);
    setLastSavedSignature(JSON.stringify(initialRuleState.answers));
    setExpandedSections(form.ui.sections.map((section) => section.titleKey));
    setValidationErrors({});
    setTouchedFields([]);
    setFormError(null);
  }, [form.rules, initialAnswers, initialSubmissionId]);

  const ruleState = useMemo(() => applyRules(form.rules, answers), [form.rules, answers]);
  const optionSetLookup = useMemo(() => new Map(optionSets.map((set) => [set.key, set])), [optionSets]);
  const buildVisibleValidationErrors = (
    nextAnswers: Record<string, JsonValue>,
    visibleFieldKeys: string[]
  ): ValidationErrors => {
    const allErrors = validateAnswers(form.schema, nextAnswers, optionSets);
    const allowedFieldKeys = new Set(visibleFieldKeys);
    return Object.fromEntries(
      Object.entries(allErrors).filter(([fieldKey]) => allowedFieldKeys.has(fieldKey))
    );
  };

  const persistProgress = async (snapshot: Record<string, JsonValue>) => {
    const signature = JSON.stringify(snapshot);
    if (signature === lastSavedSignature || submitted) {
      return;
    }

    try {
      setIsSavingProgress(true);
      const result = await onSaveProgress({
        submissionId,
        answers: snapshot,
      });
      setSubmissionId(result.submissionId);
      setLastSavedSignature(signature);
      setDraftSavedAt(new Date().toLocaleTimeString());
      setFormError(null);
    } catch (error) {
      const serverErrors = parseValidationErrors(error);
      if (serverErrors) {
        setValidationErrors((previous) => ({ ...previous, ...serverErrors }));
        setFormError(null);
      } else {
        setFormError(error instanceof Error ? error.message : "Unable to save progress.");
      }
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleChange = (fieldKey: string, nextValue: JsonValue) => {
    setAnswers((previousAnswers) => {
      const updatedAnswers = { ...previousAnswers, [fieldKey]: nextValue };
      const nextRuleState = applyRules(form.rules, updatedAnswers);
      if (touchedFields.includes(fieldKey)) {
        setValidationErrors((previous) => {
          const nextErrors = buildVisibleValidationErrors(nextRuleState.answers, touchedFields);
          return Object.keys(nextErrors).length > 0 ? nextErrors : {};
        });
      } else {
        setValidationErrors((previous) => {
          if (!previous[fieldKey]) {
            return previous;
          }

          const nextErrors = { ...previous };
          delete nextErrors[fieldKey];
          return nextErrors;
        });
      }

      setFormError(null);
      return nextRuleState.answers;
    });
  };

  const handleBlur = async (fieldKey: string) => {
    const nextTouchedFields = touchedFields.includes(fieldKey) ? touchedFields : [...touchedFields, fieldKey];
    setTouchedFields(nextTouchedFields);

    const nextErrors = buildVisibleValidationErrors(ruleState.answers, nextTouchedFields);
    setValidationErrors(nextErrors);

    if (nextErrors[fieldKey]?.length) {
      return;
    }

    await persistProgress(ruleState.answers);
  };

  const handleSubmit = async () => {
    const clientErrors = validateAnswers(form.schema, ruleState.answers, optionSets);
    setTouchedFields(Object.keys(form.schema.properties));
    setValidationErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onSave({
        submissionId,
        answers: ruleState.answers,
      });
      setSubmissionId(result.submissionId);
      setSubmitted(true);
      setValidationErrors({});
      setFormError(null);
    } catch (error) {
      const serverErrors = parseValidationErrors(error);
      if (serverErrors) {
        setTouchedFields(Object.keys(form.schema.properties));
        setValidationErrors(serverErrors);
        setFormError(null);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Submission failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    await persistProgress(ruleState.answers);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((previous) =>
      previous.includes(sectionKey)
        ? previous.filter((value) => value !== sectionKey)
        : [...previous, sectionKey]
    );
  };

  const getGroupTitle = (group: UiGroupDto): string => {
    if (group.title && group.title.trim()) {
      return group.title;
    }

    if (group.titleKey) {
      return t(group.titleKey);
    }

    return "Group";
  };

  const renderField = (fieldKey: string) => {
    if (ruleState.hiddenFields.has(fieldKey)) {
      return null;
    }

    const schemaProperty = form.schema.properties[fieldKey];
    if (!schemaProperty) {
      return null;
    }

    const widget = form.ui.widgets[fieldKey] ?? "input";
    const label = t(form.ui.labelKeys[fieldKey]);
    const helpText = t(form.ui.helpKeys[fieldKey]);
    const disabled = ruleState.disabledFields.has(fieldKey);
    const error = getFirstError(validationErrors, fieldKey);
    const value = ruleState.answers[fieldKey];

    const isBooleanField = widget === "toggle" || schemaProperty.type === "boolean";

    return (
      <div key={fieldKey} className="space-y-1">
        {!isBooleanField && <label className="text-sm font-medium text-gray-800">{label}</label>}

        {isBooleanField && (
          <label className="mt-1 inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={Boolean(value)}
              disabled={disabled}
              onChange={(event) => handleChange(fieldKey, event.target.checked)}
              onBlur={() => handleBlur(fieldKey)}
            />
            <span>{label}</span>
          </label>
        )}

        {(widget === "select" || schemaProperty.type === "enum") && (
          <select
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={typeof value === "string" ? value : ""}
            disabled={disabled}
            onChange={(event) => handleChange(fieldKey, event.target.value)}
            onBlur={() => handleBlur(fieldKey)}
          >
            <option value="">Select...</option>
            {schemaProperty.optionSetKey
              ? (optionSetLookup.get(schemaProperty.optionSetKey)?.items ?? [])
                  .filter((item) => item.isActive)
                  .sort((left, right) => left.sortOrder - right.sortOrder)
                  .map((item) => (
                    <option key={item.code} value={item.code}>
                      {t(item.labelKey)}
                    </option>
                  ))
              : (form.ui.selectOptions?.[fieldKey] ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
          </select>
        )}

        {(widget === "textarea" || schemaProperty.type === "text") && (
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            rows={4}
            value={typeof value === "string" ? value : ""}
            maxLength={typeof schemaProperty.maxLength === "number" ? schemaProperty.maxLength : undefined}
            disabled={disabled}
            onChange={(event) => handleChange(fieldKey, event.target.value)}
            onBlur={() => handleBlur(fieldKey)}
          />
        )}

        {(widget === "number" || schemaProperty.type === "integer" || schemaProperty.type === "number") && (
          <input
            type="number"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={typeof value === "number" ? value : ""}
            min={schemaProperty.minimum}
            max={schemaProperty.maximum}
            step={schemaProperty.type === "integer" ? 1 : "any"}
            disabled={disabled}
            onChange={(event) =>
              handleChange(fieldKey, event.target.value === "" ? null : Number(event.target.value))
            }
            onBlur={() => handleBlur(fieldKey)}
          />
        )}

        {widget === "input" &&
          schemaProperty.type !== "integer" &&
          schemaProperty.type !== "number" &&
          schemaProperty.type !== "enum" &&
          schemaProperty.type !== "text" &&
          schemaProperty.type !== "boolean" && (
            <input
              type={getInputType(schemaProperty.type, schemaProperty.format)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={typeof value === "string" ? value : ""}
              maxLength={typeof schemaProperty.maxLength === "number" ? schemaProperty.maxLength : undefined}
              minLength={typeof schemaProperty.minLength === "number" ? schemaProperty.minLength : undefined}
              pattern={schemaProperty.pattern ?? undefined}
              disabled={disabled}
              onChange={(event) => handleChange(fieldKey, event.target.value)}
              onBlur={() => handleBlur(fieldKey)}
            />
          )}

        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  };

  const renderSectionBody = (section: UiSectionDto) => {
    const ungroupedItems = section.items ?? [];
    const groups = section.groups ?? [];

    return (
      <div className="space-y-4">
        {ungroupedItems.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ungroupedItems.map((fieldKey) => renderField(fieldKey))}
          </div>
        )}

        {groups.map((group) => (
          <div
            key={`${section.titleKey}-${group.titleKey ?? group.title ?? "group"}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {getGroupTitle(group)}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {group.items.map((fieldKey) => renderField(fieldKey))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-semibold text-gray-900">{t(form.titleKey)}</h1>
        {form.descriptionKey && <p className="mt-1 text-sm text-gray-600">{t(form.descriptionKey)}</p>}
      </div>

      {form.ui.sections.map((section) => {
        const isExpanded = expandedSections.includes(section.titleKey);
        return (
          <section key={section.titleKey} className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              onClick={() => toggleSection(section.titleKey)}
            >
              <h2 className="text-base font-semibold text-gray-900">{t(section.titleKey)}</h2>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            <div className={isExpanded ? "block border-t border-gray-100 p-4" : "hidden"}>
              {renderSectionBody(section)}
            </div>
          </section>
        );
      })}

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {submitted && <p className="text-sm font-semibold text-green-700">Submitted.</p>}
      {!submitted && draftSavedAt && <p className="text-sm font-medium text-blue-700">Draft saved at {draftSavedAt}.</p>}

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-500">
          {isSavingProgress ? "Saving progress..." : "Progress saves on field blur."}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={handleSaveDraft}
            disabled={isSavingProgress || isSubmitting || submitted}
          >
            {isSavingProgress ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || submitted}
          >
            {isSubmitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
