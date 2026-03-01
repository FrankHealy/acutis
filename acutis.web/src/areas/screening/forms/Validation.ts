import type { JsonSchemaDto, JsonValue, OptionSetDto } from "./ApiClient";

export type ValidationErrors = Record<string, string[]>;

const asString = (value: JsonValue | undefined): string | null => {
  return typeof value === "string" ? value : null;
};

const asNumber = (value: JsonValue | undefined): number | null => {
  return typeof value === "number" ? value : null;
};

const isEmpty = (value: JsonValue | undefined): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const addError = (errors: ValidationErrors, fieldKey: string, message: string) => {
  if (!errors[fieldKey]) {
    errors[fieldKey] = [];
  }
  errors[fieldKey].push(message);
};

const hasNumericConstraint = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export const validateAnswers = (
  schema: JsonSchemaDto,
  answers: Record<string, JsonValue>,
  optionSets: OptionSetDto[]
): ValidationErrors => {
  const errors: ValidationErrors = {};
  const optionSetLookup = new Map(
    optionSets.map((set) => [set.key, new Set(set.items.filter((item) => item.isActive).map((item) => item.code))])
  );

  for (const requiredField of schema.required ?? []) {
    if (isEmpty(answers[requiredField])) {
      addError(errors, requiredField, "This field is required.");
    }
  }

  for (const [fieldKey, property] of Object.entries(schema.properties)) {
    const value = answers[fieldKey];
    if (value === undefined || value === null) {
      continue;
    }

    if ((property.type === "string" || property.type === "text" || property.type === "enum") && typeof value !== "string") {
      addError(errors, fieldKey, `Expected ${property.type}.`);
      continue;
    }

    if (property.type === "boolean" && typeof value !== "boolean") {
      addError(errors, fieldKey, "Expected boolean.");
      continue;
    }

    if (property.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) {
      addError(errors, fieldKey, "Expected integer.");
      continue;
    }

    if (property.type === "number" && typeof value !== "number") {
      addError(errors, fieldKey, "Expected number.");
      continue;
    }

    if (property.type === "multiEnum" && !Array.isArray(value)) {
      addError(errors, fieldKey, "Expected a list of option codes.");
      continue;
    }

    const stringValue = asString(value);
    if (stringValue !== null) {
      if (hasNumericConstraint(property.minLength) && stringValue.length < property.minLength) {
        addError(errors, fieldKey, `Minimum length is ${property.minLength}.`);
      }
      if (hasNumericConstraint(property.maxLength) && stringValue.length > property.maxLength) {
        addError(errors, fieldKey, `Maximum length is ${property.maxLength}.`);
      }
      if (property.pattern) {
        const regex = new RegExp(property.pattern);
        if (!regex.test(stringValue)) {
          addError(errors, fieldKey, "Value does not match required format.");
        }
      }
    }

    const numberValue = asNumber(value);
    if (numberValue !== null) {
      if (hasNumericConstraint(property.minimum) && numberValue < property.minimum) {
        addError(errors, fieldKey, `Minimum value is ${property.minimum}.`);
      }
      if (hasNumericConstraint(property.maximum) && numberValue > property.maximum) {
        addError(errors, fieldKey, `Maximum value is ${property.maximum}.`);
      }
    }

    if (property.optionSetKey && optionSetLookup.has(property.optionSetKey)) {
      const codes = optionSetLookup.get(property.optionSetKey)!;
      if (typeof value === "string" && !codes.has(value)) {
        addError(errors, fieldKey, "Invalid option value.");
      }
      if (Array.isArray(value) && value.some((item) => typeof item !== "string" || !codes.has(item))) {
        addError(errors, fieldKey, "One or more options are invalid.");
      }
    }
  }

  return errors;
};
