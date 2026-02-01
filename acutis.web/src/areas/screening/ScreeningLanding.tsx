"use client";

import React, { useMemo, useState } from 'react';
import { Phone, ClipboardCheck, BedDouble } from 'lucide-react';
import { useSession } from 'next-auth/react';
import CallLogging from './callLogging/CallLogging';
import EvaluationQueue from './evaluatiion/EvaluationQueue';
import CapacityManagement from './capacityManagment/CapacityManagement';
import Header from '@/areas/shared/layout/Headerold';

interface ScreeningLandingProps {
  showOnlyCalls?: boolean;
}

const ScreeningLanding: React.FC<ScreeningLandingProps> = ({ showOnlyCalls = false }) => {
  const { data: session } = useSession();
  const roles = useMemo(() => session?.roles ?? [], [session?.roles]);
  const isReception = roles.some((role) => role.toLowerCase() === 'reception');
  const showCallsOnly = showOnlyCalls || isReception;
  const [activeSection, setActiveSection] = useState<'calls' | 'evaluation' | 'capacity'>('calls');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCapacity={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showCallsOnly && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveSection('calls')}
                className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeSection === 'calls'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Phone className="h-5 w-5" />
                <span>Call Logging</span>
              </button>
              <button
                onClick={() => setActiveSection('evaluation')}
                className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeSection === 'evaluation'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClipboardCheck className="h-5 w-5" />
                <span>Evaluation</span>
              </button>
              <button
                onClick={() => setActiveSection('capacity')}
                className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeSection === 'capacity'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BedDouble className="h-5 w-5" />
                <span>Capacity Management</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Section Content */}
        <div className="space-y-6">
          <CallLogging />
          {!showCallsOnly && activeSection === 'evaluation' && <EvaluationQueue />}
          {!showCallsOnly && activeSection === 'capacity' && <CapacityManagement />}
        </div>
      </main>
    </div>
  );
};

export default ScreeningLanding;
