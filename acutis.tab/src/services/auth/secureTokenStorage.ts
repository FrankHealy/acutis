import * as SecureStore from "expo-secure-store";
import { getKeycloakConfig } from "../../constants/runtimeConfig";

const ACCESS_TOKEN_KEY = "acutis.accessToken";
const REFRESH_TOKEN_KEY = "acutis.refreshToken";

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
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getAuthTokens(): Promise<TokenPair> {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

  return {
    accessToken: accessToken ?? undefined,
    refreshToken: refreshToken ?? undefined,
  };
}

export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
      throw new Error("Missing Keycloak config in app.json under expo.extra.keycloak");
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
