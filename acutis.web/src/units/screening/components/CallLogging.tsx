"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Clock, User, Calendar, Save, X } from 'lucide-react';
import { fetchMockCallLogs, type CallLog } from '@/data/mock/callLogs';

const CallLogging: React.FC = () => {
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [activeDay, setActiveDay] = useState<0 | 1 | 2>(0);
  const [timeSort, setTimeSort] = useState<'desc' | 'asc'>('desc');
  const [allCalls, setAllCalls] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadCalls = async () => {
      try {
        const data = await fetchMockCallLogs();
        if (isActive) {
          setAllCalls(data);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCalls();

    return () => {
      isActive = false;
    };
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredCalls = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - activeDay);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const callsForDay = allCalls.filter((call) => {
      const ts = new Date(call.timestamp);
      return ts >= start && ts < end;
    });
    return callsForDay.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return timeSort === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [activeDay, allCalls, timeSort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Logging</h2>
          <p className="text-sm text-gray-500">Track incoming calls by day and unit.</p>
        </div>
        <button
          onClick={() => setShowNewCallForm(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Log New Call</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          {([
            { label: 'Today', value: 0 },
            { label: 'Yesterday', value: 1 },
            { label: '2 Days Ago', value: 2 },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveDay(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeDay === item.value
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
                  No calls logged for this day.
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatTime(call.timestamp)}
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

      {/* New Call Form Modal */}
      {showNewCallForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Log New Call</h3>
                  <p className="text-sm text-gray-500">Record incoming inquiry</p>
                </div>
                <button
                  onClick={() => setShowNewCallForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                    placeholder="Enter surname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caller Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue="self"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  >
                    <option value="self">Self</option>
                    <option value="family">Family Member</option>
                    <option value="professional">Healthcare Professional</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Concern Type <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
                    <option value="">Select concern...</option>
                    <option value="alcohol">Alcohol</option>
                    <option value="drugs">Drugs</option>
                    <option value="gambling">Gambling</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                    placeholder="087 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                    placeholder="City/County"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Call Notes
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-base"
                    placeholder="Optional notes about the call..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNewCallForm(false)}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5" />
                    <span>Save Call Log</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogging;
