/**
 * Dynamic Form Renderer
 * 
 * Renders forms based on configuration from the form designer.
 * This replaces hardcoded form steps with dynamic configuration-driven forms.
 */

import React, { useState, useEffect } from 'react';
import { designTokens } from '@/components/design-system/tokens';

// Types from form configuration
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

interface FormSection {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

interface FormStep {
  id: string;
  title: string;
  order: number;
  sections: FormSection[];
}

interface DynamicFormRendererProps {
  step: FormStep;
  data: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
}

export function DynamicFormRenderer({
  step,
  data,
  onChange,
  errors = {},
}: DynamicFormRendererProps) {
  return (
    <div>
      {step.sections
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <FormSection
            key={section.id}
            section={section}
            data={data}
            onChange={onChange}
            errors={errors}
          />
        ))}
    </div>
  );
}

function FormSection({
  section,
  data,
  onChange,
  errors,
}: {
  section: FormSection;
  data: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <div
      style={{
        marginBottom: designTokens.spacing.xl,
      }}
    >
      <h3
        style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.lg,
          paddingBottom: designTokens.spacing.sm,
          borderBottom: `2px solid ${designTokens.colors.neutral[200]}`,
        }}
      >
        {section.title}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: designTokens.spacing.lg,
        }}
      >
        {section.fields.map((field) => {
          // Check if field should be shown based on dependencies
          if (field.dependsOn && !data[field.dependsOn]) {
            return null;
          }

          return (
            <FormField
              key={field.id}
              field={field}
              value={getNestedValue(data, field.id)}
              onChange={(value) => onChange(field.id, value)}
              error={errors[field.id]}
            />
          );
        })}
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}) {
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    border: `1px solid ${
      error ? designTokens.colors.status.danger : designTokens.colors.neutral[300]
    }`,
    fontSize: designTokens.typography.fontSize.base,
    fontFamily: designTokens.typography.fontFamily.sans,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  };

  const containerStyle: React.CSSProperties = {
    gridColumn: field.type === 'textarea' ? '1 / -1' : 'span 1',
  };

  // Render different field types
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <div style={containerStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: designTokens.colors.status.danger }}> *</span>
            )}
          </label>
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={fieldStyle}
          />
          {field.helpText && (
            <div
              style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.tertiary,
                marginTop: designTokens.spacing.xs,
              }}
            >
              {field.helpText}
            </div>
          )}
          {error && (
            <div
              style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.status.danger,
                marginTop: designTokens.spacing.xs,
              }}
            >
              {error}
            </div>
          )}
        </div>
      );

    case 'date':
    case 'datetime-local':
      return (
        <div style={containerStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: designTokens.colors.status.danger }}> *</span>
            )}
          </label>
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            style={fieldStyle}
          />
          {error && (
            <div style={{ color: designTokens.colors.status.danger, fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>
      );

    case 'select':
      return (
        <div style={containerStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: designTokens.colors.status.danger }}> *</span>
            )}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            style={fieldStyle}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <div style={{ color: designTokens.colors.status.danger, fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div style={containerStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: designTokens.colors.status.danger }}> *</span>
            )}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
          {field.helpText && (
            <div
              style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.tertiary,
                marginTop: designTokens.spacing.xs,
              }}
            >
              {field.helpText}
            </div>
          )}
          {error && (
            <div style={{ color: designTokens.colors.status.danger, fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div style={{ ...containerStyle, gridColumn: '1 / -1' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: designTokens.spacing.sm,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              style={{
                marginTop: '2px',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ color: designTokens.colors.text.primary }}>
                {field.label}
                {field.required && (
                  <span style={{ color: designTokens.colors.status.danger }}> *</span>
                )}
              </span>
              {field.helpText && (
                <div
                  style={{
                    fontSize: designTokens.typography.fontSize.xs,
                    color: designTokens.colors.text.tertiary,
                    marginTop: designTokens.spacing.xs,
                  }}
                >
                  {field.helpText}
                </div>
              )}
            </div>
          </label>
          {error && (
            <div
              style={{
                color: designTokens.colors.status.danger,
                fontSize: '12px',
                marginLeft: '26px',
              }}
            >
              {error}
            </div>
          )}
        </div>
      );

    case 'radio':
      return (
        <div style={containerStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: designTokens.colors.status.danger }}> *</span>
            )}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  style={{ cursor: 'pointer' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {error && (
            <div style={{ color: designTokens.colors.status.danger, fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div style={containerStyle}>
          <p>Unsupported field type: {field.type}</p>
        </div>
      );
  }
}

// Helper function to get nested object values (e.g., "address.street")
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to set nested object values
export function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return { ...obj };
}

// Validation function based on field configuration
export function validateField(field: FormField, value: any): string | null {
  if (field.required && !value) {
    return `${field.label} is required`;
  }

  if (field.validation) {
    const { minLength, maxLength, pattern, minAge } = field.validation;

    if (minLength && value && value.length < minLength) {
      return `${field.label} must be at least ${minLength} characters`;
    }

    if (maxLength && value && value.length > maxLength) {
      return `${field.label} must be no more than ${maxLength} characters`;
    }

    if (pattern && value) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    if (minAge && value) {
      const birthDate = new Date(value);
      const age = Math.floor(
        (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < minAge) {
        return `Must be at least ${minAge} years old`;
      }
    }
  }

  return null;
}
