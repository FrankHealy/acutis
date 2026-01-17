import React from 'react';
import { Users, Save } from 'lucide-react';

interface ResidentsHeaderProps {
  rollCallView: boolean;
  setRollCallView: (view: boolean) => void;
  residentCount: number;
  residentSource: 'api' | 'mock';
  onSaveAttendance: () => void;
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getCurrentTimeContext = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Morning' : 'Evening';
};

const ResidentsHeader: React.FC<ResidentsHeaderProps> = ({ 
  rollCallView, 
  setRollCallView, 
  residentCount,
  residentSource,
  onSaveAttendance 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-6 w-6 text-blue-500" />
            {rollCallView ? 'Roll Call' : 'Residents'} - Alcohol Unit
          </h2>
          <p className="text-gray-600 mt-1">
            {rollCallView 
              ? `${getCurrentDate()} - ${getCurrentTimeContext()} Roll Call (${residentCount} residents)`
              : `${residentCount} total residents`
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              residentSource === 'api'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}
            title={residentSource === 'api' ? 'Live API data' : 'Mock data fallback'}
          >
            {residentSource === 'api' ? 'API' : 'MOCK'}
          </span>
          <button
            onClick={() => setRollCallView(!rollCallView)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              rollCallView
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rollCallView ? 'Exit Roll Call' : 'Start Roll Call'}
          </button>
          {rollCallView && (
            <button 
              onClick={onSaveAttendance}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Additional Status Information */}
      {rollCallView && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Click green to mark present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Click red to mark absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Pending attendance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentsHeader;
