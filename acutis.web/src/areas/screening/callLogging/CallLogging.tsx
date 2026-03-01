"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Clock, User, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { CallLog } from '@/data/mock/callLogs';
import CallLoggingModal, {
  type CallLoggingFormState,
} from '@/areas/screening/callLogging/modal/CallLoggingModal';
import {
  type CallLogRangeDays,
  formatCallLogTime,
  getFilteredCalls,
} from '@/areas/screening/callLogging/helpers/callLoggingHelpers';
import {
  createCallLog,
  fetchCallLogs,
} from '@/areas/screening/services/callLoggingService';
import { getScreeningControl } from '@/areas/screening/services/screeningControlService';

const CallLogging: React.FC = () => {
  const { data: session, status } = useSession();
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [activeRangeDays, setActiveRangeDays] = useState<CallLogRangeDays>(2);
  const [timeSort, setTimeSort] = useState<'desc' | 'asc'>('desc');
  const [allCalls, setAllCalls] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<CallLoggingFormState>({
    firstName: '',
    surname: '',
    callerType: 'self' as CallLog['callerType'],
    concernType: '' as '' | CallLog['concernType'],
    unit: 'Alcohol' as CallLog['unit'],
    location: '',
    phoneNumber: '',
    notes: '',
  });

  const loadCalls = useCallback(async (forceRefresh = false, withLoader = false) => {
    try {
      if (withLoader) {
        setIsLoading(true);
      }
      if (status !== 'authenticated') {
        setIsLoading(false);
        return;
      }
      const data = await fetchCallLogs(session?.accessToken, {
        forceRefresh,
        rangeDays: activeRangeDays,
      });
      setAllCalls(data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load call logs.');
    } finally {
      if (withLoader) {
        setIsLoading(false);
      }
    }
  }, [activeRangeDays, session?.accessToken, status]);

  useEffect(() => {
    void loadCalls(false, true);
  }, [loadCalls]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let intervalId: number | null = null;
    let disposed = false;

    const start = async () => {
      try {
        const control = await getScreeningControl(session?.accessToken);
        if (disposed) return;
        const seconds = Math.max(5, control.callLogsCacheSeconds || 30);
        intervalId = window.setInterval(() => {
          void loadCalls(true, false);
        }, seconds * 1000);
      } catch {
        if (disposed) return;
        intervalId = window.setInterval(() => {
          void loadCalls(true, false);
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
  }, [loadCalls, session?.accessToken, status]);

  const handleFormChange = (
    field: keyof typeof formState,
    value: string,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState({
      firstName: '',
      surname: '',
      callerType: 'self',
      concernType: '',
      unit: 'Alcohol',
      location: '',
      phoneNumber: '',
      notes: '',
    });
  };

  const handleSaveCallLog = async () => {
    if (!formState.firstName || !formState.surname || !formState.concernType) {
      setErrorMessage('Please complete the required fields.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (status !== 'authenticated') {
        throw new Error('You must be signed in to save a call.');
      }
      const newCall = await createCallLog({
        ...formState,
        concernType: formState.concernType as CallLog['concernType'],
        status: 'new',
        urgency: 'medium',
        timestamp: new Date().toISOString(),
      }, session?.accessToken);

      setAllCalls((prev) => [newCall, ...prev]);
      setShowNewCallForm(false);
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save call log.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCalls = useMemo(
    () => getFilteredCalls(allCalls, activeRangeDays, timeSort),
    [activeRangeDays, allCalls, timeSort],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Logging</h2>
          <p className="text-sm text-gray-500">Track incoming calls by day and unit.</p>
        </div>
        <button
          onClick={() => {
            setShowNewCallForm(true);
            setErrorMessage(null);
          }}
          className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Log New Call</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          {([
            { label: 'Last 2 Days', value: 2 },
            { label: 'Last Week', value: 7 },
            { label: 'Last 2 Weeks', value: 14 },
            { label: 'Last Month', value: 30 },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveRangeDays(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeRangeDays === item.value
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Showing {filteredCalls.length} calls
        </div>
      </div>

      {errorMessage && !showNewCallForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => setTimeSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Time
                  <span className="text-[10px] text-gray-400">
                    {timeSort === 'asc' ? '▲' : '▼'}
                  </span>
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Surname
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  Loading call logs...
                </td>
              </tr>
            ) : filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No calls logged for this range.
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatCallLogTime(call.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{call.surname}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{call.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{call.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{call.notes}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CallLoggingModal
        isOpen={showNewCallForm}
        formState={formState}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onChange={handleFormChange}
        onClose={() => {
          setShowNewCallForm(false);
          setErrorMessage(null);
        }}
        onSave={handleSaveCallLog}
      />
    </div>
  );
};

export default CallLogging;
