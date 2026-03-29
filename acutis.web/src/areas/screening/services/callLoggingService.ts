import type { CallLog } from '@/data/mock/callLogs';
import type { CallLogRangeDays } from '@/areas/screening/callLogging/helpers/callLoggingHelpers';
import {
  clearLocalCache,
  getScreeningControl,
  readLocalCache,
  writeLocalCache,
} from '@/areas/screening/services/screeningControlService';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { createAuthHeaders } from '@/lib/authMode';
import type { UnitId } from '@/areas/shared/unit/unitTypes';

type ApiCall = {
  id: string;
  callTimeUtc: string;
  caller?: string | null;
  phoneNumber?: string | null;
  notes?: string | null;
  source?: string | null;
};

const CALL_LOG_CACHE_KEY_PREFIX = 'screening.calls';
const CALL_LOG_CACHE_RANGES: ReadonlyArray<CallLogRangeDays> = [2, 7, 14, 30];

const normalizeConcernType = (source?: string | null): CallLog['concernType'] => {
  switch ((source ?? '').trim().toLowerCase()) {
    case 'alcohol':
      return 'alcohol';
    case 'drugs':
      return 'drugs';
    case 'gambling':
      return 'gambling';
    case 'ladies':
      return 'ladies';
    case 'general':
    case 'general query':
    case 'general_query':
      return 'general_query';
    default:
      return 'general_query';
  }
};

const splitCaller = (caller?: string | null) => {
  if (!caller) return { firstName: '', surname: '' };
  const parts = caller.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], surname: '' };
  }
  return { firstName: parts[0], surname: parts.slice(1).join(' ') };
};

const mapApiCallToUi = (call: ApiCall): CallLog => {
  const { firstName, surname } = splitCaller(call.caller);
  return {
    id: call.id,
    firstName,
    surname,
    callerType: 'other',
    concernType: normalizeConcernType(call.source),
    location: '',
    phoneNumber: call.phoneNumber ?? '',
    timestamp: call.callTimeUtc ?? new Date().toISOString(),
    notes: call.notes ?? '',
    status: 'new',
    urgency: 'medium',
  };
};

const mapUiToApiCall = (payload: Omit<CallLog, 'id'>): ApiCall => {
  const caller = [payload.firstName, payload.surname].filter(Boolean).join(' ').trim();
  return {
    id: crypto.randomUUID(),
    callTimeUtc: payload.timestamp || new Date().toISOString(),
    caller: caller || null,
    phoneNumber: payload.phoneNumber || null,
    notes: payload.notes || null,
    source: payload.concernType || 'general_query',
  };
};

const getAuthHeaders = (accessToken?: string) => {
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1] ?? ''));
      if (payload?.exp) {
        const expMs = Number(payload.exp) * 1000;
        const expIso = new Date(expMs).toISOString();
        console.info(`[CallLogging] access token exp: ${expIso}`);
      }
    } catch {
      console.warn('[CallLogging] Unable to decode access token expiry.');
    }
  }

  return createAuthHeaders(accessToken);
};

export const fetchCallLogs = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean; rangeDays?: CallLogRangeDays; unitId?: UnitId },
): Promise<CallLog[]> => {
  const rangeDays = options?.rangeDays ?? 30;
  const unitId = options?.unitId ?? 'alcohol';
  const cacheKey = `${CALL_LOG_CACHE_KEY_PREFIX}.${unitId}.${rangeDays}d`;
  const control = await getScreeningControl(accessToken, {
    forceRefresh: options?.forceRefresh,
    unitId,
  });
  const canUseCache = !options?.forceRefresh && control.callLogsCacheSeconds > 0;

  if (canUseCache) {
    const cached = readLocalCache<CallLog[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/api/screenings/calls?lastDays=${rangeDays}`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to load call logs: ${response.status} ${body}`);
  }

  const data = (await response.json()) as ApiCall[];
  if (!Array.isArray(data)) return [];
  const mapped = data.map(mapApiCallToUi);

  if (canUseCache) {
    writeLocalCache(cacheKey, mapped, control.callLogsCacheSeconds);
  }

  return mapped;
};

export const fetchAllCallLogs = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean; unitId?: UnitId },
): Promise<CallLog[]> => {
  const unitId = options?.unitId ?? 'alcohol';
  const cacheKey = `${CALL_LOG_CACHE_KEY_PREFIX}.${unitId}.all`;
  const control = await getScreeningControl(accessToken, {
    forceRefresh: options?.forceRefresh,
    unitId,
  });
  const canUseCache = !options?.forceRefresh && control.callLogsCacheSeconds > 0;

  if (canUseCache) {
    const cached = readLocalCache<CallLog[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/api/screenings/calls`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to load call logs: ${response.status} ${body}`);
  }

  const data = (await response.json()) as ApiCall[];
  if (!Array.isArray(data)) return [];
  const mapped = data.map(mapApiCallToUi);

  if (canUseCache) {
    writeLocalCache(cacheKey, mapped, control.callLogsCacheSeconds);
  }

  return mapped;
};

export const createCallLog = async (
  payload: Omit<CallLog, 'id'>,
  accessToken?: string,
  unitId: UnitId = 'alcohol',
): Promise<CallLog> => {
  const response = await fetch(`${getApiBaseUrl()}/api/screenings/calls`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mapUiToApiCall(payload)),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to save call log: ${response.status} ${body}`);
  }

  const data = (await response.json()) as ApiCall;
  for (const rangeDays of CALL_LOG_CACHE_RANGES) {
    clearLocalCache(`${CALL_LOG_CACHE_KEY_PREFIX}.${unitId}.${rangeDays}d`);
  }
  clearLocalCache(`${CALL_LOG_CACHE_KEY_PREFIX}.${unitId}.all`);
  clearLocalCache('screening.evaluees');
  return mapApiCallToUi(data);
};
