// src/components/residents/ResidentRow.tsx

import React from 'react';
import { User } from 'lucide-react';
import type { Resident } from '../../services/mockDataService';

interface ResidentRowProps {
  resident: Resident;
  rollCallView: boolean;
  attendance?: { present: boolean; reason?: string; description?: string };
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
}

const ResidentRow: React.FC<ResidentRowProps> = ({
  resident,
  rollCallView,
  attendance,
  onAttendanceChange,
}) => {
  return (
    <tr>
      {/* Photo */}
      <td className="px-6 py-4 whitespace-nowrap">
        {resident.photo ? (
          <img
            src={resident.photo}
            alt={`${resident.firstName} ${resident.surname}`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <User className="h-6 w-6" />
          </div>
        )}
      </td>

      {/* First Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {resident.firstName}
      </td>

      {/* Surname */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {resident.surname}
      </td>

      {/* Nationality */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {resident.nationality}
      </td>

      {/* Age */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {resident.age}
      </td>

      {/* Week */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {resident.weekNumber ?? '-'}
      </td>

      {/* Room */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {resident.roomNumber}
      </td>

      {/* Roll call column */}
      {rollCallView && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <input
            type="checkbox"
            checked={attendance?.present ?? false}
            onChange={(e) => onAttendanceChange(resident.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
        </td>
      )}
    </tr>
  );
};

export default ResidentRow;
