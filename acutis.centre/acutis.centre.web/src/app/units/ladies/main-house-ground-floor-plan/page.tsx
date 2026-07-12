"use client";

import { useRouter } from "next/navigation";
import Header from "@/areas/shared/layout/Header";
import Navigation from "@/areas/shared/layout/Navigation";
import MainHouseHGroundFloorPlan from "@/areas/detox/components/MainHouseHGroundFloorPlan";
import { UnitDefinitions } from "@/areas/shared/unit/unitTypes";

export default function LadiesMainHouseGroundFloorPlanPage() {
  const router = useRouter();
  const unit = UnitDefinitions.ladies;

  const handleStepChange = (step: string) => {
    if (step === "operations/room-mapping") {
      router.push("/units/ladies/main-house-ground-floor-plan");
      return;
    }

    router.push("/units/ladies");
  };

  return (
    <div className="app-page-shell">
      <div className="sticky top-0 z-40">
        <Header
          showCapacity={false}
          unitCode={unit.id}
          unitName={unit.name}
          unitAccentClass={unit.accentClass}
          unitIconKey={unit.iconKey}
        />
        <Navigation
          currentStep="operations/room-mapping"
          setCurrentStep={handleStepChange}
          showAdmissions={unit.admissionsEnabled}
        />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MainHouseHGroundFloorPlan />
      </main>
    </div>
  );
}
