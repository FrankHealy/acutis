"use client";

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Phone, 
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  Home,
  AlertCircle,
  X,
  Save
} from 'lucide-react';

interface EvaluationCandidate {
  id: string;
  name: string;
  phoneNumber: string;
  concernType: string;
  callDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled';
  evaluationData?: {
    personalInfo?: boolean;
    medicalHistory?: boolean;
    substanceUse?: boolean;
    livingArrangements?: boolean;
    mentalHealth?: boolean;
  };
}

interface SectionProps {
  id: string;
  title: string;
  icon: any;
  completed: boolean;
  required: boolean;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon: Icon,
  completed,
  required,
  subtitle,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {required && (
              <p className="text-sm text-red-600 font-medium">Required</p>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {completed && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 text-gray-400" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const EvaluationQueue: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluationCandidate | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal-info']);

  const candidates: EvaluationCandidate[] = [
    {
      id: '1',
      name: 'Michael O\'Brien',
      phoneNumber: '087 123 4567',
      concernType: 'Alcohol',
      callDate: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      name: 'Sarah Murphy',
      phoneNumber: '086 987 6543',
      concernType: 'Drugs',
      callDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'in-progress',
      evaluationData: {
        personalInfo: true,
        medicalHistory: false,
        substanceUse: true,
        livingArrangements: false,
        mentalHealth: false,
      }
    },
    {
      id: '3',
      name: 'John Fitzgerald',
      phoneNumber: '085 456 7890',
      concernType: 'Gambling',
      callDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConcernColor = (concern: string) => {
    switch (concern) {
      case 'Alcohol': return 'bg-blue-100 text-blue-800';
      case 'Drugs': return 'bg-purple-100 text-purple-800';
      case 'Gambling': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Evals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {candidates.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {candidates.filter(c => c.status === 'in-progress').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {candidates.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {candidates.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Evaluation Queue</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Concern</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Call Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">{candidate.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-gray-700">{candidate.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getConcernColor(candidate.concernType)}`}>
                      {candidate.concernType}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-gray-700">{formatDate(candidate.callDate)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(candidate.status)}`}>
                      {candidate.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      {candidate.status === 'pending' ? 'Start Evaluation' : 'Continue'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Form Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-3xl font-bold">{selectedCandidate.name}</h3>
                  <p className="text-blue-100 font-medium">Phone Evaluation</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                >
                  <X className="h-7 w-7 text-white" />
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Personal Information */}
                <Section
                  id="personal-info"
                  title="Personal Information"
                  icon={User}
                  completed={selectedCandidate.evaluationData?.personalInfo || false}
                  required={true}
                  isExpanded={expandedSections.includes('personal-info')}
                  onToggle={() => toggleSection('personal-info')}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCandidate.name}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={selectedCandidate.phoneNumber}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </Section>

                {/* Medical History */}
                <Section
                  id="medical-history"
                  title="Medical History"
                  icon={Heart}
                  completed={selectedCandidate.evaluationData?.medicalHistory || false}
                  required={true}
                  isExpanded={expandedSections.includes('medical-history')}
                  onToggle={() => toggleSection('medical-history')}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Current Medical Conditions
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Diabetes', 'Heart Disease', 'Liver Disease', 'Kidney Disease', 'Mental Health Conditions', 'Other'].map(condition => (
                          <label key={condition} className="flex items-center space-x-3 cursor-pointer p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                            <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300" />
                            <span className="font-medium text-gray-700">{condition}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Medications
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="List any current medications..."
                      />
                    </div>
                  </div>
                </Section>

                {/* Substance Use History */}
                <Section
                  id="substance-use"
                  title="Substance Use History"
                  icon={AlertCircle}
                  completed={selectedCandidate.evaluationData?.substanceUse || false}
                  required={true}
                  isExpanded={expandedSections.includes('substance-use')}
                  onToggle={() => toggleSection('substance-use')}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Substance of Concern <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                        <option value="">Select...</option>
                        <option value="alcohol">Alcohol</option>
                        <option value="cannabis">Cannabis</option>
                        <option value="cocaine">Cocaine</option>
                        <option value="heroin">Heroin</option>
                        <option value="prescription">Prescription Drugs</option>
                        <option value="gambling">Gambling</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration of Use
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                        placeholder="e.g., 5 years"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Previous Treatment History
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Describe any previous treatment experiences..."
                      />
                    </div>
                  </div>
                </Section>

                {/* Living Arrangements */}
                <Section
                  id="living-arrangements"
                  title="Living Arrangements"
                  icon={Home}
                  completed={selectedCandidate.evaluationData?.livingArrangements || false}
                  required={false}
                  isExpanded={expandedSections.includes('living-arrangements')}
                  onToggle={() => toggleSection('living-arrangements')}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Living Situation
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                        <option value="">Select...</option>
                        <option value="alone">Living Alone</option>
                        <option value="family">With Family</option>
                        <option value="partner">With Partner</option>
                        <option value="homeless">Homeless</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employment Status
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                        <option value="">Select...</option>
                        <option value="employed">Employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </Section>

                {/* Mental Health */}
                <Section
                  id="mental-health"
                  title="Mental Health Assessment"
                  icon={Heart}
                  completed={selectedCandidate.evaluationData?.mentalHealth || false}
                  required={false}
                  subtitle="Optional but recommended"
                  isExpanded={expandedSections.includes('mental-health')}
                  onToggle={() => toggleSection('mental-health')}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Current Mental Health Concerns
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder', 'Suicidal Ideation', 'None'].map(concern => (
                          <label key={concern} className="flex items-center space-x-3 cursor-pointer p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                            <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300" />
                            <span className="font-medium text-gray-700">{concern}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Any additional mental health information..."
                      />
                    </div>
                  </div>
                </Section>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t-2 border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border-2 border-gray-200 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Save className="h-5 w-5" />
                      <span>Save Progress</span>
                    </div>
                  </button>
                  <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Complete Evaluation</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationQueue;
