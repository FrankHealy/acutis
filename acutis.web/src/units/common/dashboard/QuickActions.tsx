import React from 'react';
import { UserPlus, MapPin, Users, Settings as SettingsIcon } from 'lucide-react';

interface QuickActionsProps {
  setCurrentStep: (step: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setCurrentStep }) => {
  const actions = [
    {
      icon: UserPlus,
      label: 'New Admission',
      styles: {
        button: 'bg-blue-50 hover:bg-blue-100',
        icon: 'text-blue-500',
        text: 'text-blue-700',
      },
      onClick: () => setCurrentStep('new-admission'),
    },
    {
      icon: MapPin,
      label: 'Room Map',
      styles: {
        button: 'bg-green-50 hover:bg-green-100',
        icon: 'text-green-500',
        text: 'text-green-700',
      },
    },
    {
      icon: Users,
      label: 'Residents',
      styles: {
        button: 'bg-purple-50 hover:bg-purple-100',
        icon: 'text-purple-500',
        text: 'text-purple-700',
      },
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      styles: {
        button: 'bg-gray-50 hover:bg-gray-100',
        icon: 'text-gray-500',
        text: 'text-gray-700',
      },
    },
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
            className={`flex flex-col items-center p-4 ${action.styles.button} rounded-lg transition-colors`}
          >
            <action.icon className={`h-8 w-8 ${action.styles.icon} mb-2`} />
            <span className={`text-sm font-medium ${action.styles.text}`}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
