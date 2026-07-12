const browserApiBasePath = "/api-proxy";
const configuredInternalApiBaseUrl = process.env.INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const configuredPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return configuredInternalApiBaseUrl ?? configuredPublicApiBaseUrl ?? browserApiBasePath;
  }

  const configuredApiUrl = configuredPublicApiBaseUrl;
  if (!configuredApiUrl) {
    return browserApiBasePath;
  }

  const resolvedApiUrl = new URL(configuredApiUrl, window.location.origin);
  const pageIsSecure = window.location.protocol === "https:";
  const apiIsSecure = resolvedApiUrl.protocol === "https:";

  if (pageIsSecure && !apiIsSecure) {
    return browserApiBasePath;
  }

  return resolvedApiUrl.toString().replace(/\/$/, "");
};
