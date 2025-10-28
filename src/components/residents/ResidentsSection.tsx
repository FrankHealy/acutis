// src/components/residents/ResidentsSection.tsx

import React, { useMemo, useState } from 'react';
import ResidentsHeader from './ResidentsHeader';
import RollCallControls from './RollCallControls';
import ResidentsTable from './ResidentsTable';
import AbsenceModal from './AbsenceModal';
import { useResidents } from './hooks/useResidents';
import ResidentDetail from './ResidentDetail';
import Toast from '../common/Toast';

const ResidentsSection: React.FC = () => {
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const {
    residents,
    loading,
    error,
    residentSource,
    toast,
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
    setToast,
  } = useResidents();

  const selectedResident = useMemo(
    () => (selectedResidentId != null ? residents.find(r => r.id === selectedResidentId) : undefined),
    [selectedResidentId, residents]
  );

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

  // Detail view when a resident is selected
  if (selectedResident) {
    return (
      <ResidentDetail
        resident={selectedResident}
        onBack={() => setSelectedResidentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ResidentsHeader
        rollCallView={rollCallView}
        setRollCallView={setRollCallView}
        residentCount={residents.length}
        residentSource={residentSource}
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
            onSelect={setSelectedResidentId}
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
          onSelect={setSelectedResidentId}
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
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default ResidentsSection;
