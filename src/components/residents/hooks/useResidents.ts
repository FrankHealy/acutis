// src/components/residents/hooks/useResidents.ts

import { useState, useEffect } from 'react';
import { residentService, type AttendanceRecord } from '../../../services/residentService';
import type { Resident } from '../../../services/mockDataService';

export type SortBy = keyof Pick<
  Resident,
  'firstName' | 'surname' | 'age' | 'weekNumber' | 'roomNumber' | 'unit'
>;
export type SortOrder = 'asc' | 'desc';

export const useResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rollCallView, setRollCallView] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('surname');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [absentResident, setAbsentResident] = useState<number | null>(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceDescription, setAbsenceDescription] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<number, AttendanceRecord>>({});

  // Load residents
  useEffect(() => {
    const loadResidents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = rollCallView
          ? await residentService.getRollCallResidents('alcohol')
          : await residentService.getResidents('alcohol');
        setResidents(data);
      } catch (err) {
        setError('Failed to load residents');
      } finally {
        setLoading(false);
      }
    };

    loadResidents();
  }, [rollCallView]);

  // Sorting logic
  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    if (residents.length === 0) return;

    const sortedResidents = [...residents].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setResidents(sortedResidents);
  }, [sortBy, sortOrder]);

  const handleAttendanceChange = (residentId: number, isPresent: boolean) => {
    if (isPresent) {
      setAttendanceData((prev) => ({
        ...prev,
        [residentId]: {
          residentId,
          present: true,
          timestamp: new Date().toISOString(),
        },
      }));
    } else {
      setAbsentResident(residentId);
    }
  };

  const handleAbsenceSubmit = async () => {
    if (absentResident && absenceReason) {
      const record: AttendanceRecord = {
        residentId: absentResident,
        present: false,
        reason: absenceReason,
        description: absenceReason === 'Other' ? absenceDescription : '',
        timestamp: new Date().toISOString(),
      };

      await residentService.saveAttendance([record]);

      setAttendanceData((prev) => ({
        ...prev,
        [absentResident]: record,
      }));

      setAbsentResident(null);
      setAbsenceReason('');
      setAbsenceDescription('');
    }
  };

  const saveAllAttendance = async () => {
    const records = Object.values(attendanceData);
    if (records.length > 0) {
      await residentService.saveAttendance(records);
    }
  };

  return {
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
  };
};
