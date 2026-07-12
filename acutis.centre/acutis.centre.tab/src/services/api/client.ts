import { getApiBaseUrl, isDevelopmentAuthorizationDisabled } from "../../constants/runtimeConfig";
import { clearAuthTokens, getValidAccessToken } from "../auth/secureTokenStorage";

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
};

export class ApiError extends Error {
  status: number;
  body?: string;

  constructor(status: number, body?: string) {
    super(body ? `API request failed with status ${status}: ${body}` : `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path: string, init: ApiRequestOptions = {}): Promise<Response> {
  const { authenticated = true, headers, ...rest } = init;
  const requestUrl = path.startsWith("http") ? path : `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const nextHeaders = new Headers(headers ?? {});

  if (authenticated) {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      nextHeaders.set("Authorization", `Bearer ${accessToken}`);
    } else if (!isDevelopmentAuthorizationDisabled()) {
      throw new Error("No valid access token is available");
    }
  }

  if (rest.body && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(requestUrl, {
    ...rest,
    headers: nextHeaders,
  });

  if (response.status === 401 && authenticated) {
    await clearAuthTokens();
  }

  return response;
}

export async function apiFetchJson<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    const body = await response.text().catch(() => undefined);
    throw new ApiError(response.status, body || undefined);
  }

  return (await response.json()) as T;
}
