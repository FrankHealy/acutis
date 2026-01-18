import React from 'react';
import AdmissionsStats from './AdmissionsStats';
import AdmissionsQuickActions from './AdmissionsQuickActions';
import RecentAdmissions from './RecentAdmissions';
import RecentActivity from './RecentActivity';

interface AdmissionsLandingProps {
  setCurrentStep: (step: string, admissionId?: string) => void;
}

const AdmissionsLanding: React.FC<AdmissionsLandingProps> = ({ setCurrentStep }) => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <AdmissionsStats />
      
      {/* Quick Actions - Admissions & Configuration Cards */}
      <AdmissionsQuickActions setCurrentStep={setCurrentStep} />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAdmissions setCurrentStep={setCurrentStep} />
        <RecentActivity />
      </div>
    </div>
  );
};

export default AdmissionsLanding;
