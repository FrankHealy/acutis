import {
  getActiveForm,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
} from "@/areas/screening/forms/ApiClient";

type EvaluationFormParams = {
  accessToken: string;
  locale: string;
  subjectId: string;
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
  subjectId,
}: EvaluationFormParams): Promise<GetActiveFormResponse> => {
  return getActiveForm(accessToken, locale, "resident", subjectId);
};

export const saveEvaluationDraft = async ({
  accessToken,
  locale,
  subjectId,
  formCode,
  formVersion,
  submissionId,
  answers,
}: EvaluationSaveParams) => {
  return saveProgress(accessToken, {
    formCode,
    formVersion,
    locale,
    subjectType: "resident",
    subjectId,
    submissionId,
    answers,
  });
};

export const submitEvaluationForm = async ({
  accessToken,
  locale,
  subjectId,
  formCode,
  formVersion,
  submissionId,
  answers,
}: EvaluationSaveParams) => {
  return save(accessToken, {
    formCode,
    formVersion,
    locale,
    subjectType: "resident",
    subjectId,
    submissionId,
    answers,
  });
};
