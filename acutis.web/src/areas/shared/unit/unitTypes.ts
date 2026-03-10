export type UnitId = "alcohol" | "detox" | "drugs" | "ladies";

export type UnitDefinition = {
  id: UnitId;
  name: string;
  accentClass: string;
  iconKey: "wine" | "shield" | "pill" | "venus";
  admissionsEnabled: boolean;
  admissionFormCode: string;
};

export const UnitDefinitions: Record<UnitId, UnitDefinition> = {
  alcohol: {
    id: "alcohol",
    name: "Alcohol",
    accentClass: "text-blue-700",
    iconKey: "wine",
    admissionsEnabled: false,
    admissionFormCode: "admission_alcohol",
  },
  detox: {
    id: "detox",
    name: "Detox",
    accentClass: "text-red-700",
    iconKey: "shield",
    admissionsEnabled: true,
    admissionFormCode: "admission_detox",
  },
  drugs: {
    id: "drugs",
    name: "Drugs",
    accentClass: "text-orange-700",
    iconKey: "pill",
    admissionsEnabled: false,
    admissionFormCode: "admission_drugs",
  },
  ladies: {
    id: "ladies",
    name: "Ladies",
    accentClass: "text-pink-700",
    iconKey: "venus",
    admissionsEnabled: false,
    admissionFormCode: "admission_ladies",
  },
};
