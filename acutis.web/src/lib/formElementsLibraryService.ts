/**
 * Form Elements Library Service
 *
 * Reads from the form-generator mock data so the UI can browse elements.
 */

import fs from "fs";
import path from "path";

const LIBRARY_FILE = path.join(
  process.cwd(),
  "src",
  "components",
  "form-generator",
  "data",
  "mock",
  "form-elements-library.json"
);

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  [key: string]: any;
}

interface FormElement {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}

interface ElementCategory {
  id: string;
  name: string;
  description: string;
  elements: FormElement[];
}

interface FormElementsLibrary {
  version: string;
  lastUpdated: string;
  categories: ElementCategory[];
  customElements: FormElement[];
}

export class FormElementsLibraryService {
  getLibrary(): FormElementsLibrary {
    const content = fs.readFileSync(LIBRARY_FILE, "utf-8");
    return JSON.parse(content).formElementLibrary;
  }

  getCategories(): ElementCategory[] {
    const library = this.getLibrary();
    return library.categories;
  }

  getCategory(categoryId: string): ElementCategory | null {
    const library = this.getLibrary();
    return library.categories.find((c) => c.id === categoryId) || null;
  }

  getElement(elementId: string): FormElement | null {
    const library = this.getLibrary();

    for (const category of library.categories) {
      const element = category.elements.find((e) => e.id === elementId);
      if (element) return element;
    }

    return library.customElements.find((e) => e.id === elementId) || null;
  }

  getElements(elementIds: string[]): FormElement[] {
    return elementIds.map((id) => this.getElement(id)).filter(Boolean) as FormElement[];
  }

  searchElements(query: string): FormElement[] {
    const library = this.getLibrary();
    const lowerQuery = query.toLowerCase();
    const results: FormElement[] = [];

    for (const category of library.categories) {
      for (const element of category.elements) {
        if (
          element.name.toLowerCase().includes(lowerQuery) ||
          element.description.toLowerCase().includes(lowerQuery) ||
          element.id.toLowerCase().includes(lowerQuery)
        ) {
          results.push(element);
        }
      }
    }

    for (const element of library.customElements) {
      if (
        element.name.toLowerCase().includes(lowerQuery) ||
        element.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push(element);
      }
    }

    return results;
  }

  addCustomElement(element: Omit<FormElement, "id"> & { id?: string }): FormElement {
    const library = this.getLibrary();

    const newElement: FormElement = {
      id: element.id || `custom-${Date.now()}`,
      name: element.name,
      description: element.description,
      fields: element.fields,
    };

    library.customElements.push(newElement);
    this.saveLibrary(library);

    return newElement;
  }

  removeCustomElement(elementId: string): boolean {
    const library = this.getLibrary();
    const index = library.customElements.findIndex((e) => e.id === elementId);

    if (index === -1) return false;

    library.customElements.splice(index, 1);
    this.saveLibrary(library);

    return true;
  }

  expandFormTemplate(formTemplate: any): any {
    const expandedForm = JSON.parse(JSON.stringify(formTemplate));

    for (const step of expandedForm.steps || []) {
      for (const section of step.sections || []) {
        if (section.elements && Array.isArray(section.elements)) {
          const expandedFields: FormField[] = [];

          for (const item of section.elements) {
            if (typeof item === "string") {
              const element = this.getElement(item);
              if (element) {
                expandedFields.push(...element.fields);
              }
            } else {
              expandedFields.push(item);
            }
          }

          section.fields = expandedFields;
          delete section.elements;
        }
      }
    }

    return expandedForm;
  }

  getPopularElements(limit: number = 10): FormElement[] {
    const popularIds = [
      "element-name-basic",
      "element-contact-basic",
      "element-dob",
      "element-address-irish",
      "element-emergency-contact",
      "element-medications",
      "element-allergies",
      "element-treatment-consent",
      "element-privacy-consent",
      "element-session-details",
    ];

    return this.getElements(popularIds.slice(0, limit));
  }

  getElementsByCategory(categoryId: string): FormElement[] {
    const category = this.getCategory(categoryId);
    return category ? category.elements : [];
  }

  getStatistics() {
    const library = this.getLibrary();

    const stats = {
      totalElements: 0,
      customElements: library.customElements.length,
      categoriesCount: library.categories.length,
      byCategory: {} as Record<string, number>,
    };

    for (const category of library.categories) {
      stats.byCategory[category.name] = category.elements.length;
      stats.totalElements += category.elements.length;
    }

    stats.totalElements += library.customElements.length;

    return stats;
  }

  cloneElement(elementId: string, newName: string): FormElement | null {
    const original = this.getElement(elementId);
    if (!original) return null;

    const cloned: FormElement = {
      id: `custom-${Date.now()}`,
      name: newName,
      description: `Customized from: ${original.name}`,
      fields: JSON.parse(JSON.stringify(original.fields)),
    };

    return cloned;
  }

  validateElement(element: FormElement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!element.id) errors.push("Element must have an ID");
    if (!element.name) errors.push("Element must have a name");
    if (!element.fields || !Array.isArray(element.fields)) {
      errors.push("Element must have fields array");
    }

    if (element.fields) {
      for (const field of element.fields) {
        if (!field.id) errors.push(`Field missing ID: ${JSON.stringify(field)}`);
        if (!field.type) errors.push(`Field missing type: ${field.id}`);
        if (!field.label) errors.push(`Field missing label: ${field.id}`);
        if (field.required === undefined) {
          errors.push(`Field missing required flag: ${field.id}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private saveLibrary(library: FormElementsLibrary): void {
    const content = {
      formElementLibrary: {
        ...library,
        lastUpdated: new Date().toISOString(),
      },
    };

    fs.writeFileSync(LIBRARY_FILE, JSON.stringify(content, null, 2), "utf-8");
  }
}

export const formElementsLibraryService = new FormElementsLibraryService();

export function expandElements(elementIds: string[]): FormField[] {
  const service = new FormElementsLibraryService();
  const elements = service.getElements(elementIds);

  const fields: FormField[] = [];
  for (const element of elements) {
    fields.push(...element.fields);
  }

  return fields;
}
