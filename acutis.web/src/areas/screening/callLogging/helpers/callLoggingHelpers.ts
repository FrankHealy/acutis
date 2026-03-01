import type { CallLog } from '@/data/mock/callLogs';

export type CallLogRangeDays = 2 | 7 | 14 | 30;

export const formatCallLogTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFilteredCalls = (
  calls: CallLog[],
  rangeDays: CallLogRangeDays,
  timeSort: 'asc' | 'desc',
) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - rangeDays);

  const callsInRange = calls.filter((call) => {
    const ts = new Date(call.timestamp);
    return ts >= cutoff;
  });

  return callsInRange.sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return timeSort === 'asc' ? aTime - bTime : bTime - aTime;
  });
};
