export type AdmissionSectionStatus = "not_started" | "in_progress" | "complete" | "needs_review";
export type AdmissionFieldType = "text" | "multiline" | "select" | "date" | "boolean";

export interface AdmissionFieldOption {
  value: string;
  labelKey: string;
}

export interface AdmissionFieldDefinition {
  key: string;
  labelKey: string;
  type: AdmissionFieldType;
  required?: boolean;
  bounded?: boolean;
  options?: AdmissionFieldOption[];
}

export interface AdmissionSectionDefinition {
  key: string;
  titleKey: string;
  descriptionKey: string;
  fields: AdmissionFieldDefinition[];
}

export interface AdmissionWorkflowDefinition {
  unitId: string;
  version: string;
  sections: AdmissionSectionDefinition[];
}

export interface AdmissionValidationIssue {
  fieldKey: string;
  reason: "required" | "invalid_option" | "ambiguous_bounded_field";
}

export const DETOX_ADMISSION_WORKFLOW: AdmissionWorkflowDefinition = {
  unitId: "detox",
  version: "2026-06-01",
  sections: [
    {
      key: "arrival",
      titleKey: "admissions.detox.sections.arrival",
      descriptionKey: "admissions.detox.sectionDescriptions.arrival",
      fields: [
        { key: "arrivalTime", labelKey: "admissions.detox.fields.arrivalTime", type: "date", required: true },
        { key: "referralSource", labelKey: "admissions.detox.fields.referralSource", type: "text" },
        { key: "escortName", labelKey: "admissions.detox.fields.escortName", type: "text" },
      ],
    },
    {
      key: "assessment",
      titleKey: "admissions.detox.sections.assessment",
      descriptionKey: "admissions.detox.sectionDescriptions.assessment",
      fields: [
        {
          key: "withdrawalRisk",
          labelKey: "admissions.detox.fields.withdrawalRisk",
          type: "select",
          required: true,
          bounded: true,
          options: [
            { value: "low", labelKey: "admissions.detox.risk.low" },
            { value: "medium", labelKey: "admissions.detox.risk.medium" },
            { value: "high", labelKey: "admissions.detox.risk.high" },
          ],
        },
        { key: "observations", labelKey: "admissions.detox.fields.observations", type: "multiline" },
      ],
    },
    {
      key: "belongings",
      titleKey: "admissions.detox.sections.belongings",
      descriptionKey: "admissions.detox.sectionDescriptions.belongings",
      fields: [
        { key: "valuablesLogged", labelKey: "admissions.detox.fields.valuablesLogged", type: "boolean", required: true },
        { key: "restrictedItems", labelKey: "admissions.detox.fields.restrictedItems", type: "multiline" },
      ],
    },
    {
      key: "room",
      titleKey: "admissions.detox.sections.room",
      descriptionKey: "admissions.detox.sectionDescriptions.room",
      fields: [
        { key: "roomId", labelKey: "admissions.detox.fields.roomId", type: "text", required: true },
        { key: "bedId", labelKey: "admissions.detox.fields.bedId", type: "text" },
      ],
    },
    {
      key: "consent",
      titleKey: "admissions.detox.sections.consent",
      descriptionKey: "admissions.detox.sectionDescriptions.consent",
      fields: [
        { key: "reviewedWithResident", labelKey: "admissions.detox.fields.reviewedWithResident", type: "boolean", required: true },
        { key: "consentNotes", labelKey: "admissions.detox.fields.consentNotes", type: "multiline" },
      ],
    },
  ],
};

export const COMMUNITY_ADMISSION_WORKFLOW: AdmissionWorkflowDefinition = {
  ...DETOX_ADMISSION_WORKFLOW,
  unitId: "community",
};

export function getAdmissionWorkflow(unitId: string): AdmissionWorkflowDefinition | null {
  if (unitId === DETOX_ADMISSION_WORKFLOW.unitId) return DETOX_ADMISSION_WORKFLOW;
  if (unitId === COMMUNITY_ADMISSION_WORKFLOW.unitId) return COMMUNITY_ADMISSION_WORKFLOW;
  return null;
}

export function validateAdmissionSection(
  section: AdmissionSectionDefinition,
  values: Record<string, unknown>
): AdmissionValidationIssue[] {
  return section.fields.flatMap<AdmissionValidationIssue>((field) => {
    const value = values[field.key];
    const isEmpty = value === undefined || value === null || value === "";

    if (field.required && isEmpty) {
      return [{ fieldKey: field.key, reason: "required" as const }];
    }

    if (!field.bounded || isEmpty) {
      return [];
    }

    if (!field.options?.length) {
      return [{ fieldKey: field.key, reason: "ambiguous_bounded_field" as const }];
    }

    return field.options.some((option) => option.value === value)
      ? []
      : [{ fieldKey: field.key, reason: "invalid_option" as const }];
  });
}
