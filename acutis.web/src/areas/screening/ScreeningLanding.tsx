"use client";

import React, { useState } from 'react';
import { Phone, ClipboardCheck, CalendarClock } from 'lucide-react';
import CallLogging from './callLogging/CallLogging';
import EvaluationQueue from './evaluatiion/EvaluationQueue';
import CapacityManagement from './capacityManagment/CapacityManagement';
import Header from '@/areas/shared/layout/Header';
import { UnitDefinitions, type UnitId } from '@/areas/shared/unit/unitTypes';

interface ScreeningLandingProps {
  showOnlyCalls?: boolean;
  unitId?: UnitId;
}

const ScreeningLanding: React.FC<ScreeningLandingProps> = ({ showOnlyCalls = false, unitId = 'alcohol' }) => {
  const [activeSection, setActiveSection] = useState<'calls' | 'evaluation' | 'scheduling'>('calls');
  const unit = UnitDefinitions[unitId];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showCapacity={false}
        unitCode={unit.id}
        unitName={`${unit.name} Screening`}
        unitAccentClass={unit.accentClass}
        unitIconKey={unit.iconKey}
      />

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
                <span>Screen Calls</span>
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
                <span>Screening Queue</span>
              </button>
              <button
                onClick={() => setActiveSection('scheduling')}
                className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeSection === 'scheduling'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CalendarClock className="h-5 w-5" />
                <span>Capacity</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Section Content */}
        <div className="space-y-6">
          {(showOnlyCalls || activeSection === 'calls') && <CallLogging unitId={unitId} />}
          {!showOnlyCalls && activeSection === 'evaluation' && <EvaluationQueue unitId={unitId} />}
          {!showOnlyCalls && activeSection === 'scheduling' && <CapacityManagement />}
        </div>
      </main>
    </div>
  );
};

export default ScreeningLanding;
