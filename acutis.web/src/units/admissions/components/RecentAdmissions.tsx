import React from 'react';
import { User, ArrowRight } from 'lucide-react';

interface RecentAdmissionsProps {
  setCurrentStep: (step: string, admissionId?: string) => void;
}

const RecentAdmissions: React.FC<RecentAdmissionsProps> = ({ setCurrentStep }) => {
  const recentAdmissions = [
    { id: 'adm-001', name: 'David Walsh', unit: 'Alcohol', room: 'A-205', status: 'Complete', time: '30 mins ago' },
    { id: 'adm-002', name: 'Emma Kelly', unit: 'Detox', room: 'D-103', status: 'Needs Review', time: '1 hour ago' },
    { id: 'adm-003', name: 'Michael Ryan', unit: 'Drugs', room: 'DR-112', status: 'Complete', time: '2 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Needs Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Admissions</h2>
        <button 
          onClick={() => setCurrentStep('admissions-list')}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {recentAdmissions.map((admission) => (
          <div 
            key={admission.id} 
            onClick={() => setCurrentStep('admission-details', admission.id)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{admission.name}</p>
                <p className="text-sm text-gray-600">{admission.unit} - {admission.room}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                {admission.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{admission.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAdmissions;
