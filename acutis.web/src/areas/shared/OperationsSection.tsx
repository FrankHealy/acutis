// src/units/shared/operations/OperationsSection.tsx

import React, { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { operationsService, type UnitOtDaySchedule, type UnitOtSession } from "@/services/operationsService";
import type { UnitId } from "./unit/unitTypes";

const Weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const SessionTable: React.FC<{ session: UnitOtSession }> = ({ session }) => (
  <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{session.title}</h3>
        <p className="text-sm text-gray-600">
          {session.facilitator} - {session.room}
        </p>
      </div>
      <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        {session.residents.length} residents
      </span>
    </div>
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Photo</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">First Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Surname</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Age</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nationality</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Room</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {session.residents.map((resident) => (
          <tr key={resident.id}>
            <td className="px-4 py-2">
              {resident.photoUrl ? (
                <img
                  src={resident.photoUrl}
                  alt={`${resident.firstName} ${resident.surname}`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
              )}
            </td>
            <td className="px-4 py-2 text-sm">{resident.firstName}</td>
            <td className="px-4 py-2 text-sm">{resident.surname}</td>
            <td className="px-4 py-2 text-sm">{resident.age}</td>
            <td className="px-4 py-2 text-sm">{resident.nationality}</td>
            <td className="px-4 py-2 text-sm">{resident.roomNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const OperationsSection: React.FC<{ unitId: UnitId }> = ({ unitId }) => {
  const [schedule, setSchedule] = useState<UnitOtDaySchedule[]>([]);
  const [activeDay, setActiveDay] = useState(Weekdays[new Date().getDay() - 1] || "Monday");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await operationsService.getOtSchedule(unitId);
        if (!active) {
          return;
        }
        setSchedule(response);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load OT schedule.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [unitId]);

  const daySchedule = useMemo(
    () => schedule.find((item) => item.day === activeDay),
    [activeDay, schedule]
  );

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">Loading OT schedule...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {Weekdays.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`rounded px-3 py-1 ${
                activeDay === day ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500">Unit-scoped OT and focus sessions</div>
      </div>

      {daySchedule ? daySchedule.sessions.map((session) => (
        <SessionTable key={`${daySchedule.day}-${session.id}`} session={session} />
      )) : null}
    </div>
  );
};

export default OperationsSection;
