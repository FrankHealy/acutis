import React from 'react';
import { UserPlus, MapPin, Users, FileText } from 'lucide-react';

interface QuickActionsProps {
  setCurrentStep: (step: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setCurrentStep }) => {
  const actions = [
    { icon: UserPlus, label: 'New Admission', color: 'blue', onClick: () => setCurrentStep('new-admission') },
    { icon: MapPin, label: 'Room Map', color: 'green' },
    { icon: Users, label: 'Residents', color: 'purple' },
    { icon: FileText, label: 'Reports', color: 'orange' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex flex-col items-center p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-colors`}
          >
            <action.icon className={`h-8 w-8 text-${action.color}-500 mb-2`} />
            <span className={`text-sm font-medium text-${action.color}-700`}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;