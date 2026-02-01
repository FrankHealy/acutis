import React from 'react';

interface Resident {
  id: number;
  firstName: string;
  surname: string;
}

interface AbsenceModalProps {
  resident: Resident | undefined;
  absenceReason: string;
  setAbsenceReason: (reason: string) => void;
  absenceDescription: string;
  setAbsenceDescription: (description: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AbsenceModal: React.FC<AbsenceModalProps> = ({
  resident,
  absenceReason,
  setAbsenceReason,
  absenceDescription,
  setAbsenceDescription,
  onSubmit,
  onCancel
}) => {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Record Absence - {resident.firstName} {resident.surname}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for absence
            </label>
            <div className="space-y-2">
              {['Sick', 'At Gate', 'Working', 'Other'].map((reason) => (
                <label key={reason} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="radio"
                    name="absence-reason"
                    value={reason}
                    checked={absenceReason === reason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          
          {absenceReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={absenceDescription}
                onChange={(e) => setAbsenceDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide details..."
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!absenceReason || (absenceReason === 'Other' && !absenceDescription.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Record Absence
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceModal;