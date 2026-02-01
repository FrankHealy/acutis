/**
 * Form Elements Library Service
 * 
 * Provides methods for working with the reusable form elements library.
 * Makes form creation 10x faster by using pre-built, validated components.
 */

import fs from 'fs';
import path from 'path';

const LIBRARY_FILE = path.join(process.cwd(), 'dat', 'mock', 'form-elements-library.json');

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
  // Load the complete library
  getLibrary(): FormElementsLibrary {
    const content = fs.readFileSync(LIBRARY_FILE, 'utf-8');
    return JSON.parse(content).formElementLibrary;
  }

  // Get all categories
  getCategories(): ElementCategory[] {
    const library = this.getLibrary();
    return library.categories;
  }

  // Get category by ID
  getCategory(categoryId: string): ElementCategory | null {
    const library = this.getLibrary();
    return library.categories.find(c => c.id === categoryId) || null;
  }

  // Get element by ID (searches all categories)
  getElement(elementId: string): FormElement | null {
    const library = this.getLibrary();
    
    // Search in categories
    for (const category of library.categories) {
      const element = category.elements.find(e => e.id === elementId);
      if (element) return element;
    }
    
    // Search in custom elements
    return library.customElements.find(e => e.id === elementId) || null;
  }

  // Get multiple elements by IDs
  getElements(elementIds: string[]): FormElement[] {
    return elementIds
      .map(id => this.getElement(id))
      .filter(e => e !== null) as FormElement[];
  }

  // Search elements by keyword
  searchElements(query: string): FormElement[] {
    const library = this.getLibrary();
    const lowerQuery = query.toLowerCase();
    const results: FormElement[] = [];
    
    // Search in all categories
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
    
    // Search in custom elements
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

  // Add custom element to library
  addCustomElement(element: Omit<FormElement, 'id'> & { id?: string }): FormElement {
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

  // Remove custom element
  removeCustomElement(elementId: string): boolean {
    const library = this.getLibrary();
    const index = library.customElements.findIndex(e => e.id === elementId);
    
    if (index === -1) return false;
    
    library.customElements.splice(index, 1);
    this.saveLibrary(library);
    
    return true;
  }

  // Expand form template using library elements
  expandFormTemplate(formTemplate: any): any {
    const expandedForm = JSON.parse(JSON.stringify(formTemplate));
    
    // Process each step
    for (const step of expandedForm.steps) {
      for (const section of step.sections) {
        // If section has elements array, expand them
        if (section.elements && Array.isArray(section.elements)) {
          const expandedFields: FormField[] = [];
          
          for (const item of section.elements) {
            if (typeof item === 'string') {
              // It's an element ID - get from library
              const element = this.getElement(item);
              if (element) {
                expandedFields.push(...element.fields);
              }
            } else {
              // It's a custom field definition
              expandedFields.push(item);
            }
          }
          
          section.fields = expandedFields;
          delete section.elements; // Remove elements array
        }
      }
    }
    
    return expandedForm;
  }

  // Get popular elements (most commonly used)
  getPopularElements(limit: number = 10): FormElement[] {
    // In a real implementation, track usage and return most used
    // For now, return the most useful ones
    const popularIds = [
      'element-name-basic',
      'element-contact-basic',
      'element-dob',
      'element-address-irish',
      'element-emergency-contact',
      'element-medications',
      'element-allergies',
      'element-treatment-consent',
      'element-privacy-consent',
      'element-session-details'
    ];
    
    return this.getElements(popularIds.slice(0, limit));
  }

  // Get elements by category
  getElementsByCategory(categoryId: string): FormElement[] {
    const category = this.getCategory(categoryId);
    return category ? category.elements : [];
  }

  // Save library (private helper)
  private saveLibrary(library: FormElementsLibrary): void {
    const content = {
      formElementLibrary: {
        ...library,
        lastUpdated: new Date().toISOString(),
      }
    };
    
    fs.writeFileSync(
      LIBRARY_FILE,
      JSON.stringify(content, null, 2),
      'utf-8'
    );
  }

  // Get element count statistics
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

  // Clone element (for customization)
  cloneElement(elementId: string, newName: string): FormElement | null {
    const original = this.getElement(elementId);
    if (!original) return null;
    
    const cloned: FormElement = {
      id: `custom-${Date.now()}`,
      name: newName,
      description: `Customized from: ${original.name}`,
      fields: JSON.parse(JSON.stringify(original.fields)), // Deep clone
    };
    
    return cloned;
  }

  // Validate element structure
  validateElement(element: FormElement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!element.id) errors.push('Element must have an ID');
    if (!element.name) errors.push('Element must have a name');
    if (!element.fields || !Array.isArray(element.fields)) {
      errors.push('Element must have fields array');
    }
    
    // Validate each field
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
}

// Singleton instance
export const formElementsLibraryService = new FormElementsLibraryService();

// Helper function for quick element expansion
export function expandElements(elementIds: string[]): FormField[] {
  const service = new FormElementsLibraryService();
  const elements = service.getElements(elementIds);
  
  const fields: FormField[] = [];
  for (const element of elements) {
    fields.push(...element.fields);
  }
  
  return fields;
}
