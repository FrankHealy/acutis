export type CallLog = {
  id: string;
  firstName: string;
  surname: string;
  callerType: "self" | "family" | "professional" | "other";
  concernType: "general" | "alcohol" | "drugs" | "gambling" | "mental-health" | "other";
  unit: "Alcohol" | "Drugs" | "Gambling" | "Mental Health" | "Other";
  location: string;
  phoneNumber: string;
  timestamp: string;
  notes: string;
  status: "new" | "in-progress" | "resolved";
  urgency: "low" | "medium" | "high";
};

export const mockCallLogs: CallLog[] = [];
