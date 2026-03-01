import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, MapPin, Heart, AlertTriangle, Brain, BookOpen, Shield, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Resident } from '../../services/mockDataService';

// lightweight mock history for demo
const mockMeetingHistory = [
  { date: "2025-10-15", type: "Group Therapy", attended: true, notes: "Good participation, shared openly" },
  { date: "2025-10-14", type: "Individual Session", attended: true, notes: "Discussed family relationships" },
  { date: "2025-10-13", type: "Group Therapy", attended: false, notes: "Sick - excused absence" },
  { date: "2025-10-12", type: "Focus Meeting", attended: true, notes: "Excellent engagement" },
  { date: "2025-10-11", type: "Group Therapy", attended: true, notes: "Supportive to other residents" },
];

type ResidentDetailProps = {
  resident: Resident;
  onBack: () => void;
};

const ResidentDetailPage: React.FC<ResidentDetailProps> = ({ resident, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getDietaryNeeds = (code: number) => {
    const dietary = {
      0: "No restrictions",
      1: "Vegetarian",
      2: "Vegan",
      3: "Halal",
      4: "Kosher",
      5: "Gluten-free"
    };
    return (dietary as Record<number, string>)[code] || "Not specified";
  };

  const ScaleIndicator: React.FC<{ label: string; value: number; max?: number; color?: 'blue' | 'yellow' | 'red' | 'green' }> = ({ label, value, max = 5, color = "blue" }) => {
    const percentage = (value / max) * 100;
    const colorClasses = {
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      green: "bg-green-500"
    };
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const StatusBadge: React.FC<{ condition: boolean; label: string; variant?: 'danger' | 'success' }>
    = ({ condition, label, variant = 'danger' }) => {
    const trueStyles = variant === 'danger'
      ? { box: 'bg-red-50 border border-red-200', icon: 'text-red-600', text: 'text-red-900' }
      : { box: 'bg-yellow-50 border border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-900' };
    const falseStyles = { box: 'bg-green-50 border border-green-200', icon: 'text-green-600', text: 'text-green-900' };
    const styles = condition ? trueStyles : falseStyles;
    return (
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${styles.box}`}>
        {condition ? (
          <XCircle className={`h-5 w-5 ${styles.icon}`} />
        ) : (
          <CheckCircle className={`h-5 w-5 ${styles.icon}`} />
        )}
        <span className={`font-medium ${styles.text}`}>
          {label}
        </span>
      </div>
    );
  };

  const calculateProgress = () => {
    const totalWeeks = 12;
    const wk = resident.weekNumber ?? 0;
    return Math.max(0, Math.min(100, Math.round((wk / totalWeeks) * 100)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Residents</span>
        </button>

        {/* Header Card with Large Photo */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>
          
          <div className="relative px-8 pb-8">
            {/* Large Profile Photo */}
            <div className="absolute -top-24 left-8">
              <div className="relative">
                <img 
                  src={resident.photo ?? resident.fallbackPhoto}
                  alt={`${resident.firstName} ${resident.surname}`}
                  className="w-48 h-48 rounded-2xl object-cover border-8 border-white shadow-2xl"
                  onError={(e) => {
                    if (e.currentTarget.src !== resident.fallbackPhoto) {
                      e.currentTarget.src = resident.fallbackPhoto;
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                  Week {resident.weekNumber ?? '-'}
                </div>
              </div>
            </div>

            {/* Header Info */}
            <div className="pt-28 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {resident.firstName} {resident.surname}
                </h1>
                <p className="text-lg text-gray-600 mb-4">PSN: {resident.psn}</p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{resident.age} years old</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{resident.nationality}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Room {resident.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - calculateProgress() / 100)}`}
                      className="text-blue-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{calculateProgress()}%</span>
                    <span className="text-sm text-gray-600">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['overview', 'history', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Addiction & Program Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Addiction & Program
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Primary Addiction</p>
                  <p className="text-xl font-bold text-red-900">{resident.primaryAddiction}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Admission Date</p>
                    <p className="font-bold text-blue-900">{new Date(resident.admissionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Expected Completion</p>
                    <p className="font-bold text-green-900">{new Date(resident.expectedCompletion).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resident.isDrug && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Drug History
                    </span>
                  )}
                  {resident.isGambeler && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Gambling Issues
                    </span>
                  )}
                  {resident.isPreviousResident && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Previous Resident
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Medical & Lifestyle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-pink-500 mr-2" />
                Medical & Lifestyle
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Dietary Requirements</p>
                  <p className="font-bold text-gray-900">{getDietaryNeeds(resident.dietaryNeedsCode)}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <StatusBadge 
                    condition={resident.isSnorer} 
                    label={resident.isSnorer ? "Snorer - Room consideration needed" : "No snoring issues"}
                  />
                </div>
              </div>
            </div>

            {/* Legal Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-500 mr-2" />
                Legal Status
              </h3>
              <div className="space-y-3">
                <StatusBadge 
                  condition={resident.hasCriminalHistory} 
                  label={resident.hasCriminalHistory ? "Criminal History on Record" : "No Criminal History"}
                  variant="success"
                />
                <StatusBadge 
                  condition={resident.isOnProbation} 
                  label={resident.isOnProbation ? "Currently on Probation" : "Not on Probation"}
                />
              </div>
            </div>

            {/* Behavioral Indicators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="h-6 w-6 text-purple-500 mr-2" />
                Behavioral Indicators
              </h3>
              <div className="space-y-4">
                <ScaleIndicator 
                  label="Argumentative Scale" 
                  value={resident.argumentativeScale} 
                  color={resident.argumentativeScale > 3 ? "red" : resident.argumentativeScale > 1 ? "yellow" : "green"}
                />
                <ScaleIndicator 
                  label="Learning Difficulty" 
                  value={resident.learningDifficultyScale} 
                  color={resident.learningDifficultyScale > 3 ? "red" : "yellow"}
                />
                <ScaleIndicator 
                  label="Literacy Level" 
                  value={resident.literacyScale} 
                  color="blue"
                />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Scales range from 0 (none/low) to 5 (high). These indicators help staff provide appropriate support and accommodations.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 text-blue-500 mr-2" />
              Meeting & Session History
            </h3>
            <div className="space-y-3">
              {mockMeetingHistory.map((meeting, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    meeting.attended 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {meeting.attended ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-bold text-gray-900">{meeting.type}</span>
                        <span className="text-sm text-gray-500">{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-8">{meeting.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-6 w-6 text-indigo-500 mr-2" />
              Staff Notes & Observations
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">Week 13 Progress Review</p>
                  <span className="text-xs text-blue-600">Oct 15, 2025</span>
                </div>
                <p className="text-sm text-gray-700">
                  Miles continues to show strong engagement in group therapy sessions. Has become more open about sharing personal experiences and provides supportive feedback to other residents.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-yellow-900">Literacy Support Plan</p>
                  <span className="text-xs text-yellow-600">Oct 10, 2025</span>
                </div>
                <p className="text-sm text-gray-700">
                  Given literacy level 4/5, Miles is receiving additional one-on-one support with workbook materials. Shows good progress and positive attitude toward learning.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-green-900">Admission Assessment</p>
                  <span className="text-xs text-green-600">Jul 15, 2025</span>
                </div>
                <p className="text-sm text-gray-700">
                  Previous resident returning for additional support. Shows strong motivation for recovery. Cooperative during admission process. Criminal history noted but no current probation requirements.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                + Add New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDetailPage;
