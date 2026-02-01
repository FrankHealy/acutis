/**
 * app/configuration/forms/page.tsx
 * Form Configuration Dashboard
 * Where admins view and manage all form configurations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { IconBadge } from '@/components/design-system/IconBadge';
import { designTokens } from '@/components/design-system/tokens';

interface FormConfig {
  id: string;
  name: string;
  unit: string;
  formType?: string;
  admissionType?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  steps: any[];
  createdAt: string;
  updatedAt: string;
}

export default function FormConfigurationDashboard() {
  const router = useRouter();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('active');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      // In a real app, you'd have an endpoint that returns all forms
      // For now, we'll load them individually
      const units = ['detox', 'alcohol', 'drugs', 'ladies', 'gambling'];
      const formPromises = units.map(unit =>
        fetch(`/api/forms/${unit}`).then(res => res.ok ? res.json() : null)
      );
      
      const formData = await Promise.all(formPromises);
      setForms(formData.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnitColor = (unit: string): string => {
    const colors: Record<string, string> = {
      detox: designTokens.colors.primary.blue,
      alcohol: designTokens.colors.primary.green,
      drugs: designTokens.colors.primary.purple,
      ladies: '#EC4899', // Pink
      gambling: '#F59E0B', // Amber
    };
    return colors[unit] || designTokens.colors.neutral[500];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return designTokens.colors.status.success;
      case 'draft':
        return designTokens.colors.status.warning;
      case 'archived':
        return designTokens.colors.neutral[500];
      default:
        return designTokens.colors.neutral[400];
    }
  };

  const filteredForms = forms.filter(form => 
    filter === 'all' || form.status === filter
  );

  const createNewForm = () => {
    router.push('/configuration/forms/new');
  };

  const editForm = (formId: string) => {
    router.push(`/configuration/forms/edit/${formId}`);
  };

  const viewElementsLibrary = () => {
    router.push('/configuration/forms/elements-library');
  };

  return (
    <div style={{ 
      padding: designTokens.spacing.xl, 
      backgroundColor: designTokens.colors.neutral[50], 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        marginBottom: designTokens.spacing.xl 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: designTokens.spacing.lg 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              marginBottom: '4px',
              color: designTokens.colors.neutral[900] 
            }}>
              Form Configuration
            </h1>
            <p style={{ color: designTokens.colors.neutral[600] }}>
              Manage admission forms and templates
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: designTokens.spacing.md }}>
            <button
              onClick={viewElementsLibrary}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: 'white',
                color: designTokens.colors.neutral[700],
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.md,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Elements Library
            </button>
            
            <button
              onClick={createNewForm}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: designTokens.colors.primary.blue,
                color: 'white',
                border: 'none',
                borderRadius: designTokens.borderRadius.md,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create New Form
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: designTokens.spacing.md, marginBottom: designTokens.spacing.lg }}>
          {(['all', 'active', 'draft', 'archived'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: filter === status ? designTokens.colors.primary.blue : 'white',
                color: filter === status ? 'white' : designTokens.colors.neutral[700],
                border: `1px solid ${filter === status ? designTokens.colors.primary.blue : designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.md,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status} ({forms.filter(f => status === 'all' || f.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <Card>
            <CardContent>
              <div style={{ padding: designTokens.spacing.xl, textAlign: 'center', color: designTokens.colors.neutral[500] }}>
                Loading forms...
              </div>
            </CardContent>
          </Card>
        ) : filteredForms.length === 0 ? (
          <Card>
            <CardContent>
              <div style={{ padding: designTokens.spacing.xl, textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: designTokens.colors.neutral[100],
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: designTokens.colors.neutral[400],
                  fontSize: '32px'
                }}>
                  📋
                </div>
                <h3 style={{ fontSize: designTokens.typography.fontSize.lg, marginBottom: '8px' }}>
                  No forms found
                </h3>
                <p style={{ color: designTokens.colors.neutral[600], marginBottom: '24px' }}>
                  {filter === 'all' 
                    ? 'Create your first form to get started'
                    : `No ${filter} forms available`
                  }
                </p>
                <button
                  onClick={createNewForm}
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
                  Create New Form
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: designTokens.spacing.lg
          }}>
            {filteredForms.map(form => (
              <Card 
                key={form.id}
                onClick={() => editForm(form.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = designTokens.shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = designTokens.shadows.sm;
                }}
              >
                <CardContent>
                  <div style={{ padding: designTokens.spacing.md }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: designTokens.spacing.md }}>
                      <div style={{ display: 'flex', gap: designTokens.spacing.md, flex: 1 }}>
                        <IconBadge
                          icon="clipboard"
                          size="md"
                          color={getUnitColor(form.unit)}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: designTokens.typography.fontSize.lg, 
                            fontWeight: 600,
                            marginBottom: '4px',
                            color: designTokens.colors.neutral[900]
                          }}>
                            {form.name}
                          </h3>
                          <div style={{ display: 'flex', gap: designTokens.spacing.sm, alignItems: 'center' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: designTokens.borderRadius.full,
                              fontSize: designTokens.typography.fontSize.xs,
                              fontWeight: 600,
                              backgroundColor: getUnitColor(form.unit),
                              color: 'white',
                              textTransform: 'capitalize',
                            }}>
                              {form.unit}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: designTokens.borderRadius.full,
                              fontSize: designTokens.typography.fontSize.xs,
                              fontWeight: 600,
                              backgroundColor: getStatusColor(form.status),
                              color: 'white',
                              textTransform: 'capitalize',
                            }}>
                              {form.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: designTokens.spacing.md,
                      padding: designTokens.spacing.md,
                      backgroundColor: designTokens.colors.neutral[50],
                      borderRadius: designTokens.borderRadius.md,
                      marginBottom: designTokens.spacing.md
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: designTokens.typography.fontSize['2xl'], fontWeight: 700, color: designTokens.colors.primary.blue }}>
                          {form.steps?.length || 0}
                        </div>
                        <div style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.neutral[600] }}>
                          Steps
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: designTokens.typography.fontSize['2xl'], fontWeight: 700, color: designTokens.colors.primary.green }}>
                          {form.steps?.reduce((acc, step) => acc + (step.sections?.length || 0), 0) || 0}
                        </div>
                        <div style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.neutral[600] }}>
                          Sections
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: designTokens.typography.fontSize['2xl'], fontWeight: 700, color: designTokens.colors.primary.purple }}>
                          {form.steps?.reduce((acc, step) => 
                            acc + (step.sections?.reduce((secAcc: number, sec: any) => 
                              secAcc + (sec.fields?.length || 0), 0) || 0), 0) || 0}
                        </div>
                        <div style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.neutral[600] }}>
                          Fields
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontSize: designTokens.typography.fontSize.xs,
                      color: designTokens.colors.neutral[500]
                    }}>
                      <span>v{form.version}</span>
                      <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
