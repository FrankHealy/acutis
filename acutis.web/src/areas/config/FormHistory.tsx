"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit3, Power, RefreshCw } from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  activateFormVersion,
  getFormVersions,
  type FormConfigurationVersionDto,
} from "@/areas/screening/forms/ApiClient";

type FormHistoryProps = {
  formCode: string;
};

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

const formatDate = (value: string | null | undefined, fallback = "-"): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const getDesignerHref = (formCode: string): string => {
  if (formCode === "alcohol_screening_call") {
    return "/units/config/forms/new?formType=screening";
  }

  return "/units/config/forms/new";
};

export default function FormHistory({ formCode }: FormHistoryProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const [versions, setVersions] = useState<FormConfigurationVersionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const loadVersions = async () => {
    if (!formCode) {
      setVersions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setVersions(await getFormVersions(session?.accessToken, formCode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load form history.");
    } finally {
      setIsLoading(false);
    }
  };

  const activateVersion = async (version: number) => {
    await activateFormVersion(session?.accessToken, formCode, version);
    await loadVersions();
  };

  useEffect(() => {
    void loadKeys([
      "config.forms.version_history",
      "config.forms.version",
      "config.forms.name",
      "config.forms.form_description",
      "config.forms.status",
      "config.forms.is_active",
      "config.forms.active_from",
      "config.forms.active_to",
      "config.forms.indefinite",
      "config.forms.actions",
      "config.forms.edit",
      "config.forms.refresh",
      "config.forms.activate",
      "config.forms.back_to_forms",
    ]);
  }, [loadKeys]);

  useEffect(() => {
    void loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formCode, session?.accessToken]);

  return (
    <div className="space-y-6">
      <section className="app-surface rounded-xl border border-[var(--app-border)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/units/config/forms")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{text("config.forms.back_to_forms", "Back to Forms")}</span>
            </button>
            <h1 className="mt-3 text-2xl font-bold text-[var(--app-text)]">
              {text("config.forms.version_history", "Version History")}
            </h1>
            <p className="mt-1 font-mono text-sm text-[var(--app-text-muted)]">{formCode || "-"}</p>
          </div>

          <button
            type="button"
            onClick={loadVersions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{text("config.forms.refresh", "Refresh")}</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-[var(--app-warning)]/30 bg-[var(--app-warning)]/10 p-4 text-sm text-[var(--app-text)]">
          {error}
        </div>
      )}

      <section className="app-surface overflow-x-auto rounded-xl border border-[var(--app-border)]">
        <table className="min-w-full divide-y divide-[var(--app-border)] text-sm">
          <thead className="bg-[var(--app-surface-muted)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)]">
              <th className="px-4 py-3">{text("config.forms.version", "Version")}</th>
              <th className="px-4 py-3">{text("config.forms.name", "Name")}</th>
              <th className="px-4 py-3">{text("config.forms.form_description", "Description")}</th>
              <th className="px-4 py-3">{text("config.forms.status", "Status")}</th>
              <th className="px-4 py-3">{text("config.forms.active_from", "Active From")}</th>
              <th className="px-4 py-3">{text("config.forms.active_to", "Active To")}</th>
              <th className="px-4 py-3">{text("config.forms.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)] bg-white">
            {versions.map((version) => (
              <tr key={`${version.code}-${version.version}`} className="hover:bg-[var(--app-surface-muted)]/70">
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--app-primary)]">
                    v{version.version}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-[var(--app-text)]">{toDisplayText(version.titleKey)}</td>
                <td className="max-w-md px-4 py-4 text-[var(--app-text-muted)]">{toDisplayText(version.descriptionKey) || "-"}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      version.isActive
                        ? "bg-[var(--app-success)]/10 text-[var(--app-success)]"
                        : "bg-[var(--app-warning)]/10 text-[var(--app-warning)]"
                    }`}
                  >
                    {version.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-[var(--app-text)]">{formatDate(version.activeFrom)}</td>
                <td className="px-4 py-4 text-[var(--app-text)]">
                  {version.activeTo ? formatDate(version.activeTo) : text("config.forms.indefinite", "Indefinite")}
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(getDesignerHref(formCode))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                      title={text("config.forms.edit", "Edit")}
                      aria-label={`${text("config.forms.edit", "Edit")} v${version.version}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {!version.isActive && (
                      <button
                        type="button"
                        onClick={() => activateVersion(version.version)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        title={text("config.forms.activate", "Activate")}
                        aria-label={`${text("config.forms.activate", "Activate")} v${version.version}`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && versions.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-[var(--app-text-muted)]">
            {formCode ? "No versions found." : "Select a form first."}
          </div>
        )}
      </section>
    </div>
  );
}
