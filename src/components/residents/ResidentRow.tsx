// src/components/residents/ResidentRow.tsx

import React from 'react';
import { User } from 'lucide-react';
import type { Resident } from '../../services/mockDataService';

interface ResidentRowProps {
  resident: Resident;
  rollCallView: boolean;
  attendance?: { present: boolean; reason?: string; description?: string };
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
  onSelect?: (residentId: number) => void;
}

const ResidentRow: React.FC<ResidentRowProps> = ({
  resident,
  rollCallView,
  attendance,
  onAttendanceChange,
  onSelect,
}) => {
  const fallbackAvatar = resident.fallbackPhoto || `https://i.pravatar.cc/150?img=${((resident.id - 1) % 70) + 1}`;

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget.src === fallbackAvatar) {
      return;
    }

    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackAvatar;
  };

  const handleRowClick = () => {
    if (onSelect) {
      onSelect(resident.id);
    }
  };

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={handleRowClick}
    >
      {/* Photo */}
      <td className="px-6 py-4 whitespace-nowrap">
        {resident.photo ? (
          <img
            src={resident.photo ?? fallbackAvatar}
            alt={`${resident.firstName} ${resident.surname}`}
            onError={handleImageError}
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
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onAttendanceChange(resident.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
        </td>
      )}
    </tr>
  );
};

export default ResidentRow;
