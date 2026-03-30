import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { setAuthTokens, clearAuthTokens } from "./secureTokenStorage";

const { keycloak } = Constants.expoConfig?.extra ?? { keycloak: { issuer: "", clientId: "", redirectUri: "" } };

const discovery = {
  authorizationEndpoint: `${keycloak.issuer}/protocol/openid-connect/auth`,
  tokenEndpoint: `${keycloak.issuer}/protocol/openid-connect/token`,
  revocationEndpoint: `${keycloak.issuer}/protocol/openid-connect/revoke`,
};

export async function signInWithKeycloak(): Promise<void> {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "acutis-tab" });

  const authRequestConfig = {
    clientId: keycloak.clientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  };

  const request = new AuthSession.AuthRequest(authRequestConfig);
  await request.promptAsync(discovery, { useProxy: false });

  if (!request.code) {
    throw new Error("Keycloak auth failed: no authorization code");
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: keycloak.clientId,
      code: request.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier || "",
      },
    },
    discovery
  );

  if (!tokenResponse.accessToken || !tokenResponse.refreshToken) {
    throw new Error("Keycloak token exchange failed");
  }

  await setAuthTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
}

export async function signOut(): Promise<void> {
  await clearAuthTokens();
}
