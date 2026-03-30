import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "acutis.accessToken";
const REFRESH_TOKEN_KEY = "acutis.refreshToken";

export async function setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

export async function getAuthTokens(): Promise<{ accessToken?: string; refreshToken?: string }> {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  return { accessToken: accessToken ?? undefined, refreshToken: refreshToken ?? undefined };
}

export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
