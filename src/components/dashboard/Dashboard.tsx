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
      {/* Brand badge */}
      <div className="flex items-center space-x-3">
        <img src="/acutis-icon.svg" alt="Acutis" className="h-8 w-8 rounded-lg border border-blue-100" />
        <h2 className="text-lg font-semibold text-gray-900">Acutis Dashboard</h2>
      </div>
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
