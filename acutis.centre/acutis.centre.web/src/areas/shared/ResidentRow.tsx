// src/components/residents/ResidentRow.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import type { Resident } from '../../services/mockDataService';

interface ResidentRowProps {
  resident: Resident;
  showProgrammeColumns: boolean;
  showCaseStatusColumn: boolean;
  rollCallView: boolean;
  attendance?: { present: boolean; reason?: string; description?: string };
  onAttendanceChange: (residentId: number, isPresent: boolean) => void;
  onSelect?: (residentId: number) => void;
}

type ResidentAvatarProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
};

const ResidentAvatar: React.FC<ResidentAvatarProps> = ({ src, fallbackSrc, alt }) => {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(fallbackSrc)}
      className="h-10 w-10 rounded-full object-cover"
      width={40}
      height={40}
    />
  );
};

const ResidentRow: React.FC<ResidentRowProps> = ({
  resident,
  showProgrammeColumns,
  showCaseStatusColumn,
  rollCallView,
  attendance,
  onAttendanceChange,
  onSelect,
}) => {
  const formatEnumLabel = (value: string | null | undefined) =>
    value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "Not set";

  const fallbackAvatar = resident.fallbackPhoto || `https://i.pravatar.cc/150?img=${((resident.id - 1) % 70) + 1}`;
  const primaryAvatar = resident.photo ?? fallbackAvatar;

  const handleRowClick = () => {
    if (onSelect) {
      onSelect(resident.id);
    }
  };

  const episodeSummary = resident.centreEpisodeCode?.trim()
    ? resident.centreEpisodeCode
    : resident.entryYear || resident.entryWeek || resident.entrySequence
      ? `Y${resident.entryYear ?? "-"} / W${resident.entryWeek ?? "-"} / #${resident.entrySequence ?? "-"}`
      : "Not set";

  const entrySummary = resident.entryYear || resident.entryWeek || resident.entrySequence
    ? `Y${resident.entryYear ?? "-"} / W${resident.entryWeek ?? "-"} / #${resident.entrySequence ?? "-"}`
    : null;

  const caseStatus = resident.caseStatus
    ? resident.caseStatus.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Not set";

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={handleRowClick}
    >
      {/* Photo */}
      <td className="px-6 py-4 whitespace-nowrap">
        <ResidentAvatar
          key={`${resident.id}-${primaryAvatar}`}
          src={primaryAvatar}
          fallbackSrc={fallbackAvatar}
          alt={`${resident.firstName} ${resident.surname}`}
        />
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

      {showProgrammeColumns && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatEnumLabel(resident.programmeType)}
        </td>
      )}

      {showProgrammeColumns && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatEnumLabel(resident.participationMode)}
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="font-medium text-gray-900">{episodeSummary}</div>
        {entrySummary && (
          <div className="text-xs text-gray-500">{entrySummary}</div>
        )}
      </td>

      {showCaseStatusColumn && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="font-medium text-gray-900">{caseStatus}</div>
        </td>
      )}

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
