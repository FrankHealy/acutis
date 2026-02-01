// src/services/http.server.ts
import 'server-only';

const baseUrl = process.env.CALL_LOGS_API_BASE_URL ?? 'https://localhost:7211';

export async function serverGet<T>(
  path: string,
  opts?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    method: 'GET',
    // Next.js caching knobs:
    next: opts?.revalidate || opts?.tags ? { revalidate: opts?.revalidate, tags: opts?.tags } : undefined,
    cache: opts?.revalidate ? undefined : 'no-store',
    headers: {
      'Accept': 'application/json',
      // add auth/tenant headers here later (Keycloak → Azure AD)
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Upstream GET ${path} failed: ${res.status} ${res.statusText} ${body}`);
  }

  return (await res.json()) as T;
}
