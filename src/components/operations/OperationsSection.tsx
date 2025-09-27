// src/components/operations/OperationsSection.tsx

import React, { useState } from 'react';
import { MockOperationsService, type Session } from '../../services/mockOperationsService';
import { User } from 'lucide-react';

const Weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SessionTable: React.FC<{ session: Session }> = ({ session }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
    <div className="flex justify-between items-center bg-gray-50 px-4 py-2 border-b border-gray-200">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{session.title}</h3>
        <p className="text-sm text-gray-600">
          {session.counsellor} – {session.room}
        </p>
      </div>
      <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
        Start Session
      </button>
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
        {session.residents.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-2">
              {r.photo ? (
                <img
                  src={r.photo}
                  alt={`${r.firstName} ${r.surname}`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
              )}
            </td>
            <td className="px-4 py-2 text-sm">{r.firstName}</td>
            <td className="px-4 py-2 text-sm">{r.surname}</td>
            <td className="px-4 py-2 text-sm">{r.age}</td>
            <td className="px-4 py-2 text-sm">{r.nationality}</td>
            <td className="px-4 py-2 text-sm">{r.roomNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const OperationsSection: React.FC = () => {
  const [schedule, setSchedule] = useState(MockOperationsService.generateWeek());
  const [activeDay, setActiveDay] = useState(Weekdays[new Date().getDay() - 1] || 'Monday');

  const handleGenerate = () => {
    setSchedule(MockOperationsService.generateWeek());
  };

  const daySchedule = schedule[activeDay];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {Weekdays.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1 rounded ${
                activeDay === day ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Generate Schedule
        </button>
      </div>

      {daySchedule && (
        <>
          <SessionTable session={daySchedule.am} />
          <SessionTable session={daySchedule.focusInside} />
          <SessionTable session={daySchedule.focusOutside} />
          <SessionTable session={daySchedule.pm} />
        </>
      )}
    </div>
  );
};

export default OperationsSection;
