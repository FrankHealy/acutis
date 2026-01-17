"use client";

import React, { useState } from 'react';
import { Phone, Plus, Clock, User, MapPin, Calendar, Save, X, MessageSquare } from 'lucide-react';

interface CallLog {
  id: string;
  callerName: string;
  callerType: 'self' | 'family' | 'professional' | 'other';
  concernType: 'alcohol' | 'drugs' | 'gambling' | 'general';
  location: string;
  phoneNumber: string;
  timestamp: string;
  notes: string;
  status: 'new' | 'callback-scheduled' | 'evaluation-scheduled' | 'declined';
  urgency: 'low' | 'medium' | 'high';
}

const CallLogging: React.FC = () => {
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  // Sample data
  const todayCalls: CallLog[] = [
    {
      id: '1',
      callerName: 'Sarah Murphy',
      callerType: 'family',
      concernType: 'alcohol',
      location: 'Dublin',
      phoneNumber: '087 123 4567',
      timestamp: new Date().toISOString(),
      notes: 'Mother calling about son, 28 years old, struggling with alcohol dependency for 3 years',
      status: 'evaluation-scheduled',
      urgency: 'high'
    },
    {
      id: '2',
      callerName: 'John O\'Brien',
      callerType: 'self',
      concernType: 'drugs',
      location: 'Cork',
      phoneNumber: '086 987 6543',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Self-referral, cocaine use, ready for treatment',
      status: 'callback-scheduled',
      urgency: 'medium'
    },
    {
      id: '3',
      callerName: 'Dr. Michael Ryan',
      callerType: 'professional',
      concernType: 'gambling',
      location: 'Galway',
      phoneNumber: '091 765 432',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      notes: 'GP referring patient with severe gambling addiction',
      status: 'new',
      urgency: 'high'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluation-scheduled': return 'bg-green-100 text-green-800';
      case 'callback-scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConcernColor = (concern: string) => {
    switch (concern) {
      case 'alcohol': return 'bg-blue-100 text-blue-800';
      case 'drugs': return 'bg-purple-100 text-purple-800';
      case 'gambling': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{todayCalls.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Calls</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {todayCalls.filter(c => c.status === 'new').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Urgency</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {todayCalls.filter(c => c.urgency === 'high').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Evals</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {todayCalls.filter(c => c.status === 'evaluation-scheduled').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* New Call Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Recent Calls</h2>
        <button
          onClick={() => setShowNewCallForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Log New Call</span>
        </button>
      </div>

      {/* Calls List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {todayCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => setSelectedCall(call)}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{call.callerName}</h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getConcernColor(call.concernType)}`}>
                      {call.concernType.charAt(0).toUpperCase() + call.concernType.slice(1)}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(call.urgency)}`}>
                      {call.urgency.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="capitalize">{call.callerType}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{call.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{call.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(call.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{call.notes}</p>
                </div>

                <div className="ml-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(call.status)}`}>
                    {call.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Call Form Modal */}
      {showNewCallForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-3xl font-bold">Log New Call</h3>
                  <p className="text-blue-100 font-medium">Record incoming inquiry</p>
                </div>
                <button
                  onClick={() => setShowNewCallForm(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                >
                  <X className="h-7 w-7 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caller Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="087 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caller Type <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                    <option value="">Select type...</option>
                    <option value="self">Self</option>
                    <option value="family">Family Member</option>
                    <option value="professional">Healthcare Professional</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Concern Type <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                    <option value="">Select concern...</option>
                    <option value="alcohol">Alcohol</option>
                    <option value="drugs">Drugs</option>
                    <option value="gambling">Gambling</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="City/County"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Call Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-base"
                    placeholder="Enter detailed notes about the call, concerns discussed, and any relevant background information..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t-2 border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNewCallForm(false)}
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border-2 border-gray-200 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5" />
                    <span>Save Call Log</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogging;
