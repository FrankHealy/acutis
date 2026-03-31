import { getApiBaseUrl, isDevelopmentAuthorizationDisabled } from "../../constants/runtimeConfig";
import { getValidAccessToken } from "../auth/secureTokenStorage";

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
};


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

  return fetch(requestUrl, {
    ...rest,
    headers: nextHeaders,
  });
}

export async function apiFetchJson<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}