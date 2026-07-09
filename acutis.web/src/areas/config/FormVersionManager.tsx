"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Activity,
  CalendarClock,
  Edit3,
  Eye,
  FileText,
  History,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  getFormsCatalogue,
  type FormCatalogueItemDto,
} from "@/areas/screening/forms/ApiClient";

type FormFilter = "all" | "active" | "inactive";

const fallbackForms: FormCatalogueItemDto[] = [
  {
    code: "alcohol_screening_call",
    name: "Alcohol Screening Form",
    version: 5,
    description: "Initial call screening and triage form for alcohol admissions.",
    isActive: true,
    activeFrom: "2026-02-06T00:00:00Z",
    activeTo: null,
    status: "active",
    createdAt: "2026-02-06T00:00:00Z",
    versionCount: 5,
  },
  {
    code: "admission_default",
    name: "Admission Form",
    version: 4,
    description: "Base admission form used when no unit-specific form is configured.",
    isActive: true,
    activeFrom: "2026-03-17T00:00:00Z",
    activeTo: null,
    status: "active",
    createdAt: "2026-03-17T00:00:00Z",
    versionCount: 4,
  },
  {
    code: "community_initial_assessment",
    name: "Internal Admissions Form",
    version: 1,
    description: "Community programme assessment based on the HSE assessment structure.",
    isActive: true,
    activeFrom: "2026-06-18T19:45:00Z",
    activeTo: null,
    status: "active",
    createdAt: "2026-06-18T19:45:00Z",
    versionCount: 1,
  },
];

const formKeys = [
  "config.forms.title",
  "config.forms.description",
  "config.forms.search",
  "config.forms.all",
  "config.forms.active",
  "config.forms.inactive",
  "config.forms.name",
  "config.forms.version",
  "config.forms.form_description",
  "config.forms.is_active",
  "config.forms.active_from",
  "config.forms.active_to",
  "config.forms.indefinite",
  "config.forms.status",
  "config.forms.actions",
  "config.forms.edit",
  "config.forms.preview",
  "config.forms.version_history",
  "config.forms.refresh",
  "config.forms.create_admission",
  "config.forms.create_screening",
  "config.forms.empty",
  "config.forms.loaded_fallback",
];

const toDisplayText = (value: string | null | undefined): string => {
  const text = value?.trim();
  if (!text) return "";
  if (!text.includes(".")) return text;

  return text
    .replace(/^designer\.generated\./i, "")
    .replace(/^screening\.form\./i, "")
    .replace(/\.title$/i, "")
    .replace(/\.description$/i, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value: string | null | undefined, fallback: string): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const getDesignerHref = (form: FormCatalogueItemDto): string => {
  if (form.code === "alcohol_screening_call") {
    return "/units/config/forms/new?formType=screening";
  }

  return "/units/config/forms/new";
};

const getPreviewHref = (form: FormCatalogueItemDto): string => {
  if (form.code === "alcohol_screening_call") {
    return "/units/screening/forms";
  }

  return `/units/screening/forms?formCode=${encodeURIComponent(form.code)}`;
};

const FormVersionManager = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const [forms, setForms] = useState<FormCatalogueItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FormFilter>("all");

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const loadForms = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await getFormsCatalogue(session?.accessToken);
      setForms(result.length > 0 ? result : fallbackForms);
    } catch (error) {
      setForms(fallbackForms);
      setLoadError(error instanceof Error ? error.message : text("config.forms.loaded_fallback", "Using local form list."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadKeys(formKeys);
  }, [loadKeys]);

  useEffect(() => {
    void loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return forms.filter((form) => {
      if (filter === "active" && !form.isActive) return false;
      if (filter === "inactive" && form.isActive) return false;
      if (!normalizedQuery) return true;

      return [
        form.code,
        toDisplayText(form.name),
        toDisplayText(form.description),
        form.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, forms, query]);

  const activeCount = forms.filter((form) => form.isActive).length;
  const inactiveCount = forms.length - activeCount;

  return (
    <div className="space-y-6">
      <section className="app-surface rounded-xl border border-[var(--app-border)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
              {text("config.dashboard.forms.title", "Form Configuration")}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--app-text)]">
              {text("config.forms.title", "Forms")}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[var(--app-text-muted)]">
              {text("config.forms.description", "Manage form definitions, active versions, and effective dates.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadForms}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{text("config.forms.refresh", "Refresh")}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/units/config/forms/new")}
              className="app-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>{text("config.forms.create_admission", "New Admission Form")}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/units/config/forms/new?formType=screening")}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--app-primary)] hover:brightness-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>{text("config.forms.create_screening", "New Screening Form")}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="app-surface rounded-lg border border-[var(--app-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--app-text-muted)]">{text("config.forms.all", "All Forms")}</span>
            <FileText className="h-4 w-4 text-[var(--app-text-muted)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{forms.length}</p>
        </div>
        <div className="app-surface rounded-lg border border-[var(--app-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--app-text-muted)]">{text("config.forms.active", "Active")}</span>
            <Activity className="h-4 w-4 text-[var(--app-success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{activeCount}</p>
        </div>
        <div className="app-surface rounded-lg border border-[var(--app-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--app-text-muted)]">{text("config.forms.inactive", "Inactive")}</span>
            <CalendarClock className="h-4 w-4 text-[var(--app-warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{inactiveCount}</p>
        </div>
      </section>

      <section className="app-surface rounded-xl border border-[var(--app-border)]">
        <div className="flex flex-col gap-3 border-b border-[var(--app-border)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text("config.forms.search", "Search forms")}
              className="w-full rounded-lg border border-[var(--app-border)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            />
          </label>

          <div className="flex rounded-lg border border-[var(--app-border)] bg-white p-1">
            {(["all", "active", "inactive"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  filter === item
                    ? "bg-[var(--app-primary)] text-white"
                    : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {item === "all"
                  ? text("config.forms.all", "All")
                  : item === "active"
                    ? text("config.forms.active", "Active")
                    : text("config.forms.inactive", "Inactive")}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-warning)]/10 px-4 py-3 text-sm text-[var(--app-text)]">
            {text("config.forms.loaded_fallback", "Using local form list while the catalogue endpoint is unavailable.")}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--app-border)] text-sm">
            <thead className="bg-[var(--app-surface-muted)]">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)]">
                <th className="px-4 py-3">{text("config.forms.name", "Name")}</th>
                <th className="px-4 py-3">{text("config.forms.version", "Version")}</th>
                <th className="px-4 py-3">{text("config.forms.form_description", "Description")}</th>
                <th className="px-4 py-3">{text("config.forms.is_active", "Is Active")}</th>
                <th className="px-4 py-3">{text("config.forms.active_from", "Active From")}</th>
                <th className="px-4 py-3">{text("config.forms.active_to", "Active To")}</th>
                <th className="px-4 py-3">{text("config.forms.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)] bg-white">
              {filteredForms.map((form) => (
                <tr key={form.code} className="align-top hover:bg-[var(--app-surface-muted)]/70">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[var(--app-text)]">{toDisplayText(form.name)}</div>
                    <div className="mt-1 font-mono text-xs text-[var(--app-text-muted)]">{form.code}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--app-primary)]">
                      v{form.version}
                    </span>
                    <div className="mt-1 text-xs text-[var(--app-text-muted)]">
                      {form.versionCount} {text("config.forms.version", "versions").toLowerCase()}
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-4 text-[var(--app-text-muted)]">
                    {toDisplayText(form.description) || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        form.isActive
                          ? "bg-[var(--app-success)]/10 text-[var(--app-success)]"
                          : "bg-[var(--app-warning)]/10 text-[var(--app-warning)]"
                      }`}
                    >
                      {form.isActive ? text("config.forms.active", "Active") : text("config.forms.inactive", "Inactive")}
                    </span>
                    <div className="mt-1 text-xs text-[var(--app-text-muted)]">{form.status}</div>
                  </td>
                  <td className="px-4 py-4 text-[var(--app-text)]">
                    {formatDate(form.activeFrom, "-")}
                  </td>
                  <td className="px-4 py-4 text-[var(--app-text)]">
                    {form.activeTo
                      ? formatDate(form.activeTo, "-")
                      : text("config.forms.indefinite", "Indefinite")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(getDesignerHref(form))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        title={text("config.forms.edit", "Edit")}
                        aria-label={`${text("config.forms.edit", "Edit")} ${toDisplayText(form.name)}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(getPreviewHref(form))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        title={text("config.forms.preview", "Preview")}
                        aria-label={`${text("config.forms.preview", "Preview")} ${toDisplayText(form.name)}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/units/config/forms/history?formCode=${encodeURIComponent(form.code)}`)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        title={text("config.forms.version_history", "Version History")}
                        aria-label={`${text("config.forms.version_history", "Version History")} ${toDisplayText(form.name)}`}
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredForms.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-[var(--app-text-muted)]">
            {text("config.forms.empty", "No forms match the current filters.")}
          </div>
        )}
      </section>
    </div>
  );
};

export default FormVersionManager;
