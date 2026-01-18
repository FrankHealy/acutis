import React, { useState } from 'react';
import { UserPlus, Clock, CheckCircle, AlertCircle, Search, Filter, Calendar, ArrowRight, Settings, FileText, History, TrendingUp, Users } from 'lucide-react';

interface ExpectedAdmission {
  id: string;
  name: string;
  expectedTime: string;
  addictionType: string;
  hasPhoneEval: boolean;
  hasPreReg: boolean;
  isPreviousResident: boolean;
  status: 'pending' | 'arrived' | 'admitted';
}

interface RecentAdmission {
  id: string;
  name: string;
  unit: string;
  roomNumber: string;
  status: 'complete' | 'incomplete' | 'needs-review';
  completedDate: string;
  completedBy: string;
}

interface ActivityItem {
  id: string;
  type: 'admission' | 'update' | 'review';
  message: string;
  time: string;
  user: string;
}

const AdmissionsLandingPage = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  const expectedAdmissions: ExpectedAdmission[] = [
    {
      id: '1',
      name: 'Michael O\'Brien',
      expectedTime: '10:00',
      addictionType: 'Alcohol',
      hasPhoneEval: true,
      hasPreReg: true,
      isPreviousResident: false,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Patrick Murphy',
      expectedTime: '11:30',
      addictionType: 'Alcohol',
      hasPhoneEval: true,
      hasPreReg: false,
      isPreviousResident: false,
      status: 'pending'
    },
    {
      id: '3',
      name: 'John Fitzgerald',
      expectedTime: '14:00',
      addictionType: 'Alcohol',
      hasPhoneEval: true,
      hasPreReg: true,
      isPreviousResident: true,
      status: 'arrived'
    },
    {
      id: '4',
      name: 'Thomas Collins',
      expectedTime: '15:30',
      addictionType: 'Drugs',
      hasPhoneEval: false,
      hasPreReg: false,
      isPreviousResident: false,
      status: 'pending'
    }
  ];

  const recentAdmissions: RecentAdmission[] = [
    {
      id: '1',
      name: 'David Walsh',
      unit: 'Alcohol',
      roomNumber: 'A-108',
      status: 'complete',
      completedDate: '2026-01-15 09:30',
      completedBy: 'Sarah Murphy'
    },
    {
      id: '2',
      name: 'Emma Kelly',
      unit: 'Detox',
      roomNumber: 'D-101',
      status: 'needs-review',
      completedDate: '2026-01-15 11:20',
      completedBy: 'John Kelly'
    },
    {
      id: '3',
      name: 'Robert Flynn',
      unit: 'Alcohol',
      roomNumber: 'A-203',
      status: 'incomplete',
      completedDate: '2026-01-14 16:45',
      completedBy: 'Mary Walsh'
    }
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'admission',
      message: 'New admission completed for David Walsh',
      time: '30 minutes ago',
      user: 'Sarah Murphy'
    },
    {
      id: '2',
      type: 'review',
      message: 'Admission flagged for review - Emma Kelly',
      time: '1 hour ago',
      user: 'John Kelly'
    },
    {
      id: '3',
      type: 'update',
      message: 'Medical prescriptions updated for Michael O\'Brien',
      time: '2 hours ago',
      user: 'Dr. Murphy'
    }
  ];

  const stats = {
    expectedToday: expectedAdmissions.length,
    completedToday: 5,
    needsReview: 2,
    currentOccupancy: 78
  };

  const getStatusBadge = (status: ExpectedAdmission['status']) => {
    switch (status) {
      case 'arrived':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Arrived' };
      case 'admitted':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Admitted' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expected' };
    }
  };

  const getRecentStatusBadge = (status: RecentAdmission['status']) => {
    switch (status) {
      case 'complete':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Complete', icon: CheckCircle };
      case 'needs-review':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Needs Review', icon: AlertCircle };
      case 'incomplete':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Incomplete', icon: Clock };
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'admission':
        return { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'review':
        return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' };
      case 'update':
        return { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admissions</h1>
            <p className="text-gray-500 mt-2">
              {new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
              <Settings className="h-5 w-5" />
              <span>Form Designer</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
              <History className="h-5 w-5" />
              <span>View All</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold shadow-md">
              <Search className="h-5 w-5" />
              <span>Search Admissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Expected Today</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.expectedToday}</p>
          <p className="text-sm text-gray-500 mt-1">4 pending arrival</p>
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
            <h3 className="text-sm font-semibold text-gray-600">Current Occupancy</h3>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.currentOccupancy}%</p>
          <p className="text-sm text-gray-500 mt-1">47 of 60 beds</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expected Admissions - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Not on List Quick Action */}
          <button className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all shadow-md hover:shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <UserPlus className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold">Walk-in / Not on List</h3>
                <p className="text-blue-100 text-sm">Start new admission for unexpected arrival</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6" />
          </button>

          {/* Expected Admissions List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Expected Admissions ({expectedAdmissions.length})</h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-medium"
                  >
                    <option value="all">All Units</option>
                    <option value="alcohol">Alcohol</option>
                    <option value="detox">Detox</option>
                    <option value="drugs">Drugs</option>
                    <option value="ladies">Ladies</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {expectedAdmissions.map((admission) => {
                const statusBadge = getStatusBadge(admission.status);
                return (
                  <div key={admission.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {admission.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{admission.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Expected: {admission.expectedTime}</span>
                            </span>
                            <span>•</span>
                            <span>{admission.addictionType}</span>
                            {admission.hasPhoneEval && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Phone Eval ✓</span>
                              </>
                            )}
                            {admission.isPreviousResident && (
                              <>
                                <span>•</span>
                                <span className="text-purple-600 font-medium">Returning</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
                        {admission.status === 'arrived' ? 'Continue Admission' : 'Start Admission'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Admissions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Admissions</h2>
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {recentAdmissions.map((admission) => {
                const statusBadge = getRecentStatusBadge(admission.status);
                const StatusIcon = statusBadge.icon;
                return (
                  <div key={admission.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-base font-bold text-gray-900">{admission.name}</h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>{admission.unit} - {admission.roomNumber}</span>
                          <span>•</span>
                          <span>{new Date(admission.completedDate).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>by {admission.completedBy}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Activity Feed */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-colors text-left">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-700">View All Admissions</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-colors text-left">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-700">Form Configuration</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-colors text-left">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Reports & Analytics</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>

            <div className="p-4 space-y-4">
              {recentActivity.map((activity) => {
                const config = getActivityIcon(activity.type);
                const ActivityIcon = config.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                      <ActivityIcon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{activity.user}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1">
                <span>View All Activity</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsLandingPage;
