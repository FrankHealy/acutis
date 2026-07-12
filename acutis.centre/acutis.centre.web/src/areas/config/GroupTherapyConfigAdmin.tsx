"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, MessageSquareText, PencilLine, Plus, Save, Timer, Trash2 } from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import { ConfigEditorDialog } from "@/areas/config/ConfigActionDialogs";
import Toast from "@/units/shared/ui/Toast";
import { isAuthorizationDisabled } from "@/lib/authMode";
import {
  globalConfigurationService,
  type GroupTherapyConversationThemeConfigurationDto,
  type GroupTherapyFacilitationConfigConfigurationDto,
  type UpsertGroupTherapyConversationThemeRequest,
  type UpsertGroupTherapyFacilitationConfigRequest,
} from "@/services/globalConfigurationService";

const defaultProgramCode = "bruree_alcohol_gt";

const emptyThemeForm: UpsertGroupTherapyConversationThemeRequest = {
  unitCode: "",
  programCode: defaultProgramCode,
  code: "",
  label: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const emptyConfigForm: UpsertGroupTherapyFacilitationConfigRequest = {
  unitCode: "",
  programCode: defaultProgramCode,
  counsellorStyle: "",
  isTimingEnabled: true,
  sessionDurationMinutes: 60,
  residentDurationMinutes: null,
  residentTimeMultiplier: 1,
  sortOrder: 0,
  isActive: true,
};

function scopeLabel(unitCode: string, programCode: string) {
  const unit = unitCode.trim() ? unitCode.toUpperCase() : "All units";
  return `${unit} / ${programCode}`;
}

function toNullablePositiveNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return value > 0 ? value : null;
}

export default function GroupTherapyConfigAdmin() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [themes, setThemes] = useState<GroupTherapyConversationThemeConfigurationDto[]>([]);
  const [configs, setConfigs] = useState<GroupTherapyFacilitationConfigConfigurationDto[]>([]);
  const [themeForm, setThemeForm] = useState<UpsertGroupTherapyConversationThemeRequest>(emptyThemeForm);
  const [configForm, setConfigForm] = useState<UpsertGroupTherapyFacilitationConfigRequest>(emptyConfigForm);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const [configEditorOpen, setConfigEditorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canLoad = Boolean(accessToken) || isAuthorizationDisabled;

  const loadAll = async () => {
    if (!canLoad) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const [nextThemes, nextConfigs] = await Promise.all([
        globalConfigurationService.getGroupTherapyConversationThemes(accessToken, showInactive),
        globalConfigurationService.getGroupTherapyFacilitationConfigs(accessToken, showInactive),
      ]);
      setThemes(nextThemes);
      setConfigs(nextConfigs);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!canLoad) {
        return;
      }

      setLoading(true);
      try {
        setError(null);
        const [nextThemes, nextConfigs] = await Promise.all([
          globalConfigurationService.getGroupTherapyConversationThemes(accessToken, showInactive),
          globalConfigurationService.getGroupTherapyFacilitationConfigs(accessToken, showInactive),
        ]);

        if (!cancelled) {
          setThemes(nextThemes);
          setConfigs(nextConfigs);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((nextError as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [accessToken, canLoad, showInactive]);

  const activeThemeCount = themes.filter((theme) => theme.isActive).length;
  const activeConfigCount = configs.filter((config) => config.isActive).length;
  const scopedUnitCount = useMemo(() => {
    const unitCodes = new Set([
      ...themes.map((theme) => theme.unitCode).filter(Boolean),
      ...configs.map((config) => config.unitCode).filter(Boolean),
    ]);
    return unitCodes.size;
  }, [configs, themes]);

  const resetThemeForm = () => {
    setEditingThemeId(null);
    setThemeForm(emptyThemeForm);
    setEditorError(null);
    setThemeEditorOpen(false);
  };

  const resetConfigForm = () => {
    setEditingConfigId(null);
    setConfigForm(emptyConfigForm);
    setEditorError(null);
    setConfigEditorOpen(false);
  };

  const startCreateTheme = () => { setEditingThemeId(null); setThemeForm(emptyThemeForm); setEditorError(null); setThemeEditorOpen(true); };
  const startCreateConfig = () => { setEditingConfigId(null); setConfigForm(emptyConfigForm); setEditorError(null); setConfigEditorOpen(true); };

  const startEditTheme = (theme: GroupTherapyConversationThemeConfigurationDto) => {
    setEditingThemeId(theme.conversationThemeId);
    setThemeForm({
      unitCode: theme.unitCode,
      programCode: theme.programCode || defaultProgramCode,
      code: theme.code,
      label: theme.label,
      description: theme.description,
      sortOrder: theme.sortOrder,
      isActive: theme.isActive,
    });
    setEditorError(null);
    setThemeEditorOpen(true);
  };

  const startEditConfig = (config: GroupTherapyFacilitationConfigConfigurationDto) => {
    setEditingConfigId(config.facilitationConfigId);
    setConfigForm({
      unitCode: config.unitCode,
      programCode: config.programCode || defaultProgramCode,
      counsellorStyle: config.counsellorStyle,
      isTimingEnabled: config.isTimingEnabled,
      sessionDurationMinutes: config.sessionDurationMinutes ?? null,
      residentDurationMinutes: config.residentDurationMinutes ?? null,
      residentTimeMultiplier: config.residentTimeMultiplier,
      sortOrder: config.sortOrder,
      isActive: config.isActive,
    });
    setEditorError(null);
    setConfigEditorOpen(true);
  };

  const submitTheme = async (event: FormEvent) => {
    event.preventDefault();
    if (!canLoad) {
      return;
    }

    setSaving(true);
    try {
      setEditorError(null);
      const payload: UpsertGroupTherapyConversationThemeRequest = {
        ...themeForm,
        unitCode: themeForm.unitCode.trim(),
        programCode: themeForm.programCode.trim() || defaultProgramCode,
        code: themeForm.code.trim(),
        label: themeForm.label.trim(),
        description: themeForm.description.trim(),
      };

      if (editingThemeId) {
        await globalConfigurationService.updateGroupTherapyConversationTheme(accessToken, editingThemeId, payload);
      } else {
        await globalConfigurationService.createGroupTherapyConversationTheme(accessToken, payload);
      }

      resetThemeForm();
      await loadAll();
      setToast("Conversation theme saved.");
    } catch (nextError) {
      setEditorError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitConfig = async (event: FormEvent) => {
    event.preventDefault();
    if (!canLoad) {
      return;
    }

    setSaving(true);
    try {
      setEditorError(null);
      const payload: UpsertGroupTherapyFacilitationConfigRequest = {
        ...configForm,
        unitCode: configForm.unitCode.trim(),
        programCode: configForm.programCode.trim() || defaultProgramCode,
        counsellorStyle: configForm.counsellorStyle.trim(),
        sessionDurationMinutes: toNullablePositiveNumber(configForm.sessionDurationMinutes),
        residentDurationMinutes: toNullablePositiveNumber(configForm.residentDurationMinutes),
        residentTimeMultiplier: Number(configForm.residentTimeMultiplier) || 1,
      };

      if (editingConfigId) {
        await globalConfigurationService.updateGroupTherapyFacilitationConfig(accessToken, editingConfigId, payload);
      } else {
        await globalConfigurationService.createGroupTherapyFacilitationConfig(accessToken, payload);
      }

      resetConfigForm();
      await loadAll();
      setToast("Timing profile saved.");
    } catch (nextError) {
      setEditorError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveTheme = async (themeId: string) => {
    if (!window.confirm("Archive this conversation theme?")) return;
    if (!canLoad) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveGroupTherapyConversationTheme(accessToken, themeId);
      if (editingThemeId === themeId) {
        resetThemeForm();
      }
      await loadAll();
      setToast("Conversation theme archived.");
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveConfig = async (configId: string) => {
    if (!window.confirm("Archive this timing profile?")) return;
    if (!canLoad) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveGroupTherapyFacilitationConfig(accessToken, configId);
      if (editingConfigId === configId) {
        resetConfigForm();
      }
      await loadAll();
      setToast("Timing profile archived.");
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminGuard
      title="Group Therapy Configuration"
      description="Maintain the conversation theme library and counsellor style timing profiles used by group therapy."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <button
              onClick={() => router.push("/units/config")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Configuration
            </button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-text)]">Group Therapy Configuration</h1>
              <p className="mt-2 max-w-3xl text-sm text-[var(--app-text-muted)]">
                Configure conversation themes separately from timing profiles. Leave unit code blank for global defaults, or set it when a unit needs its own catalogue.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] shadow-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
            />
            Show archived
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="app-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-[var(--app-primary)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Active themes</p>
                <p className="text-2xl font-semibold text-[var(--app-text)]">{activeThemeCount}</p>
              </div>
            </div>
          </div>
          <div className="app-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-[var(--app-accent)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Timing profiles</p>
                <p className="text-2xl font-semibold text-[var(--app-text)]">{activeConfigCount}</p>
              </div>
            </div>
          </div>
          <div className="app-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-[var(--app-success)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Unit overrides</p>
                <p className="text-2xl font-semibold text-[var(--app-text)]">{scopedUnitCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="app-card rounded-xl p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--app-text)]">Conversation Themes</h2>
                <p className="text-sm text-[var(--app-text-muted)]">Labels available when recording what a resident spoke about.</p>
              </div>
              <button
                type="button"
                onClick={startCreateTheme}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[var(--app-text-muted)]">Loading conversation themes...</p>
            ) : themes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
                No conversation themes are configured.
              </div>
            ) : (
              <div className="space-y-3">
                {themes.map((theme) => (
                  <article
                    key={theme.conversationThemeId}
                    className={`rounded-lg border p-4 ${
                      editingThemeId === theme.conversationThemeId
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface-muted)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-[var(--app-text)]">{theme.label}</h3>
                          <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                            {theme.code}
                          </span>
                          {!theme.isActive && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">{scopeLabel(theme.unitCode, theme.programCode)}</p>
                        <p className="mt-2 text-sm text-[var(--app-text-muted)]">{theme.description || "No description."}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditTheme(theme)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--app-text)]"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {theme.isActive && (
                          <button
                            type="button"
                            onClick={() => void archiveTheme(theme.conversationThemeId)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="app-card rounded-xl p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--app-text)]">Facilitation Timing</h2>
                <p className="text-sm text-[var(--app-text-muted)]">Session length, optional resident overrides, and counsellor style multipliers.</p>
              </div>
              <button
                type="button"
                onClick={startCreateConfig}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[var(--app-text-muted)]">Loading timing profiles...</p>
            ) : configs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
                No timing profiles are configured.
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => (
                  <article
                    key={config.facilitationConfigId}
                    className={`rounded-lg border p-4 ${
                      editingConfigId === config.facilitationConfigId
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface-muted)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-[var(--app-text)]">{config.counsellorStyle}</h3>
                          <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                            {config.isTimingEnabled ? "Timed" : "Untimed"}
                          </span>
                          {!config.isActive && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">{scopeLabel(config.unitCode, config.programCode)}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                          <span className="rounded-full bg-white px-3 py-1">Session {config.sessionDurationMinutes ?? "auto"} min</span>
                          <span className="rounded-full bg-white px-3 py-1">Resident {config.residentDurationMinutes ?? "by group"} min</span>
                          <span className="rounded-full bg-white px-3 py-1">Multiplier {config.residentTimeMultiplier}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditConfig(config)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--app-text)]"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {config.isActive && (
                          <button
                            type="button"
                            onClick={() => void archiveConfig(config.facilitationConfigId)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <ConfigEditorDialog
          open={themeEditorOpen}
          onClose={resetThemeForm}
          closeLabel="Close"
          title={editingThemeId ? "Edit Theme" : "Create Theme"}
        >
            <form onSubmit={submitTheme} className="space-y-4">
              {editorError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {editorError}
                </div>
              )}
              {editingThemeId && (
                <div className="flex justify-end">
                  <button type="button" onClick={resetThemeForm} className="text-sm font-semibold text-[var(--app-primary)]">
                    Clear
                  </button>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Unit code</span>
                  <input
                    value={themeForm.unitCode}
                    onChange={(event) => setThemeForm((current) => ({ ...current, unitCode: event.target.value }))}
                    placeholder="Blank for all units"
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Program code</span>
                  <input
                    value={themeForm.programCode}
                    onChange={(event) => setThemeForm((current) => ({ ...current, programCode: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Code</span>
                  <input
                    value={themeForm.code}
                    onChange={(event) => setThemeForm((current) => ({ ...current, code: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Label</span>
                  <input
                    value={themeForm.label}
                    onChange={(event) => setThemeForm((current) => ({ ...current, label: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-[var(--app-text)]">
                <span>Description</span>
                <textarea
                  value={themeForm.description}
                  onChange={(event) => setThemeForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Sort order</span>
                  <input
                    type="number"
                    min={0}
                    value={themeForm.sortOrder}
                    onChange={(event) => setThemeForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 pt-7 text-sm text-[var(--app-text)]">
                  <input
                    type="checkbox"
                    checked={themeForm.isActive}
                    onChange={(event) => setThemeForm((current) => ({ ...current, isActive: event.target.checked }))}
                  />
                  Active
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editingThemeId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingThemeId ? "Save theme" : "Create theme"}
              </button>
            </form>
        </ConfigEditorDialog>

        <ConfigEditorDialog
          open={configEditorOpen}
          onClose={resetConfigForm}
          closeLabel="Close"
          title={editingConfigId ? "Edit Timing Profile" : "Create Timing Profile"}
        >
            <form onSubmit={submitConfig} className="space-y-4">
              {editorError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {editorError}
                </div>
              )}
              {editingConfigId && (
                <div className="flex justify-end">
                  <button type="button" onClick={resetConfigForm} className="text-sm font-semibold text-[var(--app-primary)]">
                    Clear
                  </button>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Unit code</span>
                  <input
                    value={configForm.unitCode}
                    onChange={(event) => setConfigForm((current) => ({ ...current, unitCode: event.target.value }))}
                    placeholder="Blank for all units"
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Program code</span>
                  <input
                    value={configForm.programCode}
                    onChange={(event) => setConfigForm((current) => ({ ...current, programCode: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-[var(--app-text)]">
                <span>Counsellor style</span>
                <input
                  value={configForm.counsellorStyle}
                  onChange={(event) => setConfigForm((current) => ({ ...current, counsellorStyle: event.target.value }))}
                  placeholder="Balanced, Deep Dive, Rapid Round..."
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Session minutes</span>
                  <input
                    type="number"
                    min={1}
                    value={configForm.sessionDurationMinutes ?? ""}
                    onChange={(event) =>
                      setConfigForm((current) => ({
                        ...current,
                        sessionDurationMinutes: event.target.value === "" ? null : Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Resident minutes</span>
                  <input
                    type="number"
                    min={1}
                    value={configForm.residentDurationMinutes ?? ""}
                    onChange={(event) =>
                      setConfigForm((current) => ({
                        ...current,
                        residentDurationMinutes: event.target.value === "" ? null : Number(event.target.value),
                      }))
                    }
                    placeholder="By group size"
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Multiplier</span>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={configForm.residentTimeMultiplier}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, residentTimeMultiplier: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--app-text)]">
                  <span>Sort order</span>
                  <input
                    type="number"
                    min={0}
                    value={configForm.sortOrder}
                    onChange={(event) => setConfigForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2"
                  />
                </label>
                <div className="space-y-3 pt-7">
                  <label className="flex items-center gap-2 text-sm text-[var(--app-text)]">
                    <input
                      type="checkbox"
                      checked={configForm.isTimingEnabled}
                      onChange={(event) => setConfigForm((current) => ({ ...current, isTimingEnabled: event.target.checked }))}
                    />
                    Timing enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--app-text)]">
                    <input
                      type="checkbox"
                      checked={configForm.isActive}
                      onChange={(event) => setConfigForm((current) => ({ ...current, isActive: event.target.checked }))}
                    />
                    Active
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editingConfigId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingConfigId ? "Save profile" : "Create profile"}
              </button>
            </form>
        </ConfigEditorDialog>
        <Toast open={Boolean(toast)} message={toast ?? ""} type="success" onClose={() => setToast(null)} />
      </div>
    </SuperAdminGuard>
  );
}
