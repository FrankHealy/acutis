/**
 * app/admissions/intake/[id]/page.tsx
 * Admission intake flow using DynamicFormRenderer
 * Loads form configuration from Form Generator
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DynamicFormRenderer } from '@/components/form-generator/components/DynamicFormRenderer';
import { Card, CardHeader, CardContent } from '@/components/acutis-design-system/Card';
import { designTokens } from '@/components/acutis-design-system/tokens';

interface FormConfiguration {
  id: string;
  name: string;
  unit: string;
  steps: FormStep[];
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
  fields: any[];
}

export default function AdmissionIntakePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const admissionId = params.id as string;
  const isContinue = searchParams.get('continue') === 'true';
  const isWalkIn = params.id === 'new' && searchParams.get('type') === 'walkin';

  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admission, setAdmission] = useState<any>(null);

  useEffect(() => {
    loadFormConfiguration();
    if (!isWalkIn && admissionId !== 'new') {
      loadAdmission();
    }
  }, [admissionId, isWalkIn]);

  const loadFormConfiguration = async () => {
    try {
      // Load detox admission form (universal form for all types)
      const response = await fetch('/api/forms/detox');
      
      if (!response.ok) {
        throw new Error('Failed to load form configuration');
      }
      
      const config = await response.json();
      setFormConfig(config);
    } catch (err) {
      console.error('Error loading form:', err);
      setError('Failed to load admission form');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmission = async () => {
    try {
      const response = await fetch(`/api/admissions/${admissionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAdmission(data);
        
        // If continuing, load existing form data
        if (isContinue && data.formData) {
          setFormData(data.formData);
          setCurrentStep(data.currentStep || 0);
        }
      }
    } catch (err) {
      console.error('Error loading admission:', err);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleNext = async () => {
    if (!formConfig) return;

    // Save progress
    await saveProgress();

    if (currentStep < formConfig.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete admission
      await completeAdmission();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProgress = async () => {
    try {
      const endpoint = isWalkIn || admissionId === 'new'
        ? '/api/admissions'
        : `/api/admissions/${admissionId}`;
      
      const method = isWalkIn || admissionId === 'new' ? 'POST' : 'PUT';
      
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          currentStep,
          status: 'in_progress',
        }),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const completeAdmission = async () => {
    try {
      const endpoint = isWalkIn || admissionId === 'new'
        ? '/api/admissions'
        : `/api/admissions/${admissionId}`;
      
      const method = isWalkIn || admissionId === 'new' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Navigate back to dashboard
        router.push('/admissions?success=true');
      }
    } catch (err) {
      console.error('Error completing admission:', err);
      setError('Failed to complete admission');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved progress will be lost.')) {
      router.push('/admissions');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: designTokens.colors.neutral[50] 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: `4px solid ${designTokens.colors.neutral[200]}`,
            borderTopColor: designTokens.colors.primary.blue,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: designTokens.colors.neutral[600] }}>Loading admission form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: designTokens.colors.neutral[50],
        padding: designTokens.spacing.xl
      }}>
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <CardContent>
            <div style={{ textAlign: 'center', padding: designTokens.spacing.xl }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: designTokens.colors.status.danger,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white',
                fontSize: '32px'
              }}>!</div>
              <h2 style={{ fontSize: designTokens.typography.fontSize.xl, marginBottom: '8px' }}>Error Loading Form</h2>
              <p style={{ color: designTokens.colors.neutral[600], marginBottom: '24px' }}>{error}</p>
              <button
                onClick={() => router.push('/admissions')}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: designTokens.borderRadius.md,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formConfig) {
    return null;
  }

  const currentStepData = formConfig.steps[currentStep];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: designTokens.colors.neutral[50],
      padding: designTokens.spacing.xl
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: designTokens.spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: designTokens.spacing.md }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>
              {isWalkIn ? 'Walk-in Admission' : isContinue ? 'Continue Admission' : 'New Admission'}
            </h1>
            {admission && (
              <p style={{ color: designTokens.colors.neutral[600] }}>
                {admission.firstName} {admission.lastName}
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              backgroundColor: 'white',
              color: designTokens.colors.neutral[700],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.md,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ 
          display: 'flex', 
          gap: designTokens.spacing.xs,
          marginBottom: designTokens.spacing.lg
        }}>
          {formConfig.steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: index <= currentStep 
                  ? designTokens.colors.primary.blue 
                  : designTokens.colors.neutral[200],
                borderRadius: designTokens.borderRadius.full,
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Step Indicator */}
        <div style={{ textAlign: 'center', marginBottom: designTokens.spacing.lg }}>
          <p style={{ color: designTokens.colors.neutral[600], fontSize: designTokens.typography.fontSize.sm }}>
            Step {currentStep + 1} of {formConfig.steps.length}
          </p>
          <h2 style={{ fontSize: designTokens.typography.fontSize['2xl'], fontWeight: 600 }}>
            {currentStepData.title}
          </h2>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <CardContent style={{ padding: designTokens.spacing.xl }}>
            <DynamicFormRenderer
              step={currentStepData}
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: designTokens.spacing.xl,
          maxWidth: '1200px'
        }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            style={{
              padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
              backgroundColor: 'white',
              color: designTokens.colors.neutral[700],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.md,
              fontWeight: 600,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
              backgroundColor: designTokens.colors.primary.blue,
              color: 'white',
              border: 'none',
              borderRadius: designTokens.borderRadius.md,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = designTokens.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {currentStep === formConfig.steps.length - 1 ? 'Complete Admission' : 'Next Step'}
          </button>
        </div>
      </div>

      {/* Add spin animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
