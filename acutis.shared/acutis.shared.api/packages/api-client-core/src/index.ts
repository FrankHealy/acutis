export type ApiClientOptions = { baseUrl: string; getAccessToken?: () => Promise<string | null> };
export function createApiClient(options: ApiClientOptions) {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await options.getAccessToken?.();
    const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
      ...init, cache: "no-store", headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
    if (!response.ok) throw new Error(`API request failed (${response.status}).`);
    return response.status === 204 ? undefined as T : await response.json() as T;
  };
}
