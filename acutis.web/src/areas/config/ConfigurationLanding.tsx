"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutGrid,
  ClipboardList,
  UserCog,
  Plug,
  FileEdit,
  CalendarClock,
  ClipboardCheck,
  Quote,
  Building2,
  ShieldAlert,
  Map,
} from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import { hasSuperAdminAccess } from "@/lib/adminAccess";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { useAppAccess } from "@/areas/shared/hooks/useAppAccess";

const ConfigurationLanding: React.FC = () => {
  const router = useRouter();
  const { loadKeys, t } = useLocalization();
  const { access } = useAppAccess();
  const canAdministerGlobally = hasSuperAdminAccess(access.roles);

  useEffect(() => {
    void loadKeys([
      "config.dashboard.title",
      "config.dashboard.description",
      "config.dashboard.back",
      "config.dashboard.global_only_title",
      "config.dashboard.global_only_description",
      "config.dashboard.global_only_blocked",
      "config.dashboard.units.title",
      "config.dashboard.units.description",
      "config.dashboard.centres.title",
      "config.dashboard.centres.description",
      "config.dashboard.forms.title",
      "config.dashboard.forms.description",
      "config.dashboard.elements.title",
      "config.dashboard.elements.description",
      "config.dashboard.designer.title",
      "config.dashboard.designer.description",
      "config.dashboard.users_roles.title",
      "config.dashboard.users_roles.description",
      "config.dashboard.integrations.title",
      "config.dashboard.integrations.description",
      "config.dashboard.integrations.coming_soon",
      "config.dashboard.day_planner.title",
      "config.dashboard.day_planner.description",
      "config.dashboard.map_designer.title",
      "config.dashboard.map_designer.description",
      "config.dashboard.quotes.title",
      "config.dashboard.quotes.description",
      "config.dashboard.programs.title",
      "config.dashboard.programs.description",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  return (
    <SuperAdminGuard
      title={text("config.dashboard.title", "Configuration Dashboard")}
      description={text("config.dashboard.description", "Global administration is restricted to SuperAdmin.")}
    >
      <div className="app-page-shell">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="app-card mb-6 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)] shadow-sm">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--app-text)]">{text("config.dashboard.global_only_title", "Global administration only")}</h2>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  {text("config.dashboard.global_only_description", "Centres are the main boundary for configuration. Units sit inside a centre, and user access can be configured at centre or unit scope.")}
                </p>
                {!isAuthorizationDisabled && !canAdministerGlobally && (
                  <p className="mt-2 text-sm text-[var(--app-danger)]">
                    {text("config.dashboard.global_only_blocked", "Your current session is not recognized as SuperAdmin, so this area will stay blocked.")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push("/units/config/centres")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-[var(--app-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.centres.title", "Centre Administration")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.centres.description", "Create and maintain centres as the main configuration boundary for units and access.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/units")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-[var(--app-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.units.title", "Unit Administration")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.units.description", "Add units under a centre and maintain capacity, naming, and status from one place.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <ClipboardList className="h-6 w-6 text-[var(--app-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.forms.title", "Form Configuration")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.forms.description", "View and manage admission forms, versions, and statuses.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms/elements-library")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <LayoutGrid className="h-6 w-6 text-[var(--app-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.elements.title", "Elements Library")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.elements.description", "Browse reusable form elements and field groups.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms/new")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileEdit className="h-6 w-6 text-[var(--app-success)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.designer.title", "Form Designer")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.designer.description", "Create a new admission form from scratch.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/users-roles")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <UserCog className="h-6 w-6 text-[var(--app-text-muted)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.users_roles.title", "Users, Roles & Permissions")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.users_roles.description", "Manage role definitions and assign them at centre or unit scope.")}
              </p>
            </button>

            <div className="app-card text-left rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Plug className="h-6 w-6 text-[var(--app-text-muted)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.integrations.title", "Integrations")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">{text("config.dashboard.integrations.description", "Connect external systems and data sources.")}</p>
              <span className="inline-block mt-3 rounded bg-[var(--app-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                {text("config.dashboard.integrations.coming_soon", "Coming soon")}
              </span>
            </div>

            <button
              onClick={() => router.push("/units/config/day-planner")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <CalendarClock className="h-6 w-6 text-[var(--app-text-muted)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.day_planner.title", "Day Planner")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">{text("config.dashboard.day_planner.description", "Plan daily activities, staffing, and schedules.")}</p>
            </button>

            <button
              onClick={() => router.push("/units/config/map-designer")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Map className="h-6 w-6 text-[var(--app-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.map_designer.title", "Map Designer")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text("config.dashboard.map_designer.description", "Build and inspect internal SVG floor maps from structured spatial artefacts.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/quotes")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Quote className="h-6 w-6 text-[var(--app-text-muted)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.quotes.title", "Quote Library")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">{text("config.dashboard.quotes.description", "Global quotes and unit quote curation.")}</p>
            </button>

            <button
              onClick={() => router.push("/units/config/program-manager")}
              className="app-card text-left rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <ClipboardCheck className="h-6 w-6 text-[var(--app-text-muted)]" />
                <h2 className="text-lg font-semibold text-[var(--app-text)]">{text("config.dashboard.programs.title", "Program Manager")}</h2>
              </div>
              <p className="text-sm text-[var(--app-text-muted)]">{text("config.dashboard.programs.description", "Oversee programs, milestones, and outcomes.")}</p>
            </button>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
};

export default ConfigurationLanding;
