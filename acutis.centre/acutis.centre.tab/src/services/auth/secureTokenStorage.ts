import { getKeycloakConfig } from "../../constants/runtimeConfig";
import {
  deleteLegacySecureStoreSecret,
  deleteHardwareSecret,
  getHardwareSecret,
  migrateSecureStoreSecret,
  setHardwareSecret,
} from "../security/hardwareKeychain";

const ACCESS_TOKEN_KEY = "acutis.accessToken";
const REFRESH_TOKEN_KEY = "acutis.refreshToken";
const ACCESS_TOKEN_SERVICE = "acutis.oidc.accessToken";
const REFRESH_TOKEN_SERVICE = "acutis.oidc.refreshToken";

type TokenPair = {
  accessToken?: string;
  refreshToken?: string;
};

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload || typeof globalThis.atob !== "function") {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = globalThis.atob(padded);

    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

export async function setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await setHardwareSecret(ACCESS_TOKEN_SERVICE, accessToken);
    await setHardwareSecret(REFRESH_TOKEN_SERVICE, refreshToken);
    await deleteLegacySecureStoreSecret(ACCESS_TOKEN_KEY);
    await deleteLegacySecureStoreSecret(REFRESH_TOKEN_KEY);
  } catch (error) {
    await clearAuthTokens();
    throw error;
  }
}

export async function getAuthTokens(): Promise<TokenPair> {
  const accessToken =
    await getHardwareSecret(ACCESS_TOKEN_SERVICE) ??
    await migrateSecureStoreSecret(ACCESS_TOKEN_SERVICE, ACCESS_TOKEN_KEY);
  const refreshToken =
    await getHardwareSecret(REFRESH_TOKEN_SERVICE) ??
    await migrateSecureStoreSecret(REFRESH_TOKEN_SERVICE, REFRESH_TOKEN_KEY);

  return {
    accessToken,
    refreshToken,
  };
}

export async function clearAuthTokens(): Promise<void> {
  await deleteHardwareSecret(ACCESS_TOKEN_SERVICE);
  await deleteHardwareSecret(REFRESH_TOKEN_SERVICE);
  await deleteLegacySecureStoreSecret(ACCESS_TOKEN_KEY);
  await deleteLegacySecureStoreSecret(REFRESH_TOKEN_KEY);
}

export function isAccessTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 30_000;
}

export async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const { issuer, clientId } = getKeycloakConfig();
    if (!issuer || !clientId) {
      throw new Error("Missing Keycloak config in Expo runtime config");
    }

    const tokenEndpoint = `${issuer.replace(/\/$/, "")}/protocol/openid-connect/token`;

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      await clearAuthTokens();
      return false;
    }

    const data = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

    if (!data.access_token) {
      await clearAuthTokens();
      return false;
    }

    await setAuthTokens(data.access_token, data.refresh_token ?? refreshToken);
    return true;
  } catch {
    await clearAuthTokens();
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | undefined> {
  const { accessToken, refreshToken } = await getAuthTokens();

  if (accessToken && isAccessTokenValid(accessToken)) {
    return accessToken;
  }

  if (refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      const tokens = await getAuthTokens();
      return tokens.accessToken;
    }
  }

  return undefined;
}
