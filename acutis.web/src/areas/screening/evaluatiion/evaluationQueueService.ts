import {
  getScreeningControl,
  readLocalCache,
  writeLocalCache,
} from "@/areas/screening/services/screeningControlService";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { createAuthHeaders } from "@/lib/authMode";

export type EvaluationQueueItem = {
  surname: string;
  name: string;
  unit: string;
  numCalls: number;
  lastCallDate: string;
  status: string;
};

const EVALUATION_CACHE_KEY = "screening.evaluees";

const getAuthHeaders = (accessToken?: string) => {
  return createAuthHeaders(accessToken);
};

export const fetchEvaluationQueue = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean }
): Promise<EvaluationQueueItem[]> => {
  const control = await getScreeningControl(accessToken, { forceRefresh: options?.forceRefresh });
  const canUseCache = !options?.forceRefresh && control.evaluationQueueCacheSeconds > 0;

  if (canUseCache) {
    const cached = readLocalCache<EvaluationQueueItem[]>(EVALUATION_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/api/screenings/evaluees`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load evaluation queue: ${response.status} ${body}`);
  }

  const data = (await response.json()) as EvaluationQueueItem[];
  const mapped = Array.isArray(data) ? data : [];
  if (canUseCache) {
    writeLocalCache(EVALUATION_CACHE_KEY, mapped, control.evaluationQueueCacheSeconds);
  }

  return mapped;
};
