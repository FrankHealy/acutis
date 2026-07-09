export const defaultKeycloakProviderId = "keycloak";
export const ambulatoryKeycloakProviderId = "ambulatory-keycloak";

export const isAmbulatoryPath = (pathname: string) =>
  pathname.startsWith("/units/community") || pathname.startsWith("/units/practitioner");

export const getProviderForPath = (pathname: string) =>
  isAmbulatoryPath(pathname) ? ambulatoryKeycloakProviderId : defaultKeycloakProviderId;

export const getProviderForCallbackUrl = (callbackUrl: string) => {
  try {
    const url = callbackUrl.startsWith("http")
      ? new URL(callbackUrl)
      : new URL(callbackUrl, "http://localhost");
    return getProviderForPath(url.pathname);
  } catch {
    return defaultKeycloakProviderId;
  }
};
