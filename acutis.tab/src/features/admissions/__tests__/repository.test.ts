import { saveAdmissionDraft, saveAdmissionSection } from "../repository";
import { executeSql, queryAll } from "../../../db/connection";

jest.mock("../../../db", () => ({
  bootstrapDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../db/connection", () => ({
  executeSql: jest.fn().mockResolvedValue(undefined),
  openEncryptedDatabase: jest.fn().mockResolvedValue({}),
  queryAll: jest.fn(),
}));

describe("saveAdmissionDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts a new local draft with an explicit sync state", async () => {
    jest.mocked(queryAll).mockResolvedValue([]);

    const draft = await saveAdmissionDraft({
      id: "draft-1",
      unitId: "detox",
      residentName: "New Detox Admission",
      payload: { arrival: { escort: "Referral team" } },
    });

    expect(draft.status).toBe("draft");
    expect(draft.payload).toEqual({ arrival: { escort: "Referral team" } });
    expect(executeSql).toHaveBeenCalledWith(
      {},
      expect.stringContaining("INSERT INTO admission_drafts"),
      expect.arrayContaining(["draft-1", "detox", "New Detox Admission", "draft"])
    );
  });

  it("upserts admission section progress for restart recovery", async () => {
    jest.mocked(queryAll).mockResolvedValueOnce([]);

    const section = await saveAdmissionSection(
      "draft-1",
      "arrival",
      { arrivalTime: "2026-06-01T09:00:00.000Z" },
      "complete"
    );

    expect(section.status).toBe("complete");
    expect(executeSql).toHaveBeenCalledWith(
      {},
      expect.stringContaining("INSERT INTO admission_sections"),
      expect.arrayContaining(["draft-1-arrival", "draft-1", "arrival", "complete"])
    );
  });
});
