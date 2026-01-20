/**
 * Admission Intake Flow - DYNAMIC VERSION
 * 
 * Multi-step admission form driven by form configuration.
 * Form fields and steps are loaded from the form designer configuration.
 * 
 * Features:
 * - Dynamic form rendering based on configuration
 * - Multi-step progress tracking
 * - Validation from form config
 * - Session persistence
 * - Progress bar with configurable steps
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { designTokens } from '@/components/design-system/tokens';
import { Card, CardHeader } from '@/components/design-system/Card';
import { DynamicFormRenderer, setNestedValue, validateField } from './DynamicFormRenderer';

// Types
interface AdmissionSession {
  id: string;
  admissionId: string;
  currentStep: number;
  totalSteps: number;
  data: Record<string, any>; // Dynamic data based on form config
  startedAt: Date;
  lastUpdated: Date;
}

interface FormConfiguration {
  id: string;
  name: string;
  unit: string;
  version: string;
  status: string;
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

export function AdmissionIntakeFlow({ admissionId }: { admissionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const initialStep = parseInt(searchParams.get('step') || '1');

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [session, setSession] = useState<AdmissionSession | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormAndSession();
  }, [sessionId]);

  const loadFormAndSession = async () => {
    try {
      // Load form configuration for the unit
      // You'll need to determine the unit from the admission
      const formResponse = await fetch(`/api/forms/detox`); // Or get unit from admission
      const config = await formResponse.json();
      setFormConfig(config);

      // Load or create session
      const sessionResponse = await fetch(
        `/api/admissions/${admissionId}/session/${sessionId}`
      );
      const sessionData = await sessionResponse.json();
      setSession(sessionData);
      setFormData(sessionData.data || {});
      setCurrentStep(sessionData.currentStep);
    } catch (err) {
      setError('Failed to load admission form');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (stepData: Record<string, any>) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admissions/${admissionId}/session/${sessionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStep,
            data: stepData,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save');

      const updatedSession = await response.json();
      setSession(updatedSession);
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    if (!formConfig) return false;

    const currentStepConfig = formConfig.steps[currentStep - 1];
    const newErrors: Record<string, string> = {};

    // Validate all fields in current step
    currentStepConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = getNestedValue(formData, field.id);
        const error = validateField(field, value);
        if (error) {
          newErrors[field.id] = error;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      setError('Please fix the errors before continuing');
      return;
    }

    try {
      await saveProgress(formData);

      if (currentStep < (formConfig?.steps.length || 0)) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        // Complete admission
        await completeAdmission();
      }
    } catch (err) {
      // Error already set in saveProgress
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => setNestedValue(prev, fieldId, value));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this admission? Progress will be saved.')) {
      router.push('/detox/admissions');
    }
  };

  const completeAdmission = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/admissions/${admissionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      router.push(`/detox/admissions/${admissionId}/success`);
    } catch (err) {
      setError('Failed to complete admission');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !formConfig) {
    return <LoadingState />;
  }

  const currentStepConfig = formConfig.steps[currentStep - 1];

  return (
    <div
      style={{
        backgroundColor: designTokens.colors.background.secondary,
        minHeight: '100vh',
        padding: designTokens.spacing['2xl'],
      }}
    >
      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={formConfig.steps.length}
        steps={formConfig.steps.map(step => ({
          id: step.order,
          title: step.title,
          icon: getIconForStep(step.order),
        }))}
      />

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: designTokens.colors.status.danger,
            color: designTokens.colors.text.inverse,
            padding: designTokens.spacing.md,
            borderRadius: designTokens.borderRadius.md,
            marginBottom: designTokens.spacing.lg,
          }}
        >
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <Card padding="xl" shadow="lg">
        <CardHeader
          title={currentStepConfig.title}
          subtitle={`Step ${currentStep} of ${formConfig.steps.length}`}
        />

        {/* Dynamic Form Renderer */}
        <DynamicFormRenderer
          step={currentStepConfig}
          data={formData}
          onChange={handleFieldChange}
          errors={errors}
        />

        {/* Form Actions */}
        <FormActions
          onCancel={handleCancel}
          onBack={currentStep > 1 ? handleBack : undefined}
          onNext={handleNext}
          isSaving={isSaving}
          isLastStep={currentStep === formConfig.steps.length}
        />
      </Card>
    </div>
  );
}

// Helper to get nested values (for displaying data)
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Icon mapping for steps
function getIconForStep(order: number): string {
  const icons: Record<number, string> = {
    1: '👤',
    2: '🏥',
    3: '📋',
    4: '🛏️',
    5: '✓',
  };
  return icons[order] || '📄';
}

// Progress Bar Component
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: typeof STEPS;
}

function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: designTokens.spacing.xl }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: designTokens.spacing.lg,
        }}
      >
        {/* Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            height: '2px',
            backgroundColor: designTokens.colors.neutral[300],
            zIndex: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: designTokens.colors.primary.blue,
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              transition: `width ${designTokens.transitions.normal}`,
            }}
          />
        </div>

        {/* Step Indicators */}
        {steps.map((step) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designTokens.borderRadius.full,
                  backgroundColor: isComplete || isCurrent
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.background.primary,
                  border: `2px solid ${
                    isComplete || isCurrent
                      ? designTokens.colors.primary.blue
                      : designTokens.colors.neutral[300]
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: isComplete || isCurrent
                    ? designTokens.colors.text.inverse
                    : designTokens.colors.text.secondary,
                  fontWeight: designTokens.typography.fontWeight.semibold,
                }}
              >
                {isComplete ? '✓' : step.icon}
              </div>
              <span
                style={{
                  fontSize: designTokens.typography.fontSize.xs,
                  color: isCurrent
                    ? designTokens.colors.text.primary
                    : designTokens.colors.text.secondary,
                  fontWeight: isCurrent
                    ? designTokens.typography.fontWeight.semibold
                    : designTokens.typography.fontWeight.normal,
                  textAlign: 'center',
                  maxWidth: '100px',
                }}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Form Actions Component
function FormActions({
  onCancel,
  onBack,
  onNext,
  isSaving,
  isLastStep = false,
}: {
  onCancel: () => void;
  onBack?: () => void;
  onNext: () => void;
  isSaving: boolean;
  isLastStep?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: designTokens.spacing.md,
        justifyContent: 'space-between',
        marginTop: designTokens.spacing.xl,
        paddingTop: designTokens.spacing.xl,
        borderTop: `1px solid ${designTokens.colors.neutral[200]}`,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        style={{
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
          backgroundColor: 'transparent',
          color: designTokens.colors.text.secondary,
          border: `1px solid ${designTokens.colors.neutral[300]}`,
          borderRadius: designTokens.borderRadius.md,
          cursor: isSaving ? 'not-allowed' : 'pointer',
        }}
      >
        Cancel
      </button>

      <div style={{ display: 'flex', gap: designTokens.spacing.md }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              backgroundColor: 'transparent',
              color: designTokens.colors.primary.blue,
              border: `1px solid ${designTokens.colors.primary.blue}`,
              borderRadius: designTokens.borderRadius.md,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={isSaving}
          style={{
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.xl}`,
            backgroundColor: isSaving
              ? designTokens.colors.neutral[400]
              : designTokens.colors.primary.blue,
            color: designTokens.colors.text.inverse,
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            fontWeight: designTokens.typography.fontWeight.semibold,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : isLastStep ? 'Complete Admission' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      Loading admission form...
    </div>
  );
}
