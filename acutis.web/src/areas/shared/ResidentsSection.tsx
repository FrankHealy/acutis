// src/components/residents/ResidentsSection.tsx

import React, { useMemo, useState } from 'react';
import ResidentsHeader from './ResidentsHeader';
import RollCallControls from './RollCallControls';
import ResidentsTable from './ResidentsTable';
import AbsenceModal from './AbsenceModal';
import { useResidents } from './hooks/useResidents';
import ResidentDetail from './ResidentDetail';
import Toast from '@/units/shared/ui/Toast';
import type { UnitId } from './unit/unitTypes';
import QuoteOfTheDay from './QuoteOfTheDay';
import RecoveryVideos from './RecoveryVideos';
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

type ResidentsSectionProps = {
  unitId: UnitId;
  unitName: string;
  initialRollCallView?: boolean;
  onOpenMeditation?: () => void;
  onOpenIncidentCapture?: (resident?: import("@/services/mockDataService").Resident) => void;
};

const ResidentsSection: React.FC<ResidentsSectionProps> = ({
  unitId,
  unitName,
  initialRollCallView = false,
  onOpenMeditation,
  onOpenIncidentCapture,
}) => {
  const { loadKeys, t } = useLocalization();
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
  } = useResidents(unitId, initialRollCallView);

  const selectedResident = useMemo(
    () => (selectedResidentId != null ? residents.find(r => r.id === selectedResidentId) : undefined),
    [selectedResidentId, residents]
  );

  React.useEffect(() => {
    void loadKeys([
      "residents.loading",
      "residents.error",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

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

  if (loading) return <div className="flex justify-center p-8">{text("residents.loading", "Loading residents...")}</div>;
  if (error) return <div className="text-red-500 p-4">{text("residents.error", "Error")}: {error}</div>;

  // Detail view when a resident is selected
  if (selectedResident) {
    return (
      <ResidentDetail
        resident={selectedResident}
        onBack={() => setSelectedResidentId(null)}
        onOpenIncidentCapture={onOpenIncidentCapture}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ResidentsHeader
        unitName={unitName}
        rollCallView={rollCallView}
        setRollCallView={setRollCallView}
        residentCount={residents.length}
        residentSource={residentSource}
        onSaveAttendance={saveAllAttendance}
        onOpenMeditation={onOpenMeditation}
      />

      {rollCallView && unitId !== 'detox' && <QuoteOfTheDay unitId={unitId} />}

      {rollCallView ? (
        unitId === 'detox' ? (
          <RecoveryVideos unitId={unitId} />
        ) : (
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
        )
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
