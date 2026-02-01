// /frontend-app/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

type KeycloakAccessTokenPayload = {
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
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

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      // Add a dummy secret to .env.local if you haven't yet, e.g., AUTH_KEYCLOAK_SECRET="dummy"
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!, 
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        const payload = decodeJwtPayload(account.access_token);
        const realmRoles = Array.isArray(payload?.realm_access?.roles)
          ? payload?.realm_access?.roles
          : [];
        const resourceRoles = payload?.resource_access
          ? Object.values(payload.resource_access).flatMap((entry) => entry?.roles ?? [])
          : [];
        const roles = Array.from(new Set([...realmRoles, ...resourceRoles]));
        if (roles.length) {
          token.roles = roles;
        }
        const username =
          payload?.preferred_username ??
          (profile as { preferred_username?: string })?.preferred_username ??
          profile?.name ??
          profile?.email;
        if (username) {
          token.username = username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token?.roles) {
        session.roles = token.roles as string[];
      }
      if (token?.username) {
        session.username = token.username as string;
        if (session.user) {
          session.user.name = token.username as string;
        }
      }
      return session;
    },
  },
  // You can add database configurations or custom callbacks here later if needed
});
KeycloakProvider({
  clientId: process.env.AUTH_KEYCLOAK_ID!,
  clientSecret: process.env.AUTH_KEYCLOAK_SECRET ?? "",
  issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
  authorization: { params: { prompt: "login" } },
})


export { handler as GET, handler as POST };
