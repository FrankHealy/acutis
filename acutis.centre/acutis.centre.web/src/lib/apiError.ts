export class ApiError extends Error {
  status: number;
  bodyText: string;

  constructor(status: number, message: string, bodyText = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

const parseApiMessage = (bodyText: string) => {
  if (!bodyText.trim()) return "";

  try {
    const parsed = JSON.parse(bodyText) as { message?: unknown; detail?: unknown; title?: unknown; errors?: unknown };
    for (const key of ["message", "detail", "title"] as const) {
      if (typeof parsed[key] === "string" && parsed[key].trim()) {
        return parsed[key].trim();
      }
    }
  } catch {
    // Plain text responses are fine.
  }

  return bodyText.trim();
};

export const formatApiErrorMessage = (status: number, bodyText = "") => {
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to access this area. Ask an administrator to update your role or unit access.";
  }

  const apiMessage = parseApiMessage(bodyText);
  return apiMessage || `Request failed (${status}).`;
};

export const createApiError = (status: number, bodyText = "") =>
  new ApiError(status, formatApiErrorMessage(status, bodyText), bodyText);

export const isForbiddenError = (error: unknown) =>
  error instanceof ApiError
    ? error.status === 403
    : error instanceof Error
      ? /\b403\b|forbidden|permission/i.test(error.message)
      : typeof error === "string" && /\b403\b|forbidden|permission/i.test(error);

export async function throwApiError(response: Response): Promise<never> {
  const bodyText = await response.text().catch(() => "");
  throw createApiError(response.status, bodyText);
}
