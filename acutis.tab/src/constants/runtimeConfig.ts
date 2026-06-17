import Constants from "expo-constants";

export type RuntimeExtraConfig = {
  apiBaseUrl?: string;
  keycloak?: {
    baseUrl?: string;
    issuer?: string;
    authUrl?: string;
    clientId?: string;
    audience?: string;
    redirectUri?: string;
  };
  development?: {
    authorizationDisabled?: boolean;
  };
  security?: {
    requireHardwareBackedKeystore?: boolean;
  };
};

export function getRuntimeExtra(): RuntimeExtraConfig {
  const constants = Constants as unknown as {
    expoConfig?: { extra?: RuntimeExtraConfig };
    manifest?: { extra?: RuntimeExtraConfig };
    manifest2?: { extra?: { expoClient?: { extra?: RuntimeExtraConfig } } };
  };

  return (
    constants.expoConfig?.extra ??
    constants.manifest2?.extra?.expoClient?.extra ??
    constants.manifest?.extra ??
    {}
  );
}

export function isDevelopmentAuthorizationDisabled(): boolean {
  const configured = getRuntimeExtra().development?.authorizationDisabled;
  return typeof configured === "boolean" ? configured : false;
}

export function isHardwareBackedKeystoreRequired(): boolean {
  const configured = getRuntimeExtra().security?.requireHardwareBackedKeystore;
  return typeof configured === "boolean" ? configured : true;
}

export function getApiBaseUrl(): string {
  return getRuntimeExtra().apiBaseUrl?.replace(/\/$/, "") ?? "https://acutis.salientrecovery.com/api-proxy";
}

export function getKeycloakConfig() {
  return getRuntimeExtra().keycloak ?? {};
}
