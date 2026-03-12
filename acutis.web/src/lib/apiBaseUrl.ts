const browserApiBasePath = "/api-proxy";
const defaultApiBaseUrl =
  process.env.INTERNAL_API_BASE_URL
  ?? process.env.NEXT_PUBLIC_API_BASE_URL
  ?? "http://localhost:5009";

export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return defaultApiBaseUrl;
  }

  const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";
  const resolvedApiUrl = new URL(configuredApiUrl, window.location.origin);
  const pageIsSecure = window.location.protocol === "https:";
  const apiIsSecure = resolvedApiUrl.protocol === "https:";

  if (pageIsSecure && !apiIsSecure) {
    return browserApiBasePath;
  }

  return resolvedApiUrl.toString().replace(/\/$/, "");
};
