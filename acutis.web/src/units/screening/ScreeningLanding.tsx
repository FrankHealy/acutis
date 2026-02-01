"use client";

import React, { useState } from 'react';
import { Phone, ClipboardCheck, BedDouble } from 'lucide-react';
import CallLogging from './components/CallLogging';
import EvaluationQueue from './components/EvaluationQueue';
import CapacityManagement from './components/CapacityManagement';
import Header from '@/units/shared/layout/Header';

interface ScreeningLandingProps {
  showOnlyCalls?: boolean;
}

const ScreeningLanding: React.FC<ScreeningLandingProps> = ({ showOnlyCalls = false }) => {
  const [activeSection, setActiveSection] = useState<'calls' | 'evaluation' | 'capacity'>('calls');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCapacity={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showOnlyCalls && (
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
          {!showOnlyCalls && activeSection === 'evaluation' && <EvaluationQueue />}
          {!showOnlyCalls && activeSection === 'capacity' && <CapacityManagement />}
        </div>
      </main>
    </div>
  );
};

export default ScreeningLanding;
