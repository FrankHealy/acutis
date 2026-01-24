import React, { useState, useEffect } from 'react';
import { Bell, Users, Briefcase, Bed, Coffee, Wrench, UtensilsCrossed, Brain, Target, Moon, BookOpen, HeartHandshake, ChevronLeft, ChevronRight, UserPlus, MapPin, FileText, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Timeline Component
interface ScheduleEvent {
  time: string;
  timeMinutes: number;
  title: string;
  icon: any;
  color: string;
  description?: string;
  days?: string;
  endTime?: string;
  stackPosition?: number;
}

const DailyTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'morning' | 'evening'>('morning');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const morningSchedule: ScheduleEvent[] = [
    { time: '06:30', timeMinutes: 390, title: 'Wake Up Bell', icon: Bell, color: 'bg-orange-500', description: 'Morning wake up call for all residents', stackPosition: 0 },
    { time: '07:15', timeMinutes: 435, title: 'Roll Call', icon: Users, color: 'bg-blue-500', description: 'Morning roll call followed by guided meditation session', endTime: '07:45', stackPosition: 0 },
    { time: '07:45', timeMinutes: 465, title: 'Works/Group', icon: Briefcase, color: 'bg-purple-500', description: 'Works Meeting (Mon) OR Group Therapy (Tue-Fri)', days: 'Mon: Works | Tue-Fri: Group', endTime: '08:30', stackPosition: 0 },
    { time: '08:30', timeMinutes: 510, title: 'Room Check', icon: Bed, color: 'bg-green-500', description: 'Daily room inspection and tidiness check', stackPosition: 0 },
    { time: '08:45', timeMinutes: 525, title: 'Coffee', icon: Coffee, color: 'bg-amber-600', description: 'Morning coffee and social time', stackPosition: 0 },
    { time: '09:05', timeMinutes: 545, title: 'OT', icon: Wrench, color: 'bg-teal-500', description: 'Morning Occupational Therapy - skills development', endTime: '12:30', stackPosition: 0 },
    { time: '12:30', timeMinutes: 750, title: 'Lunch', icon: UtensilsCrossed, color: 'bg-red-500', description: 'Midday meal service', stackPosition: 0 }
  ];

  const eveningSchedule: ScheduleEvent[] = [
    { time: '14:00', timeMinutes: 840, title: 'Gambling Aware', icon: Brain, color: 'bg-indigo-500', description: 'Gambling Awareness Meeting', endTime: '14:45', stackPosition: 0 },
    { time: '14:00', timeMinutes: 840, title: 'Focus Meeting', icon: Target, color: 'bg-cyan-500', description: 'Focus Meeting', endTime: '14:45', stackPosition: 1 },
    { time: '14:45', timeMinutes: 885, title: 'OT', icon: Wrench, color: 'bg-teal-500', description: 'Afternoon Occupational Therapy', endTime: '16:00', stackPosition: 0 },
    { time: '16:00', timeMinutes: 960, title: 'Coffee', icon: Coffee, color: 'bg-amber-600', description: 'Afternoon coffee break', stackPosition: 0 },
    { time: '16:30', timeMinutes: 990, title: 'OT/Focus', icon: Target, color: 'bg-cyan-500', description: 'OT or Focus Meeting session', endTime: '17:15', stackPosition: 0 },
    { time: '17:30', timeMinutes: 1050, title: 'Tea', icon: UtensilsCrossed, color: 'bg-red-500', description: 'Evening meal service', stackPosition: 0 },
    { time: '18:15', timeMinutes: 1095, title: 'Roll Call', icon: Users, color: 'bg-blue-500', description: 'Evening roll call and meditation', stackPosition: 0 },
    { time: '18:45', timeMinutes: 1125, title: 'Group A', icon: HeartHandshake, color: 'bg-pink-500', description: 'Evening group therapy session - Cohort A', endTime: '19:45', stackPosition: 0 },
    { time: '18:45', timeMinutes: 1125, title: 'Group B', icon: HeartHandshake, color: 'bg-purple-500', description: 'Evening group therapy session - Cohort B', endTime: '19:45', stackPosition: 1 },
    { time: '18:45', timeMinutes: 1125, title: 'Group C', icon: HeartHandshake, color: 'bg-blue-500', description: 'Evening group therapy session - Cohort C', endTime: '19:45', stackPosition: 2 },
    { time: '20:00', timeMinutes: 1200, title: 'Rosary', icon: BookOpen, color: 'bg-violet-500', description: 'Evening prayer service', stackPosition: 0 },
    { time: '20:30', timeMinutes: 1230, title: 'AA/NA/GA', icon: Users, color: 'bg-emerald-500', description: 'Support group meetings', days: 'Not Wednesday', endTime: '21:30', stackPosition: 0 },
    { time: '22:00', timeMinutes: 1320, title: 'Bedtime', icon: Moon, color: 'bg-slate-600', description: 'Lights out - rest time', stackPosition: 0 }
  ];

  const getCurrentSchedule = () => viewMode === 'morning' ? morningSchedule : eveningSchedule;

  const getCurrentMinutes = () => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  };

  const isCurrentEvent = (event: ScheduleEvent) => {
    const now = getCurrentMinutes();
    const endMinutes = event.endTime ? timeToMinutes(event.endTime) : event.timeMinutes + 30;
    return now >= event.timeMinutes && now < endMinutes;
  };

  const getTimelinePosition = (minutes: number, index: number) => {
    const schedule = getCurrentSchedule();
    const startMinutes = schedule[0].timeMinutes;
    const endMinutes = schedule[schedule.length - 1].timeMinutes;
    const totalMinutes = endMinutes - startMinutes;
    const basePosition = ((minutes - startMinutes) / totalMinutes) * 100;
    
    const event = schedule[index];
    
    if (event.stackPosition && event.stackPosition > 0) {
      return basePosition;
    }
    
    if (event.title === 'Coffee' && index > 0) {
      const roomCheckIndex = schedule.findIndex(e => e.title === 'Room Check');
      if (roomCheckIndex >= 0) {
        const roomCheckPosition = ((schedule[roomCheckIndex].timeMinutes - startMinutes) / totalMinutes) * 100;
        return roomCheckPosition + 8;
      }
    }
    
    if (event.title === 'OT' && viewMode === 'morning' && index > 0) {
      const coffeeIndex = schedule.findIndex(e => e.title === 'Coffee');
      if (coffeeIndex >= 0) {
        const coffeeEvent = schedule[coffeeIndex];
        const roomCheckIndex = schedule.findIndex(e => e.title === 'Room Check');
        const roomCheckPosition = roomCheckIndex >= 0 
          ? ((schedule[roomCheckIndex].timeMinutes - startMinutes) / totalMinutes) * 100 
          : ((coffeeEvent.timeMinutes - startMinutes) / totalMinutes) * 100 - 8;
        return roomCheckPosition + 16;
      }
    }
    
    return basePosition;
  };

  const currentMinutes = getCurrentMinutes();
  const schedule = getCurrentSchedule();
  const shouldShowIndicator = viewMode === 'morning' 
    ? currentMinutes >= 390 && currentMinutes <= 750
    : currentMinutes >= 840 && currentMinutes <= 1320;
  const currentPosition = shouldShowIndicator ? getTimelinePosition(currentMinutes, -1) : 0;

  const dayName = currentTime.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{dayName}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Current Time: {currentTime.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setViewMode('morning')}
          disabled={viewMode === 'morning'}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Morning</span>
        </button>
        
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {viewMode === 'morning' ? 'Morning Schedule' : 'Evening Schedule'}
          </p>
          <p className="text-sm text-gray-500">
            {viewMode === 'morning' ? '06:30 - 12:30' : '14:00 - 22:00'}
          </p>
        </div>

        <button
          onClick={() => setViewMode('evening')}
          disabled={viewMode === 'evening'}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <span>Evening</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative pt-8">
        <div className="relative h-2 bg-gray-200 rounded-full mb-32">
          {shouldShowIndicator && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${currentPosition}%` }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">NOW</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative -mt-28 min-h-[240px]">
          {schedule.map((event, index) => {
            const position = getTimelinePosition(event.timeMinutes, index);
            const isCurrent = isCurrentEvent(event);
            const IconComponent = event.icon;
            const isSpecial = event.title === 'Wake Up Bell' || event.title === 'Bedtime';
            const topOffset = (event.stackPosition || 0) * 85;

            return (
              <div
                key={`${event.time}-${event.title}`}
                className="absolute"
                style={{ 
                  left: `${position}%`, 
                  transform: 'translateX(-50%)',
                  top: `${topOffset}px`
                }}
              >
                <button
                  onClick={() => setSelectedEvent(event)}
                  className={`relative group transition-all duration-200 ${
                    isCurrent ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <div className={`w-16 h-16 ${event.color} rounded-full flex items-center justify-center shadow-lg ${
                    isCurrent ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
                  } ${
                    isSpecial ? 'ring-4 ring-gray-300 ring-offset-2' : ''
                  }`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                    <div className={`text-sm font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                      {event.time}
                    </div>
                    <div className={`text-sm mt-1 max-w-[90px] ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {event.title}
                    </div>
                    {event.days && (
                      <div className="text-xs text-gray-400 mt-1">
                        {event.days}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${selectedEvent.color} rounded-full flex items-center justify-center mr-3`}>
                  <selectedEvent.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedEvent.time}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700">{selectedEvent.description}</p>
              {selectedEvent.days && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">{selectedEvent.days}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ setCurrentStep }: { setCurrentStep: (step: string) => void }) => {
  const actions = [
    { icon: UserPlus, label: 'New Admission', color: 'blue', onClick: () => setCurrentStep('new-admission') },
    { icon: MapPin, label: 'Room Map', color: 'green' },
    { icon: Users, label: 'Residents', color: 'purple' },
    { icon: FileText, label: 'Reports', color: 'orange' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <action.icon className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-blue-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent Admissions Component
const RecentAdmissions = () => {
  const recentAdmissions = [
    { id: 1, name: 'Sarah M.', unit: 'Detox', room: 'D-101', status: 'Medical Pending', time: '09:30' },
    { id: 2, name: 'Michael R.', unit: 'Detox', room: 'D-205', status: 'Complete', time: '08:15' },
    { id: 3, name: 'Emma K.', unit: 'Detox', room: 'D-103', status: 'Documentation', time: '07:45' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Medical Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Admissions</h2>
      <div className="space-y-3">
        {recentAdmissions.map((admission) => (
          <div key={admission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{admission.name}</p>
                <p className="text-sm text-gray-600">{admission.unit} - {admission.room}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                {admission.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{admission.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Notifications Component
const Notifications = () => {
  const notifications = [
    { id: 1, type: 'urgent', message: 'Medical review needed - John D.', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New admission scheduled for 14:00', time: '15 min ago' },
    { id: 3, type: 'success', message: 'Room D-12 cleaned and ready', time: '1 hour ago' }
  ];

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'urgent':
        return { bg: 'bg-red-50', icon: AlertTriangle, color: 'text-red-500' };
      case 'success':
        return { bg: 'bg-green-50', icon: CheckCircle, color: 'text-green-500' };
      default:
        return { bg: 'bg-blue-50', icon: Clock, color: 'text-blue-500' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
      <div className="space-y-3">
        {notifications.map((notification) => {
          const config = getNotificationConfig(notification.type);
          const IconComponent = config.icon;
          
          return (
            <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${config.bg}`}>
              <div className={`mt-1 ${config.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Detox Dashboard
const DetoxDashboard = () => {
  const [currentStep, setCurrentStep] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detox Unit</h1>
              <p className="text-sm text-gray-500">Dashboard & Daily Schedule</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm">
                12 Active Residents
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions setCurrentStep={setCurrentStep} />
          
          {/* Daily Timeline - Own Section */}
          <DailyTimeline />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentAdmissions />
            <Notifications />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetoxDashboard;