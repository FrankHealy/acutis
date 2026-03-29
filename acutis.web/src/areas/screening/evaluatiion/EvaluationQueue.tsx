"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import evaluationTemplate from "@/data/evaluationTemplate.json";
import type { CallLog } from "@/data/mock/callLogs";
import { useSession } from "next-auth/react";
import DynamicFormRenderer from "@/areas/screening/forms/DynamicFormRenderer";
import {
  type GetActiveFormResponse,
  type JsonValue,
} from "@/areas/screening/forms/ApiClient";
import {
  beginEvaluationFromCall,
  fetchEvaluationQueue,
  loadEvaluationForm,
  rejectEvaluationForm,
  saveEvaluationDraft,
  submitEvaluationForm,
  type EvaluationQueueItem,
} from "@/areas/screening/services/evaluationFormService";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { isAuthorizationDisabled, isAuthorizedClient } from "@/lib/authMode";
import { UnitDefinitions, type UnitId } from "@/areas/shared/unit/unitTypes";

interface EvaluationCandidate {
  callId: string;
  caseId: string | null;
  name: string;
  firstName?: string;
  surname?: string;
  phoneNumber: string;
  queueType: CallLog["concernType"];
  intakeSource: string;
  numCalls: number;
  lastCallDate: string;
  hasEvaluationStarted: boolean;
  status: "awaiting" | "in_progress" | "entity_missing";
  evaluationData?: Record<string, unknown>;
  canOpenEvaluation: boolean;
}

type EvaluationQueueProps = {
  unitId?: UnitId;
  renderMode?: EvaluationRenderMode;
};

type QueueFilter = "all" | CallLog["concernType"];
type EvaluationRenderMode = "accordion" | "wizard";

const getEvaluationFormCode = (
  queueType: CallLog["concernType"],
  unitId: UnitId,
): string => {
  switch (queueType) {
    case "drugs":
      return UnitDefinitions.drugs.admissionFormCode;
    case "ladies":
      return UnitDefinitions.ladies.admissionFormCode;
    case "alcohol":
      return UnitDefinitions.alcohol.admissionFormCode;
    default:
      return UnitDefinitions[unitId]?.admissionFormCode ?? UnitDefinitions.alcohol.admissionFormCode;
  }
};

const EvaluationQueue: React.FC<EvaluationQueueProps> = ({
  unitId = "alcohol",
  renderMode = "wizard",
}) => {
  const { data: session, status } = useSession();
  const { locale, mergeTranslations, t, loadKeys } = useLocalization();
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluationCandidate | null>(null);
  const [candidates, setCandidates] = useState<EvaluationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeQueue, setActiveQueue] = useState<QueueFilter>("all");
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [startingCandidateId, setStartingCandidateId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: "surname" | "queueType" | "lastCallDate";
    direction: "asc" | "desc";
  }>({ key: "surname", direction: "asc" });
  const defaultEvaluationData = useMemo(
    () => evaluationTemplate as Record<string, unknown>,
    []
  );

  const text = React.useCallback(
    (key: string, fallback: string, fallbackArabic?: string) => {
      const resolved = t(key);
      if (resolved !== key) {
        return resolved;
      }

      return locale.startsWith("ar") && fallbackArabic ? fallbackArabic : fallback;
    },
    [locale, t]
  );

  useEffect(() => {
    void loadKeys([
      "evaluation.queue.title",
      "evaluation.queue.all",
      "evaluation.queue.alcohol",
      "evaluation.queue.drugs",
      "evaluation.queue.gambling",
      "evaluation.queue.ladies",
      "evaluation.queue.general_query",
      "evaluation.table.surname",
      "evaluation.table.name",
      "evaluation.table.phone",
      "evaluation.table.queue",
      "evaluation.table.source",
      "evaluation.table.last_call_date",
      "evaluation.table.num_calls",
      "evaluation.table.action",
      "evaluation.action.awaiting",
      "evaluation.action.open",
      "evaluation.status.awaiting",
      "evaluation.status.in_progress",
      "evaluation.status.entity_missing",
      "evaluation.modal.subtitle",
      "evaluation.loading.queue",
      "evaluation.empty.queue",
      "evaluation.loading.form",
      "evaluation.empty.form",
    ]);
  }, [loadKeys]);

  const getQueueLabel = React.useCallback((queueType: CallLog["concernType"]) => {
    switch (queueType) {
      case "alcohol":
        return text("evaluation.queue.alcohol", "Alcohol", "الكحول");
      case "drugs":
        return text("evaluation.queue.drugs", "Drugs", "المخدرات");
      case "gambling":
        return text("evaluation.queue.gambling", "Gambling", "القمار");
      case "ladies":
        return text("evaluation.queue.ladies", "Ladies", "السيدات");
      default:
        return text("evaluation.queue.general_query", "General Query", "الاستفسارات العامة");
    }
  }, [text]);

  const queueFilters: Array<{ key: QueueFilter; label: string }> = [
    { key: "all", label: text("evaluation.queue.all", "All Queues", "كل القوائم") },
    { key: "alcohol", label: text("evaluation.queue.alcohol", "Alcohol", "الكحول") },
    { key: "drugs", label: text("evaluation.queue.drugs", "Drugs", "المخدرات") },
    { key: "gambling", label: text("evaluation.queue.gambling", "Gambling", "القمار") },
    { key: "ladies", label: text("evaluation.queue.ladies", "Ladies", "السيدات") },
    { key: "general_query", label: text("evaluation.queue.general_query", "General Query", "الاستفسارات العامة") },
  ];

  const mapQueueItem = React.useCallback((item: EvaluationQueueItem): EvaluationCandidate => ({
    callId: item.callId,
    caseId: item.caseId,
    name: `${item.name} ${item.surname}`.trim(),
    firstName: item.name,
    surname: item.surname,
    phoneNumber: item.phoneNumber,
    queueType: item.queueType as CallLog["concernType"],
    intakeSource: item.intakeSource,
    numCalls: item.numCalls,
    lastCallDate: item.lastCallDate,
    hasEvaluationStarted: item.hasEvaluationStarted,
    status: (item.status as EvaluationCandidate["status"]) ?? "awaiting",
    evaluationData: defaultEvaluationData,
    canOpenEvaluation: Boolean(item.caseId),
  }), [defaultEvaluationData]);

  const loadQueue = React.useCallback(async (withLoader = false) => {
    try {
      if (withLoader) {
        setIsLoading(true);
      }
      if (!isAuthorizedClient(status, session?.accessToken)) {
        setIsLoading(false);
        return;
      }

      const queue = await fetchEvaluationQueue(session?.accessToken);
      const mapped = queue
        .map(mapQueueItem)
        .filter((item) => unitId === "alcohol" || item.queueType === unitId || item.queueType === "general_query");
      setCandidates(mapped);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load evaluation queue.");
    } finally {
      if (withLoader) {
        setIsLoading(false);
      }
    }
  }, [mapQueueItem, session?.accessToken, status, unitId]);

  useEffect(() => {
    void loadQueue(true);
  }, [loadQueue]);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      if (!isAuthorizedClient(status, session?.accessToken) || !selectedCandidate?.caseId) {
        setFormData(null);
        setFormError(null);
        return;
      }

      try {
        setFormLoading(true);
        setFormData(null);
        setFormError(null);
        const accessToken = session?.accessToken;
        if (!accessToken && !isAuthorizationDisabled) {
          setFormData(null);
          setFormError("Session expired.");
          return;
        }
        const response = await loadEvaluationForm({
          accessToken,
          locale,
          residentCaseId: selectedCandidate.caseId,
          formCode: getEvaluationFormCode(selectedCandidate.queueType, unitId),
        });
        if (!active) return;
        mergeTranslations(response.translations);
        setFormData(response);
        setFormError(null);
      } catch (error) {
        if (!active) return;
        setFormData(null);
        setFormError(error instanceof Error ? error.message : "Failed to load evaluation form.");
      } finally {
        if (active) {
          setFormLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [locale, mergeTranslations, selectedCandidate, session?.accessToken, status, unitId]);

  const initialAnswers = useMemo(() => {
    if (!formData || !selectedCandidate?.caseId) {
      return {} as Record<string, JsonValue>;
    }

    const draftAnswers = formData.draftAnswers ?? {};
    const fullName = `${selectedCandidate.firstName ?? ""} ${selectedCandidate.surname ?? ""}`.trim();
    const phoneNumber = selectedCandidate.phoneNumber ?? "";

    return {
      service_user_full_name:
        (draftAnswers.service_user_full_name as JsonValue | undefined) ?? fullName,
      callerName:
        (draftAnswers.callerName as JsonValue | undefined) ?? fullName,
      caller_name:
        (draftAnswers.caller_name as JsonValue | undefined) ?? fullName,
      first_name:
        (draftAnswers.first_name as JsonValue | undefined) ?? (selectedCandidate.firstName ?? ""),
      firstName:
        (draftAnswers.firstName as JsonValue | undefined) ?? (selectedCandidate.firstName ?? ""),
      surname:
        (draftAnswers.surname as JsonValue | undefined) ?? (selectedCandidate.surname ?? ""),
      phone_number:
        (draftAnswers.phone_number as JsonValue | undefined) ?? phoneNumber,
      phoneNumber:
        (draftAnswers.phoneNumber as JsonValue | undefined) ?? phoneNumber,
      ...draftAnswers,
    } as Record<string, JsonValue>;
  }, [
    formData,
    selectedCandidate?.caseId,
    selectedCandidate?.firstName,
    selectedCandidate?.phoneNumber,
    selectedCandidate?.surname,
  ]);

  const getCandidateNameParts = (candidate: EvaluationCandidate) => {
    if (candidate.firstName || candidate.surname) {
      return {
        firstName: candidate.firstName ?? "",
        surname: candidate.surname ?? "",
      };
    }
    const parts = candidate.name.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], surname: "" };
    }
    return { firstName: parts[0], surname: parts.slice(1).join(" ") };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortableValue = (candidate: EvaluationCandidate, key: typeof sortConfig.key) => {
    if (key === "lastCallDate") {
      return new Date(candidate.lastCallDate).getTime();
    }
    if (key === "queueType") {
      return getQueueLabel(candidate.queueType).toLowerCase();
    }
    const { surname } = getCandidateNameParts(candidate);
    return surname.toLowerCase();
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const aValue = getSortableValue(a, sortConfig.key);
    const bValue = getSortableValue(b, sortConfig.key);
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const visibleCandidates = sortedCandidates.filter((candidate) =>
    activeQueue === "all" ? true : candidate.queueType === activeQueue
  );

  const toggleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getActionLabel = (candidate: EvaluationCandidate) => {
    if (!candidate.canOpenEvaluation) {
      return text("evaluation.action.awaiting", "Awaiting", "بانتظار");
    }
    return text("evaluation.action.open", "Open Evaluation", "فتح التقييم");
  };

  const getSourceLabel = (intakeSource: string) => {
    switch (intakeSource) {
      case "face_to_face":
        return text("evaluation.source.face_to_face", "Face to Face", "وجهاً لوجه");
      case "self_screening":
        return text("evaluation.source.self_screening", "Self Screening", "فحص ذاتي");
      default:
        return text("evaluation.source.screening_call", "Screening Call", "مكالمة فحص");
    }
  };

  const getQueueCount = (queueType: QueueFilter) => {
    if (queueType === "all") {
      return candidates.length;
    }
    return candidates.filter((candidate) => candidate.queueType === queueType).length;
  };

  const handleOpenEvaluation = async (candidate: EvaluationCandidate) => {
    if (candidate.canOpenEvaluation) {
      setSelectedCandidate(candidate);
      return;
    }

    if (!isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    try {
      setStartingCandidateId(candidate.callId);
      const response = await beginEvaluationFromCall(candidate.callId, session?.accessToken);
      const updatedCandidate: EvaluationCandidate = {
        ...candidate,
        caseId: response.caseId,
        hasEvaluationStarted: true,
        canOpenEvaluation: true,
      };

      setCandidates((current) =>
        current.map((item) => (item.callId === candidate.callId ? updatedCandidate : item))
      );
      setSelectedCandidate(updatedCandidate);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start evaluation.");
    } finally {
      setStartingCandidateId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {queueFilters.map((queue) => (
            <button
              key={queue.key}
              type="button"
              onClick={() => setActiveQueue(queue.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeQueue === queue.key
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>{queue.label}</span>
              <span className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                activeQueue === queue.key ? "bg-white/20 text-white" : "bg-white text-slate-700"
              }`}>
                {getQueueCount(queue.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{t("evaluation.queue.title")}</h2>
            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700">
              {visibleCandidates.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort("surname")}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {t("evaluation.table.surname")}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === "surname" && sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("evaluation.table.name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {text("evaluation.table.phone", "Phone Number", "رقم الهاتف")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort("queueType")}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {text("evaluation.table.queue", "Queue", "القائمة")}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === "queueType" && sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("evaluation.table.source")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort("lastCallDate")}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {t("evaluation.table.last_call_date")}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === "lastCallDate" && sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("evaluation.table.num_calls")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("evaluation.table.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("evaluation.loading.queue")}
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-red-600">
                    {errorMessage}
                  </td>
                </tr>
              ) : visibleCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("evaluation.empty.queue")}
                  </td>
                </tr>
              ) : visibleCandidates.map((candidate) => (
                <tr key={candidate.callId} className="transition-colors hover:bg-slate-50">
                  {(() => {
                    const { firstName, surname } = getCandidateNameParts(candidate);
                    return (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{surname}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{firstName}</td>
                      </>
                    );
                  })()}
                  <td className="px-6 py-4 text-sm text-gray-700">{candidate.phoneNumber || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getQueueLabel(candidate.queueType)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getSourceLabel(candidate.intakeSource)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(candidate.lastCallDate)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{candidate.numCalls}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => void handleOpenEvaluation(candidate)}
                      disabled={startingCandidateId === candidate.callId}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${
                        startingCandidateId === candidate.callId
                          ? "cursor-wait bg-slate-200 text-slate-500 shadow-none"
                          : candidate.canOpenEvaluation
                            ? "bg-slate-700 text-white hover:bg-slate-800"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-none"
                      }`}
                    >
                      {startingCandidateId === candidate.callId
                        ? text("evaluation.loading.form", "Loading form...", "جاري تحميل النموذج...")
                        : getActionLabel(candidate)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-8 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 bg-slate-50/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedCandidate.name}</h3>
                  <p className="text-sm text-gray-500">
                    {text("evaluation.modal.subtitle", "Resident Case Assessment Form", "نموذج تقييم الحالة")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="rounded-lg p-2 transition-colors hover:bg-slate-200"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {formLoading ? (
                <div className="text-sm text-gray-500">{t("evaluation.loading.form")}</div>
              ) : formError ? (
                <div className="text-sm text-red-600">{formError}</div>
              ) : formData && selectedCandidate.caseId ? (
                <DynamicFormRenderer
                  form={formData.form}
                  optionSets={formData.optionSets}
                  locale={locale}
                  initialSubmissionId={formData.submissionId}
                  initialSubmissionStatus={formData.submissionStatus}
                  initialAnswers={initialAnswers}
                  subjectType="admission"
                  subjectId={selectedCandidate.caseId}
                  renderMode={renderMode}
                  onSaveProgress={async ({ submissionId, answers }) =>
                    saveEvaluationDraft({
                      accessToken: session?.accessToken ?? "",
                      locale,
                      residentCaseId: selectedCandidate.caseId ?? "",
                      formCode: formData.form.code,
                      formVersion: formData.form.version,
                      submissionId,
                      answers,
                    })
                  }
                  onSave={async ({ submissionId, answers }) => {
                    const result = await submitEvaluationForm({
                      accessToken: session?.accessToken ?? "",
                      locale,
                      residentCaseId: selectedCandidate.caseId ?? "",
                      formCode: formData.form.code,
                      formVersion: formData.form.version,
                      submissionId,
                      answers,
                    });
                    setSelectedCandidate(null);
                    setFormData(null);
                    await loadQueue();
                    return result;
                  }}
                  onReject={async ({ submissionId, answers, rejectionReason }) => {
                    const result = await rejectEvaluationForm({
                      accessToken: session?.accessToken ?? "",
                      locale,
                      residentCaseId: selectedCandidate.caseId ?? "",
                      formCode: formData.form.code,
                      formVersion: formData.form.version,
                      submissionId,
                      answers,
                      rejectionReason,
                    });
                    setSelectedCandidate(null);
                    setFormData(null);
                    await loadQueue();
                    return result;
                  }}
                  submitLabel={text("form.action.accept", "Accept", "قبول")}
                  submittingLabel={text("form.action.accepting", "Accepting...", "جار القبول...")}
                  submittedLabel={text("form.status.accepted", "Accepted.", "تم القبول.")}
                />
              ) : (
                <div className="text-sm text-gray-500">{t("evaluation.empty.form")}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationQueue;
