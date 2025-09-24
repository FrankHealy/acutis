import React, { useState } from 'react';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import NewAdmissionForm from './components/admissions/NewAdmissionForm';
import ResidentsSection from './components/residents/ResidentsSection';
  
const AcutisAdmissionsSystem = () => {
  const [currentStep, setCurrentStep] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'dashboard' && <Dashboard setCurrentStep={setCurrentStep} />}
        {currentStep === 'new-admission' && <NewAdmissionForm setCurrentStep={setCurrentStep} />}
        {currentStep === 'residents' && <ResidentsSection />}
      </main>
    </div>
  );
};

export default AcutisAdmissionsSystem;
export { AcutisAdmissionsSystem };