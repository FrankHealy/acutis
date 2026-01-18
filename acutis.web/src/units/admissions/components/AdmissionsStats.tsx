import React from 'react';
import { Calendar, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';

const AdmissionsStats: React.FC = () => {
  // Mock stats
  const stats = {
    expectedToday: 4,
    completedToday: 5,
    needsReview: 2,
    currentOccupancy: 78,
    activeResidents: 47,
    totalBeds: 60
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">Expected Today</h3>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.expectedToday}</p>
        <p className="text-sm text-gray-500 mt-1">{stats.expectedToday} pending arrival</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">Completed Today</h3>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.completedToday}</p>
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          +2 from yesterday
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">Needs Review</h3>
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.needsReview}</p>
        <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">Occupancy</h3>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.currentOccupancy}%</p>
        <p className="text-sm text-gray-500 mt-1">{stats.activeResidents} of {stats.totalBeds} beds</p>
      </div>
    </div>
  );
};

export default AdmissionsStats;
