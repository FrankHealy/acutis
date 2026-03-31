export type RollCallUnitId = "alcohol" | "detox" | "drugs" | "ladies";

export type RollCallUnitDefinition = {
  id: RollCallUnitId;
  name: string;
  description: string;
  accentColor: string;
  surfaceColor: string;
};

export const ROLL_CALL_UNITS: RollCallUnitDefinition[] = [
  {
    id: "alcohol",
    name: "Alcohol",
    description: "General residential unit roll call",
    accentColor: "#2563EB",
    surfaceColor: "#EFF6FF",
  },
  {
    id: "detox",
    name: "Detox",
    description: "Detox admissions and room check roll call",
    accentColor: "#DC2626",
    surfaceColor: "#FEF2F2",
  },
  {
    id: "drugs",
    name: "Drugs",
    description: "Drug recovery unit attendance sweep",
    accentColor: "#EA580C",
    surfaceColor: "#FFF7ED",
  },
  {
    id: "ladies",
    name: "Ladies",
    description: "Ladies unit morning and evening roll call",
    accentColor: "#DB2777",
    surfaceColor: "#FDF2F8",
  },
];

export function isRollCallUnitId(value: string): value is RollCallUnitId {
  return ROLL_CALL_UNITS.some((unit) => unit.id === value);
}

export function getRollCallUnit(unitId: RollCallUnitId): RollCallUnitDefinition {
  return ROLL_CALL_UNITS.find((unit) => unit.id === unitId) ?? ROLL_CALL_UNITS[0];
}

export function getRollCallWindowLabel(date = new Date()): "Morning" | "Evening" {
  return date.getHours() < 12 ? "Morning" : "Evening";
}

export function getRollCallDateLabel(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildRollCallSessionId(unitId: RollCallUnitId, date = new Date()): string {
  const dayKey = date.toISOString().slice(0, 10);
  const windowKey = getRollCallWindowLabel(date).toLowerCase();
  return `${unitId}-${dayKey}-${windowKey}`;
}
