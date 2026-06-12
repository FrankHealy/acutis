import { saveGroupTherapySession } from "../repository";
import { executeSql, queryAll } from "../../../db/connection";

jest.mock("../../../db", () => ({
  bootstrapDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../db/connection", () => ({
  executeSql: jest.fn().mockResolvedValue(undefined),
  openEncryptedDatabase: jest.fn().mockResolvedValue({}),
  queryAll: jest.fn(),
}));

describe("saveGroupTherapySession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores tablet-first continuity data locally", async () => {
    jest.mocked(queryAll).mockResolvedValue([]);

    const session = await saveGroupTherapySession({
      id: "gt-detox-2026-06-01-am",
      unitId: "detox",
      sessionDate: "2026-06-01",
      status: "in_progress",
      payload: {
        facilitatorName: "Staff Member",
        themeKeys: ["relapse_prevention"],
        currentSpeakerResidentId: "resident-2",
        previousSpeakerResidentId: "resident-1",
        attendance: { "resident-1": "present", "resident-2": "present" },
        followUpResidentIds: ["resident-2"],
        handoverNotes: "Resident 2 needs follow-up after lunch.",
      },
    });

    expect(session.payload.currentSpeakerResidentId).toBe("resident-2");
    expect(session.payload.previousSpeakerResidentId).toBe("resident-1");
    expect(executeSql).toHaveBeenCalledWith(
      {},
      expect.stringContaining("INSERT INTO group_therapy_sessions"),
      expect.arrayContaining(["gt-detox-2026-06-01-am", "detox", "2026-06-01", "in_progress"])
    );
  });
});
