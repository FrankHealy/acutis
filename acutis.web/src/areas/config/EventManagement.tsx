"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Camera, CalendarClock, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  globalConfigurationService,
  type CentreConfigurationDto,
  type ProgrammeDefinitionDto,
  type ScheduleTemplateDto,
  type UnitConfigurationDto,
  type UpsertScheduleTemplateRequest,
} from "@/services/globalConfigurationService";

const recurrenceTypes = ["Daily", "Weekly", "Monthly", "BiMonthly", "OnceOff"] as const;
const audienceTypes = ["UnitResidents", "AllResidents", "Cohort", "ResidentSubset", "Resident", "OpenSession"] as const;
const facilitatorTypes = ["None", "Staff", "ResidentLed", "External"] as const;
const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];
const todayIso = new Date().toISOString().slice(0, 10);

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
  monthlyDayOfMonth: null,
  recurrenceStartDate: todayIso,
  startTime: "09:00",
  endTime: "10:00",
  audienceType: "UnitResidents",
  residentSubsetType: "None",
  captureRequirement: "None",
  facilitatorType: "None",
  facilitatorRole: "",
  externalResourceName: "",
  isActive: true,
};

const resolveResidentSubsetType = (audienceType: string, residentSubsetType: string) =>
  audienceType === "ResidentSubset" ? residentSubsetType || "Gambling" : "None";

const formatCaptureRequirement = (value: string) =>
  value === "ImagePerResident" ? "Image per resident" : "None";

const EventManagement: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [centres, setCentres] = useState<CentreConfigurationDto[]>([]);
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeDefinitionDto[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<UpsertScheduleTemplateRequest>(emptyTemplateForm);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  useEffect(() => {
    void loadKeys([
      "config.events.title",
      "config.events.description",
      "config.events.back",
    ]);
  }, [loadKeys]);

  const loadConfiguration = useCallback(async () => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const [centresResult, unitsResult, programmesResult, templatesResult] = await Promise.all([
        globalConfigurationService.getCentres(accessToken),
        globalConfigurationService.getUnits(accessToken),
        globalConfigurationService.getProgrammeDefinitions(accessToken),
        globalConfigurationService.getScheduleTemplates(accessToken),
      ]);
      setCentres(centresResult.filter((centre) => centre.isActive));
      setUnits(unitsResult);
      setProgrammes(programmesResult);
      setTemplates(templatesResult);
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
      lookup[unit.centreId] = [...(lookup[unit.centreId] ?? []), unit];
      return lookup;
    }, {});
  }, [units]);

  const programmesByCentre = useMemo(() => {
    return programmes.reduce<Record<string, ProgrammeDefinitionDto[]>>((lookup, programme) => {
      lookup[programme.centreId] = [...(lookup[programme.centreId] ?? []), programme];
      return lookup;
    }, {});
  }, [programmes]);

  const centreUnits = unitsByCentre[templateForm.centreId] ?? [];
  const centreProgrammes = programmesByCentre[templateForm.centreId] ?? [];

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
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
      monthlyDayOfMonth: template.monthlyDayOfMonth ?? null,
      recurrenceStartDate: template.recurrenceStartDate ?? todayIso,
      startTime: template.startTime,
      endTime: template.endTime,
      audienceType: template.audienceType,
      residentSubsetType: template.residentSubsetType,
      captureRequirement: template.captureRequirement,
      facilitatorType: template.facilitatorType,
      facilitatorRole: template.facilitatorRole,
      externalResourceName: template.externalResourceName,
      isActive: template.isActive,
    });
  };

  const submitTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload: UpsertScheduleTemplateRequest = {
        ...templateForm,
        unitId: templateForm.unitId || null,
        programmeDefinitionId: templateForm.programmeDefinitionId || null,
        residentSubsetType: resolveResidentSubsetType(templateForm.audienceType, templateForm.residentSubsetType),
        weeklyDayOfWeek: templateForm.recurrenceType === "Weekly" ? templateForm.weeklyDayOfWeek ?? null : null,
        monthlyDayOfMonth:
          templateForm.recurrenceType === "Monthly" || templateForm.recurrenceType === "BiMonthly"
            ? templateForm.monthlyDayOfMonth ?? null
            : null,
        recurrenceStartDate:
          templateForm.recurrenceType === "Monthly" || templateForm.recurrenceType === "BiMonthly"
            ? templateForm.recurrenceStartDate || null
            : null,
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

  return (
    <SuperAdminGuard
      title={text("config.events.title", "Event Management")}
      description={text("config.events.description", "Configure reusable event definitions and scheduler attributes.")}
    >
      <div className="app-page-shell">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.events.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <CalendarClock className="h-7 w-7 text-[var(--app-primary)]" />
              <div>
                <h1 className="text-2xl font-semibold text-[var(--app-text)]">{text("config.events.title", "Event Management")}</h1>
                <p className="text-[var(--app-text-muted)]">
                  {text("config.events.description", "Configure reusable event definitions and scheduler attributes.")}
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
            <div className="app-card rounded-2xl p-6 text-sm text-[var(--app-text-muted)]">Loading event configuration...</div>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="app-card rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--app-text)]">Event Definitions</h2>
                    <p className="text-sm text-[var(--app-text-muted)]">Reusable events used by unit schedulers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetTemplateForm}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    New event
                  </button>
                </div>

                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.scheduleTemplateId} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[var(--app-text)]">{template.name}</h3>
                            <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                              {template.code}
                            </span>
                            {template.captureRequirement === "ImagePerResident" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary)]">
                                <Camera className="h-3 w-3" />
                                Camera
                              </span>
                            )}
                            {!template.isActive && (
                              <span className="rounded-full bg-[var(--app-warning)]/10 px-2 py-1 text-xs font-semibold text-[var(--app-warning)]">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{template.description || "No description."}</p>
                          <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                            {template.centreName}{template.unitName ? ` - ${template.unitName}` : ""} - {template.recurrenceType} - {template.startTime || "--:--"} to {template.endTime || "--:--"} - {template.audienceType} - {formatCaptureRequirement(template.captureRequirement)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditTemplate(template)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                          {template.isActive && (
                            <button
                              type="button"
                              onClick={() => void archiveTemplate(template.scheduleTemplateId)}
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

              <form onSubmit={submitTemplate} className="app-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--app-text)]">{editingTemplateId ? "Edit event" : "Create event"}</h2>
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
                      <option value="">All units</option>
                      {centreUnits.map((unit) => <option key={unit.unitId} value={unit.unitId}>{unit.displayName}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm text-[var(--app-text)]">
                    <span>Programme</span>
                    <select value={templateForm.programmeDefinitionId ?? ""} onChange={(event) => setTemplateForm((current) => ({ ...current, programmeDefinitionId: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                      <option value="">None</option>
                      {centreProgrammes.map((programme) => <option key={programme.programmeDefinitionId} value={programme.programmeDefinitionId}>{programme.name}</option>)}
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
                    <select value={templateForm.audienceType} onChange={(event) => setTemplateForm((current) => ({ ...current, audienceType: event.target.value, residentSubsetType: resolveResidentSubsetType(event.target.value, current.residentSubsetType) }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                      {audienceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </label>
                  {templateForm.audienceType === "ResidentSubset" && (
                    <label className="space-y-1 text-sm text-[var(--app-text)]">
                      <span>Resident subset</span>
                      <select value={templateForm.residentSubsetType} onChange={(event) => setTemplateForm((current) => ({ ...current, residentSubsetType: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                        <option value="Gambling">Gambling</option>
                        <option value="Substance">NA/Substance</option>
                      </select>
                    </label>
                  )}
                  <label className="space-y-1 text-sm text-[var(--app-text)]">
                    <span>Capture</span>
                    <select value={templateForm.captureRequirement} onChange={(event) => setTemplateForm((current) => ({ ...current, captureRequirement: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                      <option value="None">None</option>
                      <option value="ImagePerResident">Image per resident</option>
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
                  {editingTemplateId ? "Save event" : "Create event"}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </SuperAdminGuard>
  );
};

export default EventManagement;
