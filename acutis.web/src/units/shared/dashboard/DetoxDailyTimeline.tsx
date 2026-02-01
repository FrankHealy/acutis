"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Users, Briefcase, Bed, Coffee, Wrench, UtensilsCrossed, Brain, Target, Moon, BookOpen, HeartHandshake, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

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

const DetoxDailyTimeline: React.FC = () => {
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

  const getTimelinePosition = (minutes: number, index?: number) => {
    const schedule = getCurrentSchedule();
    const startMinutes = schedule[0].timeMinutes;
    const endMinutes = schedule[schedule.length - 1].timeMinutes;
    const totalMinutes = endMinutes - startMinutes;
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
    const safeEdge = 3; // prevent icons from overflowing container edges
    const basePosition = clamp(((minutes - startMinutes) / totalMinutes) * 100, safeEdge, 100 - safeEdge);
    
    // If no index provided (e.g., for current-time indicator),
    // return the base position without event-specific adjustments.
    if (typeof index !== 'number') {
      return basePosition;
    }

    const event = schedule[index];
    if (!event) {
      return basePosition;
    }

    // For stacked events, use base position
    if (event.stackPosition && event.stackPosition > 0) {
      return basePosition;
    }
    
    // Manual spacing adjustments for specific events to prevent overlap
    // Morning: Room Check -> Coffee -> OT need spacing
    if (event.title === 'Coffee' && index > 0) {
      const roomCheckIndex = schedule.findIndex(e => e.title === 'Room Check');
      if (roomCheckIndex >= 0) {
        const roomCheckPosition = ((schedule[roomCheckIndex].timeMinutes - startMinutes) / totalMinutes) * 100;
        return clamp(roomCheckPosition + 8, safeEdge, 100 - safeEdge);
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
        return clamp(roomCheckPosition + 16, safeEdge, 100 - safeEdge); // keep within safe bounds
      }
    }
    
    return basePosition;
  };

  const currentMinutes = getCurrentMinutes();
  const schedule = getCurrentSchedule();
  const maxStack = Math.max(0, ...schedule.map(e => e.stackPosition ?? 0));
  const verticalSpacing = 110; // px between stacked rows (room for labels)
  const bubbleSize = 56; // approx circle size
  const labelHeight = 56; // safe label area to avoid underlap
  const baseTop = 6; // track offset
  const trackThickness = 8; // h-2 ~ 8px
  const extraBottom = 24; // bottom padding inside card to avoid clipping
  // Height: track offset + rows*spacing + bubble + labels + bottom pad
  const rows = maxStack + 1; // at least one row of events
  const timelineHeight = baseTop + (rows * verticalSpacing) + bubbleSize + labelHeight + extraBottom;
  const shouldShowIndicator = viewMode === 'morning' 
    ? currentMinutes >= 390 && currentMinutes <= 750
    : currentMinutes >= 840 && currentMinutes <= 1320;
  const currentPosition = shouldShowIndicator ? getTimelinePosition(currentMinutes) : 0;

  const dayName = currentTime.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden" style={{ paddingBottom: 24 }}>
      {/* Heading aligned to Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
        Alcohol Daily Timeline
      </h2>
      {/* Date/time moved to global header for alignment and space */}

      {/* View Toggle */}
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

      {/* Timeline */}
      <div className="relative" style={{ height: timelineHeight }}>
        {/* Track */}
        <div className="absolute left-0 right-0 bg-gray-200 rounded-full" style={{ top: baseTop, height: trackThickness }} />

        {/* NOW indicator on the track */}
        {shouldShowIndicator && (
          <div
            className="absolute -translate-x-1/2 z-40 pointer-events-none"
            style={{ left: `${currentPosition}%`, top: baseTop - 2 }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded shadow-sm">NOW</span>
            </div>
          </div>
        )}

        {/* Events area */}
        <div className="absolute inset-x-0" style={{ top: baseTop + 24 }}>
          {schedule.map((event, index) => {
            const position = getTimelinePosition(event.timeMinutes, index);
            const isCurrent = isCurrentEvent(event);
            const IconComponent = event.icon;
            const isSpecial = event.title === 'Wake Up Bell' || event.title === 'Bedtime';
            const topOffset = (event.stackPosition || 0) * verticalSpacing;

            return (
              <div
                key={`${event.time}-${event.title}`}
                className="absolute"
                style={{ left: `${position}%`, transform: 'translateX(-50%)', top: `${topOffset}px` }}
              >
                <button
                  onClick={() => setSelectedEvent(event)}
                  className={`relative group transition-all duration-200 ${isCurrent ? 'scale-125' : 'hover:scale-110'}`}
                >
                  <div className={`w-14 h-14 ${event.color} rounded-full flex items-center justify-center shadow-lg ${isCurrent ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} ${isSpecial ? 'ring-4 ring-gray-300 ring-offset-2' : ''}`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center leading-tight">
                    <div className={`text-xs font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>{event.time}</div>
                    <div className={`text-xs mt-1 max-w-[120px] ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{event.title}</div>
                    {event.days && <div className="text-[10px] text-gray-400 mt-0.5">{event.days}</div>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
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

export default DetoxDailyTimeline;
