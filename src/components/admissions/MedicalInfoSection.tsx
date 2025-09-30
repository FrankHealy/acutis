import { useState } from 'react';
import { Heart, Upload } from 'lucide-react';
import SectionToggle from '../common/SectionToggle';

const MedicalInfoSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const medicalQuestions = [
    'Any mobility issues?',
    'Physical problems or disabilities?',
    'History of self-harm?',
    'Previous suicide attempts?',
    'Significant medical conditions?'
  ];

  return (
    <div className="p-6 border-b border-gray-200">
      <SectionToggle
        icon={Heart}
        title="Medical Information"
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        iconColor="text-red-500"
      />
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GP Name</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GP Contact</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Medication name" className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="text" placeholder="Dosage" className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="text" placeholder="Frequency" className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button className="text-blue-500 text-sm hover:text-blue-600">+ Add another medication</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload prescriptions or drag and drop</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Medical History Questions</h4>
            {medicalQuestions.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{question}</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1">
                    <input type="radio" name={`medical_${index}`} value="yes" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name={`medical_${index}`} value="no" />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalInfoSection;