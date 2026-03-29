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
import { availableThemes } from "@/areas/shared/theme/ThemeProvider";
import { DEFAULT_THEME_KEY } from "@/areas/shared/theme/themeSystem";

const emptyForm: UpsertCentreRequest = {
  centreCode: "",
  displayName: "",
  description: "",
  brandName: "Acutis",
  brandSubtitle: "Bruree Centre",
  brandLogoUrl: "/acutis-icon.svg",
  browserTitle: "Acutis",
  faviconUrl: "/acutis-icon.svg",
  themeKey: DEFAULT_THEME_KEY,
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
      "config.centres.form.brand_name",
      "config.centres.form.brand_name_placeholder",
      "config.centres.form.brand_subtitle",
      "config.centres.form.brand_subtitle_placeholder",
      "config.centres.form.brand_logo_url",
      "config.centres.form.brand_logo_url_placeholder",
      "config.centres.form.browser_title",
      "config.centres.form.browser_title_placeholder",
      "config.centres.form.favicon_url",
      "config.centres.form.favicon_url_placeholder",
      "config.centres.form.theme",
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
      brandName: centre.brandName,
      brandSubtitle: centre.brandSubtitle,
      brandLogoUrl: centre.brandLogoUrl,
      browserTitle: centre.browserTitle,
      faviconUrl: centre.faviconUrl,
      themeKey: centre.themeKey,
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
      <div className="app-page-shell">
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.centres.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-[var(--app-primary)]" />
              <div>
                <h1 className="text-2xl font-semibold text-[var(--app-text)]">{text("config.centres.title", "Centre Administration")}</h1>
                <p className="text-[var(--app-text-muted)]">{text("config.centres.description", "Create centres first, then place units and user access inside them.")}</p>
              </div>
            </div>
          </div>

          {error && <div className="mb-6 rounded-xl border border-[color:color-mix(in_srgb,var(--app-danger)_20%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)] px-4 py-3 text-sm text-[var(--app-danger)]">{error}</div>}

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="app-card rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.centres.list.title", "Existing centres")}</h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="app-primary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {text("config.centres.list.create", "Create centre")}
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-[var(--app-text-muted)]">{text("config.centres.list.loading", "Loading centres...")}</p>
              ) : (
                <div className="space-y-3">
                  {centres.map((centre) => (
                    <div
                      key={centre.centreId}
                      className={`rounded-xl border p-4 transition ${
                        editingCentreId === centre.centreId
                          ? "border-[color:color-mix(in_srgb,var(--app-primary)_28%,var(--app-border))] bg-[var(--app-primary-soft)] shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-[var(--app-text)]">{centre.displayName}</h3>
                            <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">{centre.centreCode}</span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{centre.description || text("config.centres.list.no_description", "No description.")}</p>
                          <p className="mt-3 text-sm text-[var(--app-text-muted)]">{centre.unitCount} {text("config.centres.list.unit_count", "active units")}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(centre)}
                            className="app-outline-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            <PencilLine className="h-4 w-4" />
                            {text("config.centres.list.edit", "Edit")}
                          </button>
                          {centre.isActive && (
                            <button
                              type="button"
                              onClick={() => void deleteCentre(centre.centreId)}
                              className="inline-flex items-center gap-2 rounded-lg border border-[color:color-mix(in_srgb,var(--app-danger)_20%,var(--app-border))] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-danger)] hover:bg-[color:color-mix(in_srgb,var(--app-danger)_8%,white)]"
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

            <form onSubmit={submitCentre} className="app-card space-y-4 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--app-text)]">
                  {editingCentreId ? text("config.centres.form.edit_title", "Edit centre") : text("config.centres.form.create_title", "Create centre")}
                </h2>
                {editingCentreId && (
                  <button type="button" onClick={resetForm} className="text-sm font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                    {text("config.centres.form.clear", "Clear")}
                  </button>
                )}
              </div>

              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.code", "Centre code")}</span>
                <input value={form.centreCode} onChange={(event) => setForm((current) => ({ ...current, centreCode: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.code_placeholder", "centre_code")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.display_name", "Display name")}</span>
                <input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.display_name_placeholder", "Centre display name")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.description_label", "Description")}</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" rows={3} placeholder={text("config.centres.form.description_placeholder", "What this centre covers")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.brand_name", "Brand name")}</span>
                <input value={form.brandName} onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.brand_name_placeholder", "Acutis")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.brand_subtitle", "Brand subtitle")}</span>
                <input value={form.brandSubtitle} onChange={(event) => setForm((current) => ({ ...current, brandSubtitle: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.brand_subtitle_placeholder", "Bruree Centre")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.brand_logo_url", "Brand logo URL")}</span>
                <input value={form.brandLogoUrl} onChange={(event) => setForm((current) => ({ ...current, brandLogoUrl: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.brand_logo_url_placeholder", "/acutis-icon.svg")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.browser_title", "Browser title")}</span>
                <input value={form.browserTitle} onChange={(event) => setForm((current) => ({ ...current, browserTitle: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.browser_title_placeholder", "Acutis")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.favicon_url", "Favicon URL")}</span>
                <input value={form.faviconUrl} onChange={(event) => setForm((current) => ({ ...current, faviconUrl: event.target.value }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" placeholder={text("config.centres.form.favicon_url_placeholder", "/acutis-icon.svg")} />
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.theme", "Theme")}</span>
                <select
                  value={form.themeKey}
                  onChange={(event) => setForm((current) => ({ ...current, themeKey: event.target.value }))}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]"
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.key} value={theme.key}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-sm text-[var(--app-text)]">
                <span>{text("config.centres.form.display_order", "Display order")}</span>
                <input type="number" min={0} value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text)]" />
              </label>

              <div className="flex flex-col gap-3 border-t border-[var(--app-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                  {text("config.centres.form.active", "Active centre")}
                </label>
                <button type="submit" disabled={saving} className="app-primary-button inline-flex items-center justify-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 sm:self-auto">
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
