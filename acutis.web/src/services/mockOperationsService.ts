// src/services/mockOperationsService.ts

import type { Resident } from './mockDataService';
import { mockResidents } from './mockDataService';

export interface Session {
  type: 'module' | 'works' | 'focus-inside' | 'focus-outside';
  title: string;
  counsellor: string;
  room: string;
  residents: Resident[];
  time: 'AM' | 'PM' | 'N/A';
}

export interface DaySchedule {
  day: string;
  am: Session;
  focusInside: Session;
  focusOutside: Session;
  pm: Session;
}

const moduleNames = ['Spirituality', 'Change', 'Imaginative Functioning','Relapse Prevention','Healing The Hurts Of The Past'];
const counsellors = ['Counsellor A', 'Counsellor B', 'Counsellor C'];
const rooms = ['Room 5', 'Room 6', 'Room 7'];

export class MockOperationsService {
  static generateDay(day: string): DaySchedule {
    // Sort residents by surname for consistency
    const residents = [...mockResidents].sort((a, b) =>
      a.surname.localeCompare(b.surname),
    );

    // Split residents into groups of ~10 for modules
    const modules: Resident[][] = [];
    for (let i = 0; i < 3; i++) {
      modules.push(residents.slice(i * 10, (i + 1) * 10));
    }

    // Split by OT role placeholder (even id = inside, odd = outside)
    const inside = residents.filter((r) => r.id % 2 === 0);
    const outside = residents.filter((r) => r.id % 2 !== 0);

    const am: Session =
      day === 'Monday'
        ? {
            type: 'works',
            title: 'Works Meeting',
            counsellor: 'Supervisor',
            room: 'Main Hall',
            residents,
            time: 'AM',
          }
        : {
            type: 'module',
            title: `Module – ${moduleNames[0]} (AM)`,
            counsellor: counsellors[0],
            room: rooms[0],
            residents: modules[0],
            time: 'AM',
          };

    const pm: Session = {
      type: 'module',
      title: `Module – ${moduleNames[1]} (PM)`,
      counsellor: counsellors[1],
      room: rooms[1],
      residents: modules[1],
      time: 'PM',
    };

    const focusInside: Session = {
      type: 'focus-inside',
      title: 'Focus Meeting – Inside Workers',
      counsellor: counsellors[2],
      room: rooms[2],
      residents: inside,
      time: 'N/A',
    };

    const focusOutside: Session = {
      type: 'focus-outside',
      title: 'Focus Meeting – Outside Workers',
      counsellor: counsellors[2],
      room: rooms[2],
      residents: outside,
      time: 'N/A',
    };

    return { day, am, focusInside, focusOutside, pm };
  }

  static generateWeek(): Record<string, DaySchedule> {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const schedule: Record<string, DaySchedule> = {};
    weekdays.forEach((day) => {
      schedule[day] = this.generateDay(day);
    });
    return schedule;
  }
}
