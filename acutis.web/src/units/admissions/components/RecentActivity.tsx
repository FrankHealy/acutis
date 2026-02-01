import React from 'react';
import { UserPlus, AlertCircle, Settings, Users, Activity } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const recentActivity = [
    { id: 1, type: 'admission', message: 'New admission completed - David Walsh', time: '30 mins ago', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, type: 'review', message: 'Admission flagged for review - Emma Kelly', time: '1 hour ago', icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 3, type: 'update', message: 'Form version 4 published', time: '2 hours ago', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 4, type: 'session', message: 'Group therapy session completed', time: '3 hours ago', icon: Users, color: 'text-green-500', bg: 'bg-green-50' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Activity className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {recentActivity.map((activity) => {
          const ActivityIcon = activity.icon;
          return (
            <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-lg ${activity.bg}`}>
              <div className={`mt-1 ${activity.color}`}>
                <ActivityIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
