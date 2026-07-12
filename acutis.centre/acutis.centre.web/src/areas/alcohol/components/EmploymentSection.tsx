import { Briefcase } from 'lucide-react';

const EmploymentSection = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Briefcase className="mr-2 h-5 w-5 text-green-500" />
        Employment & Insurance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Select status...</option>
            <option>Employed</option>
            <option>Unemployed</option>
            <option>Student</option>
            <option>Retired</option>
            <option>Disability</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Insurance</label>
          <input type="text" placeholder="Insurance provider" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
    </div>
  );
};

export default EmploymentSection;