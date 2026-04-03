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
  onOpenGroupTherapy: (moduleKey?: string) => void;
  onOpenRollCall: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentStep, unitId, unitName, showAdmissions, onOpenGroupTherapy, onOpenRollCall }) => {
  return (
    <div className="space-y-6">
      <StatsCards unitName={unitName} />
      {/* Replaces the four unit indicators with the Detox Daily Timeline */}
      <UnitDailyTimeline unitId={unitId} unitName={unitName} onOpenGroupTherapy={onOpenGroupTherapy} onOpenRollCall={onOpenRollCall} />
      <QuickActions setCurrentStep={setCurrentStep} showAdmissions={showAdmissions} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAdmissions unitName={unitName} />
        <Notifications unitName={unitName} />
      </div>
    </div>
  );
};

export default Dashboard;
