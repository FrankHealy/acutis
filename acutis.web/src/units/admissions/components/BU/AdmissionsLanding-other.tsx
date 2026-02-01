// src/units/admissions/AdmissionsSystem.tsx

import React, { useState } from 'react';
import Header from '@/units/shared/layout/Header';
import Navigation from '@/units/shared/layout/Navigation';
import AdmissionsDashboard from '@/units/admissions/components/AdmissionsDashboard';
import NewAdmissionForm from '@/units/admissions/components/NewAdmissionForm';
import ExpectedAdmissions from '@/units/admissions/components/ExpectedAdmissions';
import AdmissionsList from '@/units/admissions/components/AdmissionsList';
import AdmissionDetails from '@/units/admissions/components/AdmissionDetails';
import AdmissionSearch from '@/units/admissions/components/AdmissionSearch';
import FormDesigner from '@/units/admissions/config/FormDesigner';
import FormVersionManager from '@/units/admissions/config/FormVersionManager';

type Step =
  | 'dashboard'
  | 'new-admission'
  | 'expected-admissions'
  | 'admissions-list'
  | 'admission-details'
  | 'search'
  | 'config/form-designer'
  | 'config/version-history';

const AdmissionsSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('dashboard');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);

  const goTo = (step: string, admissionId?: string) => {
    setCurrentStep(step as Step);
    if (admissionId) {
      setSelectedAdmissionId(admissionId);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <AdmissionsDashboard setCurrentStep={goTo} />;
      case 'new-admission':
        return <NewAdmissionForm setCurrentStep={goTo} admissionId={selectedAdmissionId} />;
      case 'expected-admissions':
        return <ExpectedAdmissions setCurrentStep={goTo} />;
      case 'admissions-list':
        return <AdmissionsList setCurrentStep={goTo} />;
      case 'admission-details':
        return <AdmissionDetails setCurrentStep={goTo} admissionId={selectedAdmissionId} />;
      case 'search':
        return <AdmissionSearch setCurrentStep={goTo} />;
      case 'config/form-designer':
        return <FormDesigner setCurrentStep={goTo} />;
      case 'config/version-history':
        return <FormVersionManager setCurrentStep={goTo} />;
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

export default AdmissionsSystem;
export { AdmissionsSystem };
