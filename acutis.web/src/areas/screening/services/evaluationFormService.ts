import {
  getActiveForm,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
} from "@/areas/screening/forms/ApiClient";

type EvaluationFormParams = {
  accessToken?: string;
  locale: string;
  residentCaseId: string;
};

type EvaluationSaveParams = EvaluationFormParams & {
  formCode: string;
  formVersion: number;
  submissionId: string | null;
  answers: Record<string, JsonValue>;
};

export const loadEvaluationForm = async ({
  accessToken,
  locale,
  residentCaseId,
}: EvaluationFormParams): Promise<GetActiveFormResponse> => {
  return getActiveForm(accessToken, locale, "admission", residentCaseId);
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
