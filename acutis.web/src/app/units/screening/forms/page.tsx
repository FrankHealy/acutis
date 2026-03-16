import ScreeningFormPage from "@/areas/screening/forms/ScreeningFormPage";
import Header from "@/areas/shared/layout/Header";
import { UnitDefinitions } from "@/areas/shared/unit/unitTypes";

export default function ScreeningFormsUnitPage() {
  const unit = UnitDefinitions.alcohol;

  return (
    <div className="app-page-shell min-h-screen">
      <Header
        showCapacity={false}
        unitCode={unit.id}
        unitName={`${unit.name} Screening`}
        unitAccentClass={unit.accentClass}
        unitIconKey={unit.iconKey}
      />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <ScreeningFormPage />
      </main>
    </div>
  );
}
