// src/units/shared/layout/Navigation.tsx

import React from 'react';

interface NavigationProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  showAdmissions: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  setCurrentStep,
  showAdmissions,
}) => {
  return (
    <nav className="app-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex space-x-6 items-center">
          <button
            onClick={() => setCurrentStep('dashboard')}
            className={`text-sm font-medium ${
              currentStep === 'dashboard' ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Dashboard
          </button>

          {showAdmissions && (
            <button
              onClick={() => setCurrentStep('new-admission')}
              className={`text-sm font-medium ${
                currentStep === 'new-admission' ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Admissions
            </button>
          )}

          <button
            onClick={() => setCurrentStep('residents')}
            className={`text-sm font-medium ${
              currentStep === 'residents' ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Residents
          </button>

          <button
            onClick={() => setCurrentStep('configuration')}
            className={`text-sm font-medium ${
              currentStep === 'configuration' ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Configuration
          </button>

          {/* Operations dropdown */}
          <div className="relative group">
            <button
              className={`text-sm font-medium ${
                currentStep.startsWith('operations')
                  ? 'text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Operations
            </button>
            <div className="absolute left-0 mt-2 w-56 rounded-lg border bg-[var(--app-surface)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
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
                      ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)] font-medium'
                      : 'text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
