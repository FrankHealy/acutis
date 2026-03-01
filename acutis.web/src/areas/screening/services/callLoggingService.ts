import type { CallLog } from '@/data/mock/callLogs';
import type { CallLogRangeDays } from '@/areas/screening/callLogging/helpers/callLoggingHelpers';
import {
  clearLocalCache,
  getScreeningControl,
  readLocalCache,
  writeLocalCache,
} from '@/areas/screening/services/screeningControlService';

type ApiCall = {
  id: string;
  callTimeUtc: string;
  caller?: string | null;
  phoneNumber?: string | null;
  notes?: string | null;
  source?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5009';
const CALLS_ENDPOINT = `${API_BASE_URL}/api/screenings/calls`;
const CALL_LOG_CACHE_KEY_PREFIX = 'screening.calls';
const CALL_LOG_CACHE_RANGES: ReadonlyArray<CallLogRangeDays> = [2, 7, 14, 30];

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
    concernType: 'general',
    unit: 'Alcohol',
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
  const source = payload.concernType || payload.unit || 'Screening';
  return {
    id: crypto.randomUUID(),
    callTimeUtc: payload.timestamp || new Date().toISOString(),
    caller: caller || null,
    phoneNumber: payload.phoneNumber || null,
    notes: payload.notes || null,
    source,
  };
};

const getAuthHeaders = (accessToken?: string) => {
  if (!accessToken) {
    throw new Error('Missing access token for call logging requests.');
  }
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
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

export const fetchCallLogs = async (
  accessToken?: string,
  options?: { forceRefresh?: boolean; rangeDays?: CallLogRangeDays },
): Promise<CallLog[]> => {
  const rangeDays = options?.rangeDays ?? 30;
  const cacheKey = `${CALL_LOG_CACHE_KEY_PREFIX}.${rangeDays}d`;
  const control = await getScreeningControl(accessToken, { forceRefresh: options?.forceRefresh });
  const canUseCache = !options?.forceRefresh && control.callLogsCacheSeconds > 0;

  if (canUseCache) {
    const cached = readLocalCache<CallLog[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${CALLS_ENDPOINT}?lastDays=${rangeDays}`, {
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
): Promise<CallLog> => {
  const response = await fetch(CALLS_ENDPOINT, {
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
    clearLocalCache(`${CALL_LOG_CACHE_KEY_PREFIX}.${rangeDays}d`);
  }
  clearLocalCache('screening.evaluees');
  return mapApiCallToUi(data);
};
