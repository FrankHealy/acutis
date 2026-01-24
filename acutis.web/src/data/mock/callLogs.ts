export interface CallLog {
  id: string;
  firstName: string;
  surname: string;
  callerType: 'self' | 'family' | 'professional' | 'other';
  concernType: 'alcohol' | 'drugs' | 'gambling' | 'general';
  unit: 'Alcohol' | 'Detox' | 'Drugs' | 'Ladies';
  location: string;
  phoneNumber: string;
  timestamp: string;
  notes: string;
  status: 'new' | 'callback-scheduled' | 'evaluation-scheduled' | 'declined';
  urgency: 'low' | 'medium' | 'high';
}

const NETWORK_DELAY_MS = 350;

function buildMockCallLogs(): CallLog[] {
  const now = Date.now();

  return [
    {
      id: '1',
      firstName: 'Sarah',
      surname: 'Murphy',
      callerType: 'family',
      concernType: 'alcohol',
      unit: 'Alcohol',
      location: 'Dublin',
      phoneNumber: '087 123 4567',
      timestamp: new Date(now).toISOString(),
      notes: 'Mother calling about son, 28 years old, struggling with alcohol dependency for 3 years',
      status: 'evaluation-scheduled',
      urgency: 'high',
    },
    {
      id: '2',
      firstName: 'John',
      surname: "O'Brien",
      callerType: 'self',
      concernType: 'drugs',
      unit: 'Drugs',
      location: 'Cork',
      phoneNumber: '086 987 6543',
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Self-referral, cocaine use, ready for treatment',
      status: 'callback-scheduled',
      urgency: 'medium',
    },
    {
      id: '3',
      firstName: 'Michael',
      surname: 'Ryan',
      callerType: 'professional',
      concernType: 'gambling',
      unit: 'Detox',
      location: 'Galway',
      phoneNumber: '091 765 432',
      timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      notes: 'GP referring patient with severe gambling addiction',
      status: 'new',
      urgency: 'high',
    },
    {
      id: '4',
      firstName: 'Aoife',
      surname: 'Kelly',
      callerType: 'self',
      concernType: 'alcohol',
      unit: 'Detox',
      location: 'Limerick',
      phoneNumber: '085 555 1122',
      timestamp: new Date(now - 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      notes: 'Follow-up on referral form, requesting assessment slot',
      status: 'callback-scheduled',
      urgency: 'medium',
    },
    {
      id: '5',
      firstName: 'Niall',
      surname: 'Fitzgerald',
      callerType: 'family',
      concernType: 'drugs',
      unit: 'Drugs',
      location: 'Waterford',
      phoneNumber: '083 222 1199',
      timestamp: new Date(now - 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Sister calling regarding detox options for brother',
      status: 'new',
      urgency: 'high',
    },
    {
      id: '6',
      firstName: 'Declan',
      surname: 'Sweeney',
      callerType: 'professional',
      concernType: 'gambling',
      unit: 'Alcohol',
      location: 'Dublin',
      phoneNumber: '01 600 2233',
      timestamp: new Date(now - 48 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      notes: 'Counsellor requesting intake update and care plan',
      status: 'evaluation-scheduled',
      urgency: 'low',
    },
    {
      id: '7',
      firstName: 'Ciara',
      surname: 'Doyle',
      callerType: 'self',
      concernType: 'general',
      unit: 'Ladies',
      location: 'Kilkenny',
      phoneNumber: '087 333 5511',
      timestamp: new Date(now - 48 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      notes: 'Seeking information about programme schedule and intake requirements',
      status: 'declined',
      urgency: 'low',
    },
  ];
}

export async function fetchMockCallLogs(): Promise<CallLog[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildMockCallLogs()), NETWORK_DELAY_MS);
  });
}
