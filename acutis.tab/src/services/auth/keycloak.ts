import * as AuthSession from "expo-auth-session";
import { getKeycloakConfig } from "../../constants/runtimeConfig";
import { clearAuthTokens, getAuthTokens, setAuthTokens } from "./secureTokenStorage";

export const NATIVE_AUTH_REDIRECT_URI = "acutis-tab://redirect";

async function getDiscovery(): Promise<AuthSession.DiscoveryDocument> {
  const { issuer } = getKeycloakConfig();
  if (!issuer) {
    throw new Error("Missing Keycloak issuer in Expo runtime config");
  }
  return AuthSession.fetchDiscoveryAsync(issuer);
}

export function getNativeAuthRedirectUri(): string {
  return getKeycloakConfig().redirectUri || NATIVE_AUTH_REDIRECT_URI;
}

export async function signInWithKeycloak(): Promise<void> {
  const { clientId } = getKeycloakConfig();
  if (!clientId) {
    throw new Error("Missing Keycloak clientId in Expo runtime config");
  }

  const redirectUri = getNativeAuthRedirectUri();
  const discovery = await getDiscovery();

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  });

  const result = await request.promptAsync(discovery, {
    browserPackage: "com.amazon.cloud9",
    createTask: false,
    useProxyActivity: false,
    showTitle: true,
    toolbarColor: "#023C69",
  });

  if (result.type !== "success" || !result.params.code) {
    const detail = result.type === "success" ? JSON.stringify(result.params) : result.type;
    console.warn("Keycloak authorization did not return a code", detail);
    throw new Error(`Keycloak auth failed: ${detail}`);
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
