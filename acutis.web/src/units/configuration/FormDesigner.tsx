import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Settings, Copy, 
  ChevronDown, ChevronUp, Type, Hash, Calendar, CheckSquare, List, 
  FileText, Image as ImageIcon, Phone, Mail, MapPin, AlertCircle,
  Download, Upload, History, Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ElementsLibraryPanel from './ElementsLibraryPanel';

interface FormField {
  id: string;
  fieldName: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'file';
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

const FormDesigner = () => {
  const router = useRouter();
  const [formName, setFormName] = useState('Admission Form v4');
  const [formVersion, setFormVersion] = useState(4);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [viewMode, setViewMode] = useState<'designer' | 'preview'>('designer');
  const [selectedSection, setSelectedSection] = useState<string | null>('personal-identity');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  // Mock form structure
  const [sections, setSections] = useState<FormSection[]>([
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
  ]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date Picker', icon: Calendar },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'textarea', label: 'Text Area', icon: FileText },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
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

  const addFieldsFromElement = (element: any, sectionId: string) => {
    if (!element || !Array.isArray(element.fields)) {
      return;
    }
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const newFields = element.fields.map((field: any) => ({
            id: `field-${Date.now()}-${Math.random()}`,
            fieldName: field.fieldName || field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            options: field.options,
            validation: field.validation,
            helpText: field.helpText,
            defaultValue: field.defaultValue
          }));

          return {
            ...section,
            fields: [...section.fields, ...newFields]
          };
        }
        return section;
      })
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/configuration/forms')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">Version {formVersion} - Form Configuration</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Unit Selector */}
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

            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
              <Save className="h-5 w-5" />
              <span>Save Draft</span>
            </button>

            <button className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold shadow-md">
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
                      <button
                        onClick={() => addField(selectedSection!)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Field</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
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
                      selectedSectionData.fields.map((field) => {
                        const FieldIcon = getFieldIcon(field.type);
                        const isSelected = selectedField === field.id;

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
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>Type: <span className="font-medium">{field.type}</span></p>
                                    <p>Field Name: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{field.fieldName}</span></p>
                                    {field.placeholder && (
                                      <p>Placeholder: <span className="italic">{field.placeholder}</span></p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Clone field logic
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type</label>
                  <select
                    value={selectedFieldData.type}
                    onChange={(e) => updateSelectedField({ type: e.target.value as FormField['type'] })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
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

                  {(selectedFieldData.type === 'text' || selectedFieldData.type === 'textarea') && (
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
              {sections.map(section => (
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
                      <div className="grid grid-cols-2 gap-6">
                        {section.fields.map(field => (
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Elements Library Panel */}
      <ElementsLibraryPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onElementDrop={addFieldsFromElement}
      />
    </div>
  );
};

export default FormDesigner;
