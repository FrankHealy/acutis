import { apiFetchJson } from "../../services/api/client";

export type ScreeningSchedulingAwaitingItemDto = {
  caseId: string;
  callId?: string | null;
  surname: string;
  name: string;
  phoneNumber: string;
  queueType: string;
  completedAt: string;
};

export type ScreeningSchedulingAssignmentDto = {
  scheduledIntakeId: string;
  caseId: string;
  callId?: string | null;
  surname: string;
  name: string;
  phoneNumber: string;
  queueType: string;
  status: string;
};

export type ScreeningSchedulingSlotDto = {
  slotId: string;
  scheduledDate: string;
  displayLabel: string;
  assignmentCount: number;
  assignments: ScreeningSchedulingAssignmentDto[];
};

export type ScreeningSchedulingBoardDto = {
  centreId: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  awaiting: ScreeningSchedulingAwaitingItemDto[];
  slots: ScreeningSchedulingSlotDto[];
};

export async function fetchDetoxSchedulingBoard(): Promise<ScreeningSchedulingBoardDto> {
  return apiFetchJson<ScreeningSchedulingBoardDto>("/api/Screenings/scheduling-board?unitId=detox");
}
