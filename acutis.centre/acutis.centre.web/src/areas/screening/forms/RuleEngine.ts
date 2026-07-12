import type { JsonValue, RuleActionDto, RuleDto } from "./ApiClient";

export type RuleEngineResult = {
  answers: Record<string, JsonValue>;
  hiddenFields: Set<string>;
  disabledFields: Set<string>;
};

const areEqual = (left: JsonValue | undefined, right: JsonValue | undefined): boolean => {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
};

const applyAction = (
  action: RuleActionDto | undefined,
  hiddenFields: Set<string>,
  disabledFields: Set<string>,
  answers: Record<string, JsonValue>
) => {
  if (!action) {
    return;
  }

  for (const field of action.show ?? []) {
    hiddenFields.delete(field);
  }
  for (const field of action.hide ?? []) {
    hiddenFields.add(field);
  }
  for (const field of action.enable ?? []) {
    disabledFields.delete(field);
  }
  for (const field of action.disable ?? []) {
    disabledFields.add(field);
  }
  for (const field of action.clear ?? []) {
    delete answers[field];
  }
};

export const applyRules = (
  rules: RuleDto[],
  currentAnswers: Record<string, JsonValue>
): RuleEngineResult => {
  const answers = { ...currentAnswers };
  const hiddenFields = new Set<string>();
  const disabledFields = new Set<string>();

  for (const rule of rules) {
    const currentValue = answers[rule.if.field];
    if (areEqual(currentValue, rule.if.equals)) {
      applyAction(rule.then, hiddenFields, disabledFields, answers);
    } else {
      applyAction(rule.else, hiddenFields, disabledFields, answers);
    }
  }

  return { answers, hiddenFields, disabledFields };
};
