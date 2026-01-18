import React from 'react';
import { 
  UserPlus, Search, FileText, BarChart3, Settings,
  Sliders, History, Database, Shield, ArrowRight
} from 'lucide-react';

interface AdmissionsQuickActionsProps {
  setCurrentStep: (step: string, admissionId?: string) => void;
}

const AdmissionsQuickActions: React.FC<AdmissionsQuickActionsProps> = ({ setCurrentStep }) => {
  return (
    <div className="space-y-8">
      {/* Admissions Section */}
      <div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Admissions</h2>
              <p className="text-blue-100">Manage resident admissions and records</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <UserPlus className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentStep('new-admission')}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <UserPlus className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">New Admission</h3>
            <p className="text-sm text-gray-600">Start admission workflow</p>
          </button>

          <button
            onClick={() => setCurrentStep('search')}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Search className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Search Records</h3>
            <p className="text-sm text-gray-600">Find admission records</p>
          </button>

          <button
            onClick={() => setCurrentStep('admissions-list')}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <FileText className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">All Admissions</h3>
            <p className="text-sm text-gray-600">View all records</p>
          </button>

          <button
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <BarChart3 className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reports</h3>
            <p className="text-sm text-gray-600">Analytics dashboard</p>
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      <div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Configuration</h2>
              <p className="text-purple-100">System settings and form management</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Settings className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentStep('config/form-designer')}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Sliders className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Form Designer</h3>
            <p className="text-sm text-gray-600">Build admission forms</p>
          </button>

          <button
            onClick={() => setCurrentStep('config/version-history')}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <History className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Version History</h3>
            <p className="text-sm text-gray-600">Manage form versions</p>
          </button>

          <button
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Database className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unit Settings</h3>
            <p className="text-sm text-gray-600">Configure units</p>
          </button>

          <button
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all p-6 text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Shield className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Manage staff & roles</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsQuickActions;
