import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

type KeycloakAccessTokenPayload = {
  iss?: string;
  preferred_username?: string;
};

const authSessionVersion = "2026-06-13-production-v1";

const refreshAccessToken = async (token: import("next-auth/jwt").JWT) => {
  try {
    if (!token.refreshToken) {
      throw new Error("Missing refresh token.");
    }

    const issuer = typeof token.issuer === "string" ? token.issuer : process.env.AUTH_KEYCLOAK_ISSUER;
    if (!issuer) {
      throw new Error("Missing Keycloak issuer.");
    }

    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_KEYCLOAK_ID!,
        client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
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
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
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
