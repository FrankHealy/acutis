// src/App.tsx

import React, { useState } from 'react';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import NewAdmissionForm from './components/admissions/NewAdmissionForm';
import ResidentsSection from './components/residents/ResidentsSection';

type Step = 'dashboard' | 'new-admission' | 'residents';

const AcutisAdmissionsSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('dashboard');

  // Wrapper keeps our internal Step type but remains compatible with children
  // that expect (step: string) => void
  const goTo = (step: string) => setCurrentStep(step as Step);

  const renderStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <Dashboard setCurrentStep={goTo} />;
      case 'new-admission':
        return <NewAdmissionForm setCurrentStep={goTo} />;
      case 'residents':
        return <ResidentsSection />;
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
