import { useState, useEffect } from 'react';
import { residentService } from '../../services/residentService';
import type { Resident } from '../../services/mockDataService';

export const useResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rollCallView, setRollCallView] = useState(false);
  const [sortBy, setSortBy] = useState('surname');
  const [sortOrder, setSortOrder] = useState('asc');
  const [absentResident, setAbsentResident] = useState<number | null>(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceDescription, setAbsenceDescription] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<number, any>>({});

  // Use our service layer!
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

  const handleAttendanceChange = (residentId: number, isPresent: boolean) => {
    if (isPresent) {
      setAttendanceData(prev => ({
        ...prev,
        [residentId]: { present: true }
      }));
    } else {
      setAbsentResident(residentId);
    }
  };

  const handleAbsenceSubmit = async () => {
    if (absentResident && absenceReason) {
      // Use our service!
      await residentService.saveAttendance([{
        residentId: absentResident,
        present: false,
        reason: absenceReason,
        description: absenceReason === 'Other' ? absenceDescription : '',
        timestamp: new Date().toISOString()
      }]);
      
      setAttendanceData(prev => ({
        ...prev,
        [absentResident]: { 
          present: false, 
          reason: absenceReason,
          description: absenceReason === 'Other' ? absenceDescription : ''
        }
      }));
      setAbsentResident(null);
      setAbsenceReason('');
      setAbsenceDescription('');
    }
  };

  const saveAllAttendance = async () => {
    const records = Object.entries(attendanceData).map(([id, data]) => ({
      residentId: parseInt(id),
      ...data,
      timestamp: new Date().toISOString()
    }));
    
    // Use our service!
    await residentService.saveAttendance(records);
  };

  // ... sorting logic ...

  return { /* all the states and functions */ };
};