import UnitAdmissionForm from "@/areas/shared/admissions/UnitAdmissionForm";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { UnitDefinitions } from "@/areas/shared/unit/unitTypes";

interface NewAdmissionFormProps {
  setCurrentStep: (step: string) => void;
  unitId?: UnitId;
  unitName?: string;
}

const NewAdmissionForm: React.FC<NewAdmissionFormProps> = ({
  setCurrentStep,
  unitId = "alcohol",
  unitName = "Alcohol",
}) => (
  <UnitAdmissionForm
    unitId={unitId}
    unitName={unitName}
    unitIconKey={UnitDefinitions[unitId].iconKey}
    admissionFormCode={UnitDefinitions[unitId].admissionFormCode}
    setCurrentStep={setCurrentStep}
  />
);

export default NewAdmissionForm;
