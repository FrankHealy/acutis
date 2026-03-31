import * as AuthSession from "expo-auth-session";
import { getKeycloakConfig } from "../../constants/runtimeConfig";
import { clearAuthTokens, getAuthTokens, setAuthTokens } from "./secureTokenStorage";

async function getDiscovery(): Promise<AuthSession.DiscoveryDocument> {
  const { issuer } = getKeycloakConfig();
  if (!issuer) {
    throw new Error("Missing Keycloak issuer in app.json under expo.extra.keycloak");
  }
  return AuthSession.fetchDiscoveryAsync(issuer);
}

export async function signInWithKeycloak(): Promise<void> {
  const { clientId, redirectUri: configuredRedirectUri } = getKeycloakConfig();
  if (!clientId) {
    throw new Error("Missing Keycloak clientId in app.json under expo.extra.keycloak");
  }

  const redirectUri = configuredRedirectUri || AuthSession.makeRedirectUri({ scheme: "acutis-tab" });
  const discovery = await getDiscovery();

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== "success" || !result.params.code) {
    throw new Error(`Keycloak auth failed: ${result.type}`);
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier ?? "",
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
  try {
    const { clientId } = getKeycloakConfig();
    const { refreshToken } = await getAuthTokens();

    if (refreshToken) {
      const discovery = await getDiscovery();
      await AuthSession.revokeAsync({ token: refreshToken, clientId }, discovery);
    }
  } catch {
    // local clear still happens below so sign-out remains reliable
  } finally {
    await clearAuthTokens();
  }
}