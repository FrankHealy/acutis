"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  FormDefinitionDto,
  JsonValue,
  OptionSetDto,
  RejectResponse,
  SaveProgressResponse,
  SaveResponse,
  UiGroupDto,
  UiSectionDto,
} from "./ApiClient";
import { applyRules } from "./RuleEngine";
import { validateAnswers, type ValidationErrors } from "./Validation";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import Toast from "@/units/shared/ui/Toast";

type DynamicFormRendererProps = {
  form: FormDefinitionDto;
  optionSets: OptionSetDto[];
  locale: string;
  initialSubmissionId: string | null;
  initialSubmissionStatus?: "in_progress" | "submitted" | null;
  initialAnswers: Record<string, JsonValue>;
  subjectType: "anonymous_call" | "resident" | "admission";
  subjectId: string | null;
  renderMode?: "accordion" | "wizard";
  onSaveProgress: (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }) => Promise<SaveProgressResponse>;
  onSave: (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }) => Promise<SaveResponse>;
  onReject?: (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
    rejectionReason: string;
  }) => Promise<RejectResponse>;
  submitLabel?: string;
  submittingLabel?: string;
  submittedLabel?: string;
};

const getInputType = (type: string, format?: string): string => {
  if (format === "email") return "email";
  if (format === "phone") return "tel";
  if (type === "date") return "date";
  if (type === "datetime") return "datetime-local";
  return "text";
};

const getJsonObject = (value: JsonValue): Record<string, JsonValue> | null => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return value as Record<string, JsonValue>;
};

const injectionBodyZones = [
  { key: "left_arm", label: "Left Arm", x: "16%", y: "40%" },
  { key: "right_arm", label: "Right Arm", x: "84%", y: "40%" },
  { key: "left_hand", label: "Left Hand", x: "10%", y: "57%" },
  { key: "right_hand", label: "Right Hand", x: "90%", y: "57%" },
  { key: "torso", label: "Torso", x: "50%", y: "44%" },
  { key: "left_leg", label: "Left Leg", x: "42%", y: "76%" },
  { key: "right_leg", label: "Right Leg", x: "58%", y: "76%" },
  { key: "feet", label: "Feet", x: "50%", y: "94%" },
] as const;

const parseJsonStringObject = (value: JsonValue): Record<string, JsonValue> => {
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as JsonValue;
      return getJsonObject(parsed) ?? {};
    } catch {
      return {};
    }
  }

  return getJsonObject(value) ?? {};
};

const booleanStatementLabels: Record<string, string> = {
  medical_card_status: "Medical card held",
  assessment_completion_status: "Comprehensive assessment completed",
  consent_mental_health_shared_record: "Consent given to share the mental health record",
  ever_treated_for_substance_use: "Previously treated for substance use",
  ever_treated_for_alcohol: "Previously treated for alcohol use",
  current_opiate_agonist_treatment: "Currently receiving opiate agonist treatment",
  other_current_treatment_medication: "Currently taking other treatment or prescribed medication",
  physical_health_concerns: "Physical health concerns identified",
  known_allergies: "Known allergies (More Info)",
  history_of_head_injury: "History of head injury",
  history_of_seizures: "History of seizures",
  mental_health_concerns: "Mental health concerns identified",
  mental_health_professional_engagement: "Seen or seeing a mental health professional (More Info)",
  history_of_psychiatric_care: "History of psychiatric care",
  history_of_self_harm_or_suicidal_thoughts: "History of self-harm or suicidal thoughts",
  comprehensive_assessment_needed: "Comprehensive assessment needed",
  comprehensive_assessment_arranged: "Comprehensive assessment arranged",
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
  initialSubmissionStatus = null,
  initialAnswers,
  subjectType,
  subjectId,
  renderMode = "accordion",
  onSaveProgress,
  onSave,
  onReject,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  submittedLabel = "Submitted.",
}: DynamicFormRendererProps) {
  const { loadKeys, t } = useLocalization();
  const isRtl = locale.startsWith("ar");
  const [answers, setAnswers] = useState<Record<string, JsonValue>>(initialAnswers);
  const [submissionId, setSubmissionId] = useState<string | null>(initialSubmissionId);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(initialSubmissionStatus === "submitted");
  const [formError, setFormError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "warning" | "error" | "info" }>({
    open: false,
    message: "",
    type: "info",
  });
  const [lastSavedSignature, setLastSavedSignature] = useState<string>(JSON.stringify(initialAnswers ?? {}));
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const answersRef = useRef<Record<string, JsonValue>>(initialAnswers);

  useEffect(() => {
    const initialRuleState = applyRules(form.rules, initialAnswers ?? {});
    setAnswers(initialRuleState.answers);
    answersRef.current = initialRuleState.answers;
    setSubmissionId(initialSubmissionId);
    setLastSavedSignature(JSON.stringify(initialRuleState.answers));
    setExpandedSections(form.ui.sections.map((section) => section.titleKey));
    setCurrentSectionIndex(0);
    setValidationErrors({});
    setTouchedFields([]);
    setFormError(null);
    setRejectionReason("");
    setIsRejectModalOpen(false);
    setSubmitted(initialSubmissionStatus === "submitted");
    setDraftSavedAt(initialSubmissionStatus === "submitted" ? null : null);
    setToast((current) => ({ ...current, open: false }));
  }, [form.rules, initialAnswers, initialSubmissionId, initialSubmissionStatus]);

  useEffect(() => {
    void loadKeys([
      "form.group.default",
      "form.select.placeholder",
      "form.status.saving_progress",
      "form.status.progress_saved_on_blur",
      "form.status.draft_saved",
      "form.status.rejected",
      "form.status.submitted",
      "form.status.draft_saved_at",
      "form.progress.label",
      "form.progress.step",
      "form.boolean.applies",
      "form.boolean.not_applies",
      "form.action.previous",
      "form.action.next",
      "form.action.accept",
      "form.action.accepting",
      "form.action.save_draft",
      "form.action.saving",
      "form.action.submit",
      "form.action.reject",
      "form.action.cancel",
      "form.action.submitting",
      "form.modal.reject.title",
      "form.modal.reject.confirm",
      "form.error.save_progress",
      "form.error.rejection_failed",
      "form.error.rejection_reason_required",
      "form.error.submission_failed",
      "form.field.rejection_reason",
      "form.field.rejection_reason_placeholder",
      "form.status.accepted",
      "form.validation.required",
      "form.validation.expected_type",
      "form.validation.expected_boolean",
      "form.validation.expected_integer",
      "form.validation.expected_number",
      "form.validation.expected_option_list",
      "form.validation.min_length",
      "form.validation.max_length",
      "form.validation.pattern",
      "form.validation.invalid_format",
      "form.validation.min_value",
      "form.validation.max_value",
      "form.validation.invalid_option",
      "form.validation.invalid_option_list",
      "toast.action.close",
    ]);
  }, [loadKeys]);

  useEffect(() => {
    if (!toast.open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [toast.open]);

  const text = (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
    fallbackArabic?: string
  ) => {
    const resolved = t(key);
    const template = resolved === key ? (isRtl && fallbackArabic ? fallbackArabic : fallback) : resolved;
    if (!values) {
      return template;
    }

    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
      template
    );
  };

  const getBooleanLabel = (fieldKey: string, label: string) => {
    if (isRtl) {
      return label;
    }

    return booleanStatementLabels[fieldKey] ?? label;
  };

  const ruleState = useMemo(() => applyRules(form.rules, answers), [form.rules, answers]);
  const optionSetLookup = useMemo(() => new Map(optionSets.map((set) => [set.key, set])), [optionSets]);
  const totalSections = form.ui.sections.length;
  const progressPercent = totalSections === 0 ? 0 : Math.round(((currentSectionIndex + 1) / totalSections) * 100);
  const getCurrentRuleState = () => applyRules(form.rules, answersRef.current);
  const buildVisibleValidationErrors = (
    nextAnswers: Record<string, JsonValue>,
    visibleFieldKeys: string[]
  ): ValidationErrors => {
    const allErrors = validateAnswers(form.schema, nextAnswers, optionSets, text);
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
      setToast({
        open: true,
        message: text("form.status.draft_saved", "Draft saved."),
        type: "success",
      });
    } catch (error) {
      const serverErrors = parseValidationErrors(error);
      if (serverErrors) {
        setValidationErrors((previous) => ({ ...previous, ...serverErrors }));
        setFormError(null);
      } else {
        setFormError(error instanceof Error ? error.message : text("form.error.save_progress", "Unable to save progress."));
      }
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleChange = (fieldKey: string, nextValue: JsonValue) => {
    setAnswers((previousAnswers) => {
      const updatedAnswers = { ...previousAnswers, [fieldKey]: nextValue };
      const nextRuleState = applyRules(form.rules, updatedAnswers);
      answersRef.current = nextRuleState.answers;
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
    const currentRuleState = getCurrentRuleState();
    const nextTouchedFields = touchedFields.includes(fieldKey) ? touchedFields : [...touchedFields, fieldKey];
    setTouchedFields(nextTouchedFields);

    const nextErrors = buildVisibleValidationErrors(currentRuleState.answers, nextTouchedFields);
    setValidationErrors(nextErrors);

    if (nextErrors[fieldKey]?.length) {
      return;
    }

    await persistProgress(currentRuleState.answers);
  };

  const handleSubmit = async () => {
    const currentRuleState = getCurrentRuleState();
    const clientErrors = validateAnswers(form.schema, currentRuleState.answers, optionSets, text);
    setTouchedFields(Object.keys(form.schema.properties));
    setValidationErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onSave({
        submissionId,
        answers: currentRuleState.answers,
      });
      setSubmissionId(result.submissionId);
      setSubmitted(true);
      setValidationErrors({});
      setFormError(null);
      setToast({
        open: true,
        message: submittedLabel,
        type: "success",
      });
    } catch (error) {
      const serverErrors = parseValidationErrors(error);
      if (serverErrors) {
        setTouchedFields(Object.keys(form.schema.properties));
        setValidationErrors(serverErrors);
        setFormError(null);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(text("form.error.submission_failed", "Submission failed."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    await persistProgress(getCurrentRuleState().answers);
  };

  const handleReject = async () => {
    if (!onReject) {
      return;
    }

    if (!rejectionReason.trim()) {
      setFormError(text("form.error.rejection_reason_required", "Rejection reason is required."));
      return;
    }

    const currentRuleState = getCurrentRuleState();
    const clientErrors = validateAnswers(form.schema, currentRuleState.answers, optionSets, text);
    setTouchedFields(Object.keys(form.schema.properties));
    setValidationErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onReject({
        submissionId,
        answers: currentRuleState.answers,
        rejectionReason: rejectionReason.trim(),
      });
      setSubmissionId(result.submissionId);
      setSubmitted(true);
      setIsRejectModalOpen(false);
      setValidationErrors({});
      setFormError(null);
      setToast({
        open: true,
        message: text("form.status.rejected", "Rejected."),
        type: "success",
      });
    } catch (error) {
      const serverErrors = parseValidationErrors(error);
      if (serverErrors) {
        setValidationErrors(serverErrors);
        setFormError(serverErrors.rejection_reason?.[0] ?? null);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(text("form.error.rejection_failed", "Rejection failed."));
      }
    } finally {
      setIsSubmitting(false);
    }
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

    return text("form.group.default", "Group");
  };

  const getFieldOptions = (fieldKey: string): Array<{ value: string; label: string }> => {
    const schemaProperty = form.schema.properties[fieldKey];
    if (schemaProperty?.optionSetKey) {
      return (optionSetLookup.get(schemaProperty.optionSetKey)?.items ?? [])
        .filter((item) => item.isActive)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((item) => ({ value: item.code, label: t(item.labelKey) }));
    }

    return (form.ui.selectOptions?.[fieldKey] ?? []).map((option) => ({
      value: option.value,
      label: t(option.label),
    }));
  };

  const getSectionFieldKeys = (section: UiSectionDto): string[] => {
    const items = section.items ?? [];
    const groupedItems = (section.groups ?? []).flatMap((group) => group.items);
    return [...items, ...groupedItems].filter((fieldKey) => !ruleState.hiddenFields.has(fieldKey));
  };

  const handleNextSection = async () => {
    const currentRuleState = getCurrentRuleState();
    const currentSection = form.ui.sections[currentSectionIndex];
    if (!currentSection) {
      return;
    }

    const visibleFieldKeys = getSectionFieldKeys(currentSection);
    const nextTouchedFields = Array.from(new Set([...touchedFields, ...visibleFieldKeys]));
    setTouchedFields(nextTouchedFields);

    const nextErrors = buildVisibleValidationErrors(currentRuleState.answers, nextTouchedFields);
    setValidationErrors(nextErrors);

    const hasCurrentSectionErrors = visibleFieldKeys.some((fieldKey) => nextErrors[fieldKey]?.length);
    if (hasCurrentSectionErrors) {
      return;
    }

    await persistProgress(currentRuleState.answers);
    setCurrentSectionIndex((previous) => Math.min(previous + 1, form.ui.sections.length - 1));
  };

  const handlePreviousSection = () => {
    setCurrentSectionIndex((previous) => Math.max(previous - 1, 0));
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
    const options = getFieldOptions(fieldKey);
    const isMultiSelectField = widget === "checklist" || widget === "multi-checkbox" || schemaProperty.type === "multiEnum";
    const isInstructionField = widget === "instruction" || widget === "instructional-text";
    const isSignatureField = widget === "signature";
    const isMatrixField = widget === "matrix";
    const isBodyMapField = widget === "body-map";
    const isDrugTableField = widget === "drug-use-table";
    const isAlcoholTableField = widget === "alcohol-use-table";
    const matrixValue = (() => {
      return parseJsonStringObject(value as JsonValue);
    })();

    const isBooleanField = widget === "toggle" || schemaProperty.type === "boolean";

    return (
      <div key={fieldKey} className="space-y-1">
        {!isBooleanField && !isInstructionField && !isDrugTableField && !isAlcoholTableField && <label className="text-sm font-medium text-gray-800">{label}</label>}

        {isInstructionField && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p className="font-semibold">{label}</p>
            {helpText && <p className="mt-1 text-xs text-sky-800">{helpText}</p>}
          </div>
        )}

        {isBooleanField && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">{getBooleanLabel(fieldKey, label)}</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  value === true
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                disabled={disabled}
                onClick={() => {
                  handleChange(fieldKey, true);
                  void handleBlur(fieldKey);
                }}
              >
                {isRtl ? "نعم" : "Yes"}
              </button>
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  value === false
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                disabled={disabled}
                onClick={() => {
                  handleChange(fieldKey, false);
                  void handleBlur(fieldKey);
                }}
              >
                {isRtl ? "لا" : "No"}
              </button>
            </div>
          </div>
        )}

        {isMultiSelectField && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {options.map((option) => {
                const selectedValues = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
                const checked = selectedValues.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                      checked ? "border-slate-300 bg-slate-50 text-slate-900" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => {
                        const nextSelectedValues = event.target.checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter((item) => item !== option.value);
                        handleChange(fieldKey, nextSelectedValues);
                        void handleBlur(fieldKey);
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            {options.length === 0 && (
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                value={typeof value === "string" ? value : ""}
                disabled={disabled}
                onChange={(event) => handleChange(fieldKey, event.target.value)}
                onBlur={() => void handleBlur(fieldKey)}
              />
            )}
          </div>
        )}

        {isSignatureField && (
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={typeof value === "string" ? value : ""}
            placeholder={isRtl ? "اكتب الاسم الكامل كتوقيع" : "Type full name as signature"}
            maxLength={typeof schemaProperty.maxLength === "number" ? schemaProperty.maxLength : 160}
            disabled={disabled}
            onChange={(event) => handleChange(fieldKey, event.target.value)}
            onBlur={() => void handleBlur(fieldKey)}
          />
        )}

        {isMatrixField && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {(helpText || !helpText) && (
              <p className="text-xs text-slate-500">
                {helpText || (isRtl ? "اختر تقييما من 1 إلى 10 لكل مجال." : "Choose a rating from 1 to 10 for each area.")}
              </p>
            )}
            <div className="space-y-2">
              {options.map((option) => {
                const storedValue = matrixValue[option.value];
                const selectedValue = typeof storedValue === "number" || typeof storedValue === "string" ? String(storedValue) : "";
                return (
                  <div
                    key={option.value}
                    className="grid gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 md:grid-cols-[minmax(0,1fr)_120px]"
                  >
                    <div className="text-sm font-medium text-slate-800">{option.label}</div>
                    <select
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      value={selectedValue}
                      disabled={disabled}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        const nextMatrixValue = { ...matrixValue };
                        if (!nextValue) {
                          delete nextMatrixValue[option.value];
                        } else {
                          nextMatrixValue[option.value] = Number(nextValue);
                        }
                        handleChange(fieldKey, JSON.stringify(nextMatrixValue));
                      }}
                      onBlur={() => void handleBlur(fieldKey)}
                    >
                      <option value="">{text("form.select.placeholder", "Select...")}</option>
                      {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isBodyMapField && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="relative mx-auto h-[360px] w-[180px] rounded-3xl border border-slate-200 bg-white p-4">
                <svg viewBox="0 0 120 220" role="img" aria-label={label} className="h-full w-full">
                  <g fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="60" cy="24" r="12" />
                    <path d="M50 36 L47 58 L36 78 L33 110 L40 126 L43 101 L49 84 L50 124 L45 170 L49 210" />
                    <path d="M70 36 L73 58 L84 78 L87 110 L80 126 L77 101 L71 84 L70 124 L75 170 L71 210" />
                    <path d="M50 36 Q60 32 70 36" />
                    <path d="M50 124 Q60 132 70 124" />
                    <path d="M50 124 L48 165 L51 212" />
                    <path d="M70 124 L72 165 L69 212" />
                    <path d="M49 212 Q54 218 58 212" />
                    <path d="M62 212 Q66 218 71 212" />
                    <path d="M33 110 Q28 118 24 126" />
                    <path d="M87 110 Q92 118 96 126" />
                    <path d="M24 126 Q20 132 18 139" />
                    <path d="M96 126 Q100 132 102 139" />
                    <path d="M15 140 Q18 146 24 147" />
                    <path d="M105 140 Q102 146 96 147" />
                    <path d="M24 147 L21 152" />
                    <path d="M24 147 L26 153" />
                    <path d="M24 147 L29 151" />
                    <path d="M96 147 L91 151" />
                    <path d="M96 147 L99 153" />
                    <path d="M96 147 L102 151" />
                  </g>
                </svg>
                {injectionBodyZones.map((zone) => {
                  const selected = Array.isArray(value) && value.includes(zone.key);
                  return (
                    <button
                      key={zone.key}
                      type="button"
                      className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                        selected ? "border-rose-600 bg-rose-500" : "border-slate-400 bg-white"
                      }`}
                      style={{ left: zone.x, top: zone.y }}
                      aria-label={zone.label}
                      disabled={disabled}
                      onClick={() => {
                        const selectedZones = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
                        const nextSelectedZones = selectedZones.includes(zone.key)
                          ? selectedZones.filter((item) => item !== zone.key)
                          : [...selectedZones, zone.key];
                        handleChange(fieldKey, nextSelectedZones);
                        void handleBlur(fieldKey);
                      }}
                    />
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  {helpText || (isRtl ? "حدد مواضع الحقن الأساسية على مخطط الجسم." : "Mark the main injection sites on the body outline.")}
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {injectionBodyZones.map((zone) => {
                    const selectedZones = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
                    const checked = selectedZones.includes(zone.key);
                    return (
                      <label
                        key={zone.key}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                          checked ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(event) => {
                            const nextSelectedZones = event.target.checked
                              ? [...selectedZones, zone.key]
                              : selectedZones.filter((item) => item !== zone.key);
                            handleChange(fieldKey, nextSelectedZones);
                            void handleBlur(fieldKey);
                          }}
                        />
                        <span>{zone.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {(isDrugTableField || isAlcoholTableField) && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">{label}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-200 text-left text-slate-700">
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "النوع" : "Type"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "طريقة الاستخدام" : "Route"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "التكرار" : "Frequency"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "الكمية" : "Quantity"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "المدة" : "Duration"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isRtl ? "العمر الأول" : "Age First Used"}</th>
                    <th className="border border-slate-300 px-3 py-2">{isDrugTableField ? (isRtl ? "آخر استخدام" : "Last Used") : (isRtl ? "السبب" : "Reason Used")}</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((option) => {
                    const rowValue = getJsonObject(parseJsonStringObject(value as JsonValue)[option.value] as JsonValue) ?? {};
                    const updateCell = (columnKey: string, nextCellValue: string) => {
                      const parsedTable = parseJsonStringObject(value as JsonValue);
                      const nextRowValue = { ...rowValue, [columnKey]: nextCellValue };
                      const nextTableValue = { ...parsedTable, [option.value]: nextRowValue };
                      handleChange(fieldKey, JSON.stringify(nextTableValue));
                    };

                    return (
                      <tr key={option.value} className="bg-white">
                        <td className="border border-slate-300 px-3 py-2 font-medium text-slate-800">{option.label}</td>
                        {["route", "frequency", "quantity", "duration", "ageFirstUsed", isDrugTableField ? "dateLastUsed" : "reasonUsed"].map((columnKey) => (
                          <td key={columnKey} className="border border-slate-300 p-1 align-top">
                            <input
                              type="text"
                              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                              value={typeof rowValue[columnKey] === "string" ? rowValue[columnKey] : ""}
                              disabled={disabled}
                              onChange={(event) => updateCell(columnKey, event.target.value)}
                              onBlur={() => void handleBlur(fieldKey)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isMultiSelectField && !isInstructionField && !isSignatureField && !isMatrixField && !isBodyMapField && !isDrugTableField && !isAlcoholTableField && (widget === "select" || schemaProperty.type === "enum") && (
          <select
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={typeof value === "string" ? value : ""}
            disabled={disabled}
            onChange={(event) => handleChange(fieldKey, event.target.value)}
            onBlur={() => handleBlur(fieldKey)}
          >
            <option value="">{text("form.select.placeholder", "Select...")}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {!isMultiSelectField && !isInstructionField && !isSignatureField && !isMatrixField && !isBodyMapField && !isDrugTableField && !isAlcoholTableField && (widget === "textarea" || schemaProperty.type === "text") && (
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

        {!isMultiSelectField && !isInstructionField && !isSignatureField && !isMatrixField && !isBodyMapField && !isDrugTableField && !isAlcoholTableField && (widget === "number" || schemaProperty.type === "integer" || schemaProperty.type === "number") && (
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

        {!isMultiSelectField && !isInstructionField && !isSignatureField && !isMatrixField && !isBodyMapField && !isDrugTableField && !isAlcoholTableField && widget === "input" &&
          schemaProperty.type !== "integer" &&
          schemaProperty.type !== "number" &&
          schemaProperty.type !== "enum" &&
          schemaProperty.type !== "text" &&
          schemaProperty.type !== "multiEnum" &&
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

        {helpText && !isInstructionField && !isMatrixField && <p className="text-xs text-gray-500">{helpText}</p>}
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
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`space-y-6 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 ${isRtl ? "text-right" : "text-left"}`}
    >
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t(form.titleKey)}</h1>
            {form.descriptionKey && <p className="mt-1 text-sm text-gray-600">{t(form.descriptionKey)}</p>}
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-slate-500">
            {form.code} v{form.version}
          </div>
        </div>
      </div>

      {renderMode === "accordion" && (
        <div className="flex flex-wrap items-center gap-2">
          {form.ui.sections.map((section, index) => {
            const isActive = index === currentSectionIndex;
            const isExpanded = expandedSections.includes(section.titleKey);
            return (
              <button
                key={section.titleKey}
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive || isExpanded
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setCurrentSectionIndex(index);
                  setExpandedSections((previous) =>
                    previous.includes(section.titleKey) ? previous : [...previous, section.titleKey]
                  );
                }}
              >
                <span>{index + 1}</span>
                <span>{t(section.titleKey)}</span>
              </button>
            );
          })}
        </div>
      )}

      {renderMode === "wizard" ? (
        <>
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                {text("form.progress.label", "Progress", undefined, "التقدم")}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {text(
                  "form.progress.step",
                  "Step {current} of {total}",
                  { current: currentSectionIndex + 1, total: totalSections },
                  "الخطوة {current} من {total}"
                )}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800 transition-[width] duration-300"
                style={{
                  width: `${progressPercent}%`,
                  marginLeft: isRtl ? "auto" : undefined,
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {form.ui.sections.map((section, index) => {
              const isActive = index === currentSectionIndex;
              const isComplete = index < currentSectionIndex;
              return (
                <div
                  key={section.titleKey}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : isComplete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span>{index + 1}</span>
                  <span>{t(section.titleKey)}</span>
                </div>
              );
            })}
          </div>

          {form.ui.sections[currentSectionIndex] && (
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-base font-semibold text-gray-900">
                  {t(form.ui.sections[currentSectionIndex].titleKey)}
                </h2>
              </div>
              <div className="p-4">
                {renderSectionBody(form.ui.sections[currentSectionIndex])}
              </div>
            </section>
          )}
        </>
      ) : (
        form.ui.sections.map((section) => {
          const isExpanded = expandedSections.includes(section.titleKey);
          return (
            <section key={section.titleKey} className="rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                onClick={() => {
                  setCurrentSectionIndex(form.ui.sections.findIndex((item) => item.titleKey === section.titleKey));
                  toggleSection(section.titleKey);
                }}
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
        })
      )}

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {submitted && <p className="text-sm font-semibold text-green-700">{submittedLabel}</p>}
      {!submitted && draftSavedAt && (
        <p className="text-sm font-medium text-blue-700">
          {text("form.status.draft_saved_at", "Draft saved at {time}.", { time: draftSavedAt })}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-500">
          {isSavingProgress
            ? text("form.status.saving_progress", "Saving progress...")
            : text("form.status.progress_saved_on_blur", "Progress saves on field blur.")}
        </span>
        <div className="flex items-center gap-2">
          {renderMode === "wizard" && (
            <button
              type="button"
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0 || isSavingProgress || isSubmitting}
            >
              {text("form.action.previous", "Previous")}
            </button>
          )}
          <button
            type="button"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={handleSaveDraft}
            disabled={isSavingProgress || isSubmitting || submitted}
          >
            {isSavingProgress
              ? text("form.action.saving", "Saving...")
              : text("form.action.save_draft", "Save Draft")}
          </button>
          {renderMode === "wizard" && currentSectionIndex < form.ui.sections.length - 1 ? (
            <button
              type="button"
              className="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              onClick={handleNextSection}
              disabled={isSavingProgress || isSubmitting || submitted}
            >
              {text("form.action.next", "Next")}
            </button>
          ) : (
            <>
              {onReject && (
                <button
                  type="button"
                  className="rounded border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isSubmitting || submitted}
                >
                  {text("form.action.reject", "Reject")}
                </button>
              )}
              <button
                type="button"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting || submitted}
              >
                {isSubmitting
                  ? submittingLabel
                  : submitted
                    ? submittedLabel
                    : submitLabel}
              </button>
            </>
          )}
        </div>
      </div>
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {text("form.modal.reject.title", "Reject Assessment")}
              </h3>
              <label className="block text-sm font-semibold text-slate-800">
                {text("form.field.rejection_reason", "Reason for rejection")}
              </label>
              <textarea
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                rows={4}
                value={rejectionReason}
                disabled={isSubmitting}
                placeholder={text("form.field.rejection_reason_placeholder", "Enter the reason for rejection")}
                onChange={(event) => setRejectionReason(event.target.value)}
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isSubmitting}
              >
                {text("form.action.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                {text("form.modal.reject.confirm", "Confirm Reject")}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        closeLabel={text("toast.action.close", "Close", undefined, "إغلاق")}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
