export type UnitId = "alcohol" | "detox" | "drugs" | "ladies";

export type UnitDefinition = {
  id: UnitId;
  name: string;
  accentClass: string;
};

export const UnitDefinitions: Record<UnitId, UnitDefinition> = {
  alcohol: { id: "alcohol", name: "Alcohol", accentClass: "text-blue-700" },
  detox: { id: "detox", name: "Detox", accentClass: "text-red-700" },
  drugs: { id: "drugs", name: "Drugs", accentClass: "text-orange-700" },
  ladies: { id: "ladies", name: "Ladies", accentClass: "text-pink-700" },
};

