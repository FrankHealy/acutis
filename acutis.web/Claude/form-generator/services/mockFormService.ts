/**
 * Form Configuration Extensions for Mock Data Service
 * 
 * Add these methods to your mockDataService.ts class
 */

// Add to MockAdmissionsService class:

interface FormConfiguration {
  id: string;
  name: string;
  unit: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  steps: FormStep[];
  validationRules?: any;
}

interface FormStep {
  id: string;
  title: string;
  order: number;
  sections: FormSection[];
}

interface FormSection {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: any;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: string;
  rows?: number;
}

interface FormsData {
  formConfigurations: FormConfiguration[];
}

export class MockAdmissionsService {
  // ... existing methods ...

  // Get form configuration by ID
  getFormConfiguration(formId: string): FormConfiguration | null {
    const data = readJsonFile<FormsData>('forms.json');
    return data.formConfigurations.find(f => f.id === formId) || null;
  }

  // Get form configuration by unit
  getFormConfigurationByUnit(unit: string): FormConfiguration | null {
    const data = readJsonFile<FormsData>('forms.json');
    return data.formConfigurations.find(
      f => f.unit === unit && f.status === 'active'
    ) || null;
  }

  // List all form configurations
  getFormConfigurations(filters?: {
    unit?: string;
    status?: 'draft' | 'active' | 'archived';
  }): FormConfiguration[] {
    const data = readJsonFile<FormsData>('forms.json');
    let forms = data.formConfigurations;

    if (filters?.unit) {
      forms = forms.filter(f => f.unit === filters.unit);
    }

    if (filters?.status) {
      forms = forms.filter(f => f.status === filters.status);
    }

    return forms;
  }

  // Create new form configuration
  createFormConfiguration(
    form: Omit<FormConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ): FormConfiguration {
    const data = readJsonFile<FormsData>('forms.json');

    const newForm: FormConfiguration = {
      ...form,
      id: `form-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.formConfigurations.push(newForm);
    writeJsonFile('forms.json', data);

    return newForm;
  }

  // Update form configuration
  updateFormConfiguration(
    formId: string,
    updates: Partial<FormConfiguration>
  ): FormConfiguration {
    const data = readJsonFile<FormsData>('forms.json');

    const index = data.formConfigurations.findIndex(f => f.id === formId);
    if (index === -1) {
      throw new Error(`Form configuration not found: ${formId}`);
    }

    data.formConfigurations[index] = {
      ...data.formConfigurations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('forms.json', data);

    return data.formConfigurations[index];
  }

  // Delete form configuration
  deleteFormConfiguration(formId: string): void {
    const data = readJsonFile<FormsData>('forms.json');

    const index = data.formConfigurations.findIndex(f => f.id === formId);
    if (index === -1) {
      throw new Error(`Form configuration not found: ${formId}`);
    }

    data.formConfigurations.splice(index, 1);
    writeJsonFile('forms.json', data);
  }

  // Duplicate form configuration
  duplicateFormConfiguration(formId: string, newName: string): FormConfiguration {
    const existing = this.getFormConfiguration(formId);
    if (!existing) {
      throw new Error(`Form configuration not found: ${formId}`);
    }

    return this.createFormConfiguration({
      ...existing,
      name: newName,
      status: 'draft',
      version: '1.0',
    });
  }
}
