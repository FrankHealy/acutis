import type { CallLog } from '@/data/mock/callLogs';

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
