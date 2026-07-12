export type SessionResident = {
  id: number;
  firstName: string;
  surname: string;
  age: number;
  nationality: string;
  roomNumber: string;
  photo: string | null;
};

export type Session = {
  title: string;
  counsellor: string;
  room: string;
  residents: SessionResident[];
};

type DaySchedule = {
  am: Session;
  focusInside: Session;
  focusOutside: Session;
  pm: Session;
};

const Weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const sampleResidents: SessionResident[] = [
  { id: 1, firstName: "Michael", surname: "Ryan", age: 39, nationality: "Irish", roomNumber: "A-205", photo: null },
  { id: 2, firstName: "Sarah", surname: "Moran", age: 31, nationality: "Irish", roomNumber: "D-101", photo: null },
  { id: 3, firstName: "Ahmed", surname: "Latif", age: 28, nationality: "Moroccan", roomNumber: "DR-110", photo: null },
  { id: 4, firstName: "Emma", surname: "Kelly", age: 34, nationality: "Irish", roomNumber: "L-103", photo: null },
];

const buildSession = (title: string, counsellor: string, room: string): Session => ({
  title,
  counsellor,
  room,
  residents: sampleResidents,
});

export const MockOperationsService = {
  generateWeek(): Record<string, DaySchedule> {
    return Weekdays.reduce<Record<string, DaySchedule>>((acc, day) => {
      acc[day] = {
        am: buildSession("Morning Session", "Sr. Moran", "OT-1"),
        focusInside: buildSession("Focus (Inside)", "Fr. Kelly", "Focus-A"),
        focusOutside: buildSession("Focus (Outside)", "Mr. Byrne", "Focus-B"),
        pm: buildSession("Afternoon Session", "Ms. Doyle", "OT-2"),
      };
      return acc;
    }, {});
  },
};

