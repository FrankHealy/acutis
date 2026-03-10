// src/units/shared/layout/Navigation.tsx

import React from 'react';
import { Pill, Shield, Venus, Wine } from "lucide-react";
import type { UnitDefinition } from "@/areas/shared/unit/unitTypes";

interface NavigationProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  showAdmissions: boolean;
  unitName: string;
  unitAccentClass: string;
  unitIconKey: UnitDefinition["iconKey"];
}

const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  setCurrentStep,
  showAdmissions,
  unitName,
  unitAccentClass,
  unitIconKey,
}) => {
  const unitIconMap = {
    wine: Wine,
    shield: Shield,
    pill: Pill,
    venus: Venus,
  } as const;
  const UnitIcon = unitIconMap[unitIconKey];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex space-x-6 items-center">
          <button
            onClick={() => setCurrentStep('dashboard')}
            className={`text-sm font-medium ${
              currentStep === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>

          {showAdmissions && (
            <button
              onClick={() => setCurrentStep('new-admission')}
              className={`text-sm font-medium ${
                currentStep === 'new-admission' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admissions
            </button>
          )}

          <button
            onClick={() => setCurrentStep('residents')}
            className={`text-sm font-medium ${
              currentStep === 'residents' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Residents
          </button>

          <button
            onClick={() => setCurrentStep('configuration')}
            className={`text-sm font-medium ${
              currentStep === 'configuration' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Configuration
          </button>

          {/* Operations dropdown */}
          <div className="relative group">
            <button
              className={`text-sm font-medium ${
                currentStep.startsWith('operations')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Operations
            </button>
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {[
                { key: 'operations/day-planner', label: 'Day Planner' },
                { key: 'operations/room-mapping', label: 'Room Assignments' },
                { key: 'operations/ot-roles', label: 'OT Roles' },
                { key: 'operations/therapy-schedule', label: 'Therapy Schedule' },
                { key: 'operations/meditation', label: 'Meditation' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentStep(item.key)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    currentStep === item.key
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
            <UnitIcon className={`h-4 w-4 ${unitAccentClass}`} />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Unit</span>
            <span className={`text-sm font-semibold ${unitAccentClass}`}>{unitName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
