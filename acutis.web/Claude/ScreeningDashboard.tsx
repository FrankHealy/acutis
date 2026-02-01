"use client";

import React, { useState } from 'react';
import { Phone, ClipboardCheck, BedDouble, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CallLogging from './components/CallLogging';
import EvaluationQueue from './components/EvaluationQueue';
import CapacityManagement from './components/CapacityManagement';

const ScreeningDashboard: React.FC = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'calls' | 'evaluation' | 'capacity'>('calls');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Screening & Forecasting</h1>
                <p className="text-sm text-gray-500">Intake Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-IE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveSection('calls')}
              className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                activeSection === 'calls'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Phone className="h-5 w-5" />
              <span>Call Logging</span>
            </button>
            <button
              onClick={() => setActiveSection('evaluation')}
              className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                activeSection === 'evaluation'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ClipboardCheck className="h-5 w-5" />
              <span>Evaluation</span>
            </button>
            <button
              onClick={() => setActiveSection('capacity')}
              className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                activeSection === 'capacity'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BedDouble className="h-5 w-5" />
              <span>Capacity Management</span>
            </button>
          </div>
        </div>

        {/* Active Section Content */}
        <div className="space-y-6">
          {activeSection === 'calls' && <CallLogging />}
          {activeSection === 'evaluation' && <EvaluationQueue />}
          {activeSection === 'capacity' && <CapacityManagement />}
        </div>
      </main>
    </div>
  );
};

export default ScreeningDashboard;
