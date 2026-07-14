import Keycloak, { type KeycloakConfig, type KeycloakInitOptions } from "keycloak-js";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SpaAuthState = { ready: boolean; authenticated: boolean; token?: string; displayName: string; logout: () => Promise<void> };
const AuthContext = createContext<SpaAuthState | null>(null);

export function ProductSpaAuthProvider({ issuer, clientId, children }: { issuer: string; clientId: string; children: ReactNode }) {
  const keycloak = useMemo(() => {
    const authority = new URL(issuer);
    const path = authority.pathname.split("/").filter(Boolean);
    const realmIndex = path.indexOf("realms");
    if (realmIndex < 0 || !path[realmIndex + 1]) throw new Error(`Invalid Keycloak issuer: ${issuer}`);
    const config: KeycloakConfig = { url: authority.origin, realm: path[realmIndex + 1], clientId };
    return new Keycloak(config);
  }, [clientId, issuer]);
  const initialization = useRef<Promise<boolean> | null>(null);
  const [state, setState] = useState<Omit<SpaAuthState, "logout"> & { error?: string }>({ ready: false, authenticated: false, displayName: "" });
  useEffect(() => {
    let active = true;
    const options: KeycloakInitOptions = { onLoad: "login-required", pkceMethod: "S256", checkLoginIframe: false, redirectUri: `${window.location.origin}${window.location.pathname}` };
    // React Strict Mode intentionally re-runs effects in development. Keycloak
    // rejects a second init call on the same instance, so retain and reuse the
    // first promise across the effect replay.
    initialization.current ??= keycloak.init(options);
    void initialization.current
      .then((authenticated) => {
        if (active) setState({ ready: true, authenticated, token: keycloak.token, displayName: String(keycloak.tokenParsed?.name ?? keycloak.tokenParsed?.preferred_username ?? "") });
      })
      .catch(() => {
        if (active) setState({ ready: true, authenticated: false, displayName: "", error: "Authentication could not be started. Refresh the page or return to sign in." });
      });
    const refresh = window.setInterval(() => {
      if (keycloak.authenticated) void keycloak.updateToken(120).then(() => active && setState((current) => ({ ...current, token: keycloak.token })));
    }, 60_000);
    return () => { active = false; window.clearInterval(refresh); };
  }, [keycloak]);
  const value = useMemo<SpaAuthState>(() => ({ ...state, logout: async () => { await keycloak.logout({ redirectUri: window.location.origin }); } }), [keycloak, state]);
  return <AuthContext.Provider value={value}>{state.error ? <main className="auth-state" role="alert"><h1>Unable to sign in</h1><p>{state.error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main> : children}</AuthContext.Provider>;
}

export function useProductSpaAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useProductSpaAuth must be used within ProductSpaAuthProvider.");
  return value;
}
