import type { JsonSchemaDto, JsonValue, OptionSetDto } from "./ApiClient";

export type ValidationErrors = Record<string, string[]>;
type ValidationMessageValues = Record<string, string | number>;
type ValidationMessageFormatter = (key: string, fallback: string, values?: ValidationMessageValues) => string;

const defaultFormatValidationMessage: ValidationMessageFormatter = (_key, fallback, values) => {
  if (!values) {
    return fallback;
  }

  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    fallback
  );
};

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

const normalizePhoneNumber = (value: string): string => value.replace(/[\s().-]/g, "");

const matchesFormat = (format: string, value: string): boolean => {
  if (format === "email") {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  }

  if (format === "phone") {
    const normalized = normalizePhoneNumber(value);
    return /^\+?\d{7,15}$/.test(normalized);
  }

  return true;
};

export const validateAnswers = (
  schema: JsonSchemaDto,
  answers: Record<string, JsonValue>,
  optionSets: OptionSetDto[],
  formatMessage: ValidationMessageFormatter = defaultFormatValidationMessage
): ValidationErrors => {
  const errors: ValidationErrors = {};
  const optionSetLookup = new Map(
    optionSets.map((set) => [set.key, new Set(set.items.filter((item) => item.isActive).map((item) => item.code))])
  );

  for (const requiredField of schema.required ?? []) {
    if (isEmpty(answers[requiredField])) {
      addError(
        errors,
        requiredField,
        formatMessage("form.validation.required", "This field is required.")
      );
    }
  }

  for (const [fieldKey, property] of Object.entries(schema.properties)) {
    const value = answers[fieldKey];
    if (value === undefined || value === null) {
      continue;
    }

    if ((property.type === "string" || property.type === "text" || property.type === "enum") && typeof value !== "string") {
      addError(
        errors,
        fieldKey,
        formatMessage("form.validation.expected_type", "Expected {type}.", { type: property.type })
      );
      continue;
    }

    if (property.type === "boolean" && typeof value !== "boolean") {
      addError(errors, fieldKey, formatMessage("form.validation.expected_boolean", "Expected boolean."));
      continue;
    }

    if (property.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) {
      addError(errors, fieldKey, formatMessage("form.validation.expected_integer", "Expected integer."));
      continue;
    }

    if (property.type === "number" && typeof value !== "number") {
      addError(errors, fieldKey, formatMessage("form.validation.expected_number", "Expected number."));
      continue;
    }

    if (property.type === "multiEnum" && !Array.isArray(value)) {
      addError(
        errors,
        fieldKey,
        formatMessage("form.validation.expected_option_list", "Expected a list of option codes.")
      );
      continue;
    }

    const stringValue = asString(value);
    if (stringValue !== null) {
      const normalizedStringValue = property.format === "phone" ? normalizePhoneNumber(stringValue) : stringValue;

      if (hasNumericConstraint(property.minLength) && normalizedStringValue.length < property.minLength) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.min_length", "Minimum length is {value}.", { value: property.minLength })
        );
      }
      if (hasNumericConstraint(property.maxLength) && normalizedStringValue.length > property.maxLength) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.max_length", "Maximum length is {value}.", { value: property.maxLength })
        );
      }
      if (property.pattern) {
        const regex = new RegExp(property.pattern);
        if (!regex.test(stringValue)) {
          addError(
            errors,
            fieldKey,
            formatMessage("form.validation.pattern", "Value does not match required format.")
          );
        }
      }
      if (property.format && !matchesFormat(property.format, stringValue)) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.invalid_format", "Invalid {format} format.", { format: property.format })
        );
      }
    }

    const numberValue = asNumber(value);
    if (numberValue !== null) {
      if (hasNumericConstraint(property.minimum) && numberValue < property.minimum) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.min_value", "Minimum value is {value}.", { value: property.minimum })
        );
      }
      if (hasNumericConstraint(property.maximum) && numberValue > property.maximum) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.max_value", "Maximum value is {value}.", { value: property.maximum })
        );
      }
    }

    if (property.optionSetKey && optionSetLookup.has(property.optionSetKey)) {
      const codes = optionSetLookup.get(property.optionSetKey)!;
      if (typeof value === "string" && !codes.has(value)) {
        addError(errors, fieldKey, formatMessage("form.validation.invalid_option", "Invalid option value."));
      }
      if (Array.isArray(value) && value.some((item) => typeof item !== "string" || !codes.has(item))) {
        addError(
          errors,
          fieldKey,
          formatMessage("form.validation.invalid_option_list", "One or more options are invalid.")
        );
      }
    }
  }

  return errors;
};
