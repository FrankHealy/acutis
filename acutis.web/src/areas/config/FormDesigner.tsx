"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Settings, Copy, 
  ChevronDown, ChevronUp, Type, Hash, Calendar, CheckSquare, List, 
  FileText, Image as ImageIcon, Phone, Mail, AlertCircle,
  Upload, History, Package, ArrowUp, ArrowDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ElementsLibraryPanel from './ElementsLibraryPanel';
import {
  getFallbackScreeningTemplateSections,
  getScreeningTemplateSectionsFromForm,
  type ScreeningTemplateSection,
} from './screeningFormLibrary';
import {
  elementLibraryService,
  type LibraryCategory,
  type LibraryElement,
  type LibraryField,
} from '@/services/elementLibraryService';
import {
  getActiveForm,
  createAlcoholScreeningForm,
  createAdmissionForm,
  saveAsDraftAlcoholScreeningForm,
  saveAsDraftAdmissionForm,
  type FormDefinitionDto,
  type JsonSchemaDto,
  type JsonSchemaPropertyDto,
  type UpsertFormDefinitionRequest,
  type UiLayoutDto,
} from '@/areas/screening/forms/ApiClient';
import Toast from '@/units/shared/ui/Toast';

interface FormField {
  id: string;
  fieldName: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'file' | 'tel';
  dataType?: 'string' | 'integer' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'text';
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
  sourceKind?: 'canonical' | 'json' | 'unbound';
  libraryElementType?: string;
  libraryElementKind?: 'definition' | 'group';
  libraryDefinitionId?: string;
  libraryElementId?: string;
  libraryElementName?: string;
  libraryGroupName?: string;
  canonicalFieldKey?: string | null;
  optionSetKey?: string | null;
  sourceDocumentReference?: string | null;
}

interface FormSection {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  required: boolean;
  fields: FormField[];
  collapsed: boolean;
}

type SectionFieldGroup = {
  name: string;
  fields: FormField[];
};

const prettifyDesignerText = (value: string): string =>
  value
    .replace(/^designer\.generated\./i, "")
    .replace(/^screening\.section\./i, "")
    .replace(/^screening\.group\./i, "")
    .replace(/^screening\.field\./i, "")
    .replace(/^screening\.form\./i, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const resolveDesignerText = (
  value: string | null | undefined,
  translations: Record<string, string>
): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "";
  }

  const translated = translations[trimmed]?.trim();
  if (translated) {
    return translated;
  }

  if (trimmed.includes(".")) {
    return prettifyDesignerText(trimmed);
  }

  return trimmed;
};

const localizeFormDefinition = (
  form: FormDefinitionDto,
  translations: Record<string, string>
): FormDefinitionDto => ({
  ...form,
  titleKey: resolveDesignerText(form.titleKey, translations),
  descriptionKey: resolveDesignerText(form.descriptionKey, translations) || null,
  ui: {
    ...form.ui,
    sections: form.ui.sections.map((section) => ({
      ...section,
      titleKey: resolveDesignerText(section.titleKey, translations),
      groups: section.groups?.map((group) => ({
        ...group,
        titleKey: group.titleKey ? resolveDesignerText(group.titleKey, translations) : undefined,
        title: group.title ? resolveDesignerText(group.title, translations) : undefined,
      })),
    })),
    labelKeys: Object.fromEntries(
      Object.entries(form.ui.labelKeys).map(([fieldKey, label]) => [
        fieldKey,
        resolveDesignerText(label, translations),
      ])
    ),
    helpKeys: Object.fromEntries(
      Object.entries(form.ui.helpKeys).map(([fieldKey, helpText]) => [
        fieldKey,
        resolveDesignerText(helpText, translations),
      ])
    ),
    selectOptions: form.ui.selectOptions
      ? Object.fromEntries(
          Object.entries(form.ui.selectOptions).map(([fieldKey, options]) => [
            fieldKey,
            options.map((option) => ({
              ...option,
              label: resolveDesignerText(option.label, translations),
            })),
          ])
        )
      : undefined,
  },
});

const normalizeGroupName = (group?: string): string | null => {
  const trimmed = group?.trim();
  return trimmed ? trimmed : null;
};

const getSectionFieldLayout = (fields: FormField[]): { ungroupedFields: FormField[]; groups: SectionFieldGroup[] } => {
  const ungroupedFields: FormField[] = [];
  const groupsByName = new Map<string, FormField[]>();

  for (const field of fields) {
    const groupName = normalizeGroupName(field.group);
    if (!groupName) {
      ungroupedFields.push(field);
      continue;
    }

    const groupFields = groupsByName.get(groupName) ?? [];
    groupFields.push(field);
    groupsByName.set(groupName, groupFields);
  }

  const groups = Array.from(groupsByName.entries()).map(([name, groupedFields]) => ({
    name,
    fields: groupedFields,
  }));

  return { ungroupedFields, groups };
};

const renderPreviewField = (field: FormField) => (
  <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {field.type === 'textarea' ? (
      <textarea
        placeholder={field.placeholder}
        rows={4}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
      />
    ) : field.type === 'select' ? (
      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none">
        <option value="">Select...</option>
        {field.options?.map((option, i) => (
          <option key={i} value={option}>{option}</option>
        ))}
      </select>
    ) : field.type === 'checkbox' ? (
      <label className="flex items-center space-x-3 cursor-pointer">
        <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300" />
        <span className="text-gray-700">{field.placeholder || field.label}</span>
      </label>
    ) : (
      <input
        type={field.type}
        placeholder={field.placeholder}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
      />
    )}
    {field.helpText && (
      <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
    )}
  </div>
);

const slugifyKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";

const getWidgetType = (field: FormField): string => {
  switch (field.type) {
    case 'number':
      return 'number';
    case 'textarea':
      return 'textarea';
    case 'checkbox':
      return 'toggle';
    case 'select':
      return 'select';
    default:
      return 'input';
  }
};

const getSourceKindBadgeClasses = (sourceKind?: FormField["sourceKind"]): string => {
  switch (sourceKind) {
    case "canonical":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "json":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "unbound":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

const getSchemaProperty = (field: FormField): JsonSchemaPropertyDto => {
  const fieldDataType = field.dataType ?? 'string';
  const schemaType: JsonSchemaPropertyDto["type"] =
    field.type === 'checkbox' ? 'boolean'
    : field.type === 'date' ? 'date'
    : field.type === 'textarea' ? 'text'
    : field.type === 'select' ? 'string'
    : fieldDataType === 'integer' ? 'integer'
    : fieldDataType === 'number' ? 'number'
    : fieldDataType === 'boolean' ? 'boolean'
    : fieldDataType === 'date' ? 'date'
    : fieldDataType === 'text' ? 'text'
    : 'string';

  const property: JsonSchemaPropertyDto = { type: schemaType };

  if (schemaType === 'string' || schemaType === 'text') {
    if (field.validation?.min !== undefined) {
      property.minLength = field.validation.min;
    }
    if (field.validation?.max !== undefined) {
      property.maxLength = field.validation.max;
    }
    if (field.validation?.pattern) {
      property.pattern = field.validation.pattern;
    }
  }

  if (schemaType === 'integer' || schemaType === 'number') {
    if (field.validation?.min !== undefined) {
      property.minimum = field.validation.min;
    }
    if (field.validation?.max !== undefined) {
      property.maximum = field.validation.max;
    }
  }

  if (field.type === 'email' || fieldDataType === 'email') {
    property.format = 'email';
  }

  if (field.type === 'phone' || fieldDataType === 'phone') {
    property.format = 'phone';
  }

  return property;
};

const cloneTemplateField = (field: Omit<FormField, 'id'> & { id?: string }): FormField => ({
  ...field,
  id: `field-${Date.now()}-${Math.random()}`,
});

const createLibraryInstanceField = (
  field: LibraryField,
  element: Pick<LibraryElement, "id" | "name" | "kind" | "categoryName">
): FormField => ({
  id: `field-${Date.now()}-${Math.random()}`,
  fieldName: field.fieldName || field.id,
  label: field.label,
  type: field.type,
  dataType:
    field.type === "number"
      ? "number"
      : field.type === "checkbox"
        ? "boolean"
        : field.type === "date"
          ? "date"
          : field.type === "email"
            ? "email"
            : field.type === "phone" || field.type === "tel"
              ? "phone"
              : field.type === "textarea"
                ? "text"
                : "string",
  required: field.required,
  placeholder: field.placeholder,
  options: field.options,
  validation: field.validation,
  helpText: field.helpText,
  defaultValue: field.defaultValue,
  sourceKind: field.sourceKind,
  libraryElementType: field.elementType,
  libraryElementKind: element.kind,
  libraryDefinitionId: field.id,
  libraryElementId: element.id,
  libraryElementName: element.name,
  libraryGroupName: element.categoryName,
  canonicalFieldKey: field.canonicalFieldKey ?? null,
  optionSetKey: field.optionSetKey ?? null,
  sourceDocumentReference: field.sourceDocumentReference ?? null,
});

const buildSectionFromTemplate = (section: ScreeningTemplateSection): FormSection => ({
  id: `${section.id}-${Date.now()}-${Math.random()}`,
  title: section.title,
  icon: section.icon,
  subtitle: section.subtitle,
  required: section.required,
  collapsed: section.collapsed,
  fields: section.fields.map((field) => cloneTemplateField(field)),
});

const serializeSectionsForComparison = (sections: FormSection[]) =>
  JSON.stringify(
    sections.map((section) => ({
      title: section.title,
      icon: section.icon,
      subtitle: section.subtitle ?? "",
      required: section.required,
      collapsed: section.collapsed,
      fields: section.fields.map((field) => ({
        fieldName: field.fieldName,
        label: field.label,
        type: field.type,
        dataType: field.dataType ?? "string",
        required: field.required,
        placeholder: field.placeholder ?? "",
        options: field.options ?? [],
        validation: {
          min: field.validation?.min ?? null,
          max: field.validation?.max ?? null,
          pattern: field.validation?.pattern ?? "",
          customMessage: field.validation?.customMessage ?? "",
        },
        helpText: field.helpText ?? "",
        defaultValue: field.defaultValue ?? "",
        group: field.group ?? "",
        sourceKind: field.sourceKind ?? "",
        libraryElementType: field.libraryElementType ?? "",
        libraryElementKind: field.libraryElementKind ?? "",
        libraryDefinitionId: field.libraryDefinitionId ?? "",
        libraryElementId: field.libraryElementId ?? "",
        libraryElementName: field.libraryElementName ?? "",
        libraryGroupName: field.libraryGroupName ?? "",
        canonicalFieldKey: field.canonicalFieldKey ?? "",
        optionSetKey: field.optionSetKey ?? "",
        sourceDocumentReference: field.sourceDocumentReference ?? "",
      })),
    }))
  );

const createDefaultAdmissionSections = (): FormSection[] => [
  {
    id: 'personal-identity',
    title: 'Personal Identity',
    icon: 'user',
    required: true,
    collapsed: false,
    fields: [
      {
        id: 'first-name',
        fieldName: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter first name',
        validation: { min: 2, max: 50 }
      },
      {
        id: 'middle-name',
        fieldName: 'middleName',
        label: 'Middle Name',
        type: 'text',
        required: false,
        placeholder: 'Enter middle name'
      },
      {
        id: 'surname',
        fieldName: 'surname',
        label: 'Surname',
        type: 'text',
        required: true,
        placeholder: 'Enter surname',
        validation: { min: 2, max: 50 }
      },
      {
        id: 'dob',
        fieldName: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        id: 'sex',
        fieldName: 'sex',
        label: 'Sex',
        type: 'select',
        required: false,
        options: ['Male', 'Female', 'Other']
      },
      {
        id: 'previous-resident',
        fieldName: 'isPreviousResident',
        label: 'Previous Resident (Returning)',
        type: 'checkbox',
        required: false
      }
    ]
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: 'phone',
    required: false,
    collapsed: true,
    fields: [
      {
        id: 'phone',
        fieldName: 'phoneNumber',
        label: 'Phone Number',
        type: 'phone',
        required: false,
        placeholder: 'Enter phone number'
      },
      {
        id: 'email',
        fieldName: 'email',
        label: 'Email Address',
        type: 'email',
        required: false,
        placeholder: 'Enter email address'
      }
    ]
  }
];

const createDefaultScreeningSections = (): FormSection[] =>
  getFallbackScreeningTemplateSections().map((section) => buildSectionFromTemplate(section));

type FormDesignerProps = {
  initialFormType?: 'admission' | 'screening';
};

const FormDesigner = ({ initialFormType = 'admission' }: FormDesignerProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [formType, setFormType] = useState<'admission' | 'screening'>(initialFormType);
  const [formName, setFormName] = useState(initialFormType === 'screening' ? 'Alcohol Screening Form' : 'Admission Form v4');
  const [formVersion, setFormVersion] = useState(4);
  const [selectedUnit, setSelectedUnit] = useState(initialFormType === 'screening' ? 'alcohol_screening_call' : 'all');
  const [admissionType, setAdmissionType] = useState<'alcohol' | 'drugs' | 'ladies'>('alcohol');
  const [viewMode, setViewMode] = useState<'designer' | 'preview'>('designer');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'warning' | 'error' | 'info' }>({
    open: false,
    message: '',
    type: 'info',
  });

  const isScreeningForm = formType === 'screening';

  const [sections, setSections] = useState<FormSection[]>(
    isScreeningForm ? createDefaultScreeningSections() : createDefaultAdmissionSections()
  );
  const [library, setLibrary] = useState<LibraryCategory[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  useEffect(() => {
    const nextSections = isScreeningForm ? createDefaultScreeningSections() : createDefaultAdmissionSections();
    setSections(nextSections);
    setSelectedSection(nextSections[0]?.id ?? null);
    setSelectedField(null);
  }, [isScreeningForm]);

  useEffect(() => {
    const loadScreeningConfiguration = async () => {
      if (!isScreeningForm) {
        return;
      }

      const accessToken = session?.accessToken;
      if (!accessToken) {
        const fallbackSections = createDefaultScreeningSections();
        setSections(fallbackSections);
        setSelectedSection(fallbackSections[0]?.id ?? null);
        return;
      }

      try {
        const response = await getActiveForm(accessToken, 'en-IE', 'anonymous_call', null, 'alcohol_screening_call');
        const activeForm = localizeFormDefinition(response.form as FormDefinitionDto, response.translations ?? {});
        const loadedSections = getScreeningTemplateSectionsFromForm(activeForm).map((section) => buildSectionFromTemplate(section));
        setSections(loadedSections);
        setSelectedSection(loadedSections[0]?.id ?? null);
        setSelectedField(null);
        setFormName(activeForm.titleKey || 'Alcohol Screening Form');
        setFormVersion(activeForm.version);
      } catch (error) {
        console.error('Failed to load active screening form configuration:', error);
        const fallbackSections = createDefaultScreeningSections();
        setSections(fallbackSections);
        setSelectedSection(fallbackSections[0]?.id ?? null);
        setSelectedField(null);
      }
    };

    void loadScreeningConfiguration();
  }, [isScreeningForm, session?.accessToken]);

  useEffect(() => {
    const loadLibrary = async () => {
      const accessToken = session?.accessToken;
      if (!accessToken) {
        setLibrary([]);
        setIsLoadingLibrary(false);
        return;
      }

      try {
        setIsLoadingLibrary(true);
        setLibrary(await elementLibraryService.getLibrary(accessToken));
      } catch (error) {
        console.error("Failed to load element library:", error);
        setLibrary([]);
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    void loadLibrary();
  }, [session?.accessToken]);

  useEffect(() => {
    if (!toast.open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast.open]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date Picker', icon: Calendar },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'textarea', label: 'Text Area', icon: FileText },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'tel', label: 'Telephone', icon: Phone },
    { value: 'file', label: 'File Upload', icon: ImageIcon }
  ];

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      icon: 'file',
      required: false,
      collapsed: false,
      fields: []
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(sections[0]?.id || null);
    }
  };

  const addField = (sectionId: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      fieldName: 'newField',
      label: 'New Field',
      type: 'text',
      dataType: 'string',
      required: false
    };

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: [...section.fields, newField]
        };
      }
      return section;
    }));

    setSelectedField(newField.id);
  };

  const addBoundElementField = (sectionId: string, field: LibraryField, element: LibraryElement) => {
    const newField = createLibraryInstanceField(field, element);

    setSections(prev =>
      prev.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          fields: [...section.fields, newField],
        };
      })
    );
    setSelectedField(newField.id);
  };

  const applyScreeningTemplate = () => {
    const nextSections = createDefaultScreeningSections();
    const alreadyApplied =
      serializeSectionsForComparison(sections) === serializeSectionsForComparison(nextSections);

    if (alreadyApplied) {
      setToast({ open: true, message: 'The HSE screening template is already applied.', type: 'info' });
      return;
    }

    setSections(nextSections);
    setSelectedSection(nextSections[0]?.id ?? null);
    setSelectedField(null);
    setToast({ open: true, message: 'HSE screening template applied.', type: 'success' });
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.filter(f => f.id !== fieldId)
        };
      }
      return section;
    }));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, collapsed: !section.collapsed };
      }
      return section;
    }));
  };

  const cloneField = (sectionId: string, fieldId: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id !== sectionId) return section;
        const fieldIndex = section.fields.findIndex(field => field.id === fieldId);
        if (fieldIndex === -1) return section;
        const sourceField = section.fields[fieldIndex];
        const clonedField: FormField = {
          ...sourceField,
          id: `field-${Date.now()}-${Math.random()}`,
          fieldName: `${sourceField.fieldName}Copy`,
          label: `${sourceField.label} (Copy)`,
        };
        const nextFields = [...section.fields];
        nextFields.splice(fieldIndex + 1, 0, clonedField);
        return { ...section, fields: nextFields };
      })
    );
  };

  const moveField = (sectionId: string, fieldId: string, direction: 'up' | 'down') => {
    setSections(prev =>
      prev.map(section => {
        if (section.id !== sectionId) return section;
        const index = section.fields.findIndex(field => field.id === fieldId);
        if (index === -1) return section;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= section.fields.length) return section;
        const nextFields = [...section.fields];
        const [moved] = nextFields.splice(index, 1);
        nextFields.splice(targetIndex, 0, moved);
        return { ...section, fields: nextFields };
      })
    );
  };

  const addFieldsFromElement = (element: LibraryElement, sectionId: string) => {
    if (!element || !Array.isArray(element.fields)) {
      return;
    }
    const newFields = element.fields.map((field) => createLibraryInstanceField(field, element));
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: [...section.fields, ...newFields]
          };
        }
        return section;
      })
    );
    setSelectedField(newFields[0]?.id ?? null);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverSectionId(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSectionId(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);
    const elementData =
      e.dataTransfer.getData('application/json') ||
      e.dataTransfer.getData('text/plain');
    
    if (elementData) {
      try {
        const element = JSON.parse(elementData);
        addFieldsFromElement(element, sectionId);
      } catch (error) {
        console.error('Failed to parse element data:', error);
      }
    }
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || Type;
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);
  const selectedFieldData = selectedSectionData?.fields.find(f => f.id === selectedField);

  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedSection || !selectedField) return;
    setSections(sections.map(section => {
      if (section.id !== selectedSection) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== selectedField) return field;
          return { ...field, ...updates };
        })
      };
    }));
  };

  const buildFormPayload = (): UpsertFormDefinitionRequest => {
    const schema: JsonSchemaDto = {
      type: 'object',
      properties: {},
      required: [],
    };

    const ui: UiLayoutDto = {
      sections: [],
      widgets: {},
      labelKeys: {},
      helpKeys: {},
      selectOptions: {},
    };

    for (const section of sections) {
      const { ungroupedFields, groups } = getSectionFieldLayout(section.fields);

      ui.sections.push({
        titleKey: section.title,
        items: ungroupedFields.map((field) => field.fieldName || field.id),
        groups: groups.map((group) => ({
          title: group.name,
          items: group.fields.map((field) => field.fieldName || field.id),
        })),
      });

      for (const field of section.fields) {
        const fieldKey = field.fieldName || field.id;
        schema.properties[fieldKey] = getSchemaProperty(field);
        ui.widgets[fieldKey] = getWidgetType(field);
        ui.labelKeys[fieldKey] = field.label;

        if (field.required) {
          schema.required.push(fieldKey);
        }

        if (field.helpText?.trim()) {
          ui.helpKeys[fieldKey] = field.helpText.trim();
        }

        if (field.type === 'select' && field.options?.length) {
          ui.selectOptions![fieldKey] = field.options.map((option) => ({
            value: option,
            label: option,
          }));
        }
      }
    }

    return {
      titleKey: formName.trim() || 'Admission Form',
      descriptionKey: `designer.generated.${slugifyKey(formName)}`,
      schemaJson: JSON.stringify(schema, null, 2),
      uiJson: JSON.stringify(ui, null, 2),
      rulesJson: '[]',
      makeActive: true,
    };
  };

  const saveForm = async (status: 'draft' | 'active') => {
    if (selectedUnit === 'all') {
      setToast({ open: true, message: 'Select a unit before saving.', type: 'warning' });
      return;
    }

    const accessToken = session?.accessToken;
    if (!accessToken) {
      setToast({ open: true, message: 'You must be signed in to save form configuration.', type: 'warning' });
      return;
    }

    try {
      const payload = buildFormPayload();
      payload.makeActive = status === 'active';
      if (isScreeningForm) {
        if (status === 'active') {
          await createAlcoholScreeningForm(accessToken, payload);
        } else {
          await saveAsDraftAlcoholScreeningForm(accessToken, payload);
        }
      } else {
        const formCode = selectedUnit;
        if (status === 'active') {
          await createAdmissionForm(accessToken, formCode, payload);
        } else {
          await saveAsDraftAdmissionForm(accessToken, formCode, payload);
        }
      }

      if (status === 'active') {
        setToast({ open: true, message: 'Form published and set as active.', type: 'success' });
      } else {
        setToast({ open: true, message: 'Draft saved.', type: 'success' });
      }
    } catch (error) {
      console.error('Save form error:', error);
      setToast({ open: true, message: 'Failed to save form configuration.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/units/config/forms')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>Back to Forms</span>
            </button>
            <div>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">Version {formVersion} - {isScreeningForm ? 'Screening' : 'Form'} Configuration</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={formType}
              onChange={(e) => {
                const nextType = e.target.value as 'admission' | 'screening';
                setFormType(nextType);
                if (nextType === 'screening') {
                  setSelectedUnit('alcohol_screening_call');
                  setFormName('Alcohol Screening Form');
                } else {
                  setSelectedUnit('all');
                  setFormName('Admission Form v4');
                }
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="admission">Admission Form</option>
              <option value="screening">Screening Form</option>
            </select>

            {/* Unit Selector */}
            {isScreeningForm ? (
              <input
                type="text"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium min-w-[220px]"
                placeholder="alcohol_screening_call"
              />
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="all">All Units (Base Form)</option>
                <option value="alcohol">Alcohol Unit</option>
                <option value="detox">Detox Unit</option>
                <option value="drugs">Drugs Unit</option>
                <option value="ladies">Ladies Unit</option>
              </select>
            )}

            {!isScreeningForm && selectedUnit === 'detox' && (
              <select
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value as typeof admissionType)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="alcohol">Alcohol Admission</option>
                <option value="drugs">Drugs Admission</option>
                <option value="ladies">Ladies Admission</option>
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('designer')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${
                  viewMode === 'designer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Designer
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Preview
              </button>
            </div>

            <button
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Package className="h-4 w-4" />
              <span>Elements Library</span>
            </button>

            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
              <History className="h-5 w-5" />
              <span>Version History</span>
            </button>

            <button
              onClick={() => saveForm('draft')}
              className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              <Save className="h-5 w-5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => saveForm('active')}
              className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold shadow-md"
            >
              <Upload className="h-5 w-5" />
              <span>Publish Version</span>
            </button>
          </div>
        </div>
      </div>

      {/* Designer View */}
      {viewMode === 'designer' && (
        <div className="flex h-[calc(100vh-88px)]">
          {/* Sections List */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={addSection}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="p-4 space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSection(section.id)}
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSection(section.id);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedSection === section.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  } ${dragOverSectionId === section.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-bold text-gray-900">{section.title}</span>
                    </div>
                    {section.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{section.fields.length} fields</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Editor */}
          <div
            className="flex-1 overflow-y-auto p-8"
            onDragOver={(e) => {
              if (selectedSection) {
                handleDragOver(e, selectedSection);
              }
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              if (selectedSection) {
                handleDrop(e, selectedSection);
              }
            }}
          >
            {selectedSectionData ? (
              <div className="max-w-4xl mx-auto">
                {/* Section Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Section Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                      <input
                        type="text"
                        value={selectedSectionData.title}
                        onChange={(e) => {
                          setSections(sections.map(s => 
                            s.id === selectedSection ? { ...s, title: e.target.value } : s
                          ));
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle (optional)</label>
                      <input
                        type="text"
                        value={selectedSectionData.subtitle || ''}
                        onChange={(e) => {
                          setSections(sections.map(s => 
                            s.id === selectedSection ? { ...s, subtitle: e.target.value } : s
                          ));
                        }}
                        placeholder="e.g., Medical staff only"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSectionData.required}
                          onChange={(e) => {
                            setSections(sections.map(s => 
                              s.id === selectedSection ? { ...s, required: e.target.checked } : s
                            ));
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-300"
                        />
                        <span className="font-semibold text-gray-700">Required Section</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Fields ({selectedSectionData.fields.length})</h3>
                      <div className="flex items-center gap-2">
                        {isScreeningForm && (
                          <button
                            onClick={applyScreeningTemplate}
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
                          >
                            <Package className="h-4 w-4" />
                            <span>Apply HSE Screening Template</span>
                          </button>
                        )}
                        <button
                          onClick={() => addField(selectedSection!)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Field</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {isScreeningForm && (
                      <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-3">Library Elements Catalog</p>
                        <div className="space-y-4">
                          {library.map((category) => (
                            <div key={category.id}>
                              <div className="mb-2">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">{category.name}</p>
                                <p className="text-xs text-blue-700">{category.description}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {category.elements.flatMap((element) =>
                                  element.fields.map((field) => (
                                    <button
                                      key={`${element.id}-${field.fieldName}`}
                                      onClick={() => addBoundElementField(selectedSection!, field, element)}
                                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-100 transition-colors text-left"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                                        <p className="text-xs text-gray-500">{category.name} • {field.sourceKind}</p>
                                        <p className="text-[11px] text-blue-700">
                                          {field.canonicalFieldKey || field.optionSetKey || field.sourceDocumentReference || "library"}
                                        </p>
                                      </div>
                                      <Plus className="h-4 w-4 text-blue-700" />
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dragOverSectionId === selectedSectionData.id && (
                      <div className="border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm font-medium">
                        Drop element here to add fields to this section
                      </div>
                    )}
                    {selectedSectionData.fields.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No fields in this section</p>
                        <button
                          onClick={() => addField(selectedSection!)}
                          className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Add your first field
                        </button>
                      </div>
                    ) : (
                      selectedSectionData.fields.map((field, index) => {
                        const FieldIcon = getFieldIcon(field.type);
                        const isSelected = selectedField === field.id;
                        const groupName = normalizeGroupName(field.group);

                        return (
                          <div
                            key={field.id}
                            onClick={() => setSelectedField(field.id)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FieldIcon className="h-4 w-4 text-gray-600" />
                                    <span className="font-bold text-gray-900">{field.label}</span>
                                    {field.required && (
                                      <span className="text-red-500 font-bold">*</span>
                                    )}
                                  </div>
                                  {field.sourceKind && (
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getSourceKindBadgeClasses(field.sourceKind)}`}>
                                        {field.sourceKind}
                                      </span>
                                      {field.libraryElementType && (
                                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                                          {field.libraryElementType}
                                        </span>
                                      )}
                                      {field.libraryGroupName && (
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                          {field.libraryGroupName}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>Type: <span className="font-medium">{field.type}</span></p>
                                    {field.dataType && (
                                      <p>Data Type: <span className="font-medium">{field.dataType}</span></p>
                                    )}
                                    {groupName && (
                                      <p>Group: <span className="font-medium">{groupName}</span></p>
                                    )}
                                    <p>Field Name: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{field.fieldName}</span></p>
                                    {(field.validation?.min !== undefined || field.validation?.max !== undefined) && (
                                      <p>
                                        Constraints: <span className="font-medium">{field.validation?.min ?? '-'} to {field.validation?.max ?? '-'}</span>
                                      </p>
                                    )}
                                    {field.validation?.pattern && (
                                      <p>Regex: <span className="font-mono text-xs">{field.validation.pattern}</span></p>
                                    )}
                                    {field.placeholder && (
                                      <p>Placeholder: <span className="italic">{field.placeholder}</span></p>
                                    )}
                                    {field.canonicalFieldKey && (
                                      <p>Canonical Field: <span className="font-medium">{field.canonicalFieldKey}</span></p>
                                    )}
                                    {field.optionSetKey && (
                                      <p>Option Set: <span className="font-medium">{field.optionSetKey}</span></p>
                                    )}
                                    {field.sourceDocumentReference && (
                                      <p>Source Document: <span className="font-medium">{field.sourceDocumentReference}</span></p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveField(selectedSection!, field.id, 'up');
                                  }}
                                  disabled={index === 0}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveField(selectedSection!, field.id, 'down');
                                  }}
                                  disabled={index === selectedSectionData.fields.length - 1}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cloneField(selectedSection!, field.id);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Copy className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteField(selectedSection!, field.id);
                                  }}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Settings className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Section Selected</h3>
                  <p className="text-gray-500">Select a section from the left to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Field Properties Panel */}
          {selectedFieldData && (
            <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Field Properties</h3>
              
              <div className="space-y-6">
                {selectedFieldData.sourceKind && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getSourceKindBadgeClasses(selectedFieldData.sourceKind)}`}>
                        {selectedFieldData.sourceKind}
                      </span>
                      {selectedFieldData.libraryElementType && (
                        <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                          {selectedFieldData.libraryElementType}
                        </span>
                      )}
                      {selectedFieldData.libraryGroupName && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          {selectedFieldData.libraryGroupName}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>Library element: <span className="font-semibold">{selectedFieldData.libraryElementName || "Library definition"}</span></p>
                      <p>Form instance field: <span className="font-semibold">{selectedFieldData.fieldName}</span></p>
                      {selectedFieldData.canonicalFieldKey && (
                        <p>Canonical field key: <span className="font-semibold">{selectedFieldData.canonicalFieldKey}</span></p>
                      )}
                      {selectedFieldData.optionSetKey && (
                        <p>Option set key: <span className="font-semibold">{selectedFieldData.optionSetKey}</span></p>
                      )}
                      {selectedFieldData.sourceDocumentReference && (
                        <p>Source document: <span className="font-semibold">{selectedFieldData.sourceDocumentReference}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Basic Properties */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                  <input
                    type="text"
                    value={selectedFieldData.label}
                    onChange={(e) => updateSelectedField({ label: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Field Name</label>
                  <input
                    type="text"
                    value={selectedFieldData.fieldName}
                    onChange={(e) => updateSelectedField({ fieldName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in API/database (camelCase recommended)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Group (optional)</label>
                  <input
                    type="text"
                    value={selectedFieldData.group || ''}
                    onChange={(e) => updateSelectedField({ group: e.target.value || undefined })}
                    placeholder="e.g., Next of Kin"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep this field outside any group.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type</label>
                  <select
                    value={selectedFieldData.type}
                    onChange={(e) => {
                      const nextType = e.target.value as FormField['type'];
                      const defaultDataType: FormField['dataType'] =
                        nextType === 'number' ? 'number'
                        : nextType === 'checkbox' ? 'boolean'
                        : nextType === 'date' ? 'date'
                        : nextType === 'email' ? 'email'
                        : nextType === 'phone' ? 'phone'
                        : nextType === 'textarea' ? 'text'
                        : 'string';
                      updateSelectedField({ type: nextType, dataType: defaultDataType });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data Type</label>
                  <select
                    value={selectedFieldData.dataType || 'string'}
                    onChange={(e) => updateSelectedField({ dataType: e.target.value as FormField['dataType'] })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="string">String</option>
                    <option value="integer">Integer</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={selectedFieldData.placeholder || ''}
                    placeholder="e.g., Enter first name"
                    onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Help Text</label>
                  <textarea
                    value={selectedFieldData.helpText || ''}
                    placeholder="Additional guidance for users..."
                    rows={3}
                    onChange={(e) => updateSelectedField({ helpText: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Validation */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Validation Rules</h4>
                  
                  <label className="flex items-center space-x-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateSelectedField({ required: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300"
                    />
                    <span className="font-semibold text-gray-700">Required Field</span>
                  </label>

                  {(selectedFieldData.type === 'text' || selectedFieldData.type === 'textarea' || selectedFieldData.type === 'phone' || selectedFieldData.type === 'email') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Min Length</label>
                        <input
                          type="number"
                          value={selectedFieldData.validation?.min || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value);
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                min: value,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Max Length</label>
                        <input
                          type="number"
                          value={selectedFieldData.validation?.max || ''}
                          placeholder="500"
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value);
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                max: value,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {selectedFieldData.type === 'number' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Min Value</label>
                        <input
                          type="number"
                          value={selectedFieldData.validation?.min ?? ''}
                          placeholder="0"
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value);
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                min: value,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Max Value</label>
                        <input
                          type="number"
                          value={selectedFieldData.validation?.max ?? ''}
                          placeholder="100"
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value);
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                max: value,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {(selectedFieldData.type === 'text' || selectedFieldData.type === 'textarea' || selectedFieldData.type === 'email' || selectedFieldData.type === 'phone') && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Regex Pattern (optional)</label>
                        <input
                          type="text"
                          value={selectedFieldData.validation?.pattern || ''}
                          placeholder="e.g. ^[+0-9()\\-\\s]+$"
                          onChange={(e) => {
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                pattern: e.target.value || undefined,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Validation Message</label>
                        <input
                          type="text"
                          value={selectedFieldData.validation?.customMessage || ''}
                          placeholder="Shown when regex fails"
                          onChange={(e) => {
                            updateSelectedField({
                              validation: {
                                ...selectedFieldData.validation,
                                customMessage: e.target.value || undefined,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Options for Select */}
                {selectedFieldData.type === 'select' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">Dropdown Options</h4>
                    <div className="space-y-2">
                      {(selectedFieldData.options || []).map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const nextOptions = [...(selectedFieldData.options || [])];
                              nextOptions[index] = e.target.value;
                              updateSelectedField({ options: nextOptions });
                            }}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const nextOptions = [...(selectedFieldData.options || [])];
                              nextOptions.splice(index, 1);
                              updateSelectedField({ options: nextOptions });
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const nextOptions = [...(selectedFieldData.options || []), 'New option'];
                          updateSelectedField({ options: nextOptions });
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Preview Mode</p>
                  <p className="text-sm text-blue-700">This is how the form will appear to users. Switch back to Designer mode to make changes.</p>
                </div>
              </div>
            </div>

            {/* Preview of Form */}
            <div className="space-y-6">
              {sections.map(section => {
                const { ungroupedFields, groups } = getSectionFieldLayout(section.fields);

                return (
                  <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                          {section.required && (
                            <p className="text-sm text-red-600 font-medium">Required</p>
                          )}
                          {section.subtitle && (
                            <p className="text-sm text-gray-500">{section.subtitle}</p>
                          )}
                        </div>
                      </div>
                      {section.collapsed ? (
                        <ChevronDown className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronUp className="h-6 w-6 text-gray-400" />
                      )}
                    </button>

                    {!section.collapsed && (
                      <div className="p-6 border-t border-gray-200 bg-gray-50">
                        {ungroupedFields.length > 0 && (
                          <div className="grid grid-cols-2 gap-6">
                            {ungroupedFields.map((field) => renderPreviewField(field))}
                          </div>
                        )}

                        {groups.length > 0 && (
                          <div className={`${ungroupedFields.length > 0 ? 'mt-6' : ''} space-y-4`}>
                            {groups.map((group) => (
                              <div key={`${section.id}-${group.name}`} className="rounded-2xl border border-gray-200 bg-white p-5">
                                <div className="mb-4">
                                  <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">{group.name}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  {group.fields.map((field) => renderPreviewField(field))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Elements Library Panel */}
      <ElementsLibraryPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onElementDrop={addFieldsFromElement}
        library={library}
        isLoadingLibrary={isLoadingLibrary}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </div>
  );
};

export default FormDesigner;
