const fs = require("fs");
const path = require("path");

const sourcePath = "c:/work/Acutis HSE Application Form/HSE.json";
const outputJsonPath = path.join(__dirname, "..", "resources", "forms", "hse_initial_assessment.generated.json");
const outputTsPath = path.join(__dirname, "..", "acutis.tab", "src", "features", "hseAssessment", "definition.ts");
const outputMigrationPayloadPath = path.join(__dirname, "..", "tmp", "hse_initial_assessment_migration_payload.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const schema = {
  type: "object",
  properties: {},
  required: [],
};

const ui = {
  sections: [],
  widgets: {},
  labelKeys: {},
  helpKeys: {},
  selectOptions: {},
};

const rules = [];

const titleCase = (value) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());

const humanizePath = (parts) => titleCase(parts[parts.length - 1] || "Field");
const fieldId = (parts) => parts.join(".");
const optionValue = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "option";

const uniqueOptions = (values) => {
  const seen = new Set();
  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
    .filter((value) => {
      const key = optionValue(value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((label) => ({ value: optionValue(label), label }));
};

const addField = (parts, type, widget, options = null, config = {}) => {
  const id = fieldId(parts);
  schema.properties[id] = {
    type,
    ...config,
  };
  ui.widgets[id] = widget;
  ui.labelKeys[id] = humanizePath(parts);
  if (options?.length) {
    ui.selectOptions[id] = options;
  }
  return id;
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const readOptions = (options) => {
  if (!Array.isArray(options)) return [];
  if (options.every((item) => typeof item === "string")) return uniqueOptions(options);
  if (options.every((item) => isPlainObject(item) && typeof item.value === "string")) {
    return uniqueOptions(options.map((item) => item.value));
  }
  return [];
};

const readCategoryOptions = (categories) => {
  if (!Array.isArray(categories)) return [];
  const values = [];
  for (const category of categories) {
    if (!isPlainObject(category) || !Array.isArray(category.options)) continue;
    for (const option of category.options) {
      values.push(`${category.group}: ${option}`);
    }
  }
  return uniqueOptions(values);
};

const flatten = (value, parts, collector) => {
  if (isPlainObject(value)) {
    const categoryOptions = readCategoryOptions(value.categories);
    if (categoryOptions.length) {
      collector.push(addField([...parts, "selected_value"], "enum", "select", categoryOptions));
      for (const [key, child] of Object.entries(value)) {
        if (key !== "categories" && key !== "selected_value") {
          flatten(child, [...parts, key], collector);
        }
      }
      return;
    }

    const options = readOptions(value.options);
    if (options.length) {
      const selectedKey = Object.prototype.hasOwnProperty.call(value, "selected") ? "selected" : null;
      const selectedSourcesKey = Object.prototype.hasOwnProperty.call(value, "selected_sources") ? "selected_sources" : null;
      const checkedOptions = Array.isArray(value.options) && value.options.some((item) => isPlainObject(item) && "checked" in item);
      const selectedOptions = Array.isArray(value.options) && value.options.some((item) => isPlainObject(item) && "selected" in item);
      const answerKey = selectedSourcesKey ?? selectedKey ?? "selected_values";
      collector.push(addField([...parts, answerKey], selectedSourcesKey || checkedOptions || selectedOptions ? "multiEnum" : "enum", "select", options));
      for (const [key, child] of Object.entries(value)) {
        if (key !== "options" && key !== selectedKey && key !== selectedSourcesKey) {
          flatten(child, [...parts, key], collector);
        }
      }
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      flatten(child, [...parts, key], collector);
    }
    return;
  }

  if (Array.isArray(value)) {
    const options = readOptions(value);
    if (options.length) {
      collector.push(addField(parts, "multiEnum", "select", options));
      return;
    }

    value.forEach((item, index) => flatten(item, [...parts, String(index + 1)], collector));
    return;
  }

  if (typeof value === "boolean") {
    collector.push(addField(parts, "boolean", "toggle"));
    return;
  }

  if (typeof value === "number") {
    collector.push(addField(parts, Number.isInteger(value) ? "integer" : "number", "number", null, { minimum: 0, maximum: 1000 }));
    return;
  }

  const key = parts[parts.length - 1] ?? "";
  if (value === null) {
    if (/age|count|number|score|scale|total|quantity|duration/i.test(key)) {
      collector.push(addField(parts, "integer", "number", null, { minimum: 0, maximum: 1000 }));
      return;
    }

    if (/^(is|has|had|can|uses|knows|wishes|attends|needed|arranged|aware|adheres|served|engaged|confirmed|agreed)|ever_|currently|current_|previous_|history_|concerns|status$/i.test(key)) {
      collector.push(addField(parts, "boolean", "toggle"));
      return;
    }
  }

  if (/date|dob|birth/i.test(key)) {
    collector.push(addField(parts, "date", "input"));
    return;
  }
  if (/email/i.test(key)) {
    collector.push(addField(parts, "string", "input", null, { maxLength: 160, format: "email" }));
    return;
  }
  if (/phone|mobile/i.test(key)) {
    collector.push(addField(parts, "string", "input", null, { maxLength: 40, format: "phone" }));
    return;
  }
  if (/signature/i.test(key)) {
    collector.push(addField(parts, "text", "signature", null, { maxLength: 200000 }));
    return;
  }
  if (/statement|description|details|notes|comments|history|address|reason|information|medications|providers|places|logistics/i.test(key)) {
    collector.push(addField(parts, "text", "textarea", null, { maxLength: 4000 }));
    return;
  }

  collector.push(addField(parts, "string", "input", null, { maxLength: 240 }));
};

for (const [sectionKey, sectionValue] of Object.entries(source.assessment_form)) {
  const section = {
    titleKey: titleCase(sectionKey),
    items: [],
    groups: [],
  };

  if (isPlainObject(sectionValue)) {
    for (const [groupKey, groupValue] of Object.entries(sectionValue)) {
      const groupItems = [];
      flatten(groupValue, ["assessment_form", sectionKey, groupKey], groupItems);
      if (groupItems.length) {
        section.groups.push({
          title: titleCase(groupKey),
          items: groupItems,
        });
      }
    }
  } else {
    flatten(sectionValue, ["assessment_form", sectionKey], section.items);
  }

  if (section.items.length || section.groups.length) {
    ui.sections.push(section);
  }
}

const requiredHints = [
  "assessment_form.administrative_details.name_of_service_user",
  "assessment_form.administrative_details.date_of_birth",
  "assessment_form.consent_and_sign_offs.general_service_user_consent.service_user_signature",
  "assessment_form.consent_and_sign_offs.general_service_user_consent.staff_signature",
];
schema.required = requiredHints.filter((key) => schema.properties[key]);

const definition = {
  code: "alcohol_screening_call",
  version: 6,
  status: "published",
  titleKey: "Initial Assessment and Service User Consent Form",
  descriptionKey: "HSE Addiction and Primary Homeless Services bounded initial assessment.",
  schema,
  ui,
  rules,
};

fs.writeFileSync(outputJsonPath, `${JSON.stringify(definition, null, 2)}\n`);
fs.writeFileSync(outputMigrationPayloadPath, `${JSON.stringify({
  schemaJson: JSON.stringify(schema, null, 2),
  uiJson: JSON.stringify(ui, null, 2),
  rulesJson: JSON.stringify(rules, null, 2),
}, null, 2)}\n`);
fs.writeFileSync(
  outputTsPath,
  `export type JsonSchemaPropertyDto = {
  type: "string" | "integer" | "number" | "boolean" | "date" | "datetime" | "enum" | "multiEnum" | "text";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  optionSetKey?: string;
  format?: string;
};

export type HseAssessmentFormDefinition = {
  code: string;
  version: number;
  status: string;
  titleKey: string;
  descriptionKey: string | null;
  schema: {
    type: "object";
    properties: Record<string, JsonSchemaPropertyDto>;
    required: string[];
  };
  ui: {
    sections: Array<{
      titleKey: string;
      items: string[];
      groups?: Array<{ title?: string; titleKey?: string; items: string[] }>;
    }>;
    widgets: Record<string, string>;
    labelKeys: Record<string, string>;
    helpKeys: Record<string, string>;
    selectOptions?: Record<string, Array<{ value: string; label: string }>>;
  };
  rules: Array<unknown>;
};

export const HSE_INITIAL_ASSESSMENT_FORM: HseAssessmentFormDefinition = ${JSON.stringify(definition, null, 2)};

export const HSE_INITIAL_ASSESSMENT_FORM_CODE = "alcohol_screening_call";
`
);

console.log(`Generated ${Object.keys(schema.properties).length} bounded HSE fields.`);
