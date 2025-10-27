import React, { useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import PersonalInfoSection from './PersonalInfoSection';
import PhotoUploadSection from './PhotoUploadSection';
import ContrabandSection from './ContrabandSection';
import MedicalInfoSection from './MedicalInfoSection';
import EmploymentSection from './EmploymentSection';
import AdmissionsService from '@/services/admissionsService';

interface NewAdmissionFormProps {
  setCurrentStep: (step: string) => void;
}

const NewAdmissionForm: React.FC<NewAdmissionFormProps> = ({ setCurrentStep }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      // TODO: Collect real form values from sections. Sending minimal draft for now.
      const res = await AdmissionsService.saveDraft({ status: 'draft' });
      setSaveMessage(`Draft saved (id: ${res.id})`);
    } catch (err: any) {
      setSaveMessage(err?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <PersonalInfoSection />
        <PhotoUploadSection />
        <ContrabandSection />
        <MedicalInfoSection />
        <EmploymentSection />
      </div>

      {saveMessage && (
        <div className="text-sm px-2 text-gray-600">{saveMessage}</div>
      )}

      <div className="flex justify-between">
        <button 
          onClick={() => setCurrentStep('dashboard')}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className={`px-6 py-3 border rounded-lg transition-colors ${
              saving
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-blue-600 border-blue-300 hover:bg-blue-50'
            }`}
          >
            Save as Draft
          </button>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            Continue to Medical Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAdmissionForm;
