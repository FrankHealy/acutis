"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Building2, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import {
  globalConfigurationService,
  type CentreConfigurationDto,
  type UnitConfigurationDto,
  type UpsertUnitRequest,
} from "@/services/globalConfigurationService";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

const emptyForm: UpsertUnitRequest = {
  centreId: "",
  unitCode: "",
  displayName: "",
  description: "",
  unitCapacity: 0,
  currentOccupancy: 0,
  capacityWarningThreshold: 0,
  displayOrder: 0,
  isActive: true,
};

export default function UnitsAdmin() {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [centres, setCentres] = useState<CentreConfigurationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertUnitRequest>(emptyForm);

  const loadUnits = useCallback(async () => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const [centresResult, unitsResult] = await Promise.all([
        globalConfigurationService.getCentres(accessToken),
        globalConfigurationService.getUnits(accessToken),
      ]);
      setCentres(centresResult.filter((centre) => centre.isActive));
      setUnits(unitsResult);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    void loadKeys([
      "config.units.title",
      "config.units.description",
      "config.units.back",
      "config.units.form.create_title",
      "config.units.form.edit_title",
      "config.units.form.clear",
      "config.units.form.unit_code",
      "config.units.form.unit_code_placeholder",
      "config.units.form.display_name",
      "config.units.form.display_name_placeholder",
      "config.units.form.description_label",
      "config.units.form.description_placeholder",
      "config.units.form.capacity",
      "config.units.form.capacity_placeholder",
      "config.units.form.current_occupancy",
      "config.units.form.current_occupancy_placeholder",
      "config.units.form.warning_threshold",
      "config.units.form.warning_threshold_placeholder",
      "config.units.form.display_order",
      "config.units.form.display_order_placeholder",
      "config.units.form.centre",
      "config.units.form.select_centre",
      "config.units.form.active_unit",
      "config.units.form.create_button",
      "config.units.form.save_button",
      "config.units.list.title",
      "config.units.list.total_suffix",
      "config.units.list.loading",
      "config.units.list.archived",
      "config.units.list.no_description",
      "config.units.list.edit",
      "config.units.list.delete",
      "config.units.list.editing",
      "config.units.list.create",
      "config.units.list.empty",
      "config.units.metrics.capacity",
      "config.units.metrics.occupancy",
      "config.units.metrics.free_beds",
      "config.units.metrics.display_order",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const resetForm = () => {
    setEditingUnitId(null);
    setForm(emptyForm);
  };

  const startEdit = (unit: UnitConfigurationDto) => {
    setEditingUnitId(unit.unitId);
      setForm({
      centreId: unit.centreId,
      unitCode: unit.unitCode,
      displayName: unit.displayName,
      description: unit.description,
      unitCapacity: unit.unitCapacity,
      currentOccupancy: unit.currentOccupancy,
      capacityWarningThreshold: unit.capacityWarningThreshold,
      displayOrder: unit.displayOrder,
      isActive: unit.isActive,
    });
  };

  const submitUnit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      if (editingUnitId) {
        await globalConfigurationService.updateUnit(accessToken, editingUnitId, form);
      } else {
        await globalConfigurationService.createUnit(accessToken, form);
      }
      resetForm();
      await loadUnits();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUnit = async (unitId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveUnit(accessToken, unitId);
      if (editingUnitId === unitId) {
        resetForm();
      }
      await loadUnits();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminGuard
      title={text("config.units.title", "Unit Administration")}
      description={text("config.units.description", "Global unit administration. Create units once and manage their shared details here.")}
    >
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.units.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-gray-700" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{text("config.units.title", "Unit Administration")}</h1>
                <p className="text-gray-600">{text("config.units.description", "Create, edit, and archive units at the global level.")}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1.05fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{text("config.units.list.title", "Existing units")}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{units.length} {text("config.units.list.total_suffix", "total")}</span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    {text("config.units.list.create", "Create unit")}
                  </button>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-gray-600">{text("config.units.list.loading", "Loading units...")}</p>
              ) : (
                <div className="space-y-3">
                  {units.map((unit) => (
                    <div
                      key={unit.unitId}
                      className={`rounded-xl border p-4 transition ${
                        editingUnitId === unit.unitId
                          ? "border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">{unit.displayName}</h3>
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                              {unit.unitCode}
                            </span>
                            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                              {unit.centreName}
                            </span>
                            {!unit.isActive && (
                              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                {text("config.units.list.archived", "Archived")}
                              </span>
                            )}
                            {editingUnitId === unit.unitId && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                {text("config.units.list.editing", "Editing")}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{unit.description || text("config.units.list.no_description", "No description.")}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(unit)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <PencilLine className="h-4 w-4" />
                            {text("config.units.list.edit", "Edit")}
                          </button>
                          {unit.isActive && (
                            <button
                              type="button"
                              onClick={() => void deleteUnit(unit.unitId)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {text("config.units.list.delete", "Delete unit")}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">{text("config.units.metrics.capacity", "Capacity")}</p>
                          <p className="font-semibold text-gray-900">{unit.unitCapacity}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">{text("config.units.metrics.occupancy", "Occupancy")}</p>
                          <p className="font-semibold text-gray-900">{unit.currentOccupancy}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">{text("config.units.metrics.free_beds", "Free beds")}</p>
                          <p className="font-semibold text-gray-900">{unit.freeBeds}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">{text("config.units.metrics.display_order", "Display order")}</p>
                          <p className="font-semibold text-gray-900">{unit.displayOrder}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {units.length === 0 && <p className="text-sm text-gray-600">{text("config.units.list.empty", "No units configured yet.")}</p>}
                </div>
              )}
            </div>

            <form onSubmit={submitUnit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingUnitId ? text("config.units.form.edit_title", "Edit unit") : text("config.units.form.create_title", "Create unit")}
                </h2>
                {editingUnitId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    {text("config.units.form.clear", "Clear")}
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.centre", "Centre")}</span>
                  <select
                    value={form.centreId}
                    onChange={(event) => setForm((current) => ({ ...current, centreId: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="">{text("config.units.form.select_centre", "Select centre")}</option>
                    {centres.map((centre) => (
                      <option key={centre.centreId} value={centre.centreId}>
                        {centre.displayName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.unit_code", "Unit code")}</span>
                  <input
                    value={form.unitCode}
                    onChange={(event) => setForm((current) => ({ ...current, unitCode: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.unit_code_placeholder", "New unit code")}
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.display_name", "Display name")}</span>
                  <input
                    value={form.displayName}
                    onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.display_name_placeholder", "New unit display name")}
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm text-gray-700 block">
                <span>{text("config.units.form.description_label", "Description")}</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  rows={3}
                  placeholder={text("config.units.form.description_placeholder", "New unit description")}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.capacity", "Capacity")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.unitCapacity}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, unitCapacity: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.capacity_placeholder", "New unit capacity")}
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.current_occupancy", "Current occupancy")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.currentOccupancy}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, currentOccupancy: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.current_occupancy_placeholder", "Current occupancy")}
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.warning_threshold", "Warning threshold")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.capacityWarningThreshold}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, capacityWarningThreshold: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.warning_threshold_placeholder", "Warning threshold")}
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span>{text("config.units.form.display_order", "Display order")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder={text("config.units.form.display_order_placeholder", "Display order")}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  />
                  {text("config.units.form.active_unit", "Active unit")}
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:self-auto"
                >
                  {editingUnitId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingUnitId ? text("config.units.form.save_button", "Save unit") : text("config.units.form.create_button", "Create unit")}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
