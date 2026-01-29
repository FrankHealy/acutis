"use client";

import type { CallLog } from '@/data/mock/callLogs';

const CALL_LOGS_BASE_URL =
  process.env.NEXT_PUBLIC_CALL_LOGS_API_BASE_URL || 'https://localhost:7211';
const CALL_LOGS_ENDPOINT = `${CALL_LOGS_BASE_URL}/call-logs`;

type ApiCallLog = {
  id: string;
  firstName: string;
  surname: string;
  callerType: string;
  concernType: string;
  unit: string;
  location: string;
  phoneNumber: string;
  timestampUtc: string;
  notes: string;
  status: string;
  urgency: string;
};

type ApiPagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

const getApiTimestamp = (callLog: any): string => {
  return (
    callLog?.timestampUtc ||
    callLog?.timestampUTC ||
    callLog?.timestamp ||
    callLog?.TimestampUtc ||
    callLog?.TimestampUTC ||
    callLog?.Timestamp ||
    new Date().toISOString()
  );
};

const mapUnknownApiCallLog = (callLog: any): CallLog => {
  return {
    id: String(callLog?.id ?? crypto.randomUUID()),
    firstName: callLog?.firstName ?? callLog?.FirstName ?? '',
    surname: callLog?.surname ?? callLog?.Surname ?? '',
    callerType: (callLog?.callerType ?? callLog?.CallerType ?? 'other') as CallLog['callerType'],
    concernType: (callLog?.concernType ?? callLog?.ConcernType ?? 'general') as CallLog['concernType'],
    unit: (callLog?.unit ?? callLog?.Unit ?? 'Alcohol') as CallLog['unit'],
    location: callLog?.location ?? callLog?.Location ?? '',
    phoneNumber: callLog?.phoneNumber ?? callLog?.PhoneNumber ?? '',
    timestamp: getApiTimestamp(callLog),
    notes: callLog?.notes ?? callLog?.Notes ?? '',
    status: (callLog?.status ?? callLog?.Status ?? 'new') as CallLog['status'],
    urgency: (callLog?.urgency ?? callLog?.Urgency ?? 'medium') as CallLog['urgency'],
  };
};

export const fetchCallLogs = async (): Promise<CallLog[]> => {
  const response = await fetch(CALL_LOGS_ENDPOINT, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load call logs');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data.map(mapUnknownApiCallLog);
  }

  if (data && Array.isArray((data as ApiPagedResult<ApiCallLog>).items)) {
    return (data as ApiPagedResult<ApiCallLog>).items.map(mapUnknownApiCallLog);
  }

  return [];
};

export const createCallLog = async (payload: Omit<CallLog, 'id'>): Promise<CallLog> => {
  const response = await fetch(CALL_LOGS_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: payload.firstName,
      surname: payload.surname,
      callerType: payload.callerType,
      concernType: payload.concernType,
      unit: payload.unit,
      location: payload.location,
      phoneNumber: payload.phoneNumber,
      timestampUtc: payload.timestamp,
      notes: payload.notes,
      status: payload.status,
      urgency: payload.urgency,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save call log');
  }

  const data = await response.json();
  return mapUnknownApiCallLog(data);
};

export const formatCallLogTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFilteredCalls = (
  calls: CallLog[],
  activeDay: 0 | 1 | 2,
  timeSort: 'asc' | 'desc',
) => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - activeDay);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const callsForDay = calls.filter((call) => {
    const ts = new Date(call.timestamp);
    return ts >= start && ts < end;
  });
  return callsForDay.sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return timeSort === 'asc' ? aTime - bTime : bTime - aTime;
  });
};
