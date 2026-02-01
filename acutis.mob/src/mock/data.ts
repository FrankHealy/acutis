export const occupancy = {
  detox: { used: 8, capacity: 12 },
  alcohol: { used: 32, capacity: 40 },
};

export const formatPercent = (used: number, capacity: number) =>
  Math.round((used / Math.max(capacity, 1)) * 100);

export type Resident = {
  id: string;
  name: string;
  room: string;
  status: string;
  days: number;
  age: number;
  primaryCounselor: string;
  photo: number;
};

export const residents: Resident[] = [
  {
    id: 'R-1001',
    name: 'Maya Patel',
    room: 'Detox 3',
    status: 'Active',
    days: 5,
    age: 29,
    primaryCounselor: 'Dr. Lee',
    photo: require('../../assets/residents/resident-1.jpg')
  },
  {
    id: 'R-1002',
    name: 'Lucas Martin',
    room: 'Alcohol 2',
    status: 'Active',
    days: 12,
    age: 35,
    primaryCounselor: 'Dr. Alvarez',
    photo: require('../../assets/residents/resident-2.jpg')
  },
  {
    id: 'R-1003',
    name: 'Ava Thompson',
    room: 'Detox 1',
    status: 'Pending',
    days: 1,
    age: 26,
    primaryCounselor: 'Dr. Kim',
    photo: require('../../assets/residents/resident-3.jpg')
  },
  {
    id: 'R-1004',
    name: 'Noah Wilson',
    room: 'Alcohol 4',
    status: 'Active',
    days: 18,
    age: 41,
    primaryCounselor: 'Dr. Rogers',
    photo: require('../../assets/residents/resident-4.jpg')
  },
  {
    id: 'R-1005',
    name: 'Zoe Ramirez',
    room: 'Detox 5',
    status: 'Discharge',
    days: 28,
    age: 32,
    primaryCounselor: 'Dr. Singh',
    photo: require('../../assets/residents/resident-5.jpg')
  }
];
