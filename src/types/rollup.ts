export interface ResidentWeeklyRollup {
  id: string;
  residentId: string;
  weekStart: string;
  weekEnd: string;
  therapySessionsAttended: number;
  therapySessionsMissed: number;
  incidentReports: number;
  cleanTestsAllWeek: boolean;
  stepDownEligible: boolean;
  staffNotes?: string;
  calculatedAt: string;
}

