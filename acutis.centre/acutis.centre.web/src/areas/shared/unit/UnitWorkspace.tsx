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
import BoundedFormRunner from "@/areas/screening/forms/BoundedFormRunner";
import ResidentsSection from "@/areas/shared/ResidentsSection";
import MeditationSection from "@/areas/shared/MeditationSection";
import IncidentsSection from "@/areas/shared/incidents/IncidentsSection";
import IncidentCaptureModal, { type IncidentPrefill } from "@/areas/shared/incidents/IncidentCaptureModal";
import UnitScheduler from "@/areas/shared/scheduler/UnitScheduler";
import type { UnitId } from "./unitTypes";
import { UnitDefinitions } from "./unitTypes";
import { hasSuperAdminAccess } from "@/lib/adminAccess";
import { useAppAccess } from "@/areas/shared/hooks/useAppAccess";
import type { Resident } from "@/services/mockDataService";

type Step =
  | "dashboard"
  | "new-admission"
  | "residents"
  | "incidents"
  | "configuration"
  | "operations/day-planner"
  | "operations/unit-scheduler"
  | "operations/room-mapping"
  | "operations/ot-roles"
  | "operations/therapy-schedule"
  | "operations/hse-extended-assessment"
  | "operations/care-plan-1"
  | "operations/care-plan-2"
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
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentPrefill, setIncidentPrefill] = useState<IncidentPrefill | null>(null);
  const [incidentRefreshKey, setIncidentRefreshKey] = useState(0);
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
  const openIncidentCapture = (prefill?: IncidentPrefill) => {
    setIncidentPrefill(prefill ?? { scope: "unit" });
    setIncidentModalOpen(true);
  };
  const openIncidentFromResident = (resident?: Resident) => {
    if (!resident) {
      openIncidentCapture({ scope: "unit" });
      return;
    }

    openIncidentCapture({ scope: resident.residentGuid ? "resident" : "unit", resident });
  };
  const openCarePlanEventForm = () => {
    setCurrentStep("operations/care-plan-2");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "dashboard":
        return (
          <Dashboard
            setCurrentStep={goTo}
            unitId={unitId}
            unitName={unit.name}
            showAdmissions={unit.admissionsEnabled}
            showExtendedAssessment={unit.extendedAssessmentEnabled}
            onOpenGroupTherapy={openGroupTherapy}
            onOpenRollCall={openRollCall}
            onOpenCarePlan={openCarePlanEventForm}
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
            onOpenIncidentCapture={openIncidentFromResident}
          />
        );
      case "incidents":
        return (
          <IncidentsSection
            unitId={unitId}
            unitName={unit.name}
            refreshKey={incidentRefreshKey}
            onOpenIncidentCapture={() => openIncidentCapture({ scope: "unit" })}
          />
        );
      case "configuration":
        return (
          <div className="space-y-6">
            <div className="app-card rounded-xl p-6">
              <h2 className={`text-xl font-semibold ${unit.accentClass}`}>{unit.name} Configuration</h2>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                Unit configuration uses shared controls with unit-specific data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/units/config/day-planner")}
                  className="app-primary-button rounded px-3 py-2 text-sm font-semibold"
                >
                  Day Planner
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/units/config/forms")}
                  className="app-outline-button rounded px-3 py-2 text-sm font-semibold"
                >
                  Forms
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/units/config/program-manager")}
                  className="app-outline-button rounded px-3 py-2 text-sm font-semibold"
                >
                  Program Manager
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/units/config/event-management")}
                  className="app-outline-button rounded px-3 py-2 text-sm font-semibold"
                >
                  Event Management
                </button>
              </div>
              {canSeeGlobalAdministration && (
                <div className="mt-6 border-t border-[var(--app-border)] pt-4">
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">Global Administration</h3>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                    Units are created and administered centrally. Use the global area for unit records, roles, and system-wide settings.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/units/config")}
                    className="app-outline-button mt-3 rounded px-3 py-2 text-sm font-semibold"
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
      case "operations/unit-scheduler":
        return <UnitScheduler unitId={unitId} unitName={unit.name} />;
      case "operations/room-mapping":
        return <RoomAssignments unitId={unitId} />;
      case "operations/ot-roles":
        return <OperationsSection unitId={unitId} />;
      case "operations/therapy-schedule":
        return <GroupTherapySection initialModuleKey={therapyModuleKey} unitId={unitId} />;
      case "operations/hse-extended-assessment":
        return unit.extendedAssessmentEnabled ? (
          <BoundedFormRunner
            formCode="hse_extended_assessment"
            subjectType="anonymous_call"
            title="HSE Extended Assessment"
            description={`${unit.name} session assessment using the bounded HSE form elements.`}
            submitLabel="Confirm Extended Assessment"
            submittedLabel="HSE Extended Assessment submitted."
          />
        ) : null;
      case "operations/care-plan-1":
        return (
          <BoundedFormRunner
            formCode="care_plan_1"
            subjectType="resident"
            title="Comprehensive Care Plan"
            description={`${unit.name} comprehensive care plan using bounded form elements.`}
            submitLabel="Confirm Care Plan"
            submittedLabel="Comprehensive Care Plan submitted."
          />
        );
      case "operations/care-plan-2":
        return (
          <BoundedFormRunner
            formCode="care_plan_2"
            subjectType="resident"
            title="Initial Care Plan"
            description={`${unit.name} Careplan event generated form.`}
            submitLabel="Confirm Initial Care Plan"
            submittedLabel="Initial Care Plan submitted."
          />
        );
      case "operations/meditation":
        return <MeditationSection unitId={unitId} unitName={unit.name} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-page-shell">
      <div className="sticky top-0 z-40">
        <Header
          showCapacity={false}
          unitCode={unitId}
          unitName={unit.name}
          unitAccentClass={unit.accentClass}
          unitIconKey={unit.iconKey}
          onOpenIncidentCapture={() => openIncidentCapture({ scope: "unit" })}
        />
        <Navigation
          currentStep={currentStep}
          setCurrentStep={goTo}
          showAdmissions={unit.admissionsEnabled}
          showExtendedAssessment={unit.extendedAssessmentEnabled}
        />
      </div>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">{renderStep()}</main>
      <IncidentCaptureModal
        open={incidentModalOpen}
        unitId={unitId}
        unitName={unit.name}
        prefill={incidentPrefill}
        onClose={() => setIncidentModalOpen(false)}
        onCreated={() => setIncidentRefreshKey((value) => value + 1)}
      />
    </div>
  );
}
