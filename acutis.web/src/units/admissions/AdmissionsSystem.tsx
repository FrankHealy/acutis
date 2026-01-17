// src/units/admissions/AdmissionsSystem.tsx

import React, { useState } from 'react';
import Header from '@/units/shared/layout/Header';
import Navigation from '@/units/shared/layout/Navigation';
import Dashboard from '@/units/shared/dashboard/Dashboard';
import NewAdmissionForm from '@/units/admissions/components/NewAdmissionForm';
import ResidentsSection from '@/units/shared/residents/ResidentsSection';
import RoomAssignments from '@/units/shared/operations/RoomAssignments';
import GroupTherapySection from '@/units/shared/operations/GroupTherapySection';

type Step =
  | 'dashboard'
  | 'new-admission'
  | 'residents'
  | 'operations/room-mapping'
  | 'operations/ot-roles'
  | 'operations/therapy-schedule';

const AcutisAdmissionsSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('dashboard');

  const goTo = (step: string) => setCurrentStep(step as Step);

  const renderStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <Dashboard setCurrentStep={goTo} />;
      case 'new-admission':
        return <NewAdmissionForm setCurrentStep={goTo} />;
      case 'residents':
        return <ResidentsSection />;
      case 'operations/room-mapping':
        return <RoomAssignments />;
      case 'operations/ot-roles':
        return (
          <div className="p-6 bg-white rounded-xl shadow">
            OT Roles (coming soon)
          </div>
        );
      case 'operations/therapy-schedule':
        return <GroupTherapySection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation currentStep={currentStep} setCurrentStep={goTo} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </main>
    </div>
  );
};

export default AcutisAdmissionsSystem;
export { AcutisAdmissionsSystem };
