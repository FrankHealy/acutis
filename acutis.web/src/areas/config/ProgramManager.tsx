"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CalendarClock, ClipboardCheck, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  globalConfigurationService,
  type CentreConfigurationDto,
  type ProgrammeDefinitionDto,
  type ScheduleOccurrenceDto,
  type ScheduleTemplateDto,
  type UnitConfigurationDto,
  type UpsertProgrammeDefinitionRequest,
  type UpsertScheduleOccurrenceRequest,
  type UpsertScheduleTemplateRequest,
  type UpsertUnitRequest,
} from "@/services/globalConfigurationService";

const durationUnits = ["Weeks", "Days"] as const;
const recurrenceTypes = ["Daily", "Weekly", "OnceOff"] as const;
const audienceTypes = ["UnitResidents", "AllResidents", "Cohort", "ResidentSubset", "Resident", "OpenSession"] as const;
const facilitatorTypes = ["None", "Staff", "ResidentLed", "External"] as const;
const occurrenceStatuses = ["Scheduled", "Cancelled", "Completed"] as const;
const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const emptyProgrammeForm: UpsertProgrammeDefinitionRequest = {
  centreId: "",
  code: "",
  name: "",
  description: "",
  totalDurationValue: 12,
  totalDurationUnit: "Weeks",
  detoxPhaseDurationValue: 2,
  detoxPhaseDurationUnit: "Weeks",
  mainPhaseDurationValue: 10,
  mainPhaseDurationUnit: "Weeks",
  isActive: true,
};

const emptyTemplateForm: UpsertScheduleTemplateRequest = {
  centreId: "",
  unitId: "",
  programmeDefinitionId: "",
  code: "",
  name: "",
  description: "",
  category: "",
  recurrenceType: "Weekly",
  weeklyDayOfWeek: 1,
  startTime: "",
  endTime: "",
  audienceType: "UnitResidents",
  facilitatorType: "None",
  facilitatorRole: "",
  externalResourceName: "",
  isActive: true,
};

const todayIso = new Date().toISOString().slice(0, 10);

const emptyOccurrenceForm: UpsertScheduleOccurrenceRequest = {
  centreId: "",
  unitId: "",
  programmeDefinitionId: "",
  templateId: "",
  title: "",
  description: "",
  category: "",
  scheduledDate: todayIso,
  startTime: "",
  endTime: "",
  audienceType: "UnitResidents",
  facilitatorType: "None",
  facilitatorRole: "",
  externalResourceName: "",
  status: "Scheduled",
  notes: "",
};

const ProgramManager: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [centres, setCentres] = useState<CentreConfigurationDto[]>([]);
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeDefinitionDto[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplateDto[]>([]);
  const [occurrences, setOccurrences] = useState<ScheduleOccurrenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProgrammeId, setEditingProgrammeId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingOccurrenceId, setEditingOccurrenceId] = useState<string | null>(null);
  const [programmeForm, setProgrammeForm] = useState<UpsertProgrammeDefinitionRequest>(emptyProgrammeForm);
  const [templateForm, setTemplateForm] = useState<UpsertScheduleTemplateRequest>(emptyTemplateForm);
  const [occurrenceForm, setOccurrenceForm] = useState<UpsertScheduleOccurrenceRequest>(emptyOccurrenceForm);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  useEffect(() => {
    void loadKeys([
      "config.programs.title",
      "config.programs.description",
      "config.programs.back",
    ]);
  }, [loadKeys]);

  const loadConfiguration = useCallback(async () => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const [centresResult, unitsResult, programmesResult, templatesResult, occurrencesResult] = await Promise.all([
        globalConfigurationService.getCentres(accessToken),
        globalConfigurationService.getUnits(accessToken),
        globalConfigurationService.getProgrammeDefinitions(accessToken),
        globalConfigurationService.getScheduleTemplates(accessToken),
        globalConfigurationService.getScheduleOccurrences(accessToken),
      ]);
      setCentres(centresResult.filter((centre) => centre.isActive));
      setUnits(unitsResult);
      setProgrammes(programmesResult);
      setTemplates(templatesResult);
      setOccurrences(occurrencesResult);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const unitsByCentre = useMemo(() => {
    return units.reduce<Record<string, UnitConfigurationDto[]>>((lookup, unit) => {
      const key = unit.centreId;
      lookup[key] = [...(lookup[key] ?? []), unit];
      return lookup;
    }, {});
  }, [units]);

  const programmesByCentre = useMemo(() => {
    return programmes.reduce<Record<string, ProgrammeDefinitionDto[]>>((lookup, programme) => {
      const key = programme.centreId;
      lookup[key] = [...(lookup[key] ?? []), programme];
      return lookup;
    }, {});
  }, [programmes]);

  const centreUnitsForTemplate = unitsByCentre[templateForm.centreId] ?? [];
  const centreProgrammesForTemplate = programmesByCentre[templateForm.centreId] ?? [];
  const centreUnitsForOccurrence = unitsByCentre[occurrenceForm.centreId] ?? [];
  const centreProgrammesForOccurrence = programmesByCentre[occurrenceForm.centreId] ?? [];
  const centreTemplatesForOccurrence = templates.filter((template) => template.centreId === occurrenceForm.centreId && template.isActive);

  const resetProgrammeForm = () => {
    setEditingProgrammeId(null);
    setProgrammeForm(emptyProgrammeForm);
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
  };

  const resetOccurrenceForm = () => {
    setEditingOccurrenceId(null);
    setOccurrenceForm({ ...emptyOccurrenceForm, scheduledDate: todayIso });
  };

  const startEditProgramme = (programme: ProgrammeDefinitionDto) => {
    setEditingProgrammeId(programme.programmeDefinitionId);
    setProgrammeForm({
      centreId: programme.centreId,
      code: programme.code,
      name: programme.name,
      description: programme.description,
      totalDurationValue: programme.totalDurationValue,
      totalDurationUnit: programme.totalDurationUnit,
      detoxPhaseDurationValue: programme.detoxPhaseDurationValue ?? null,
      detoxPhaseDurationUnit: programme.detoxPhaseDurationUnit || "Weeks",
      mainPhaseDurationValue: programme.mainPhaseDurationValue ?? null,
      mainPhaseDurationUnit: programme.mainPhaseDurationUnit || "Weeks",
      isActive: programme.isActive,
    });
  };

  const startEditTemplate = (template: ScheduleTemplateDto) => {
    setEditingTemplateId(template.scheduleTemplateId);
    setTemplateForm({
      centreId: template.centreId,
      unitId: template.unitId ?? "",
      programmeDefinitionId: template.programmeDefinitionId ?? "",
      code: template.code,
      name: template.name,
      description: template.description,
      category: template.category,
      recurrenceType: template.recurrenceType,
      weeklyDayOfWeek: template.weeklyDayOfWeek ?? null,
      startTime: template.startTime,
      endTime: template.endTime,
      audienceType: template.audienceType,
      facilitatorType: template.facilitatorType,
      facilitatorRole: template.facilitatorRole,
      externalResourceName: template.externalResourceName,
      isActive: template.isActive,
    });
  };

  const startEditOccurrence = (occurrence: ScheduleOccurrenceDto) => {
    setEditingOccurrenceId(occurrence.scheduleOccurrenceId);
    setOccurrenceForm({
      centreId: occurrence.centreId,
      unitId: occurrence.unitId ?? "",
      programmeDefinitionId: occurrence.programmeDefinitionId ?? "",
      templateId: occurrence.templateId ?? "",
      title: occurrence.title,
      description: occurrence.description,
      category: occurrence.category,
      scheduledDate: occurrence.scheduledDate,
      startTime: occurrence.startTime,
      endTime: occurrence.endTime,
      audienceType: occurrence.audienceType,
      facilitatorType: occurrence.facilitatorType,
      facilitatorRole: occurrence.facilitatorRole,
      externalResourceName: occurrence.externalResourceName,
      status: occurrence.status,
      notes: occurrence.notes,
    });
  };

  const submitProgramme = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload = {
        ...programmeForm,
        detoxPhaseDurationUnit: programmeForm.detoxPhaseDurationValue ? programmeForm.detoxPhaseDurationUnit : "",
        mainPhaseDurationUnit: programmeForm.mainPhaseDurationValue ? programmeForm.mainPhaseDurationUnit : "",
      };
      if (editingProgrammeId) {
        await globalConfigurationService.updateProgrammeDefinition(accessToken, editingProgrammeId, payload);
      } else {
        await globalConfigurationService.createProgrammeDefinition(accessToken, payload);
      }
      resetProgrammeForm();
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload = {
        ...templateForm,
        unitId: templateForm.unitId || null,
        programmeDefinitionId: templateForm.programmeDefinitionId || null,
        weeklyDayOfWeek: templateForm.recurrenceType === "Weekly" ? templateForm.weeklyDayOfWeek ?? null : null,
      };
      if (editingTemplateId) {
        await globalConfigurationService.updateScheduleTemplate(accessToken, editingTemplateId, payload);
      } else {
        await globalConfigurationService.createScheduleTemplate(accessToken, payload);
      }
      resetTemplateForm();
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitOccurrence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload = {
        ...occurrenceForm,
        unitId: occurrenceForm.unitId || null,
        programmeDefinitionId: occurrenceForm.programmeDefinitionId || null,
        templateId: occurrenceForm.templateId || null,
      };
      if (editingOccurrenceId) {
        await globalConfigurationService.updateScheduleOccurrence(accessToken, editingOccurrenceId, payload);
      } else {
        await globalConfigurationService.createScheduleOccurrence(accessToken, payload);
      }
      resetOccurrenceForm();
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveUnitProgramme = async (unit: UnitConfigurationDto, programmeDefinitionId: string | null) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload: UpsertUnitRequest = {
        centreId: unit.centreId,
        unitCode: unit.unitCode,
        displayName: unit.displayName,
        description: unit.description,
        unitCapacity: unit.unitCapacity,
        currentOccupancy: unit.currentOccupancy,
        capacityWarningThreshold: unit.capacityWarningThreshold,
        defaultResidentWeekNumber: unit.defaultResidentWeekNumber,
        programmeDefinitionId,
        displayOrder: unit.displayOrder,
        isActive: unit.isActive,
      };
      await globalConfigurationService.updateUnit(accessToken, unit.unitId, payload);
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveProgramme = async (programmeDefinitionId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveProgrammeDefinition(accessToken, programmeDefinitionId);
      if (editingProgrammeId === programmeDefinitionId) {
        resetProgrammeForm();
      }
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveTemplate = async (scheduleTemplateId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveScheduleTemplate(accessToken, scheduleTemplateId);
      if (editingTemplateId === scheduleTemplateId) {
        resetTemplateForm();
      }
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveOccurrence = async (scheduleOccurrenceId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveScheduleOccurrence(accessToken, scheduleOccurrenceId);
      if (editingOccurrenceId === scheduleOccurrenceId) {
        resetOccurrenceForm();
      }
      await loadConfiguration();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminGuard
      title={text("config.programs.title", "Program Manager")}
      description={text("config.programs.description", "Manage programme definitions, unit assignments, recurring schedule templates, and one-off occurrences.")}
    >
      <div className="app-page-shell">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.programs.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7 text-[var(--app-primary)]" />
              <div>
                <h1 className="text-2xl font-semibold text-[var(--app-text)]">{text("config.programs.title", "Program Manager")}</h1>
                <p className="text-[var(--app-text-muted)]">
                  {text("config.programs.description", "Manage programme definitions, unit assignments, recurring schedule templates, and one-off occurrences.")}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-[var(--app-danger)]/30 bg-[var(--app-danger)]/10 px-4 py-3 text-sm text-[var(--app-danger)]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="app-card rounded-2xl p-6 text-sm text-[var(--app-text-muted)]">Loading programme configuration...</div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="app-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--app-text)]">Programme Definitions</h2>
                      <p className="text-sm text-[var(--app-text-muted)]">Define duration models per centre and reuse them across units.</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetProgrammeForm}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      New programme
                    </button>
                  </div>

                  <div className="space-y-3">
                    {programmes.map((programme) => (
                      <div key={programme.programmeDefinitionId} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-[var(--app-text)]">{programme.name}</h3>
                              <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                                {programme.code}
                              </span>
                              {!programme.isActive && (
                                <span className="rounded-full bg-[var(--app-warning)]/10 px-2 py-1 text-xs font-semibold text-[var(--app-warning)]">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[var(--app-text-muted)]">{programme.description}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--app-text-muted)]">
                              <span>{programme.centreName}</span>
                              <span>{programme.totalDurationValue} {programme.totalDurationUnit}</span>
                              {programme.detoxPhaseDurationValue ? <span>Detox {programme.detoxPhaseDurationValue} {programme.detoxPhaseDurationUnit}</span> : null}
                              {programme.mainPhaseDurationValue ? <span>Main {programme.mainPhaseDurationValue} {programme.mainPhaseDurationUnit}</span> : null}
                            </div>
                            <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                              Assigned units: {programme.assignedUnitNames.length > 0 ? programme.assignedUnitNames.join(", ") : "None"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditProgramme(programme)}
                              className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            {programme.isActive && (
                              <button
                                type="button"
                                onClick={() => void archiveProgramme(programme.programmeDefinitionId)}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-danger)]/30 px-3 py-2 text-sm font-semibold text-[var(--app-danger)]"
                              >
                                <Trash2 className="h-4 w-4" />
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitProgramme} className="app-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--app-text)]">
                      {editingProgrammeId ? "Edit programme" : "Create programme"}
                    </h2>
                    {editingProgrammeId && (
                      <button type="button" onClick={resetProgrammeForm} className="text-sm font-semibold text-[var(--app-text-muted)]">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Centre</span>
                      <select value={programmeForm.centreId} onChange={(event) => setProgrammeForm((current) => ({ ...current, centreId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">Select centre</option>
                        {centres.map((centre) => <option key={centre.centreId} value={centre.centreId}>{centre.displayName}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Code</span>
                      <input value={programmeForm.code} onChange={(event) => setProgrammeForm((current) => ({ ...current, code: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)] sm:col-span-2">
                      <span>Name</span>
                      <input value={programmeForm.name} onChange={(event) => setProgrammeForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                  </div>
                  <label className="block space-y-1 text-sm text-[var(--app-text)]">
                    <span>Description</span>
                    <textarea value={programmeForm.description} onChange={(event) => setProgrammeForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Total duration</span>
                      <input type="number" min={1} value={programmeForm.totalDurationValue} onChange={(event) => setProgrammeForm((current) => ({ ...current, totalDurationValue: Number(event.target.value) }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Duration unit</span>
                      <select value={programmeForm.totalDurationUnit} onChange={(event) => setProgrammeForm((current) => ({ ...current, totalDurationUnit: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {durationUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Detox phase</span>
                      <input type="number" min={0} value={programmeForm.detoxPhaseDurationValue ?? 0} onChange={(event) => setProgrammeForm((current) => ({ ...current, detoxPhaseDurationValue: Number(event.target.value) || null }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Detox unit</span>
                      <select value={programmeForm.detoxPhaseDurationUnit} onChange={(event) => setProgrammeForm((current) => ({ ...current, detoxPhaseDurationUnit: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {durationUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Main phase</span>
                      <input type="number" min={0} value={programmeForm.mainPhaseDurationValue ?? 0} onChange={(event) => setProgrammeForm((current) => ({ ...current, mainPhaseDurationValue: Number(event.target.value) || null }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Main unit</span>
                      <select value={programmeForm.mainPhaseDurationUnit} onChange={(event) => setProgrammeForm((current) => ({ ...current, mainPhaseDurationUnit: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {durationUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                    <input type="checkbox" checked={programmeForm.isActive} onChange={(event) => setProgrammeForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    Active
                  </label>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {editingProgrammeId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingProgrammeId ? "Save programme" : "Create programme"}
                  </button>
                </form>
              </section>

              <section className="app-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--app-text)]">Unit Programme Assignment</h2>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">Assign an optional programme definition to each active unit.</p>
                <div className="mt-4 grid gap-3">
                  {units.filter((unit) => unit.isActive).map((unit) => {
                    const availableProgrammes = programmesByCentre[unit.centreId] ?? [];
                    return (
                      <div key={unit.unitId} className="grid gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 md:grid-cols-[1fr_260px_auto] md:items-center">
                        <div>
                          <p className="font-semibold text-[var(--app-text)]">{unit.displayName}</p>
                          <p className="text-sm text-[var(--app-text-muted)]">{unit.centreName}</p>
                        </div>
                        <select
                          value={unit.programmeDefinitionId ?? ""}
                          onChange={(event) => void saveUnitProgramme(unit, event.target.value || null)}
                          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                        >
                          <option value="">No programme assigned</option>
                          {availableProgrammes.map((programme) => (
                            <option key={programme.programmeDefinitionId} value={programme.programmeDefinitionId}>
                              {programme.name}
                            </option>
                          ))}
                        </select>
                        <span className="text-sm text-[var(--app-text-muted)]">{unit.programmeDefinitionName || "Unassigned"}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="app-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--app-text)]">Schedule Templates</h2>
                      <p className="text-sm text-[var(--app-text-muted)]">Define recurring daily, weekly, or named reusable schedule items.</p>
                    </div>
                    <button type="button" onClick={resetTemplateForm} className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white">
                      <Plus className="h-4 w-4" />
                      New template
                    </button>
                  </div>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div key={template.scheduleTemplateId} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--app-text)]">{template.name}</h3>
                              <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">{template.recurrenceType}</span>
                              {!template.isActive && <span className="rounded-full bg-[var(--app-warning)]/10 px-2 py-1 text-xs font-semibold text-[var(--app-warning)]">Inactive</span>}
                            </div>
                            <p className="mt-1 text-sm text-[var(--app-text-muted)]">{template.unitName || template.centreName}</p>
                            <p className="text-xs text-[var(--app-text-muted)]">
                              {template.code} {template.startTime ? `• ${template.startTime}` : ""} {template.endTime ? `- ${template.endTime}` : ""}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditTemplate(template)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            {template.isActive && (
                              <button type="button" onClick={() => void archiveTemplate(template.scheduleTemplateId)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-danger)]/30 px-3 py-2 text-sm font-semibold text-[var(--app-danger)]">
                                <Trash2 className="h-4 w-4" />
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitTemplate} className="app-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--app-text)]">{editingTemplateId ? "Edit template" : "Create template"}</h2>
                    {editingTemplateId && <button type="button" onClick={resetTemplateForm} className="text-sm font-semibold text-[var(--app-text-muted)]">Clear</button>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Centre</span>
                      <select value={templateForm.centreId} onChange={(event) => setTemplateForm((current) => ({ ...current, centreId: event.target.value, unitId: "", programmeDefinitionId: "" }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">Select centre</option>
                        {centres.map((centre) => <option key={centre.centreId} value={centre.centreId}>{centre.displayName}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Unit</span>
                      <select value={templateForm.unitId ?? ""} onChange={(event) => setTemplateForm((current) => ({ ...current, unitId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">Centre-wide / optional</option>
                        {centreUnitsForTemplate.map((unit) => <option key={unit.unitId} value={unit.unitId}>{unit.displayName}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Programme</span>
                      <select value={templateForm.programmeDefinitionId ?? ""} onChange={(event) => setTemplateForm((current) => ({ ...current, programmeDefinitionId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">None</option>
                        {centreProgrammesForTemplate.map((programme) => <option key={programme.programmeDefinitionId} value={programme.programmeDefinitionId}>{programme.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Code</span>
                      <input value={templateForm.code} onChange={(event) => setTemplateForm((current) => ({ ...current, code: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)] sm:col-span-2">
                      <span>Name</span>
                      <input value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                  </div>
                  <label className="block space-y-1 text-sm text-[var(--app-text)]">
                    <span>Description</span>
                    <textarea value={templateForm.description} onChange={(event) => setTemplateForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Category</span>
                      <input value={templateForm.category} onChange={(event) => setTemplateForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Recurrence</span>
                      <select value={templateForm.recurrenceType} onChange={(event) => setTemplateForm((current) => ({ ...current, recurrenceType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {recurrenceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    {templateForm.recurrenceType === "Weekly" && (
                      <label className="space-y-1 text-sm text-[var(--app-text)]">
                        <span>Weekday</span>
                        <select value={templateForm.weeklyDayOfWeek ?? ""} onChange={(event) => setTemplateForm((current) => ({ ...current, weeklyDayOfWeek: Number(event.target.value) }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                          {weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                        </select>
                      </label>
                    )}
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Start time</span>
                      <input type="time" value={templateForm.startTime} onChange={(event) => setTemplateForm((current) => ({ ...current, startTime: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>End time</span>
                      <input type="time" value={templateForm.endTime} onChange={(event) => setTemplateForm((current) => ({ ...current, endTime: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Audience</span>
                      <select value={templateForm.audienceType} onChange={(event) => setTemplateForm((current) => ({ ...current, audienceType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {audienceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Facilitator type</span>
                      <select value={templateForm.facilitatorType} onChange={(event) => setTemplateForm((current) => ({ ...current, facilitatorType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {facilitatorTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Facilitator role</span>
                      <input value={templateForm.facilitatorRole} onChange={(event) => setTemplateForm((current) => ({ ...current, facilitatorRole: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>External resource</span>
                      <input value={templateForm.externalResourceName} onChange={(event) => setTemplateForm((current) => ({ ...current, externalResourceName: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                    <input type="checkbox" checked={templateForm.isActive} onChange={(event) => setTemplateForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    Active
                  </label>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {editingTemplateId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingTemplateId ? "Save template" : "Create template"}
                  </button>
                </form>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="app-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--app-text)]">Schedule Occurrences</h2>
                      <p className="text-sm text-[var(--app-text-muted)]">Manage one-off or date-specific items that belong on the timeline.</p>
                    </div>
                    <button type="button" onClick={resetOccurrenceForm} className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white">
                      <CalendarClock className="h-4 w-4" />
                      New occurrence
                    </button>
                  </div>
                  <div className="space-y-3">
                    {occurrences.slice(0, 24).map((occurrence) => (
                      <div key={occurrence.scheduleOccurrenceId} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--app-text)]">{occurrence.title}</h3>
                              <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">{occurrence.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-[var(--app-text-muted)]">{occurrence.scheduledDate} {occurrence.startTime ? `• ${occurrence.startTime}` : ""}</p>
                            <p className="text-xs text-[var(--app-text-muted)]">{occurrence.unitName || occurrence.centreName}{occurrence.templateName ? ` • ${occurrence.templateName}` : ""}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditOccurrence(occurrence)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            {occurrence.status !== "Cancelled" && (
                              <button type="button" onClick={() => void archiveOccurrence(occurrence.scheduleOccurrenceId)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-danger)]/30 px-3 py-2 text-sm font-semibold text-[var(--app-danger)]">
                                <Trash2 className="h-4 w-4" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitOccurrence} className="app-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--app-text)]">{editingOccurrenceId ? "Edit occurrence" : "Create occurrence"}</h2>
                    {editingOccurrenceId && <button type="button" onClick={resetOccurrenceForm} className="text-sm font-semibold text-[var(--app-text-muted)]">Clear</button>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Centre</span>
                      <select value={occurrenceForm.centreId} onChange={(event) => setOccurrenceForm((current) => ({ ...current, centreId: event.target.value, unitId: "", programmeDefinitionId: "", templateId: "" }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">Select centre</option>
                        {centres.map((centre) => <option key={centre.centreId} value={centre.centreId}>{centre.displayName}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Unit</span>
                      <select value={occurrenceForm.unitId ?? ""} onChange={(event) => setOccurrenceForm((current) => ({ ...current, unitId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">None</option>
                        {centreUnitsForOccurrence.map((unit) => <option key={unit.unitId} value={unit.unitId}>{unit.displayName}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Programme</span>
                      <select value={occurrenceForm.programmeDefinitionId ?? ""} onChange={(event) => setOccurrenceForm((current) => ({ ...current, programmeDefinitionId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">None</option>
                        {centreProgrammesForOccurrence.map((programme) => <option key={programme.programmeDefinitionId} value={programme.programmeDefinitionId}>{programme.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Template</span>
                      <select value={occurrenceForm.templateId ?? ""} onChange={(event) => setOccurrenceForm((current) => ({ ...current, templateId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="">None</option>
                        {centreTemplatesForOccurrence.map((template) => <option key={template.scheduleTemplateId} value={template.scheduleTemplateId}>{template.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)] sm:col-span-2">
                      <span>Title</span>
                      <input value={occurrenceForm.title} onChange={(event) => setOccurrenceForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                  </div>
                  <label className="block space-y-1 text-sm text-[var(--app-text)]">
                    <span>Description</span>
                    <textarea value={occurrenceForm.description} onChange={(event) => setOccurrenceForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Category</span>
                      <input value={occurrenceForm.category} onChange={(event) => setOccurrenceForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Status</span>
                      <select value={occurrenceForm.status} onChange={(event) => setOccurrenceForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {occurrenceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Date</span>
                      <input type="date" value={occurrenceForm.scheduledDate} onChange={(event) => setOccurrenceForm((current) => ({ ...current, scheduledDate: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Audience</span>
                      <select value={occurrenceForm.audienceType} onChange={(event) => setOccurrenceForm((current) => ({ ...current, audienceType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {audienceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Start time</span>
                      <input type="time" value={occurrenceForm.startTime} onChange={(event) => setOccurrenceForm((current) => ({ ...current, startTime: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>End time</span>
                      <input type="time" value={occurrenceForm.endTime} onChange={(event) => setOccurrenceForm((current) => ({ ...current, endTime: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Facilitator type</span>
                      <select value={occurrenceForm.facilitatorType} onChange={(event) => setOccurrenceForm((current) => ({ ...current, facilitatorType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        {facilitatorTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Facilitator role</span>
                      <input value={occurrenceForm.facilitatorRole} onChange={(event) => setOccurrenceForm((current) => ({ ...current, facilitatorRole: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>External resource</span>
                      <input value={occurrenceForm.externalResourceName} onChange={(event) => setOccurrenceForm((current) => ({ ...current, externalResourceName: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                    </label>
                  </div>
                  <label className="block space-y-1 text-sm text-[var(--app-text)]">
                    <span>Notes</span>
                    <textarea value={occurrenceForm.notes} onChange={(event) => setOccurrenceForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
                  </label>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {editingOccurrenceId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingOccurrenceId ? "Save occurrence" : "Create occurrence"}
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </SuperAdminGuard>
  );
};

export default ProgramManager;
