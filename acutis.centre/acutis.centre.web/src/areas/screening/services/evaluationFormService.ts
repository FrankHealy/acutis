import {
  getActiveForm,
  reject,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
} from "@/areas/screening/forms/ApiClient";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { createAuthHeaders } from "@/lib/authMode";

type EvaluationFormParams = {
  accessToken?: string;
  locale: string;
  residentCaseId: string;
  formCode?: string;
};

type EvaluationSaveParams = EvaluationFormParams & {
  formCode: string;
  formVersion: number;
  submissionId: string | null;
  answers: Record<string, JsonValue>;
};

type BeginEvaluationResponse = {
  callId: string;
  caseId: string;
  created: boolean;
};

export type EvaluationQueueItem = {
  callId: string;
  caseId: string | null;
  surname: string;
  name: string;
  phoneNumber: string;
  queueType: string;
  intakeSource: string;
  numCalls: number;
  lastCallDate: string;
  hasEvaluationStarted: boolean;
  status: string;
};

export const loadEvaluationForm = async ({
  accessToken,
  locale,
  residentCaseId,
  formCode,
}: EvaluationFormParams): Promise<GetActiveFormResponse> => {
  return getActiveForm(accessToken, locale, "admission", residentCaseId, formCode);
};

export const saveEvaluationDraft = async ({
  accessToken,
  locale,
  residentCaseId,
  formCode,
  formVersion,
  submissionId,
  answers,
}: EvaluationSaveParams) => {
  return saveProgress(accessToken, {
    formCode,
    formVersion,
    locale,
    subjectType: "admission",
    subjectId: residentCaseId,
    submissionId,
    answers,
  });
};

export const submitEvaluationForm = async ({
  accessToken,
  locale,
  residentCaseId,
  formCode,
  formVersion,
  submissionId,
  answers,
}: EvaluationSaveParams) => {
  return save(accessToken, {
    formCode,
    formVersion,
    locale,
    subjectType: "admission",
    subjectId: residentCaseId,
    submissionId,
    answers,
  });
};

export const rejectEvaluationForm = async ({
  accessToken,
  locale,
  residentCaseId,
  formCode,
  formVersion,
  submissionId,
  answers,
  rejectionReason,
}: EvaluationSaveParams & { rejectionReason: string }) => {
  return reject(accessToken, {
    formCode,
    formVersion,
    locale,
    subjectType: "admission",
    subjectId: residentCaseId,
    submissionId,
    answers,
    rejectionReason,
  });
};

export const fetchEvaluationQueue = async (
  accessToken?: string,
): Promise<EvaluationQueueItem[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/screenings/evaluation-queue`, {
    method: "GET",
    headers: createAuthHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load evaluation queue: ${response.status} ${body}`);
  }

  const data = (await response.json()) as EvaluationQueueItem[];
  return Array.isArray(data) ? data : [];
};

export const beginEvaluationFromCall = async (
  callId: string,
  accessToken?: string,
): Promise<BeginEvaluationResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/api/screenings/calls/${encodeURIComponent(callId)}/begin-evaluation`, {
    method: "POST",
    headers: createAuthHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to start evaluation: ${response.status} ${body}`);
  }

  return (await response.json()) as BeginEvaluationResponse;
};
