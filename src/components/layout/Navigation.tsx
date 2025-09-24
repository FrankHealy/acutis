import React from 'react';

interface NavigationProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentStep, setCurrentStep }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'new-admission', label: 'Admissions' },
    { id: 'residents', label: 'Residents' },
    { id: 'operations', label: 'Operations' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentStep(item.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentStep === item.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;