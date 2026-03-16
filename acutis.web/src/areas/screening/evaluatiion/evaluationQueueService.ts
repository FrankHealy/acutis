import {
  getScreeningControl,
  readLocalCache,
  writeLocalCache,
} from "@/areas/screening/services/screeningControlService";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { createAuthHeaders } from "@/lib/authMode";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

export type EvaluationQueueItem = {
  caseId: string;
  residentId: string | null;
  surname: string;
  name: string;
  unit: string;
  intakeSource: string;
  numCalls: number;
  lastCallDate: string;
  status: string;
  hasScreeningStarted: boolean;
};

const EVALUATION_CACHE_KEY = "screening.evaluees";

const getAuthHeaders = (accessToken?: string) => {
  return createAuthHeaders(accessToken);
};

export const fetchEvaluationQueue = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean; unitId?: UnitId }
): Promise<EvaluationQueueItem[]> => {
  const unitId = options?.unitId ?? "alcohol";
  const control = await getScreeningControl(accessToken, {
    forceRefresh: options?.forceRefresh,
    unitId,
  });
  const canUseCache = !options?.forceRefresh && control.evaluationQueueCacheSeconds > 0;
  const cacheKey = `${EVALUATION_CACHE_KEY}.${unitId}`;

  if (canUseCache) {
    const cached = readLocalCache<EvaluationQueueItem[]>(cacheKey);
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
    writeLocalCache(cacheKey, mapped, control.evaluationQueueCacheSeconds);
  }

  return mapped;
};
