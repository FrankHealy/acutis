import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  GitCompare,
  User,
} from 'lucide-react';

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
            changeType: 'modified',
          },
          {
            fieldName: 'Policy Number',
            oldValue: 'VHI-123456',
            newValue: 'LAYA-789012',
            changeType: 'modified',
          },
        ],
      },
      {
        sectionName: 'Medical Prescriptions',
        fields: [
          {
            fieldName: 'Medication: Chlordiazepoxide Dosage',
            oldValue: '10mg TID',
            newValue: '15mg TID',
            changeType: 'modified',
          },
          {
            fieldName: 'Medication: Thiamine',
            oldValue: '',
            newValue: '100mg daily',
            changeType: 'added',
          },
        ],
      },
    ],
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
            changeType: 'added',
          },
          {
            fieldName: 'Surname',
            oldValue: '',
            newValue: "O'Brien",
            changeType: 'added',
          },
          {
            fieldName: 'Phone Number',
            oldValue: '',
            newValue: '087 123 4567',
            changeType: 'added',
          },
        ],
      },
    ],
  },
  {
    id: '1',
    version: 1,
    modifiedDate: '2026-01-15 09:30',
    modifiedBy: 'Sarah Murphy',
    changesSummary: 'Initial admission form created',
    changesCount: 0,
    sections: [],
  },
];

const residentName = "Michael O'Brien";
const currentVersion = 3;

const FormVersionManager = () => {
  const router = useRouter();
  const [selectedVersions, setSelectedVersions] = useState<[number, number]>([3, 2]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['3-Medical & Insurance']);
  const [viewMode, setViewMode] = useState<'timeline' | 'compare'>('timeline');

  const getChangeTypeStyle = (changeType: FieldChange['changeType']) => {
    switch (changeType) {
      case 'added':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          label: 'Added',
          labelBg: 'bg-green-100',
        };
      case 'modified':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          label: 'Modified',
          labelBg: 'bg-blue-100',
        };
      case 'removed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          label: 'Removed',
          labelBg: 'bg-red-100',
        };
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((current) =>
      current.includes(sectionName)
        ? current.filter((section) => section !== sectionName)
        : [...current, sectionName],
    );
  };

  const getComparisonData = () => {
    const [newVersion, oldVersion] = selectedVersions;
    return {
      newVersionData: versions.find((version) => version.version === newVersion),
      oldVersionData: versions.find((version) => version.version === oldVersion),
    };
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="app-surface mb-6 rounded-3xl border p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <button
                onClick={() => router.push('/units/config/forms')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Forms</span>
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-muted)]">
                  Configuration
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--app-text)]">Form Version History</h1>
                <p className="mt-1 text-[var(--app-text-muted)]">
                  {residentName} - Current Version: {currentVersion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="app-primary-button inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-colors">
                <Download className="h-5 w-5" />
                <span>Export History</span>
              </button>
            </div>
          </div>
        </section>

        <section className="app-surface mb-6 rounded-2xl border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'app-primary-button shadow-md'
                  : 'app-surface-muted border text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Timeline View</span>
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                viewMode === 'compare'
                  ? 'app-primary-button shadow-md'
                  : 'app-surface-muted border text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              <GitCompare className="h-5 w-5" />
              <span>Compare Versions</span>
            </button>
          </div>
        </section>

        {viewMode === 'compare' && (
          <section className="app-surface mb-6 rounded-2xl border p-6">
            <h3 className="mb-4 text-lg font-bold text-[var(--app-text)]">Select Versions to Compare</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--app-text-muted)]">Newer Version</label>
                <select
                  value={selectedVersions[0]}
                  onChange={(event) => setSelectedVersions([Number(event.target.value), selectedVersions[1]])}
                  className="w-full rounded-xl border px-4 py-3 text-base text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
                >
                  {versions
                    .filter((version) => version.version > selectedVersions[1])
                    .map((version) => (
                      <option key={version.version} value={version.version}>
                        Version {version.version} - {new Date(version.modifiedDate).toLocaleDateString('en-IE')}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--app-text-muted)]">Older Version</label>
                <select
                  value={selectedVersions[1]}
                  onChange={(event) => setSelectedVersions([selectedVersions[0], Number(event.target.value)])}
                  className="w-full rounded-xl border px-4 py-3 text-base text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none"
                >
                  {versions
                    .filter((version) => version.version < selectedVersions[0])
                    .map((version) => (
                      <option key={version.version} value={version.version}>
                        Version {version.version} - {new Date(version.modifiedDate).toLocaleDateString('en-IE')}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="relative">
                {index < versions.length - 1 && (
                  <div className="absolute bottom-0 left-[47px] top-24 w-0.5 bg-[var(--app-border)]" />
                )}

                <div className="app-surface overflow-hidden rounded-2xl border">
                  <div
                    className={`p-6 ${
                      version.version === currentVersion
                        ? 'bg-[linear-gradient(135deg,var(--app-primary-soft),var(--app-accent-soft))]'
                        : 'app-surface-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ${
                            version.version === currentVersion ? 'app-gradient-bar' : 'bg-slate-400'
                          }`}
                        >
                          <div className="text-center text-white">
                            <div className="text-xs font-semibold opacity-90">Version</div>
                            <div className="text-2xl font-bold">{version.version}</div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-[var(--app-text)]">{version.changesSummary}</h3>
                            {version.version === currentVersion && (
                              <span className="app-primary-button rounded-full px-3 py-1 text-xs font-bold">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--app-text-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(version.modifiedDate).toLocaleString('en-IE')}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{version.modifiedBy}</span>
                            </span>
                            {version.changesCount > 0 && (
                              <>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{version.changesCount} changes</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {version.version !== 1 && (
                        <button className="rounded-lg border px-5 py-2 font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]">
                          View Form
                        </button>
                      )}
                    </div>
                  </div>

                  {version.sections.length > 0 && (
                    <div className="border-t p-6">
                      <div className="space-y-4">
                        {version.sections.map((section, sectionIndex) => {
                          const sectionKey = `${version.id}-${section.sectionName}`;
                          const expanded = expandedSections.includes(sectionKey);

                          return (
                            <div key={sectionIndex} className="overflow-hidden rounded-xl border">
                              <button
                                onClick={() => toggleSection(sectionKey)}
                                className="app-surface-muted flex w-full items-center justify-between p-4 transition-colors hover:brightness-[0.98]"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[var(--app-text-muted)]" />
                                  <span className="font-bold text-[var(--app-text)]">{section.sectionName}</span>
                                  <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--app-primary)]">
                                    {section.fields.length} changes
                                  </span>
                                </div>
                                {expanded ? (
                                  <ChevronUp className="h-5 w-5 text-[var(--app-text-muted)]" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-[var(--app-text-muted)]" />
                                )}
                              </button>

                              {expanded && (
                                <div className="space-y-3 p-4">
                                  {section.fields.map((field, fieldIndex) => {
                                    const style = getChangeTypeStyle(field.changeType);

                                    return (
                                      <div key={fieldIndex} className={`rounded-xl border-2 p-4 ${style.bg} ${style.border}`}>
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                          <span className="font-bold text-[var(--app-text)]">{field.fieldName}</span>
                                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.labelBg} ${style.text}`}>
                                            {style.label}
                                          </span>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                          <div>
                                            <p className="mb-1 text-xs font-semibold text-[var(--app-text-muted)]">Previous Value</p>
                                            <p className={`text-sm ${field.oldValue ? 'text-[var(--app-text)]' : 'italic text-[var(--app-text-muted)]'}`}>
                                              {field.oldValue || '(empty)'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="mb-1 text-xs font-semibold text-[var(--app-text-muted)]">New Value</p>
                                            <p className={`text-sm font-semibold ${style.text}`}>{field.newValue || '(removed)'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'compare' &&
          (() => {
            const { newVersionData, oldVersionData } = getComparisonData();

            if (!newVersionData || !oldVersionData) {
              return (
                <div className="app-surface rounded-2xl border p-12 text-center">
                  <AlertCircle className="mx-auto mb-4 h-16 w-16 text-[var(--app-text-muted)]" />
                  <h3 className="mb-2 text-xl font-bold text-[var(--app-text)]">Unable to compare</h3>
                  <p className="text-[var(--app-text-muted)]">Please select valid versions to compare</p>
                </div>
              );
            }

            return (
              <div className="app-surface overflow-hidden rounded-2xl border">
                <div className="app-gradient-bar p-6 text-white">
                  <h2 className="mb-2 text-2xl font-bold">Version Comparison</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-blue-100">Version {oldVersionData.version}</span>
                      <span className="mx-3">&rarr;</span>
                      <span className="font-bold">Version {newVersionData.version}</span>
                    </div>
                    <span className="rounded-lg bg-white/20 px-4 py-2 font-semibold">
                      {newVersionData.changesCount} changes
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {newVersionData.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="overflow-hidden rounded-xl border">
                        <div className="app-surface-muted border-b p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[var(--app-text-muted)]" />
                            <span className="font-bold text-[var(--app-text)]">{section.sectionName}</span>
                            <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--app-primary)]">
                              {section.fields.length} changes
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          {section.fields.map((field, fieldIndex) => {
                            const style = getChangeTypeStyle(field.changeType);

                            return (
                              <div key={fieldIndex} className={`rounded-xl border-2 p-4 ${style.bg} ${style.border}`}>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <span className="font-bold text-[var(--app-text)]">{field.fieldName}</span>
                                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.labelBg} ${style.text}`}>
                                    {style.label}
                                  </span>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="mb-1 text-xs font-semibold text-[var(--app-text-muted)]">
                                      Version {oldVersionData.version}
                                    </p>
                                    <p className={`text-sm ${field.oldValue ? 'text-[var(--app-text)]' : 'italic text-[var(--app-text-muted)]'}`}>
                                      {field.oldValue || '(empty)'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs font-semibold text-[var(--app-text-muted)]">
                                      Version {newVersionData.version}
                                    </p>
                                    <p className={`text-sm font-semibold ${style.text}`}>{field.newValue || '(removed)'}</p>
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
      </main>
    </div>
  );
};

export default FormVersionManager;
