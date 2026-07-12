import type {
  FormDefinitionDto,
  JsonSchemaPropertyDto,
  UiGroupDto,
  UiSectionDto,
} from "@/areas/screening/forms/ApiClient";

export type LibraryField = {
  id: string;
  fieldName: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea" | "email" | "phone" | "file" | "tel";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  helpText?: string;
  defaultValue?: string;
  group?: string;
};

export type LibraryElement = {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: LibraryField[];
};

export type LibraryCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: LibraryElement[];
};

export type ScreeningTemplateSection = {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  required: boolean;
  collapsed: boolean;
  fields: LibraryField[];
};

const toSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "group";

const toTitle = (value: string): string =>
  value
    .replace(/^designer\.generated\./i, "")
    .replace(/^screening\.section\./i, "")
    .replace(/^screening\.group\./i, "")
    .replace(/^screening\.field\./i, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getSectionIcon = (title: string): string => {
  const normalized = title.toLowerCase();
  if (normalized.includes("caller") || normalized.includes("identity") || normalized.includes("contact")) return "user";
  if (normalized.includes("alcohol") || normalized.includes("substance") || normalized.includes("drink")) return "alert-triangle";
  if (normalized.includes("safety") || normalized.includes("risk") || normalized.includes("stability")) return "shield";
  if (normalized.includes("follow") || normalized.includes("note") || normalized.includes("outcome")) return "file-text";
  return "file-text";
};

const getFieldType = (
  property: JsonSchemaPropertyDto | undefined,
  widget: string | undefined
): LibraryField["type"] => {
  if (widget === "textarea" || property?.type === "text") return "textarea";
  if (widget === "toggle" || property?.type === "boolean") return "checkbox";
  if (widget === "select" || property?.type === "enum") return "select";
  if (widget === "number" || property?.type === "integer" || property?.type === "number") return "number";
  if (property?.type === "date") return "date";
  if (property?.format === "email") return "email";
  if (property?.format === "phone") return "phone";
  return "text";
};

const mapField = (
  form: FormDefinitionDto,
  fieldKey: string,
  groupName?: string
): LibraryField => {
  const property = form.schema.properties[fieldKey];
  const fieldType = getFieldType(property, form.ui.widgets[fieldKey]);
  const selectOptions = form.ui.selectOptions?.[fieldKey]?.map((option) => option.value);

  return {
    id: fieldKey,
    fieldName: fieldKey,
    label: form.ui.labelKeys[fieldKey] || toTitle(fieldKey),
    type: fieldType,
    required: form.schema.required.includes(fieldKey),
    options: fieldType === "select" ? selectOptions : undefined,
    validation: {
      min: property?.type === "integer" || property?.type === "number" ? property.minimum : property?.minLength,
      max: property?.type === "integer" || property?.type === "number" ? property.maximum : property?.maxLength,
      pattern: property?.pattern,
    },
    helpText: form.ui.helpKeys[fieldKey],
    group: groupName,
  };
};

const buildElement = (
  sectionTitle: string,
  group: UiGroupDto | null,
  fields: LibraryField[]
): LibraryElement => {
  const groupTitle = group?.title?.trim() || (group?.titleKey ? toTitle(group.titleKey) : sectionTitle);
  const categoryId = `screening-${toSlug(sectionTitle)}-${toSlug(groupTitle)}`;
  return {
    id: `${categoryId}-pack`,
    name: `${groupTitle} Pack`,
    description: `${groupTitle} fields from ${sectionTitle}.`,
    category: categoryId,
    fields,
  };
};

const mapSectionToCategories = (form: FormDefinitionDto, section: UiSectionDto): LibraryCategory[] => {
  const sectionTitle = toTitle(section.titleKey);
  const sectionIcon = getSectionIcon(sectionTitle);
  const categories: LibraryCategory[] = [];

  if (section.items.length > 0) {
    const fields = section.items.map((fieldKey) => mapField(form, fieldKey));
    categories.push({
      id: `screening-${toSlug(sectionTitle)}`,
      name: sectionTitle,
      description: `${sectionTitle} fields from the active screening form.`,
      icon: sectionIcon,
      elements: [buildElement(sectionTitle, null, fields)],
    });
  }

  for (const group of section.groups ?? []) {
    const groupTitle = group.title?.trim() || (group.titleKey ? toTitle(group.titleKey) : sectionTitle);
    const fields = group.items.map((fieldKey) => mapField(form, fieldKey, groupTitle));
    categories.push({
      id: `screening-${toSlug(sectionTitle)}-${toSlug(groupTitle)}`,
      name: groupTitle,
      description: `${groupTitle} fields from ${sectionTitle}.`,
      icon: sectionIcon,
      elements: [buildElement(sectionTitle, group, fields)],
    });
  }

  return categories;
};

export const getFallbackScreeningTemplateSections = (): ScreeningTemplateSection[] => {
  const fallbackForm = getFallbackScreeningFormDefinition();
  return getScreeningTemplateSectionsFromForm(fallbackForm);
};

export const getFallbackScreeningElementsLibrary = (): LibraryCategory[] => {
  const fallbackForm = getFallbackScreeningFormDefinition();
  return getScreeningElementsLibraryFromForm(fallbackForm);
};

export const getScreeningTemplateSectionsFromForm = (
  form: FormDefinitionDto | null | undefined
): ScreeningTemplateSection[] => {
  if (!form) {
    return getFallbackScreeningTemplateSections();
  }

  return form.ui.sections.map((section, index) => {
    const title = toTitle(section.titleKey);
    const groupedFields = (section.groups ?? []).flatMap((group) =>
      group.items.map((fieldKey) => mapField(form, fieldKey, group.title?.trim() || (group.titleKey ? toTitle(group.titleKey) : undefined)))
    );
    const ungroupedFields = section.items.map((fieldKey) => mapField(form, fieldKey));

    return {
      id: `screening-section-${index + 1}-${toSlug(title)}`,
      title,
      icon: getSectionIcon(title),
      subtitle: `Configured from active form section ${title}.`,
      required: ungroupedFields.concat(groupedFields).some((field) => field.required),
      collapsed: false,
      fields: [...ungroupedFields, ...groupedFields],
    };
  });
};

export const getScreeningElementsLibraryFromForm = (
  form: FormDefinitionDto | null | undefined
): LibraryCategory[] => {
  if (!form) {
    return getFallbackScreeningElementsLibrary();
  }

  const categories = form.ui.sections.flatMap((section) => mapSectionToCategories(form, section));
  return categories.length > 0 ? categories : getFallbackScreeningElementsLibrary();
};

const getFallbackScreeningFormDefinition = (): FormDefinitionDto => ({
  code: "alcohol_screening_call",
  version: 1,
  status: "published",
  titleKey: "Alcohol Screening Form",
  descriptionKey: "designer.generated.alcohol-screening-form",
  schema: {
    type: "object",
    properties: {
      callerName: { type: "string", minLength: 2, maxLength: 120 },
      phoneNumber: { type: "string", minLength: 8, maxLength: 20, pattern: "^\\+?[1-9][0-9()\\-\\s]{7,19}$", format: "phone" },
      emailAddress: { type: "string", maxLength: 120, pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", format: "email" },
      age: { type: "integer", minimum: 16, maximum: 120 },
      drinkType: { type: "enum" },
      drinkTypeOther: { type: "string", maxLength: 80 },
      drinksPerDay: { type: "number", minimum: 0, maximum: 100 },
      drinksPerDayUnit: { type: "enum" },
      daysDrinkingPerWeek: { type: "integer", minimum: 0, maximum: 7 },
      lastDrinkDate: { type: "date" },
      withdrawalHistory: { type: "boolean" },
      historyOfSeizures: { type: "boolean" },
      referralSource: { type: "enum" },
      currentlyUnsafe: { type: "boolean" },
      suicidalIdeation: { type: "boolean" },
      housingStatus: { type: "enum" },
      supportNetwork: { type: "string", maxLength: 300 },
      medicalNotes: { type: "text", maxLength: 1000 },
      assessorNotes: { type: "text", maxLength: 2000 },
      nextSteps: { type: "text", maxLength: 1000 },
    },
    required: ["callerName", "phoneNumber", "age", "drinkType", "drinksPerDay", "drinksPerDayUnit", "referralSource", "housingStatus"],
  },
  ui: {
    sections: [
      {
        titleKey: "screening.section.caller_details",
        items: [],
        groups: [
          { title: "Identity", items: ["callerName", "age"] },
          { title: "Contact", items: ["phoneNumber", "emailAddress"] },
        ],
      },
      {
        titleKey: "screening.section.alcohol_use",
        items: [],
        groups: [
          { title: "Alcohol Pattern", items: ["drinkType", "drinkTypeOther", "drinksPerDay", "drinksPerDayUnit", "daysDrinkingPerWeek", "lastDrinkDate"] },
          { title: "Risk", items: ["withdrawalHistory", "historyOfSeizures"] },
          { title: "Referral", items: ["referralSource"] },
        ],
      },
      {
        titleKey: "screening.section.stability",
        items: [],
        groups: [
          { title: "Safety", items: ["currentlyUnsafe", "suicidalIdeation"] },
          { title: "Stability", items: ["housingStatus", "supportNetwork"] },
        ],
      },
      {
        titleKey: "screening.section.follow_up",
        items: [],
        groups: [
          { title: "Clinical Notes", items: ["medicalNotes", "assessorNotes"] },
          { title: "Outcome", items: ["nextSteps"] },
        ],
      },
    ],
    widgets: {
      callerName: "input",
      phoneNumber: "input",
      emailAddress: "input",
      age: "number",
      drinkType: "select",
      drinkTypeOther: "input",
      drinksPerDay: "number",
      drinksPerDayUnit: "select",
      daysDrinkingPerWeek: "number",
      lastDrinkDate: "input",
      withdrawalHistory: "toggle",
      historyOfSeizures: "toggle",
      referralSource: "select",
      currentlyUnsafe: "toggle",
      suicidalIdeation: "toggle",
      housingStatus: "select",
      supportNetwork: "input",
      medicalNotes: "textarea",
      assessorNotes: "textarea",
      nextSteps: "textarea",
    },
    labelKeys: {
      callerName: "Caller Name",
      phoneNumber: "Phone Number",
      emailAddress: "Email Address",
      age: "Age",
      drinkType: "Drink Type",
      drinkTypeOther: "If Other, Specify Drink Type",
      drinksPerDay: "Drinks Per Day",
      drinksPerDayUnit: "Drink Unit",
      daysDrinkingPerWeek: "Days Drinking Per Week",
      lastDrinkDate: "Last Drink Date",
      withdrawalHistory: "Withdrawal History",
      historyOfSeizures: "History of Seizures",
      referralSource: "Referral Source",
      currentlyUnsafe: "Immediate Concern",
      suicidalIdeation: "Suicidal Ideation",
      housingStatus: "Housing Status",
      supportNetwork: "Support Network",
      medicalNotes: "Medical Notes",
      assessorNotes: "Assessor Notes",
      nextSteps: "Next Steps",
    },
    helpKeys: {
      drinksPerDay: "Approximate average on drinking days. Select the unit used for this quantity.",
      drinksPerDayUnit: "Record whether the quantity is in pints, litres or bottles.",
      assessorNotes: "Add contextual details for follow-up and handover.",
      nextSteps: "Capture agreed actions and ownership.",
    },
    selectOptions: {
      drinkType: [
        { value: "beer", label: "Beer" },
        { value: "wine", label: "Wine" },
        { value: "spirits", label: "Spirits" },
        { value: "cider", label: "Cider" },
        { value: "other", label: "Other" },
      ],
      referralSource: [
        { value: "gp", label: "GP" },
        { value: "family", label: "Family" },
        { value: "self", label: "Self" },
        { value: "other", label: "Other" },
      ],
      drinksPerDayUnit: [
        { value: "pints", label: "Pints" },
        { value: "litres", label: "Litres" },
        { value: "bottles", label: "Bottles" },
      ],
      housingStatus: [
        { value: "stable", label: "Stable Accommodation" },
        { value: "temporary", label: "Temporary Accommodation" },
        { value: "homeless", label: "Homeless" },
        { value: "supported", label: "Supported Accommodation" },
        { value: "other", label: "Other" },
      ],
    },
  },
  rules: [],
});
