// src/components/residents/ResidentsSection.tsx

import React from 'react';
import ResidentsHeader from './ResidentsHeader';
import RollCallControls from './RollCallControls';
import ResidentsTable from './ResidentsTable';
import AbsenceModal from './AbsenceModal';
import { useResidents } from './hooks/useResidents';

const ResidentsSection: React.FC = () => {
  const {
    residents,
    loading,
    error,
    rollCallView,
    setRollCallView,
    sortBy,
    sortOrder,
    handleSort,
    attendanceData,
    handleAttendanceChange,
    absentResident,
    setAbsentResident,
    absenceReason,
    setAbsenceReason,
    absenceDescription,
    setAbsenceDescription,
    handleAbsenceSubmit,
    saveAllAttendance,
  } = useResidents();

  // bulk actions for roll call
  const handleMarkAllPresent = () => {
    residents.forEach((resident) => {
      if (!attendanceData[resident.id]) {
        handleAttendanceChange(resident.id, true);
      }
    });
  };

  const handleMarkAllAbsent = () => {
    residents.forEach((resident) => {
      if (!attendanceData[resident.id]) {
        handleAttendanceChange(resident.id, false);
      }
    });
  };

  if (loading) return <div className="flex justify-center p-8">Loading residents...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <ResidentsHeader
        rollCallView={rollCallView}
        setRollCallView={setRollCallView}
        residentCount={residents.length}
        onSaveAttendance={saveAllAttendance}
      />

      {rollCallView ? (
        <>
          <RollCallControls
            attendanceData={attendanceData}
            totalResidents={residents.length}
            onSaveAttendance={saveAllAttendance}
            onMarkAllPresent={handleMarkAllPresent}
            onMarkAllAbsent={handleMarkAllAbsent}
          />
          <ResidentsTable
            residents={residents}
            rollCallView={true}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            attendanceData={attendanceData}
            onAttendanceChange={handleAttendanceChange}
          />
        </>
      ) : (
        <ResidentsTable
          residents={residents}
          rollCallView={false}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          attendanceData={attendanceData}
          onAttendanceChange={handleAttendanceChange}
        />
      )}

      {absentResident && (
        <AbsenceModal
          resident={residents.find((r) => r.id === absentResident)}
          absenceReason={absenceReason}
          setAbsenceReason={setAbsenceReason}
          absenceDescription={absenceDescription}
          setAbsenceDescription={setAbsenceDescription}
          onSubmit={handleAbsenceSubmit}
          onCancel={() => {
            setAbsentResident(null);
            setAbsenceReason('');
            setAbsenceDescription('');
          }}
        />
      )}
    </div>
  );
};

export default ResidentsSection;
