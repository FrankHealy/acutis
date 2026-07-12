import type { ScreeningSchedulingAwaitingItemDto } from "../admissions/api";
import { saveAdmissionDraft } from "../admissions/repository";

export async function createAdmissionDraftFromScreening(
  unitId: string,
  item: ScreeningSchedulingAwaitingItemDto
) {
  const residentName = `${item.name} ${item.surname}`.trim() || "New Admission";

  return saveAdmissionDraft({
    id: `screening-${item.caseId}`,
    unitId,
    residentName,
    payload: {
      source: "screening_scheduling_board",
      caseId: item.caseId,
      callId: item.callId ?? null,
      queueType: item.queueType,
      completedAt: item.completedAt,
      phoneNumber: item.phoneNumber,
    },
  });
}
