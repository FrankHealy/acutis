// src/components/residents/ResidentsTable.tsx

import React from 'react';
import { ChevronDown } from 'lucide-react';
import ResidentRow from './ResidentRow';
import type { Resident } from '../../services/mockDataService';
import type { AttendanceRecord } from '../../services/residentService';

export type SortBy = keyof Pick<
  Resident,
  'firstName' | 'surname' | 'age' | 'weekNumber' | 'roomNumber' | 'unit'
>;
export type SortOrder = 'asc' | 'desc';

interface ResidentsTableProps {
  residents: Resident[];
  rollCallView: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (column: SortBy) => void;
  attendanceData: Record<number, AttendanceRecord | undefined>;
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
  onSelect?: (residentId: number) => void;
}

const ResidentsTable: React.FC<ResidentsTableProps> = ({
  residents,
  rollCallView,
  sortBy,
  sortOrder,
  onSort,
  attendanceData,
  onAttendanceChange,
  onSelect,
}) => {
  const SortableHeader: React.FC<{ column: SortBy; children: React.ReactNode }> = ({
    column,
    children,
  }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <SortableHeader column="firstName">First Name</SortableHeader>
              <SortableHeader column="surname">Surname</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nationality
              </th>
              <SortableHeader column="age">Age</SortableHeader>
              <SortableHeader column="weekNumber">Week</SortableHeader>
              <SortableHeader column="roomNumber">Room</SortableHeader>
              {rollCallView && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(residents) && residents.length > 0 ? (
              residents.map((resident, idx) => {
                if (!resident) {
                  console.error('Undefined resident at index', idx);
                  return null;
                }
                return (
                  <ResidentRow
                    key={resident.id}
                    resident={resident}
                    rollCallView={rollCallView}
                    attendance={attendanceData[resident.id]}
                    onAttendanceChange={onAttendanceChange}
                    onSelect={onSelect}
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan={rollCallView ? 8 : 7} className="text-center py-4 text-gray-500">
                  No residents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentsTable;
