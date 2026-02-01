/**
 * app/configuration/forms/elements-library/page.tsx
 * Form Elements Library Viewer
 * Browse and preview all 26 pre-built form elements
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { IconBadge } from '@/components/design-system/IconBadge';
import { designTokens } from '@/components/design-system/tokens';

interface FormElement {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: any[];
}

interface ElementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: FormElement[];
}

export default function ElementsLibraryPage() {
  const router = useRouter();
  const [library, setLibrary] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const response = await fetch('/api/elements-library');
      const data = await response.json();
      setLibrary(data.categories || []);
      if (data.categories?.length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch elements library:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryId: string): string => {
    const colors: Record<string, string> = {
      'personal-info': designTokens.colors.primary.blue,
      'medical': designTokens.colors.primary.green,
      'substance-use': designTokens.colors.primary.purple,
      'assessment': '#EC4899', // Pink
      'consent': '#F59E0B', // Amber
      'therapy': '#8B5CF6', // Violet
    };
    return colors[categoryId] || designTokens.colors.neutral[500];
  };

  const getCategoryIcon = (categoryId: string): string => {
    const icons: Record<string, string> = {
      'personal-info': 'user',
      'medical': 'heart',
      'substance-use': 'alert-circle',
      'assessment': 'clipboard',
      'consent': 'shield',
      'therapy': 'message-circle',
    };
    return icons[categoryId] || 'file';
  };

  const getFieldTypeIcon = (fieldType: string): string => {
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'tel':
        return '📝';
      case 'select':
        return '📋';
      case 'radio':
        return '🔘';
      case 'checkbox':
        return '☑️';
      case 'textarea':
        return '📄';
      case 'date':
      case 'datetime-local':
        return '📅';
      case 'number':
        return '🔢';
      default:
        return '📌';
    }
  };

  const filteredLibrary = library.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      searchQuery === '' ||
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.elements.length > 0);

  const selectedCategoryData = filteredLibrary.find(cat => cat.id === selectedCategory);

  return (
    <div style={{ 
      padding: designTokens.spacing.xl, 
      backgroundColor: designTokens.colors.neutral[50], 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: '1600px', 
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
            <button
              onClick={() => router.push('/configuration/forms')}
              style={{
                background: 'none',
                border: 'none',
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSize.sm,
                cursor: 'pointer',
                marginBottom: designTokens.spacing.sm,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Forms
            </button>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              marginBottom: '4px',
              color: designTokens.colors.neutral[900] 
            }}>
              Form Elements Library
            </h1>
            <p style={{ color: designTokens.colors.neutral[600] }}>
              26 pre-built form elements across 6 categories
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: designTokens.spacing.md,
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSize.base,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: designTokens.spacing.xl }}>
        {/* Categories Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: 600 }}>
                Categories
              </h3>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
                {filteredLibrary.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                      padding: designTokens.spacing.md,
                      backgroundColor: selectedCategory === category.id 
                        ? getCategoryColor(category.id)
                        : 'transparent',
                      color: selectedCategory === category.id 
                        ? 'white'
                        : designTokens.colors.neutral[700],
                      border: 'none',
                      borderRadius: designTokens.borderRadius.md,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedCategory === category.id ? 600 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ 
                      fontSize: '20px',
                      opacity: selectedCategory === category.id ? 1 : 0.6 
                    }}>
                      {getCategoryIcon(category.id) === 'user' && '👤'}
                      {getCategoryIcon(category.id) === 'heart' && '❤️'}
                      {getCategoryIcon(category.id) === 'alert-circle' && '⚠️'}
                      {getCategoryIcon(category.id) === 'clipboard' && '📋'}
                      {getCategoryIcon(category.id) === 'shield' && '🛡️'}
                      {getCategoryIcon(category.id) === 'message-circle' && '💬'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>{category.name}</div>
                      <div style={{ 
                        fontSize: designTokens.typography.fontSize.xs,
                        opacity: 0.8
                      }}>
                        {category.elements.length} elements
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elements Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <Card>
              <CardContent>
                <div style={{ padding: designTokens.spacing.xl, textAlign: 'center', color: designTokens.colors.neutral[500] }}>
                  Loading elements...
                </div>
              </CardContent>
            </Card>
          ) : selectedCategoryData ? (
            <>
              {/* Category Header */}
              <div style={{ marginBottom: designTokens.spacing.lg }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: designTokens.spacing.md,
                  marginBottom: designTokens.spacing.sm 
                }}>
                  <IconBadge
                    icon={getCategoryIcon(selectedCategoryData.id)}
                    size="lg"
                    color={getCategoryColor(selectedCategoryData.id)}
                  />
                  <div>
                    <h2 style={{ 
                      fontSize: designTokens.typography.fontSize['2xl'], 
                      fontWeight: 700,
                      marginBottom: '4px' 
                    }}>
                      {selectedCategoryData.name}
                    </h2>
                    <p style={{ color: designTokens.colors.neutral[600] }}>
                      {selectedCategoryData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Elements Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: designTokens.spacing.lg
              }}>
                {selectedCategoryData.elements.map(element => (
                  <Card key={element.id}>
                    <CardHeader>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            fontSize: designTokens.typography.fontSize.lg, 
                            fontWeight: 600,
                            marginBottom: '4px' 
                          }}>
                            {element.name}
                          </h4>
                          <p style={{ 
                            fontSize: designTokens.typography.fontSize.sm,
                            color: designTokens.colors.neutral[600] 
                          }}>
                            {element.description}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: designTokens.borderRadius.full,
                          fontSize: designTokens.typography.fontSize.xs,
                          fontWeight: 600,
                          backgroundColor: getCategoryColor(selectedCategoryData.id),
                          color: 'white',
                        }}>
                          {element.fields.length} {element.fields.length === 1 ? 'field' : 'fields'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Element ID */}
                      <div style={{ 
                        padding: designTokens.spacing.sm,
                        backgroundColor: designTokens.colors.neutral[100],
                        borderRadius: designTokens.borderRadius.md,
                        marginBottom: designTokens.spacing.md,
                        fontFamily: 'monospace',
                        fontSize: designTokens.typography.fontSize.sm,
                        color: designTokens.colors.neutral[700]
                      }}>
                        {element.id}
                      </div>

                      {/* Fields Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                        {element.fields.map((field, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: designTokens.spacing.sm,
                              padding: designTokens.spacing.sm,
                              backgroundColor: designTokens.colors.neutral[50],
                              borderRadius: designTokens.borderRadius.sm,
                              fontSize: designTokens.typography.fontSize.sm
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>
                              {getFieldTypeIcon(field.type)}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>
                                {field.label}
                                {field.required && (
                                  <span style={{ color: designTokens.colors.status.danger }}> *</span>
                                )}
                              </div>
                              <div style={{ 
                                fontSize: designTokens.typography.fontSize.xs,
                                color: designTokens.colors.neutral[500]
                              }}>
                                {field.type}
                                {field.validation?.pattern && ' • validated'}
                                {field.dependsOn && ' • conditional'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Usage Hint */}
                      <div style={{ 
                        marginTop: designTokens.spacing.md,
                        padding: designTokens.spacing.sm,
                        backgroundColor: designTokens.colors.primary.blue + '10',
                        borderLeft: `3px solid ${designTokens.colors.primary.blue}`,
                        borderRadius: designTokens.borderRadius.sm,
                        fontSize: designTokens.typography.fontSize.xs,
                        color: designTokens.colors.neutral[600]
                      }}>
                        💡 Add to form by referencing: <code style={{ fontFamily: 'monospace' }}>"{element.id}"</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent>
                <div style={{ padding: designTokens.spacing.xl, textAlign: 'center', color: designTokens.colors.neutral[500] }}>
                  No elements found
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
