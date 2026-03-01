import React, { useState } from "react";
import ProgressIndicator from "@/areas/alcohol/components/ProgressIndicator";
import PersonalInfoSection from "@/areas/alcohol/components/PersonalInfoSection";
import PhotoUploadSection from "@/areas/alcohol/components/PhotoUploadSection";
import ContrabandSection from "@/areas/alcohol/components/ContrabandSection";
import MedicalInfoSection from "@/areas/alcohol/components/MedicalInfoSection";
import EmploymentSection from "@/areas/alcohol/components/EmploymentSection";
import AdmissionsService from "@/services/admissionsService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

interface UnitAdmissionFormProps {
  unitId: UnitId;
  unitName: string;
  setCurrentStep: (step: string) => void;
}

const UnitAdmissionForm: React.FC<UnitAdmissionFormProps> = ({ unitName, setCurrentStep }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await AdmissionsService.saveDraft({ status: "draft", unit: unitName });
      setSaveMessage(`Draft saved (id: ${res.id})`);
    } catch (err: any) {
      setSaveMessage(err?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold text-slate-900">{unitName} Admission</h2>
        <p className="mt-1 text-sm text-slate-600">Shared admissions workflow with unit-specific data context.</p>
      </div>

      <ProgressIndicator />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <PersonalInfoSection />
        <PhotoUploadSection />
        <ContrabandSection />
        <MedicalInfoSection />
        <EmploymentSection />
      </div>

      {saveMessage && <div className="px-2 text-sm text-gray-600">{saveMessage}</div>}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep("dashboard")}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <div className="space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className={`rounded-lg border px-6 py-3 transition-colors ${
              saving
                ? "cursor-not-allowed border-gray-200 text-gray-400"
                : "border-blue-300 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Save as Draft
          </button>
          <button className="flex items-center rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
            Continue to Medical Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitAdmissionForm;

