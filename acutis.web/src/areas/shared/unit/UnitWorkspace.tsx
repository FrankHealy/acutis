"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/areas/shared/layout/Header";
import Navigation from "@/areas/shared/layout/Navigation";
import Dashboard from "@/areas/shared/dashboard/Dashboard";
import DayPlanner from "@/areas/config/DayPlanner";
import UnitAdmissionForm from "@/areas/shared/admissions/UnitAdmissionForm";
import RoomAssignments from "@/areas/shared/RoomAssignments";
import GroupTherapySection from "@/areas/shared/GroupTherapySection";
import ResidentsSection from "@/areas/shared/ResidentsSection";
import type { UnitId } from "./unitTypes";
import { UnitDefinitions } from "./unitTypes";

type Step =
  | "dashboard"
  | "new-admission"
  | "residents"
  | "configuration"
  | "operations/day-planner"
  | "operations/room-mapping"
  | "operations/ot-roles"
  | "operations/therapy-schedule";

type UnitWorkspaceProps = {
  unitId: UnitId;
};

export default function UnitWorkspace({ unitId }: UnitWorkspaceProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("dashboard");
  const [therapyModuleKey, setTherapyModuleKey] = useState<string | undefined>(undefined);
  const unit = UnitDefinitions[unitId];

  const goTo = (step: string) => setCurrentStep(step as Step);
  const openGroupTherapy = (moduleKey?: string) => {
    setTherapyModuleKey(moduleKey);
    setCurrentStep("operations/therapy-schedule");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "dashboard":
        return <Dashboard setCurrentStep={goTo} unitName={unit.name} onOpenGroupTherapy={openGroupTherapy} />;
      case "new-admission":
        return <UnitAdmissionForm unitId={unitId} unitName={unit.name} setCurrentStep={goTo} />;
      case "residents":
        return <ResidentsSection unitId={unitId} unitName={unit.name} />;
      case "configuration":
        return (
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
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Global Settings</h3>
              <p className="mt-1 text-xs text-gray-600">
                Global configuration applies across all units and is intentionally separate.
              </p>
              <button
                type="button"
                onClick={() => router.push("/units/config")}
                className="mt-3 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open Global Configuration
              </button>
            </div>
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
        return <RoomAssignments />;
      case "operations/ot-roles":
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{unit.name} OT Roles</h2>
            <p className="mt-2 text-sm text-gray-600">Role assignment controls are unit-scoped and share the same UI.</p>
          </div>
        );
      case "operations/therapy-schedule":
        return <GroupTherapySection initialModuleKey={therapyModuleKey} unitId={unitId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCapacity={false} />
      <Navigation currentStep={currentStep} setCurrentStep={goTo} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{renderStep()}</main>
    </div>
  );
}
