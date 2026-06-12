import { DETOX_ADMISSION_WORKFLOW, validateAdmissionSection } from "../workflow";

describe("validateAdmissionSection", () => {
  it("rejects invalid bounded values and missing required fields", () => {
    const assessment = DETOX_ADMISSION_WORKFLOW.sections.find((section) => section.key === "assessment");

    expect(assessment).toBeDefined();
    expect(validateAdmissionSection(assessment!, {})).toEqual([
      { fieldKey: "withdrawalRisk", reason: "required" },
    ]);
    expect(validateAdmissionSection(assessment!, { withdrawalRisk: "unclear" })).toEqual([
      { fieldKey: "withdrawalRisk", reason: "invalid_option" },
    ]);
  });

  it("allows capture-only fields to remain unstructured", () => {
    const assessment = DETOX_ADMISSION_WORKFLOW.sections.find((section) => section.key === "assessment")!;

    expect(
      validateAdmissionSection(assessment, {
        withdrawalRisk: "medium",
        observations: "Free text with messy but reviewable notes",
      })
    ).toEqual([]);
  });
});
