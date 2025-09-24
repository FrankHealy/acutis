import React from 'react';
import { User, CheckCircle, AlertTriangle } from 'lucide-react';

interface Resident {
  id: number;
  firstName: string;
  surname: string;
  nationality: string;
  age: number;
  weekNumber: number | null;
  roomNumber: string;
  photo: string | null;
  present: boolean | null;
  extra?: boolean;
}

interface ResidentRowProps {
  resident: Resident;
  rollCallView: boolean;
  attendance: any;
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
}

const ResidentRow: React.FC<ResidentRowProps> = ({
  resident,
  rollCallView,
  attendance,
  onAttendanceChange
}) => {
  return (
    <tr key={resident.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          {resident.photo ? (
            <img src={resident.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
          {resident.firstName} {resident.surname}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {resident.nationality}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {resident.age}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {resident.weekNumber ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Week {resident.weekNumber}
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Extra
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {resident.roomNumber}
      </td>
      {rollCallView && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {attendance ? (
            attendance.present ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-xs text-red-600 mt-1">
                  {attendance.reason}
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => onAttendanceChange(resident.id, true)}
                className="w-6 h-6 rounded border-2 border-green-300 hover:bg-green-100 flex items-center justify-center transition-colors"
                title="Mark Present"
              >
                <CheckCircle className="h-4 w-4 text-green-500 opacity-0 hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onAttendanceChange(resident.id, false)}
                className="w-6 h-6 rounded border-2 border-red-300 hover:bg-red-100 flex items-center justify-center transition-colors"
                title="Mark Absent"
              >
                <AlertTriangle className="h-4 w-4 text-red-500 opacity-0 hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
        </td>
      )}
    </tr>
  );
};

export default ResidentRow;