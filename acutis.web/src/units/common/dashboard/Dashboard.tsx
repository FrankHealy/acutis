import React from 'react';
import DetoxDailyTimeline from './DetoxDailyTimeline';
import QuickActions from './QuickActions';
import RecentAdmissions from './RecentAdmissions';
import Notifications from './Notifications';

interface DashboardProps {
  setCurrentStep: (step: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentStep }) => {
  return (
    <div className="space-y-6">
      {/* Replaces the four unit indicators with the Detox Daily Timeline */}
      <DetoxDailyTimeline />
      <QuickActions setCurrentStep={setCurrentStep} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAdmissions />
        <Notifications />
      </div>
    </div>
  );
};

export default Dashboard;
