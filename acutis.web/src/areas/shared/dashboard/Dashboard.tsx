import React from 'react';
import StatsCards from './StatsCards';
import UnitDailyTimeline from './UnitDailyTimeline';
import QuickActions from './QuickActions';
import RecentAdmissions from './RecentAdmissions';
import Notifications from './Notifications';

interface DashboardProps {
  setCurrentStep: (step: string) => void;
  unitId: string;
  unitName: string;
  showAdmissions: boolean;
  showExtendedAssessment?: boolean;
  onOpenGroupTherapy: (moduleKey?: string) => void;
  onOpenRollCall: () => void;
  onOpenCarePlan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentStep, unitId, unitName, showAdmissions, showExtendedAssessment = false, onOpenGroupTherapy, onOpenRollCall, onOpenCarePlan }) => {
  return (
    <div className="space-y-6">
      <StatsCards unitName={unitName} />
      {/* Replaces the four unit indicators with the Detox Daily Timeline */}
      <UnitDailyTimeline unitId={unitId} unitName={unitName} onOpenGroupTherapy={onOpenGroupTherapy} onOpenRollCall={onOpenRollCall} onOpenCarePlan={onOpenCarePlan} />
      <QuickActions setCurrentStep={setCurrentStep} showAdmissions={showAdmissions} showExtendedAssessment={showExtendedAssessment} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAdmissions unitName={unitName} />
        <Notifications unitName={unitName} />
      </div>
    </div>
  );
};

export default Dashboard;
