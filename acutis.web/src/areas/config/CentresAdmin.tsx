"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Building2, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import {
  globalConfigurationService,
  type CentreConfigurationDto,
  type UpsertCentreRequest,
} from "@/services/globalConfigurationService";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

const emptyForm: UpsertCentreRequest = {
  centreCode: "",
  displayName: "",
  description: "",
  displayOrder: 0,
  isActive: true,
};

export default function CentresAdmin() {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [centres, setCentres] = useState<CentreConfigurationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCentreId, setEditingCentreId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertCentreRequest>(emptyForm);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const loadCentres = useCallback(async () => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setLoading(true);
    try {
      setError(null);
      setCentres(await globalConfigurationService.getCentres(accessToken));
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadCentres();
  }, [loadCentres]);

  useEffect(() => {
    void loadKeys([
      "config.centres.title",
      "config.centres.description",
      "config.centres.back",
      "config.centres.list.title",
      "config.centres.form.create_title",
      "config.centres.form.edit_title",
      "config.centres.list.create",
      "config.centres.list.loading",
      "config.centres.list.no_description",
      "config.centres.list.unit_count",
      "config.centres.list.edit",
      "config.centres.list.delete",
      "config.centres.form.clear",
      "config.centres.form.code",
      "config.centres.form.code_placeholder",
      "config.centres.form.display_name",
      "config.centres.form.display_name_placeholder",
      "config.centres.form.description_label",
      "config.centres.form.description_placeholder",
      "config.centres.form.display_order",
      "config.centres.form.active",
      "config.centres.form.create_button",
      "config.centres.form.save_button",
    ]);
  }, [loadKeys]);

  const resetForm = () => {
    setEditingCentreId(null);
    setForm(emptyForm);
  };

  const startEdit = (centre: CentreConfigurationDto) => {
    setEditingCentreId(centre.centreId);
    setForm({
      centreCode: centre.centreCode,
      displayName: centre.displayName,
      description: centre.description,
      displayOrder: centre.displayOrder,
      isActive: centre.isActive,
    });
  };

  const submitCentre = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      if (editingCentreId) {
        await globalConfigurationService.updateCentre(accessToken, editingCentreId, form);
      } else {
        await globalConfigurationService.createCentre(accessToken, form);
      }

      resetForm();
      await loadCentres();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCentre = async (centreId: string) => {
    if (!accessToken && !isAuthorizationDisabled) {
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await globalConfigurationService.archiveCentre(accessToken, centreId);
      if (editingCentreId === centreId) {
        resetForm();
      }
      await loadCentres();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminGuard
      title={text("config.centres.title", "Centre Administration")}
      description={text("config.centres.description", "Create centres first, then place units and user access inside them.")}
    >
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.centres.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-gray-700" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{text("config.centres.title", "Centre Administration")}</h1>
                <p className="text-gray-600">{text("config.centres.description", "Create centres first, then place units and user access inside them.")}</p>
              </div>
            </div>
          </div>

          {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{text("config.centres.list.title", "Existing centres")}</h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  {text("config.centres.list.create", "Create centre")}
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-gray-600">{text("config.centres.list.loading", "Loading centres...")}</p>
              ) : (
                <div className="space-y-3">
                  {centres.map((centre) => (
                    <div
                      key={centre.centreId}
                      className={`rounded-xl border p-4 transition ${
                        editingCentreId === centre.centreId ? "border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200" : "border-gray-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">{centre.displayName}</h3>
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{centre.centreCode}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{centre.description || text("config.centres.list.no_description", "No description.")}</p>
                          <p className="mt-3 text-sm text-gray-500">{centre.unitCount} {text("config.centres.list.unit_count", "active units")}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(centre)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <PencilLine className="h-4 w-4" />
                            {text("config.centres.list.edit", "Edit")}
                          </button>
                          {centre.isActive && (
                            <button
                              type="button"
                              onClick={() => void deleteCentre(centre.centreId)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {text("config.centres.list.delete", "Delete centre")}
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={submitCentre} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCentreId ? text("config.centres.form.edit_title", "Edit centre") : text("config.centres.form.create_title", "Create centre")}
                </h2>
                {editingCentreId && (
                  <button type="button" onClick={resetForm} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                    {text("config.centres.form.clear", "Clear")}
                  </button>
                )}
              </div>

              <label className="block space-y-1 text-sm text-gray-700">
                <span>{text("config.centres.form.code", "Centre code")}</span>
                <input value={form.centreCode} onChange={(event) => setForm((current) => ({ ...current, centreCode: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder={text("config.centres.form.code_placeholder", "centre_code")} />
              </label>
              <label className="block space-y-1 text-sm text-gray-700">
                <span>{text("config.centres.form.display_name", "Display name")}</span>
                <input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder={text("config.centres.form.display_name_placeholder", "Centre display name")} />
              </label>
              <label className="block space-y-1 text-sm text-gray-700">
                <span>{text("config.centres.form.description_label", "Description")}</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" rows={3} placeholder={text("config.centres.form.description_placeholder", "What this centre covers")} />
              </label>
              <label className="block space-y-1 text-sm text-gray-700">
                <span>{text("config.centres.form.display_order", "Display order")}</span>
                <input type="number" min={0} value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </label>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                  {text("config.centres.form.active", "Active centre")}
                </label>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-blue-300 sm:self-auto">
                  <Save className="h-4 w-4" />
                  {editingCentreId ? text("config.centres.form.save_button", "Save centre") : text("config.centres.form.create_button", "Create centre")}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
