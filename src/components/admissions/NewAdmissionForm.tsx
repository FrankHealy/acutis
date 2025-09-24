import React from 'react';
import ProgressIndicator from './ProgressIndicator';
import PersonalInfoSection from './PersonalInfoSection';
import PhotoUploadSection from './PhotoUploadSection';
import ContrabandSection from './ContrabandSection';
import MedicalInfoSection from './MedicalInfoSection';
import EmploymentSection from './EmploymentSection';

interface NewAdmissionFormProps {
  setCurrentStep: (step: string) => void;
}

const NewAdmissionForm: React.FC<NewAdmissionFormProps> = ({ setCurrentStep }) => {
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

      <div className="flex justify-between">
        <button 
          onClick={() => setCurrentStep('dashboard')}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="space-x-3">
          <button className="px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
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