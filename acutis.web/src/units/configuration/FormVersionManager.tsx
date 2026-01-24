import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, User, FileText, GitCompare, Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface FormVersion {
  id: string;
  version: number;
  modifiedDate: string;
  modifiedBy: string;
  changesSummary: string;
  changesCount: number;
  sections: SectionChange[];
}

interface SectionChange {
  sectionName: string;
  fields: FieldChange[];
}

interface FieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeType: 'added' | 'modified' | 'removed';
}

const FormVersionManager = () => {
  const router = useRouter();
  const [selectedVersions, setSelectedVersions] = useState<[number, number]>([3, 2]); // Compare v3 with v2
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal-identity']);
  const [viewMode, setViewMode] = useState<'timeline' | 'compare'>('timeline');

  // Mock data - replace with API call
  const residentName = 'Michael O\'Brien';
  const currentVersion = 3;

  const versions: FormVersion[] = [
    {
      id: '3',
      version: 3,
      modifiedDate: '2026-01-15 14:30',
      modifiedBy: 'Dr. Sarah Murphy',
      changesSummary: 'Updated medical prescriptions and insurance information',
      changesCount: 5,
      sections: [
        {
          sectionName: 'Medical & Insurance',
          fields: [
            {
              fieldName: 'Insurance Provider',
              oldValue: 'VHI Healthcare',
              newValue: 'Laya Healthcare',
              changeType: 'modified'
            },
            {
              fieldName: 'Policy Number',
              oldValue: 'VHI-123456',
              newValue: 'LAYA-789012',
              changeType: 'modified'
            }
          ]
        },
        {
          sectionName: 'Medical Prescriptions',
          fields: [
            {
              fieldName: 'Medication: Chlordiazepoxide Dosage',
              oldValue: '10mg TID',
              newValue: '15mg TID',
              changeType: 'modified'
            },
            {
              fieldName: 'Medication: Thiamine',
              oldValue: '',
              newValue: '100mg daily',
              changeType: 'added'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      version: 2,
      modifiedDate: '2026-01-15 11:45',
      modifiedBy: 'Nurse John Kelly',
      changesSummary: 'Added next of kin contact information',
      changesCount: 3,
      sections: [
        {
          sectionName: 'Next of Kin',
          fields: [
            {
              fieldName: 'First Name',
              oldValue: '',
              newValue: 'Mary',
              changeType: 'added'
            },
            {
              fieldName: 'Surname',
              oldValue: '',
              newValue: 'O\'Brien',
              changeType: 'added'
            },
            {
              fieldName: 'Phone Number',
              oldValue: '',
              newValue: '087 123 4567',
              changeType: 'added'
            }
          ]
        }
      ]
    },
    {
      id: '1',
      version: 1,
      modifiedDate: '2026-01-15 09:30',
      modifiedBy: 'Sarah Murphy',
      changesSummary: 'Initial admission form created',
      changesCount: 0,
      sections: []
    }
  ];

  const getChangeTypeStyle = (changeType: FieldChange['changeType']) => {
    switch (changeType) {
      case 'added':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          label: 'Added',
          labelBg: 'bg-green-100'
        };
      case 'modified':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          label: 'Modified',
          labelBg: 'bg-blue-100'
        };
      case 'removed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          label: 'Removed',
          labelBg: 'bg-red-100'
        };
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const getComparisonData = () => {
    const [newVersion, oldVersion] = selectedVersions;
    const newVersionData = versions.find(v => v.version === newVersion);
    const oldVersionData = versions.find(v => v.version === oldVersion);
    return { newVersionData, oldVersionData };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/configuration/forms')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
            <span>Back to Forms</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Version History</h1>
            <p className="text-gray-500">{residentName} - Current Version: {currentVersion}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold">
            <Download className="h-5 w-5" />
            <span>Export History</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Timeline View</span>
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'compare'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <GitCompare className="h-5 w-5" />
            <span>Compare Versions</span>
          </button>
        </div>
      </div>

      {/* Compare Mode Selectors */}
      {viewMode === 'compare' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Versions to Compare</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Newer Version</label>
              <select
                value={selectedVersions[0]}
                onChange={(e) => setSelectedVersions([Number(e.target.value), selectedVersions[1]])}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-base"
              >
                {versions.filter(v => v.version > selectedVersions[1]).map(v => (
                  <option key={v.version} value={v.version}>
                    Version {v.version} - {new Date(v.modifiedDate).toLocaleDateString('en-IE')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Older Version</label>
              <select
                value={selectedVersions[1]}
                onChange={(e) => setSelectedVersions([selectedVersions[0], Number(e.target.value)])}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-base"
              >
                {versions.filter(v => v.version < selectedVersions[0]).map(v => (
                  <option key={v.version} value={v.version}>
                    Version {v.version} - {new Date(v.modifiedDate).toLocaleDateString('en-IE')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id} className="relative">
              {/* Timeline Line */}
              {index < versions.length - 1 && (
                <div className="absolute left-[47px] top-24 bottom-0 w-0.5 bg-gray-200" />
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Version Header */}
                <div className={`p-6 ${version.version === currentVersion ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Version Badge */}
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                        version.version === currentVersion
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gray-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-white text-xs font-semibold opacity-90">Version</div>
                          <div className="text-white text-2xl font-bold">{version.version}</div>
                        </div>
                      </div>

                      {/* Version Info */}
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{version.changesSummary}</h3>
                          {version.version === currentVersion && (
                            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(version.modifiedDate).toLocaleString('en-IE')}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{version.modifiedBy}</span>
                          </span>
                          {version.changesCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FileText className="h-4 w-4" />
                                <span>{version.changesCount} changes</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {version.version !== 1 && (
                        <button className="px-5 py-2 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg font-medium text-gray-700 transition-colors">
                          View Form
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Changes Details */}
                {version.sections.length > 0 && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {version.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${version.id}-${section.sectionName}`)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-600" />
                              <span className="font-bold text-gray-900">{section.sectionName}</span>
                              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                {section.fields.length} changes
                              </span>
                            </div>
                            {expandedSections.includes(`${version.id}-${section.sectionName}`) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>

                          {expandedSections.includes(`${version.id}-${section.sectionName}`) && (
                            <div className="p-4 bg-white space-y-3">
                              {section.fields.map((field, fieldIndex) => {
                                const style = getChangeTypeStyle(field.changeType);
                                return (
                                  <div
                                    key={fieldIndex}
                                    className={`border-2 rounded-xl p-4 ${style.bg} ${style.border}`}
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <span className="font-bold text-gray-900">{field.fieldName}</span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.labelBg} ${style.text}`}>
                                        {style.label}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Previous Value</p>
                                        <p className={`text-sm ${field.oldValue ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                          {field.oldValue || '(empty)'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">New Value</p>
                                        <p className={`text-sm font-semibold ${style.text}`}>
                                          {field.newValue || '(removed)'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare View */}
      {viewMode === 'compare' && (() => {
        const { newVersionData, oldVersionData } = getComparisonData();
        
        if (!newVersionData || !oldVersionData) {
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to compare</h3>
              <p className="text-gray-500">Please select valid versions to compare</p>
            </div>
          );
        }

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Comparison Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Version Comparison</h2>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-blue-100">Version {oldVersionData.version}</span>
                  <span className="mx-3">→</span>
                  <span className="font-bold">Version {newVersionData.version}</span>
                </div>
                <span className="px-4 py-2 bg-white bg-opacity-20 rounded-lg font-semibold">
                  {newVersionData.changesCount} changes
                </span>
              </div>
            </div>

            {/* Changes */}
            <div className="p-6">
              <div className="space-y-4">
                {newVersionData.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="font-bold text-gray-900">{section.sectionName}</span>
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                          {section.fields.length} changes
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-3">
                      {section.fields.map((field, fieldIndex) => {
                        const style = getChangeTypeStyle(field.changeType);
                        return (
                          <div
                            key={fieldIndex}
                            className={`border-2 rounded-xl p-4 ${style.bg} ${style.border}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="font-bold text-gray-900">{field.fieldName}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.labelBg} ${style.text}`}>
                                {style.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                  Version {oldVersionData.version}
                                </p>
                                <p className={`text-sm ${field.oldValue ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                  {field.oldValue || '(empty)'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                  Version {newVersionData.version}
                                </p>
                                <p className={`text-sm font-semibold ${style.text}`}>
                                  {field.newValue || '(removed)'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FormVersionManager;
