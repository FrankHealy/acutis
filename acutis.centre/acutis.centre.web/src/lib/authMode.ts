export const isAuthorizationDisabled =
  process.env.NEXT_PUBLIC_DISABLE_AUTH?.toLowerCase() === "true";

export const isAuthorizedClient = (status: string, accessToken?: string | null) =>
  isAuthorizationDisabled || (status === "authenticated" && Boolean(accessToken));

export const createAuthHeaders = (accessToken?: string | null): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};
