"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CalendarDays,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import {
  globalConfigurationService,
  type CentreConfigurationDto,
  type OtRoleDefinitionConfigurationDto,
  type UnitConfigurationDto,
  type UpsertOtRoleDefinitionRequest,
} from "@/services/globalConfigurationService";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

const roleTypes = ["Internal", "External", "Mixed", "Split"] as const;

const emptyForm: UpsertOtRoleDefinitionRequest = {
  centreId: "",
  unitId: "",
  name: "",
  description: "",
  roleType: "Internal",
  capacity: 1,
  requiresTraining: false,
  isOneOff: false,
  scheduledDate: "",
  displayOrder: 0,
  isActive: true,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRoleTone(roleType: string) {
  switch (roleType.toLowerCase()) {
    case "internal":
      return "bg-sky-100 text-sky-700";
    case "external":
      return "bg-emerald-100 text-emerald-700";
    case "mixed":
      return "bg-amber-100 text-amber-700";
    case "split":
      return "bg-fuchsia-100 text-fuchsia-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OtRolesAdmin() {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [roles, setRoles] = useState<OtRoleDefinitionConfigurationDto[]>([]);
  const [centres, setCentres] = useState<CentreConfigurationDto[]>([]);
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertOtRoleDefinitionRequest>(emptyForm);

  useEffect(() => {
    void loadKeys([
      "config.ot_roles.title",
      "config.ot_roles.description",
      "config.ot_roles.back",
      "config.dashboard.ot_roles.title",
      "config.dashboard.ot_roles.description",
    ]);
  }, [loadKeys]);

  useEffect(() => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        setError(null);
        const [nextCentres, nextUnits, nextRoles] = await Promise.all([
          globalConfigurationService.getCentres(accessToken),
          globalConfigurationService.getUnits(accessToken),
          globalConfigurationService.getOtRoleDefinitions(accessToken, showInactive),
        ]);

        if (cancelled) {
          return;
        }

        setCentres(nextCentres.filter((centre) => centre.isActive));
        setUnits(nextUnits);
        setRoles(nextRoles);
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
  }, [accessToken, showInactive]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const activeUnitOptions = units
    .filter((unit) => unit.isActive && unit.centreId === form.centreId)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.displayName.localeCompare(right.displayName));

  const resetForm = () => {
    setEditingRoleId(null);
    setForm(emptyForm);
  };

  const loadAll = async () => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const [nextCentres, nextUnits, nextRoles] = await Promise.all([
        globalConfigurationService.getCentres(accessToken),
        globalConfigurationService.getUnits(accessToken),
        globalConfigurationService.getOtRoleDefinitions(accessToken, showInactive),
      ]);
      setCentres(nextCentres.filter((centre) => centre.isActive));
      setUnits(nextUnits);
      setRoles(nextRoles);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (role: OtRoleDefinitionConfigurationDto) => {
    setEditingRoleId(role.otRoleDefinitionId);
    setForm({
      centreId: role.centreId,
      unitId: role.unitId ?? "",
      name: role.name,
      description: role.description,
      roleType: role.roleType,
      capacity: role.capacity ?? null,
      requiresTraining: role.requiresTraining,
      isOneOff: role.isOneOff,
      scheduledDate: role.scheduledDate ?? "",
      displayOrder: role.displayOrder,
      isActive: role.isActive,
    });
  };

  const submitRole = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      const payload: UpsertOtRoleDefinitionRequest = {
        ...form,
        unitId: form.unitId || null,
        capacity: form.capacity === null || form.capacity === undefined || Number.isNaN(form.capacity)
          ? null
          : form.capacity,
        scheduledDate: form.isOneOff ? form.scheduledDate || null : null,
      };

      if (editingRoleId) {
        await globalConfigurationService.updateOtRoleDefinition(accessToken, editingRoleId, payload);
      } else {
        await globalConfigurationService.createOtRoleDefinition(accessToken, payload);
      }

      resetForm();
      await loadAll();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const archiveRole = async (roleId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveOtRoleDefinition(accessToken, roleId);
      if (editingRoleId === roleId) {
        resetForm();
      }
      await loadAll();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const totalUnitsWithRoles = new Set(roles.map((role) => role.unitId ?? `centre:${role.centreId}`)).size;
  const oneOffCount = roles.filter((role) => role.isOneOff && role.isActive).length;
  const standingCount = roles.filter((role) => !role.isOneOff && role.isActive).length;

  const groupedRoles = centres
    .map((centre) => {
      const centreUnits = units
        .filter((unit) => unit.centreId === centre.centreId)
        .sort((left, right) => left.displayOrder - right.displayOrder || left.displayName.localeCompare(right.displayName));
      const groupEntries = [
        ...centreUnits.map((unit) => ({
          key: unit.unitId,
          centreName: centre.displayName,
          title: unit.displayName,
          subtitle: `${unit.unitCode.toUpperCase()} · ${centre.displayName}`,
          roles: roles.filter((role) => role.centreId === centre.centreId && role.unitId === unit.unitId),
        })),
        {
          key: `centre:${centre.centreId}`,
          centreName: centre.displayName,
          title: "Shared across centre",
          subtitle: centre.displayName,
          roles: roles.filter((role) => role.centreId === centre.centreId && !role.unitId),
        },
      ];

      return groupEntries.filter((entry) => entry.roles.length > 0);
    })
    .flat();

  return (
    <SuperAdminGuard
      title={text("config.ot_roles.title", "OT Roles Configuration")}
      description={text("config.ot_roles.description", "Define standing and one-off OT roles per unit, then use them operationally in the allocation board.")}
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.14),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef5f7_100%)]">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <button
                onClick={() => router.push("/units/config")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800"
              >
                <ArrowLeft className="h-4 w-4" />
                {text("config.ot_roles.back", "Back to Configuration")}
              </button>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {text("config.ot_roles.title", "OT Roles Configuration")}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  {text("config.ot_roles.description", "Define standing and one-off OT roles per unit, then use them operationally in the allocation board.")}
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
              />
              Show archived roles
            </label>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-sky-100 p-2 text-sky-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Standing roles</p>
                  <p className="text-2xl font-semibold text-slate-900">{standingCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">One-off event roles</p>
                  <p className="text-2xl font-semibold text-slate-900">{oneOffCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Unit groups</p>
                  <p className="text-2xl font-semibold text-slate-900">{totalUnitsWithRoles}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Configured roles</h2>
                  <p className="text-sm text-slate-500">Grouped by unit, with one-off event roles separated from the standing OT catalogue.</p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  New OT role
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-slate-600">Loading OT role configuration...</p>
              ) : groupedRoles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No OT roles are configured yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedRoles.map((group) => {
                    const standingRolesForGroup = group.roles
                      .filter((role) => !role.isOneOff)
                      .sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name));
                    const oneOffRolesForGroup = group.roles
                      .filter((role) => role.isOneOff)
                      .sort((left, right) => {
                        const leftDate = left.scheduledDate ?? "";
                        const rightDate = right.scheduledDate ?? "";
                        return leftDate.localeCompare(rightDate) || left.displayOrder - right.displayOrder || left.name.localeCompare(right.name);
                      });

                    return (
                      <div key={group.key} className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">{group.title}</h3>
                            <p className="text-sm text-slate-500">{group.subtitle}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {group.roles.length} roles
                          </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-sky-700" />
                              <h4 className="text-sm font-semibold text-slate-900">Standing roles</h4>
                            </div>
                            <div className="space-y-3">
                              {standingRolesForGroup.length === 0 && (
                                <p className="text-sm text-slate-500">No standing roles configured.</p>
                              )}
                              {standingRolesForGroup.map((role) => (
                                <article
                                  key={role.otRoleDefinitionId}
                                  className={`rounded-2xl border p-4 transition ${
                                    editingRoleId === role.otRoleDefinitionId
                                      ? "border-sky-300 bg-sky-50 shadow-sm ring-1 ring-sky-200"
                                      : "border-slate-200 bg-slate-50"
                                  }`}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="text-sm font-semibold text-slate-900">{role.name}</h5>
                                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getRoleTone(role.roleType)}`}>
                                          {role.roleType}
                                        </span>
                                        {role.requiresTraining && (
                                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700">
                                            Training
                                          </span>
                                        )}
                                        {!role.isActive && (
                                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                            Archived
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-2 text-sm text-slate-600">{role.description || "No description."}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEdit(role)}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                      >
                                        <PencilLine className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      {role.isActive && (
                                        <button
                                          type="button"
                                          onClick={() => void archiveRole(role.otRoleDefinitionId)}
                                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Archive
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Capacity {role.capacity ?? "Unlimited"}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Active assignments {role.activeAssignmentCount}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Order {role.displayOrder}
                                    </span>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-700" />
                              <h4 className="text-sm font-semibold text-slate-900">One-off event roles</h4>
                            </div>
                            <div className="space-y-3">
                              {oneOffRolesForGroup.length === 0 && (
                                <p className="text-sm text-slate-500">No event-specific roles configured.</p>
                              )}
                              {oneOffRolesForGroup.map((role) => (
                                <article
                                  key={role.otRoleDefinitionId}
                                  className={`rounded-2xl border p-4 transition ${
                                    editingRoleId === role.otRoleDefinitionId
                                      ? "border-amber-300 bg-amber-50 shadow-sm ring-1 ring-amber-200"
                                      : "border-slate-200 bg-slate-50"
                                  }`}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="text-sm font-semibold text-slate-900">{role.name}</h5>
                                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getRoleTone(role.roleType)}`}>
                                          {role.roleType}
                                        </span>
                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                          {formatDate(role.scheduledDate)}
                                        </span>
                                        {!role.isActive && (
                                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                            Archived
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-2 text-sm text-slate-600">{role.description || "No description."}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEdit(role)}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                      >
                                        <PencilLine className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      {role.isActive && (
                                        <button
                                          type="button"
                                          onClick={() => void archiveRole(role.otRoleDefinitionId)}
                                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Archive
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Capacity {role.capacity ?? "Unlimited"}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Active assignments {role.activeAssignmentCount}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1">
                                      Order {role.displayOrder}
                                    </span>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editingRoleId ? "Edit OT role" : "Create OT role"}
                  </h2>
                  <p className="text-sm text-slate-300">
                    Standing roles stay available until archived. One-off roles are pinned to a date for special events or temporary demand.
                  </p>
                </div>
                {editingRoleId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              <form onSubmit={submitRole} className="space-y-5">
                <div className="grid gap-4">
                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Centre</span>
                    <select
                      value={form.centreId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          centreId: event.target.value,
                          unitId: "",
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    >
                      <option value="">Select centre</option>
                      {centres.map((centre) => (
                        <option key={centre.centreId} value={centre.centreId}>
                          {centre.displayName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Unit</span>
                    <select
                      value={form.unitId ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, unitId: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    >
                      <option value="">Shared across centre</option>
                      {activeUnitOptions.map((unit) => (
                        <option key={unit.unitId} value={unit.unitId}>
                          {unit.displayName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Role name</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      placeholder="Kitchen, Reception, Detox dining room..."
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      rows={4}
                      placeholder="What the role covers, who it is for, and any operational notes."
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-200">Role type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {roleTypes.map((roleType) => {
                      const selected = form.roleType === roleType;
                      return (
                        <button
                          key={roleType}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, roleType }))}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            selected
                              ? "border-sky-400 bg-sky-500/20 text-sky-100"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                          }`}
                        >
                          {roleType}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Capacity</span>
                    <input
                      type="number"
                      min={1}
                      value={form.capacity ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          capacity: event.target.value === "" ? null : Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      placeholder="Leave blank for unlimited"
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Display order</span>
                    <input
                      type="number"
                      min={0}
                      value={form.displayOrder}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.requiresTraining}
                        onChange={(event) => setForm((current) => ({ ...current, requiresTraining: event.target.checked }))}
                      />
                      Requires training or continuity
                    </label>
                    <label className="inline-flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.isOneOff}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            isOneOff: event.target.checked,
                            scheduledDate: event.target.checked ? current.scheduledDate : "",
                          }))
                        }
                      />
                      One-off event role
                    </label>
                    {form.isOneOff && (
                      <label className="space-y-1 text-sm text-slate-200">
                        <span>Scheduled date</span>
                        <input
                          type="date"
                          value={form.scheduledDate ?? ""}
                          onChange={(event) => setForm((current) => ({ ...current, scheduledDate: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                        />
                      </label>
                    )}
                    <label className="inline-flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                      />
                      Role is active
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  {editingRoleId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingRoleId ? "Save OT role" : "Create OT role"}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
