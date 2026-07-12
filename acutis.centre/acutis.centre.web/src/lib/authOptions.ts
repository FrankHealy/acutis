import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { ambulatoryKeycloakProviderId, defaultKeycloakProviderId } from "@/lib/authProviders";

type KeycloakAccessTokenPayload = {
  iss?: string;
  preferred_username?: string;
};

const authSessionVersion = "2026-06-13-production-v1";

const getKeycloakConfig = (providerId?: string) => {
  if (providerId === ambulatoryKeycloakProviderId) {
    return {
      clientId: process.env.AUTH_AMBULATORY_KEYCLOAK_ID ?? process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_AMBULATORY_KEYCLOAK_SECRET ?? process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_AMBULATORY_KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/acutis-ambulatory",
    };
  }

  return {
    clientId: process.env.AUTH_KEYCLOAK_ID!,
    clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
    issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
  };
};

const refreshAccessToken = async (token: import("next-auth/jwt").JWT) => {
  try {
    if (!token.refreshToken) {
      throw new Error("Missing refresh token.");
    }

    const providerId = typeof token.authProvider === "string" ? token.authProvider : defaultKeycloakProviderId;
    const keycloakConfig = getKeycloakConfig(providerId);
    const issuer = typeof token.issuer === "string" ? token.issuer : keycloakConfig.issuer;
    if (!issuer) {
      throw new Error("Missing Keycloak issuer.");
    }

    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      id_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!response.ok || !refreshedTokens.access_token) {
      throw new Error(refreshedTokens.error_description ?? refreshedTokens.error ?? "Token refresh failed.");
    }

    const payload = decodeJwtPayload(refreshedTokens.access_token);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + ((refreshedTokens.expires_in ?? 60) - 10) * 1000,
      issuer: payload?.iss ?? token.issuer,
      username: payload?.preferred_username ?? token.username,
      authProvider: providerId,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

const decodeJwtPayload = (token: string): KeycloakAccessTokenPayload | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  try {
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as KeycloakAccessTokenPayload;
  } catch {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  pages: {
    error: "/auth/error",
    signIn: "/auth/error",
  },
  providers: [
    KeycloakProvider({
      id: defaultKeycloakProviderId,
      clientId: getKeycloakConfig(defaultKeycloakProviderId).clientId,
      clientSecret: getKeycloakConfig(defaultKeycloakProviderId).clientSecret,
      issuer: getKeycloakConfig(defaultKeycloakProviderId).issuer,
    }),
    KeycloakProvider({
      id: ambulatoryKeycloakProviderId,
      name: "Ambulatory Keycloak",
      clientId: getKeycloakConfig(ambulatoryKeycloakProviderId).clientId,
      clientSecret: getKeycloakConfig(ambulatoryKeycloakProviderId).clientSecret,
      issuer: getKeycloakConfig(ambulatoryKeycloakProviderId).issuer,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const canonicalBaseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? baseUrl;
      if (url.startsWith("/")) {
        return `${canonicalBaseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        const canonical = new URL(canonicalBaseUrl);
        if (
          target.origin === canonical.origin ||
          target.hostname === "acutis.167-233-16-141.sslip.io"
        ) {
          return `${canonicalBaseUrl}${target.pathname}${target.search}${target.hash}`;
        }
      } catch {
        return canonicalBaseUrl;
      }

      return canonicalBaseUrl;
    },
    async jwt({ token, account, profile }) {
    if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 50 * 1000;
        if (account.id_token) {
          token.idToken = account.id_token;
        }
        token.authProvider = account.provider ?? defaultKeycloakProviderId;
        const payload = decodeJwtPayload(account.access_token);
        if (payload?.iss) {
          token.issuer = payload.iss;
        }
        const username =
          payload?.preferred_username ??
          (profile as { preferred_username?: string })?.preferred_username ??
          profile?.name ??
          profile?.email;
        if (username) {
          token.username = username;
        }
      token.error = undefined;
      token.authSessionVersion = authSessionVersion;
      return token;
    }

    if (
      token.accessToken &&
      token.authSessionVersion === authSessionVersion &&
      token.accessTokenExpires &&
      Date.now() < Number(token.accessTokenExpires)
      ) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);
      if (!refreshedToken.error) {
        refreshedToken.authSessionVersion = authSessionVersion;
      }
      return refreshedToken;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token?.idToken) {
        session.idToken = token.idToken as string;
      }
      if (token?.issuer) {
        session.issuer = token.issuer as string;
      }
      if (token?.authProvider) {
        session.authProvider = token.authProvider as string;
      }
      if (token?.username) {
        session.username = token.username as string;
        if (session.user) {
          session.user.name = token.username as string;
        }
      }
      if (token?.error) {
        session.error = token.error as string;
      }
      return session;
    },
  },
};
