export type ScreeningControl = {
  unitCode: string;
  unitName: string;
  unitCapacity: number;
  currentOccupancy: number;
  capacityWarningThreshold: number;
  callLogsCacheSeconds: number;
  evaluationQueueCacheSeconds: number;
  localizationCacheSeconds: number;
  enableClientCacheOverride: boolean;
  updatedAt: string;
};

type CacheEnvelope<T> = {
  expiresAt: number;
  value: T;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";
const DEFAULT_UNIT_CODE = "alcohol";

const getAuthHeaders = (accessToken?: string) => {
  if (!accessToken) {
    throw new Error("Missing access token for screening control requests.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

const getCacheKey = (key: string) => `acutis.cache.${key}`;

export const readLocalCache = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(getCacheKey(key));
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};

export const writeLocalCache = <T>(key: string, value: T, ttlSeconds: number): void => {
  if (typeof window === "undefined" || ttlSeconds <= 0) {
    return;
  }
  const envelope: CacheEnvelope<T> = {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  window.localStorage.setItem(getCacheKey(key), JSON.stringify(envelope));
};

export const clearLocalCache = (key: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(getCacheKey(key));
};

let inMemoryControl: ScreeningControl | null = null;
let inMemoryControlExpiresAt = 0;

export const getScreeningControl = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean; unitCode?: string }
): Promise<ScreeningControl> => {
  const unitCode = options?.unitCode ?? DEFAULT_UNIT_CODE;
  const forceRefresh = Boolean(options?.forceRefresh);
  const cacheKey = `screening.control.${unitCode}`;

  if (!forceRefresh && inMemoryControl && Date.now() < inMemoryControlExpiresAt) {
    return inMemoryControl;
  }

  if (!forceRefresh) {
    const cached = readLocalCache<ScreeningControl>(cacheKey);
    if (cached) {
      inMemoryControl = cached;
      inMemoryControlExpiresAt = Date.now() + 60_000;
      return cached;
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/screening/control?unitCode=${encodeURIComponent(unitCode)}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load screening control: ${response.status} ${body}`);
  }

  const control = (await response.json()) as ScreeningControl;
  inMemoryControl = control;
  inMemoryControlExpiresAt = Date.now() + 60_000;
  writeLocalCache(cacheKey, control, 60);
  return control;
};
