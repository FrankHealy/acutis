import React from 'react';
import { ChevronDown, User } from 'lucide-react';
import ResidentRow from './ResidentRow';

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

interface ResidentsTableProps {
  residents: Resident[];
  rollCallView: boolean;
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
  attendanceData: Record<number, any>;
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
}

const ResidentsTable: React.FC<ResidentsTableProps> = ({
  residents,
  rollCallView,
  sortBy,
  sortOrder,
  onSort,
  attendanceData,
  onAttendanceChange
}) => {
  const SortableHeader: React.FC<{ column: string; children: React.ReactNode }> = ({ column, children }) => (
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
              <SortableHeader column="surname">Name</SortableHeader>
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
            {residents.map((resident) => (
              <ResidentRow
                key={resident.id}
                resident={resident}
                rollCallView={rollCallView}
                attendance={attendanceData[resident.id]}
                onAttendanceChange={onAttendanceChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentsTable;