import Constants from "expo-constants";

export type RuntimeExtraConfig = {
  apiBaseUrl?: string;
  keycloak?: {
    issuer?: string;
    clientId?: string;
    audience?: string;
    redirectUri?: string;
  };
  development?: {
    authorizationDisabled?: boolean;
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
  return typeof configured === "boolean" ? configured : __DEV__;
}

export function getApiBaseUrl(): string {
  return getRuntimeExtra().apiBaseUrl?.replace(/\/$/, "") ?? "";
}

export function getKeycloakConfig() {
  return getRuntimeExtra().keycloak ?? {};
}
