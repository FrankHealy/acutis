import { createAuthHeaders } from "@/lib/authMode";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type GetActiveFormResponse = {
  form: FormDefinitionDto;
  optionSets: OptionSetDto[];
  translations: Record<string, string>;
  submissionId: string | null;
  draftAnswers: Record<string, JsonValue>;
};

export type FormDefinitionDto = {
  code: string;
  version: number;
  status: "published";
  titleKey: string;
  descriptionKey: string | null;
  schema: JsonSchemaDto;
  ui: UiLayoutDto;
  rules: RuleDto[];
};

export type JsonSchemaDto = {
  type: "object";
  properties: Record<string, JsonSchemaPropertyDto>;
  required: string[];
};

export type JsonSchemaPropertyDto = {
  type: "string" | "integer" | "number" | "boolean" | "date" | "datetime" | "enum" | "multiEnum" | "text";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  optionSetKey?: string;
  format?: string;
};

export type UiLayoutDto = {
  sections: UiSectionDto[];
  widgets: Record<string, string>;
  labelKeys: Record<string, string>;
  helpKeys: Record<string, string>;
};

export type UiSectionDto = {
  titleKey: string;
  items: string[];
};

export type RuleDto = {
  if: {
    field: string;
    equals: JsonValue;
  };
  then: RuleActionDto;
  else?: RuleActionDto;
};

export type RuleActionDto = {
  show?: string[];
  hide?: string[];
  enable?: string[];
  disable?: string[];
  clear?: string[];
};

export type OptionSetDto = {
  key: string;
  items: OptionItemDto[];
};

export type OptionItemDto = {
  code: string;
  labelKey: string;
  isActive: boolean;
  sortOrder: number;
};

export type SaveProgressRequest = {
  formCode: string;
  formVersion: number;
  locale: string;
  subjectType: "anonymous_call" | "resident" | "admission";
  subjectId: string | null;
  submissionId: string | null;
  answers: Record<string, JsonValue>;
};

export type SaveRequest = SaveProgressRequest;

export type SaveProgressResponse = {
  submissionId: string;
  status: "in_progress" | "submitted";
};

export type SaveResponse = SaveProgressResponse;

export type ValidationProblem = {
  errors: Array<{ fieldKey: string; message: string }>;
};

export type FormConfigurationVersionDto = {
  code: string;
  version: number;
  status: string;
  titleKey: string;
  descriptionKey: string | null;
  createdAt: string;
};

export type UpsertFormDefinitionRequest = {
  titleKey: string;
  descriptionKey: string | null;
  schemaJson: string;
  uiJson: string;
  rulesJson: string;
  makeActive: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

const formatApiErrorMessage = (status: number, bodyText: string): string => {
  if (!bodyText) {
    return `Request failed (${status}).`;
  }

  try {
    const parsed = JSON.parse(bodyText) as {
      title?: string;
      message?: string;
      detail?: string;
      errors?: Record<string, string[] | string>;
    };

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return `Request failed (${status}): ${parsed.message}`;
    }

    if (typeof parsed.detail === "string" && parsed.detail.trim()) {
      return `Request failed (${status}): ${parsed.detail}`;
    }

    if (typeof parsed.title === "string" && parsed.title.trim()) {
      return `Request failed (${status}): ${parsed.title}`;
    }

    if (parsed.errors && typeof parsed.errors === "object") {
      const firstEntry = Object.entries(parsed.errors)[0];
      if (firstEntry) {
        const [key, value] = firstEntry;
        const firstMessage = Array.isArray(value) ? value[0] : value;
        if (typeof firstMessage === "string" && firstMessage.trim()) {
          return `Request failed (${status}): ${key} ${firstMessage}`.trim();
        }
      }
    }
  } catch {
    // Fall through to plain text handling below.
  }

  return `Request failed (${status}): ${bodyText}`;
};

const request = async <TResponse>(
  path: string,
  accessToken?: string,
  init?: RequestInit
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...createAuthHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text();
    const error = new Error(formatApiErrorMessage(response.status, bodyText));
    (error as Error & { status?: number; bodyText?: string }).status = response.status;
    (error as Error & { status?: number; bodyText?: string }).bodyText = bodyText;
    throw error;
  }

  return (await response.json()) as TResponse;
};

export const getActiveForm = async (
  accessToken: string | undefined,
  locale: string,
  subjectType: SaveProgressRequest["subjectType"],
  subjectId: string | null,
  formCode?: string
): Promise<GetActiveFormResponse> => {
  const params = new URLSearchParams({
    locale,
    subjectType,
  });

  if (subjectId) {
    params.set("subjectId", subjectId);
  }

  if (formCode) {
    params.set("formCode", formCode);
  }

  return request<GetActiveFormResponse>(`/api/screening/GetActiveForm?${params.toString()}`, accessToken, {
    method: "GET",
  });
};

export const saveProgress = async (
  accessToken: string | undefined,
  payload: SaveProgressRequest
): Promise<SaveProgressResponse> => {
  return request<SaveProgressResponse>("/api/screening/SaveProgress", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const save = async (
  accessToken: string | undefined,
  payload: SaveRequest
): Promise<SaveResponse> => {
  return request<SaveResponse>("/api/screening/Save", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getFormVersions = async (
  accessToken: string | undefined,
  formCode: string
): Promise<FormConfigurationVersionDto[]> => {
  return request<FormConfigurationVersionDto[]>(
    `/api/configuration/forms/${encodeURIComponent(formCode)}/versions`,
    accessToken,
    {
      method: "GET",
    }
  );
};

export const activateFormVersion = async (
  accessToken: string | undefined,
  formCode: string,
  version: number
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>(
    `/api/configuration/forms/${encodeURIComponent(formCode)}/activate/${version}`,
    accessToken,
    {
      method: "POST",
    }
  );
};

export const deleteAlcoholScreeningForm = async (
  accessToken: string | undefined,
  version: number
): Promise<void> => {
  await request<void>(`/api/configuration/DeleteAlcoholScreeningForm/${version}`, accessToken, {
    method: "DELETE",
  });
};

export const deleteAdmissionForm = async (
  accessToken: string | undefined,
  formCode: string,
  version: number
): Promise<void> => {
  await request<void>(
    `/api/configuration/DeleteAdmissionForm/${encodeURIComponent(formCode)}/${version}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
};

export const deleteSurveyForm = async (
  accessToken: string | undefined,
  surveyCode: string,
  version: number
): Promise<void> => {
  await request<void>(
    `/api/configuration/DeleteSurveyForm/${encodeURIComponent(surveyCode)}/${version}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
};

export const createAlcoholScreeningForm = async (
  accessToken: string | undefined,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/CreateAlcoholScreeningForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ form }),
  });
};

export const saveAsDraftAlcoholScreeningForm = async (
  accessToken: string | undefined,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/SaveAsDraftAlcoholScreeningForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ form }),
  });
};

export const editAlcoholScreeningForm = async (
  accessToken: string | undefined,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditAlcoholScreeningForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ sourceVersion, form }),
  });
};

export const editAsDraftAlcoholScreeningForm = async (
  accessToken: string | undefined,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditAsDraftAlcoholScreeningForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ sourceVersion, form }),
  });
};

export const createAdmissionForm = async (
  accessToken: string | undefined,
  formCode: string,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/CreateAdmissionForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ formCode, form }),
  });
};

export const saveAsDraftAdmissionForm = async (
  accessToken: string | undefined,
  formCode: string,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/SaveAsDraftAdmissionForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ formCode, form }),
  });
};

export const editAdmissionForm = async (
  accessToken: string | undefined,
  formCode: string,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditAdmissionForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ formCode, sourceVersion, form }),
  });
};

export const editAsDraftAdmissionForm = async (
  accessToken: string | undefined,
  formCode: string,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditAsDraftAdmissionForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ formCode, sourceVersion, form }),
  });
};

export const createSurveyForm = async (
  accessToken: string | undefined,
  surveyCode: string,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/CreateSurveyForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ surveyCode, form }),
  });
};

export const saveAsDraftSurveyForm = async (
  accessToken: string | undefined,
  surveyCode: string,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/SaveAsDraftSurveyForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ surveyCode, form }),
  });
};

export const editSurveyForm = async (
  accessToken: string | undefined,
  surveyCode: string,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditSurveyForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ surveyCode, sourceVersion, form }),
  });
};

export const editAsDraftSurveyForm = async (
  accessToken: string | undefined,
  surveyCode: string,
  sourceVersion: number,
  form: UpsertFormDefinitionRequest
): Promise<FormConfigurationVersionDto> => {
  return request<FormConfigurationVersionDto>("/api/configuration/EditAsDraftSurveyForm", accessToken, {
    method: "POST",
    body: JSON.stringify({ surveyCode, sourceVersion, form }),
  });
};
