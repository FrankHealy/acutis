"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import evaluationTemplate from '@/data/evaluationTemplate.json';
import { useSession } from 'next-auth/react';
import {
  fetchEvaluationQueue,
  type EvaluationQueueItem,
} from './evaluationQueueService';
import { getScreeningControl } from '@/areas/screening/services/screeningControlService';
import DynamicFormRenderer from '@/areas/screening/forms/DynamicFormRenderer';
import {
  type GetActiveFormResponse,
  type JsonValue,
} from '@/areas/screening/forms/ApiClient';
import {
  loadEvaluationForm,
  saveEvaluationDraft,
  submitEvaluationForm,
} from '@/areas/screening/services/evaluationFormService';
import { useLocalization } from '@/areas/shared/i18n/LocalizationProvider';
import { isAuthorizationDisabled, isAuthorizedClient } from '@/lib/authMode';
import type { UnitId } from '@/areas/shared/unit/unitTypes';

interface EvaluationCandidate {
  caseId: string;
  residentId: string | null;
  name: string;
  firstName?: string;
  surname?: string;
  unit: string;
  intakeSource: string;
  numCalls: number;
  lastCallDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled';
  hasScreeningStarted: boolean;
  evaluationData?: Record<string, unknown>;
}

type EvaluationQueueProps = {
  unitId?: UnitId;
};

const EvaluationQueue: React.FC<EvaluationQueueProps> = ({ unitId = 'alcohol' }) => {
  const { data: session, status } = useSession();
  const { locale, mergeTranslations, t, loadKeys } = useLocalization();
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluationCandidate | null>(null);
  const [candidates, setCandidates] = useState<EvaluationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'surname' | 'unit' | 'lastCallDate';
    direction: 'asc' | 'desc';
  }>({ key: 'surname', direction: 'asc' });
  const defaultEvaluationData = useMemo(
    () => evaluationTemplate as Record<string, unknown>,
    []
  );

  useEffect(() => {
    void loadKeys([
      'evaluation.queue.title',
      'evaluation.stats.pending',
      'evaluation.stats.in_progress',
      'evaluation.stats.scheduled',
      'evaluation.stats.completed',
      'evaluation.table.surname',
      'evaluation.table.name',
      'evaluation.table.unit',
      'evaluation.table.source',
      'evaluation.table.last_call_date',
      'evaluation.table.num_calls',
      'evaluation.table.status',
      'evaluation.table.action',
      'evaluation.action.view',
      'evaluation.modal.subtitle',
      'evaluation.loading.queue',
      'evaluation.empty.queue',
      'evaluation.loading.form',
      'evaluation.empty.form',
      'evaluation.status.pending',
      'evaluation.status.in_progress',
      'evaluation.status.scheduled',
      'evaluation.status.completed',
    ]);
  }, [loadKeys]);

  const loadQueue = React.useCallback(async (forceRefresh = false, withLoader = false) => {
    try {
      if (withLoader) {
        setIsLoading(true);
      }
      if (!isAuthorizedClient(status, session?.accessToken)) {
        setIsLoading(false);
        return;
      }
      const queue = await fetchEvaluationQueue(session?.accessToken, { forceRefresh, unitId });
      const mapped = queue.map((item: EvaluationQueueItem) => ({
        caseId: item.caseId,
        residentId: item.residentId,
        name: `${item.name} ${item.surname}`.trim(),
        firstName: item.name,
        surname: item.surname,
        unit: item.unit,
        intakeSource: item.intakeSource,
        numCalls: item.numCalls,
        lastCallDate: item.lastCallDate,
        status: (item.status as EvaluationCandidate['status']) ?? 'pending',
        hasScreeningStarted: item.hasScreeningStarted,
        evaluationData: defaultEvaluationData,
      }));
      setCandidates(mapped);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load evaluation queue.');
    } finally {
      if (withLoader) {
        setIsLoading(false);
      }
    }
  }, [defaultEvaluationData, session?.accessToken, status, unitId]);

  useEffect(() => {
    void loadQueue(false, true);
  }, [loadQueue]);

  useEffect(() => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    let intervalId: number | null = null;
    let disposed = false;

    const start = async () => {
      try {
        const control = await getScreeningControl(session?.accessToken, { unitId });
        if (disposed) return;
        const seconds = Math.max(5, control.evaluationQueueCacheSeconds || 30);
        intervalId = window.setInterval(() => {
          void loadQueue(true, false);
        }, seconds * 1000);
      } catch {
        if (disposed) return;
        intervalId = window.setInterval(() => {
          void loadQueue(true, false);
        }, 30_000);
      }
    };

    void start();

    return () => {
      disposed = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [loadQueue, session?.accessToken, status, unitId]);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      if (!isAuthorizedClient(status, session?.accessToken) || !selectedCandidate) {
        setFormData(null);
        setFormError(null);
        return;
      }

      try {
        setFormLoading(true);
        const accessToken = session?.accessToken;
        if (!accessToken && !isAuthorizationDisabled) {
          setFormData(null);
          setFormError("Session expired.");
          return;
        }
          const response = await loadEvaluationForm({
          accessToken,
          locale,
          residentCaseId: selectedCandidate.caseId,
        });
        if (!active) return;
        setFormData(response);
        mergeTranslations(response.translations);
        setFormError(null);
      } catch (error) {
        if (!active) return;
        setFormError(error instanceof Error ? error.message : 'Failed to load evaluation form.');
      } finally {
        if (active) {
          setFormLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [locale, mergeTranslations, selectedCandidate, session?.accessToken, status]);

  const getCandidateNameParts = (candidate: EvaluationCandidate) => {
    if (candidate.firstName || candidate.surname) {
      return {
        firstName: candidate.firstName ?? '',
        surname: candidate.surname ?? '',
      };
    }
    const parts = candidate.name.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], surname: '' };
    }
    return { firstName: parts[0], surname: parts.slice(1).join(' ') };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'in-progress': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'scheduled': return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
      default: return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getStatusLabel = (status: EvaluationCandidate['status']) => {
    switch (status) {
      case 'completed':
        return t('evaluation.status.completed');
      case 'in-progress':
        return t('evaluation.status.in_progress');
      case 'scheduled':
        return t('evaluation.status.scheduled');
      default:
        return t('evaluation.status.pending');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSortableValue = (candidate: EvaluationCandidate, key: typeof sortConfig.key) => {
    if (key === 'lastCallDate') {
      return new Date(candidate.lastCallDate).getTime();
    }
    if (key === 'unit') {
      return candidate.unit.toLowerCase();
    }
    const { surname } = getCandidateNameParts(candidate);
    return surname.toLowerCase();
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const aValue = getSortableValue(a, sortConfig.key);
    const bValue = getSortableValue(b, sortConfig.key);
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getActionLabel = (candidate: EvaluationCandidate) => {
    return candidate.hasScreeningStarted || candidate.status === 'completed'
      ? 'Review Screening'
      : 'Start Screening';
  };

  const getSourceLabel = (intakeSource: string) => {
    switch (intakeSource) {
      case 'face_to_face':
        return 'Face to Face';
      case 'self_screening':
        return 'Self Screening';
      default:
        return 'Screening Call';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('evaluation.stats.pending')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {candidates.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('evaluation.stats.in_progress')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {candidates.filter(c => c.status === 'in-progress').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('evaluation.stats.scheduled')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {candidates.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('evaluation.stats.completed')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {candidates.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <h2 className="text-lg font-semibold text-gray-900">{t('evaluation.queue.title')}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('surname')}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {t('evaluation.table.surname')}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === 'surname' && sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('evaluation.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('unit')}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {t('evaluation.table.unit')}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === 'unit' && sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('evaluation.table.source')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('lastCallDate')}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {t('evaluation.table.last_call_date')}
                    <span className="text-[10px] text-gray-400">
                      {sortConfig.key === 'lastCallDate' && sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('evaluation.table.num_calls')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('evaluation.table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('evaluation.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t('evaluation.loading.queue')}
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-red-600">
                    {errorMessage}
                  </td>
                </tr>
              ) : sortedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t('evaluation.empty.queue')}
                  </td>
                </tr>
              ) : sortedCandidates.map((candidate) => (
                <tr key={candidate.caseId} className="hover:bg-slate-50 transition-colors">
                  {(() => {
                    const { firstName, surname } = getCandidateNameParts(candidate);
                    return (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{surname}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{firstName}</td>
                      </>
                    );
                  })()}
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{candidate.unit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{getSourceLabel(candidate.intakeSource)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{formatDate(candidate.lastCallDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 font-semibold">{candidate.numCalls}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(candidate.status)}`}>
                      {getStatusLabel(candidate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      {getActionLabel(candidate)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Form Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 p-6 bg-slate-50/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedCandidate.name}</h3>
                  <p className="text-sm text-gray-500">Screening Form</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {formLoading ? (
                <div className="text-sm text-gray-500">{t('evaluation.loading.form')}</div>
              ) : formError ? (
                <div className="text-sm text-red-600">{formError}</div>
              ) : formData ? (
                <DynamicFormRenderer
                  form={formData.form}
                  optionSets={formData.optionSets}
                  locale={locale}
                  initialSubmissionId={formData.submissionId}
                  initialAnswers={{
                    callerName:
                      (formData.draftAnswers?.callerName as JsonValue | undefined) ??
                      `${selectedCandidate.firstName ?? ''} ${selectedCandidate.surname ?? ''}`.trim(),
                    ...formData.draftAnswers,
                  } as Record<string, JsonValue>}
                  subjectType="admission"
                  subjectId={selectedCandidate.caseId}
                  onSaveProgress={async ({ submissionId, answers }) =>
                    saveEvaluationDraft({
                      accessToken: session?.accessToken ?? '',
                      locale,
                      residentCaseId: selectedCandidate.caseId,
                      formCode: formData.form.code,
                      formVersion: formData.form.version,
                      submissionId,
                      answers,
                    })
                  }
                  onSave={async ({ submissionId, answers }) =>
                    submitEvaluationForm({
                      accessToken: session?.accessToken ?? '',
                      locale,
                      residentCaseId: selectedCandidate.caseId,
                      formCode: formData.form.code,
                      formVersion: formData.form.version,
                      submissionId,
                      answers,
                    })
                  }
                />
              ) : (
                <div className="text-sm text-gray-500">{t('evaluation.empty.form')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationQueue;
