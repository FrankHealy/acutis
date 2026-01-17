import { ResidentWeeklyRollup } from "../types";

export function calculateStepDownEligibility(rollup: ResidentWeeklyRollup): boolean {
  return (
    rollup.cleanTestsAllWeek &&
    rollup.therapySessionsMissed === 0 &&
    rollup.incidentReports === 0
  );
}

