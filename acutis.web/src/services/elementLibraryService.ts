import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type LibraryField = {
  id: string;
  fieldName: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea" | "email" | "phone" | "file" | "tel";
  elementType: string;
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
  sourceKind: "canonical" | "json" | "unbound";
  canonicalFieldKey?: string | null;
  optionSetKey?: string | null;
  sourceDocumentReference?: string | null;
  version: number;
  status: string;
};

export type LibraryElement = {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryName: string;
  kind: "definition" | "group";
  sourceKind: "canonical" | "json" | "unbound";
  canonicalFieldKey?: string | null;
  optionSetKey?: string | null;
  sourceDocumentReference?: string | null;
  version: number;
  status: string;
  fields: LibraryField[];
};

export type LibraryCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  sourceDocumentReference?: string | null;
  version: number;
  status: string;
  elements: LibraryElement[];
};

type ElementLibraryResponseDto = {
  groups: ElementGroupDto[];
};

type ElementGroupDto = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  sourceDocumentReference?: string | null;
  version: number;
  status: string;
  displayOrder: number;
  definitions: ElementDefinitionDto[];
};

type ElementDefinitionDto = {
  id: string;
  groupId?: string | null;
  key: string;
  label: string;
  description?: string | null;
  helpText?: string | null;
  elementType: string;
  sourceKind: "canonical" | "json" | "unbound";
  canonicalFieldKey?: string | null;
  optionSetKey?: string | null;
  sourceDocumentReference?: string | null;
  version: number;
  status: string;
  displayOrder: number;
  fieldConfig: {
    required?: boolean;
    placeholder?: string | null;
    defaultValue?: string | null;
    validation?: {
      min?: number | null;
      max?: number | null;
      pattern?: string | null;
      customMessage?: string | null;
    } | null;
    options?: Array<{ value: string; label: string }> | null;
  };
};

const getCategoryIcon = (groupKey: string): string => {
  const normalized = groupKey.toLowerCase();
  if (normalized.includes("identity")) return "user";
  if (normalized.includes("safety")) return "shield";
  if (normalized.includes("alcohol")) return "alert-triangle";
  if (normalized.includes("notes")) return "file-text";
  return "package";
};

const normalizeFieldType = (value: string): LibraryField["type"] => {
  switch (value) {
    case "textarea":
    case "number":
    case "date":
    case "checkbox":
    case "email":
    case "phone":
    case "file":
    case "tel":
      return value;
    case "select":
    case "single-choice":
      return "select";
    case "yes-no":
      return "select";
    case "multi-checkbox":
    case "checklist":
      return "checkbox";
    case "signature":
    case "instructional-text":
      return "text";
    case "matrix/rating":
      return "number";
    default:
      return "text";
  }
};

const mapDefinitionToField = (definition: ElementDefinitionDto): LibraryField => ({
  id: definition.id,
  fieldName: definition.key,
  label: definition.label,
  type: normalizeFieldType(definition.elementType),
  elementType: definition.elementType,
  required: Boolean(definition.fieldConfig.required),
  placeholder: definition.fieldConfig.placeholder ?? undefined,
  options:
    definition.elementType === "yes-no"
      ? ["Yes", "No"]
      : definition.fieldConfig.options?.map((option) => option.label) ?? undefined,
  validation: definition.fieldConfig.validation
    ? {
        min: definition.fieldConfig.validation.min ?? undefined,
        max: definition.fieldConfig.validation.max ?? undefined,
        pattern: definition.fieldConfig.validation.pattern ?? undefined,
        customMessage: definition.fieldConfig.validation.customMessage ?? undefined,
      }
    : undefined,
  helpText: definition.helpText ?? undefined,
  defaultValue: definition.fieldConfig.defaultValue ?? undefined,
  sourceKind: definition.sourceKind,
  canonicalFieldKey: definition.canonicalFieldKey ?? null,
  optionSetKey: definition.optionSetKey ?? null,
  sourceDocumentReference: definition.sourceDocumentReference ?? null,
  version: definition.version,
  status: definition.status,
});

const mapGroupToCategory = (group: ElementGroupDto): LibraryCategory => {
  const definitionElements: LibraryElement[] = group.definitions
    .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label))
    .map((definition) => ({
      id: definition.id,
      name: definition.label,
      description: definition.description ?? "Reusable library element.",
      category: group.key,
      categoryName: group.name,
      kind: "definition",
      sourceKind: definition.sourceKind,
      canonicalFieldKey: definition.canonicalFieldKey ?? null,
      optionSetKey: definition.optionSetKey ?? null,
      sourceDocumentReference: definition.sourceDocumentReference ?? group.sourceDocumentReference ?? null,
      version: definition.version,
      status: definition.status,
      fields: [mapDefinitionToField(definition)],
    }));

  const packFields = group.definitions
    .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label))
    .map(mapDefinitionToField);

  const packElement: LibraryElement = {
    id: `${group.id}-pack`,
    name: `${group.name} Pack`,
    description: group.description ?? `Reusable element group for ${group.name}.`,
    category: group.key,
    categoryName: group.name,
    kind: "group",
    sourceKind: packFields.every((field) => field.sourceKind === "canonical")
      ? "canonical"
      : packFields.every((field) => field.sourceKind === "json")
        ? "json"
        : "unbound",
    canonicalFieldKey: null,
    optionSetKey: null,
    sourceDocumentReference: group.sourceDocumentReference ?? null,
    version: group.version,
    status: group.status,
    fields: packFields,
  };

  return {
    id: group.key,
    name: group.name,
    description: group.description ?? "Reusable library group.",
    icon: getCategoryIcon(group.key),
    sourceDocumentReference: group.sourceDocumentReference ?? null,
    version: group.version,
    status: group.status,
    elements: [packElement, ...definitionElements],
  };
};

export const elementLibraryService = {
  async getLibrary(accessToken?: string | null): Promise<LibraryCategory[]> {
    const response = await fetch(`${getApiBaseUrl()}/api/configuration/elements-library`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Element library request failed (${response.status})`);
    }

    const payload = (await response.json()) as ElementLibraryResponseDto;
    return (payload.groups ?? [])
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      .map(mapGroupToCategory);
  },
};
