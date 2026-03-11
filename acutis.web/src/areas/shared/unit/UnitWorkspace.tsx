"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/areas/shared/layout/Header";
import Navigation from "@/areas/shared/layout/Navigation";
import Dashboard from "@/areas/shared/dashboard/Dashboard";
import DayPlanner from "@/areas/config/DayPlanner";
import UnitMediaConfiguration from "@/areas/config/UnitMediaConfiguration";
import UnitAdmissionForm from "@/areas/shared/admissions/UnitAdmissionForm";
import RoomAssignments from "@/areas/shared/RoomAssignments";
import OperationsSection from "@/areas/shared/OperationsSection";
import GroupTherapySection from "@/areas/shared/GroupTherapySection";
import ResidentsSection from "@/areas/shared/ResidentsSection";
import MeditationSection from "@/areas/shared/MeditationSection";
import type { UnitId } from "./unitTypes";
import { UnitDefinitions } from "./unitTypes";
import { hasSuperAdminAccess } from "@/lib/adminAccess";
import { useAppAccess } from "@/areas/shared/hooks/useAppAccess";

type Step =
  | "dashboard"
  | "new-admission"
  | "residents"
  | "configuration"
  | "operations/day-planner"
  | "operations/room-mapping"
  | "operations/ot-roles"
  | "operations/therapy-schedule"
  | "operations/meditation";

type UnitWorkspaceProps = {
  unitId: UnitId;
};

export default function UnitWorkspace({ unitId }: UnitWorkspaceProps) {
  const router = useRouter();
  const { access } = useAppAccess();
  const [currentStep, setCurrentStep] = useState<Step>("dashboard");
  const [therapyModuleKey, setTherapyModuleKey] = useState<string | undefined>(undefined);
  const [residentsDefaultRollCall, setResidentsDefaultRollCall] = useState(false);
  const unit = UnitDefinitions[unitId];
  const canSeeGlobalAdministration = hasSuperAdminAccess(access.roles);

  const goTo = (step: string) => {
    if (step === "residents") {
      setResidentsDefaultRollCall(false);
    }
    setCurrentStep(step as Step);
  };
  const openGroupTherapy = (moduleKey?: string) => {
    setTherapyModuleKey(moduleKey);
    setCurrentStep("operations/therapy-schedule");
  };
  const openRollCall = () => {
    setResidentsDefaultRollCall(true);
    setCurrentStep("residents");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "dashboard":
        return (
          <Dashboard
            setCurrentStep={goTo}
            unitName={unit.name}
            showAdmissions={unit.admissionsEnabled}
            onOpenGroupTherapy={openGroupTherapy}
            onOpenRollCall={openRollCall}
          />
        );
      case "new-admission":
        return unit.admissionsEnabled ? (
          <UnitAdmissionForm
            unitId={unitId}
            unitName={unit.name}
            unitIconKey={unit.iconKey}
            admissionFormCode={unit.admissionFormCode}
            setCurrentStep={goTo}
          />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">{unit.name} Admissions</h2>
            <p className="mt-2 text-sm text-amber-800">
              Admissions are currently handled through Detox. Unit-specific admission processes remain configurable for role-based rollout.
            </p>
          </div>
        );
      case "residents":
        return (
          <ResidentsSection
            unitId={unitId}
            unitName={unit.name}
            initialRollCallView={residentsDefaultRollCall}
            onOpenMeditation={() => setCurrentStep("operations/meditation")}
          />
        );
      case "configuration":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className={`text-xl font-semibold ${unit.accentClass}`}>{unit.name} Configuration</h2>
              <p className="mt-1 text-sm text-gray-600">
                Unit configuration uses shared controls with unit-specific data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/units/config/day-planner")}
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Day Planner
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/units/config/forms")}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Forms
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/units/config/program-manager")}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Program Manager
                </button>
              </div>
              {canSeeGlobalAdministration && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900">Global Administration</h3>
                  <p className="mt-1 text-xs text-gray-600">
                    Units are created and administered centrally. Use the global area for unit records, roles, and system-wide settings.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/units/config")}
                    className="mt-3 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Open Global Administration
                  </button>
                </div>
              )}
            </div>
            <UnitMediaConfiguration unitId={unitId} />
          </div>
        );
      case "operations/day-planner":
        return (
          <DayPlanner
            embedded
            lockUnit
            initialUnit={unitId}
            title={`${unit.name} Day Planner`}
          />
        );
      case "operations/room-mapping":
        return <RoomAssignments unitId={unitId} />;
      case "operations/ot-roles":
        return <OperationsSection unitId={unitId} />;
      case "operations/therapy-schedule":
        return <GroupTherapySection initialModuleKey={therapyModuleKey} unitId={unitId} />;
      case "operations/meditation":
        return <MeditationSection unitId={unitId} unitName={unit.name} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40">
        <Header showCapacity={false} />
        <Navigation
          currentStep={currentStep}
          setCurrentStep={goTo}
          showAdmissions={unit.admissionsEnabled}
          unitName={unit.name}
          unitAccentClass={unit.accentClass}
          unitIconKey={unit.iconKey}
        />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{renderStep()}</main>
    </div>
  );
}
