import { UserPlus, Shield, FileText, Stethoscope, MapPin, ChevronRight } from 'lucide-react';

const ProgressIndicator = () => {
  const admissionSteps = [
    { id: 'initial', title: 'Initial Registration', icon: UserPlus, status: 'complete' },
    { id: 'contraband', title: 'Contraband Check', icon: Shield, status: 'complete' },
    { id: 'forms', title: 'Forms & Documentation', icon: FileText, status: 'current' },
    { id: 'medical', title: 'Medical Assessment', icon: Stethoscope, status: 'pending' },
    { id: 'room', title: 'Room Assignment', icon: MapPin, status: 'pending' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">New Admission Process</h2>
        <span className="text-sm text-gray-500">Step 3 of 5</span>
      </div>
      <div className="flex items-center space-x-4">
        {admissionSteps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.status === 'complete' ? 'bg-green-100 text-green-600' :
              step.status === 'current' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              <step.icon className="h-4 w-4" />
            </div>
            <span className={`text-sm font-medium ${
              step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
            {index < admissionSteps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;