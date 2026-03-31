import { apiFetchJson } from "./client";

export type OfflinePolicyStatus = {
  timeZone: string;
  serverTimeUtc: string;
  localTime: string;
  isInMorningWindow: boolean;
  isInEveningWindow: boolean;
  currentWindowEndsAtLocal: string | null;
  nextWindowStartsAtLocal: string | null;
  tokenValidityMinutes: number;
  dataValidityMinutes: number;
};

export async function getOfflinePolicyStatus(): Promise<OfflinePolicyStatus> {
  return apiFetchJson<OfflinePolicyStatus>("/api/policy/offline-windows", {
    authenticated: false,
  });
}
