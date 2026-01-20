/**
 * Mock Data Service
 *
 * Provides mock data layer with file persistence for development.
 * Reads/writes to JSON files in form-generator mock data folder.
 */

import fs from 'fs';
import path from 'path';

type AdmissionStatus = 'expected' | 'arrived' | 'in_progress' | 'completed';

export interface Admission {
  id: string;
  firstName: string;
  lastName: string;
  status: AdmissionStatus;
  expectedTime?: string;
  admissionType?: string | null;
  phoneEvalCompleted?: boolean;
  isReturning?: boolean;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  notes?: string;
  formData?: Record<string, unknown>;
  currentStep?: number;
}

export interface AdmissionsStats {
  expectedToday: number;
  completedToday: number;
  needsReview: number;
  occupancy: number;
  totalBeds: number;
  occupiedBeds: number;
  completedYesterday?: number;
}

export interface AdmissionSession {
  id: string;
  admissionId: string;
  currentStep: number;
  totalSteps: number;
  data: Record<string, unknown>;
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
}

export interface FormConfiguration {
  id: string;
  name: string;
  unit: string;
  admissionType?: string | null;
  formType?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  description?: string;
  steps: FormStep[];
  validationRules?: any;
}

export interface FormStep {
  id: string;
  title: string;
  order: number;
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

export interface FormField {
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

const MOCK_DATA_DIR = path.join(
  process.cwd(),
  'src',
  'components',
  'form-generator',
  'data',
  'mock'
);

// Ensure mock data directory exists
if (!fs.existsSync(MOCK_DATA_DIR)) {
  fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
}

// Helper functions for file operations
function readJsonFile<T>(filename: string): T {
  const filePath = path.join(MOCK_DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Mock data file not found: ${filename}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(MOCK_DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Type definitions for JSON file structures
interface AdmissionsData {
  admissions: Admission[];
  stats: {
    expectedToday?: number;
    completedToday?: number;
    needsReview?: number;
    occupancy?: {
      current?: number;
      total?: number;
      percentage?: number;
    };
    lastUpdated?: string;
  };
}

interface SessionsData {
  sessions: AdmissionSession[];
}

interface ActivityData {
  activities: any[];
}

interface FormsData {
  formConfigurations: FormConfiguration[];
}

// Mock Service Class
export class MockAdmissionsService {
  // Get admissions stats
  getStats(date?: string): AdmissionsStats {
    const data = readJsonFile<AdmissionsData>('admissions.json');
    
    // Recalculate stats based on current data
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAdmissions = data.admissions.filter((a) => {
      const admissionDate = new Date(a.createdAt || '');
      admissionDate.setHours(0, 0, 0, 0);
      return admissionDate.getTime() === today.getTime();
    });
    
    const expectedToday = todayAdmissions.filter((a) => a.status === 'expected')
      .length;
    const completedToday = todayAdmissions.filter((a) => a.status === 'completed')
      .length;
    const needsReview = data.admissions.filter(
      (a) => a.status === 'in_progress' || (a.status === 'expected' && !a.phoneEvalCompleted)
    ).length;

    const occupancy = data.stats.occupancy || {};
    const occupiedBeds = occupancy.current || 0;
    const totalBeds = occupancy.total || 0;
    const percent = occupancy.percentage || 0;
    
    return {
      expectedToday,
      completedToday,
      needsReview,
      occupancy: percent,
      totalBeds,
      occupiedBeds,
    };
  }

  // Get admissions list
  getAdmissions(params?: { date?: string; status?: string; unit?: string }): Admission[] {
    const data = readJsonFile<AdmissionsData>('admissions.json');
    let admissions = data.admissions;
    
    // Filter by date
    if (params?.date) {
      const filterDate = new Date(params.date);
      filterDate.setHours(0, 0, 0, 0);
      
      admissions = admissions.filter((a) => {
        const admissionDate = new Date(a.createdAt || '');
        admissionDate.setHours(0, 0, 0, 0);
        return admissionDate.getTime() === filterDate.getTime();
      });
    }
    
    // Filter by status
    if (params?.status) {
      admissions = admissions.filter((a) => a.status === params.status);
    }
    
    // Filter by unit
    if (params?.unit) {
      admissions = admissions.filter((a) => a.unit === params.unit);
    }
    
    return admissions;
  }

  // Get single admission
  getAdmission(id: string): Admission | null {
    const data = readJsonFile<AdmissionsData>('admissions.json');
    return data.admissions.find((a) => a.id === id) || null;
  }

  // Create new admission
  createAdmission(admission: Omit<Admission, 'id' | 'createdAt'>): Admission {
    const data = readJsonFile<AdmissionsData>('admissions.json');
    
    const newAdmission: Admission = {
      ...admission,
      id: `adm-${String(data.admissions.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    
    data.admissions.push(newAdmission);
    writeJsonFile('admissions.json', data);
    
    return newAdmission;
  }

  // Update admission
  updateAdmission(id: string, updates: Partial<Admission>): Admission {
    const data = readJsonFile<AdmissionsData>('admissions.json');
    
    const index = data.admissions.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Admission not found: ${id}`);
    }
    
    data.admissions[index] = {
      ...data.admissions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    writeJsonFile('admissions.json', data);
    
    return data.admissions[index];
  }

  // Start admission session
  startSession(admissionId: string): AdmissionSession {
    const sessionsData = readJsonFile<SessionsData>('sessions.json');
    
    // Check if session already exists
    const existing = sessionsData.sessions.find(
      (s) => s.admissionId === admissionId && !s.completedAt
    );
    
    if (existing) {
      return existing;
    }
    
    const newSession: AdmissionSession = {
      id: `sess-${String(sessionsData.sessions.length + 1).padStart(3, '0')}`,
      admissionId,
      currentStep: 1,
      totalSteps: 5,
      data: {},
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
    };
    
    sessionsData.sessions.push(newSession);
    writeJsonFile('sessions.json', sessionsData);
    
    // Update admission status
    this.updateAdmission(admissionId, { status: 'in_progress' });
    
    // Log activity
    this.logActivity({
      type: 'admission_started',
      text: 'Admission process started',
      admissionId,
      user: { name: 'System', id: 'system' },
    });
    
    return newSession;
  }

  // Get session
  getSession(admissionId: string, sessionId: string): AdmissionSession | null {
    const data = readJsonFile<SessionsData>('sessions.json');
    return (
      data.sessions.find((s) => s.id === sessionId && s.admissionId === admissionId) ||
      null
    );
  }

  // Update session
  updateSession(
    admissionId: string,
    sessionId: string,
    updates: { currentStep: number; data: Record<string, unknown> }
  ): AdmissionSession {
    const sessionsData = readJsonFile<SessionsData>('sessions.json');
    
    const index = sessionsData.sessions.findIndex(
      (s) => s.id === sessionId && s.admissionId === admissionId
    );
    
    if (index === -1) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    sessionsData.sessions[index] = {
      ...sessionsData.sessions[index],
      currentStep: updates.currentStep,
      data: {
        ...sessionsData.sessions[index].data,
        ...updates.data,
      },
      lastUpdatedAt: new Date(),
    };
    
    writeJsonFile('sessions.json', sessionsData);
    
    return sessionsData.sessions[index];
  }

  // Complete admission
  completeAdmission(admissionId: string, sessionId: string): void {
    // Update session
    const sessionsData = readJsonFile<SessionsData>('sessions.json');
    const sessionIndex = sessionsData.sessions.findIndex((s) => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessionsData.sessions[sessionIndex].completedAt = new Date();
      writeJsonFile('sessions.json', sessionsData);
    }
    
    // Update admission status
    this.updateAdmission(admissionId, { 
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    
    // Log activity
    const admission = this.getAdmission(admissionId);
    if (admission) {
      this.logActivity({
        type: 'admission_completed',
        text: `New admission completed for ${admission.firstName} ${admission.lastName}`,
        admissionId,
        user: { name: 'System', id: 'system' },
      });
    }
  }

  // Get recent activity
  getRecentActivity(limit: number = 10): any[] {
    const data = readJsonFile<ActivityData>('activity.json');
    return data.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get form configuration by ID
  getFormConfiguration(formId: string): FormConfiguration | null {
    const data = readJsonFile<FormsData>('forms.json');
    return data.formConfigurations.find((f) => f.id === formId) || null;
  }

  // Get form configuration by unit
  getFormConfigurationByUnit(unit: string): FormConfiguration | null {
    const data = readJsonFile<FormsData>('forms.json');
    return (
      data.formConfigurations.find((f) => f.unit === unit && f.status === 'active') ||
      null
    );
  }

  // List all form configurations
  getFormConfigurations(filters?: { unit?: string; status?: 'draft' | 'active' | 'archived' }): FormConfiguration[] {
    const data = readJsonFile<FormsData>('forms.json');
    let forms = data.formConfigurations;

    if (filters?.unit) {
      forms = forms.filter((f) => f.unit === filters.unit);
    }

    if (filters?.status) {
      forms = forms.filter((f) => f.status === filters.status);
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
  updateFormConfiguration(formId: string, updates: Partial<FormConfiguration>): FormConfiguration {
    const data = readJsonFile<FormsData>('forms.json');

    const index = data.formConfigurations.findIndex((f) => f.id === formId);
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

    const index = data.formConfigurations.findIndex((f) => f.id === formId);
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

  // Log activity
  private logActivity(activity: {
    type: string;
    text: string;
    admissionId: string;
    user: { name: string; id: string };
    metadata?: any;
  }): void {
    const data = readJsonFile<ActivityData>('activity.json');
    
    const newActivity = {
      id: `act-${String(data.activities.length + 1).padStart(3, '0')}`,
      icon: this.getIconForActivityType(activity.type),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    
    data.activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 100 activities
    if (data.activities.length > 100) {
      data.activities = data.activities.slice(0, 100);
    }
    
    writeJsonFile('activity.json', data);
  }

  private getIconForActivityType(type: string): string {
    const iconMap: Record<string, string> = {
      admission_started: 'user_plus',
      admission_completed: 'check',
      admission_flagged: 'alert',
      medical_update: 'clipboard',
      room_assigned: 'bed',
    };
    return iconMap[type] || 'info';
  }
}

// Singleton instance
export const mockAdmissionsService = new MockAdmissionsService();
