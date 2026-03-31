import React, { createContext, useContext, useEffect, useState } from "react";
import { isDevelopmentAuthorizationDisabled } from "../../constants/runtimeConfig";
import { signInWithKeycloak, signOut as signOutFromKeycloak } from "./keycloak";
import { getAuthTokens, isAccessTokenValid, refreshAccessToken } from "./secureTokenStorage";

export type AuthState = "checking" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("checking");

  useEffect(() => {
    void checkAuth();
  }, []);

  async function checkAuth() {
    try {
      if (isDevelopmentAuthorizationDisabled()) {
        setState("authenticated");
        return;
      }

      const { accessToken, refreshToken } = await getAuthTokens();

      if (!accessToken || !refreshToken) {
        setState("unauthenticated");
        return;
      }

      if (isAccessTokenValid(accessToken)) {
        setState("authenticated");
        return;
      }

      const refreshed = await refreshAccessToken(refreshToken);
      setState(refreshed ? "authenticated" : "unauthenticated");
    } catch {
      setState("unauthenticated");
    }
  }

  async function handleSignIn() {
    if (isDevelopmentAuthorizationDisabled()) {
      setState("authenticated");
      return;
    }

    setState("checking");
    try {
      await signInWithKeycloak();
      await checkAuth();
    } catch {
      setState("unauthenticated");
      throw new Error("Keycloak sign-in was not completed");
    }
  }

  async function handleSignOut() {
    await signOutFromKeycloak();
    setState("unauthenticated");
  }

  return (
    <AuthContext.Provider value={{ state, signIn: handleSignIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
