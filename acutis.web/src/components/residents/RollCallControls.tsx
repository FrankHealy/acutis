import React from 'react';
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react';

interface RollCallControlsProps {
  attendanceData: Record<number, any>;
  totalResidents: number;
  onSaveAttendance: () => void;
  onMarkAllPresent?: () => void;
  onMarkAllAbsent?: () => void;
}

const RollCallControls: React.FC<RollCallControlsProps> = ({
  attendanceData,
  totalResidents,
  onSaveAttendance,
  onMarkAllPresent,
  onMarkAllAbsent
}) => {
  const presentCount = Object.values(attendanceData).filter(record => record.present).length;
  const absentCount = Object.values(attendanceData).filter(record => !record.present).length;
  const pendingCount = totalResidents - (presentCount + absentCount);

  const getCompletionPercentage = () => {
    return ((presentCount + absentCount) / totalResidents) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Attendance Stats */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{presentCount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Present</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{absentCount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Absent</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-bold">{pendingCount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 lg:px-8">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Roll Call Progress</span>
            <span>{Math.round(getCompletionPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onMarkAllPresent && (
            <button
              onClick={onMarkAllPresent}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              Mark All Present
            </button>
          )}
          
          {onMarkAllAbsent && (
            <button
              onClick={onMarkAllAbsent}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Mark All Absent
            </button>
          )}
          
          <button
            onClick={onSaveAttendance}
            disabled={pendingCount > 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Completion: {presentCount + absentCount} of {totalResidents}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default RollCallControls;