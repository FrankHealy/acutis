"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Settings,
  LayoutGrid,
  ClipboardList,
  UserCog,
  Plug,
  FileEdit,
  CalendarClock,
  ClipboardCheck,
  Quote,
  ArrowLeft,
  Building2,
  ShieldAlert,
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
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.dashboard.back", "Back to Startup")}</span>
            </button>
            <div className="flex items-center gap-3">
              <Settings className="h-7 w-7 text-gray-700" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{text("config.dashboard.title", "Configuration Dashboard")}</h1>
                <p className="text-gray-600">{text("config.dashboard.description", "Manage global units, forms, roles, and system settings.")}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white p-3 text-blue-600 shadow-sm">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{text("config.dashboard.global_only_title", "Global administration only")}</h2>
                <p className="mt-1 text-sm text-gray-700">
                  {text("config.dashboard.global_only_description", "Centres are the main boundary for configuration. Units sit inside a centre, and user access can be configured at centre or unit scope.")}
                </p>
                {!isAuthorizationDisabled && !canAdministerGlobally && (
                  <p className="mt-2 text-sm text-red-700">
                    {text("config.dashboard.global_only_blocked", "Your current session is not recognized as SuperAdmin, so this area will stay blocked.")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push("/units/config/centres")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.centres.title", "Centre Administration")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.centres.description", "Create and maintain centres as the main configuration boundary for units and access.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/units")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-sky-600" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.units.title", "Unit Administration")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.units.description", "Add units under a centre and maintain capacity, naming, and status from one place.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.forms.title", "Form Configuration")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.forms.description", "View and manage admission forms, versions, and statuses.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms/elements-library")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <LayoutGrid className="h-6 w-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.elements.title", "Elements Library")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.elements.description", "Browse reusable form elements and field groups.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/forms/new")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileEdit className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.designer.title", "Form Designer")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.designer.description", "Create a new admission form from scratch.")}
              </p>
            </button>

            <button
              onClick={() => router.push("/units/config/users-roles")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <UserCog className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.users_roles.title", "Users, Roles & Permissions")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {text("config.dashboard.users_roles.description", "Manage role definitions and assign them at centre or unit scope.")}
              </p>
            </button>

            <div className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Plug className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.integrations.title", "Integrations")}</h2>
              </div>
              <p className="text-sm text-gray-600">{text("config.dashboard.integrations.description", "Connect external systems and data sources.")}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {text("config.dashboard.integrations.coming_soon", "Coming soon")}
              </span>
            </div>

            <button
              onClick={() => router.push("/units/config/day-planner")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <CalendarClock className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.day_planner.title", "Day Planner")}</h2>
              </div>
              <p className="text-sm text-gray-600">{text("config.dashboard.day_planner.description", "Plan daily activities, staffing, and schedules.")}</p>
            </button>

            <button
              onClick={() => router.push("/units/config/quotes")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Quote className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.quotes.title", "Quote Library")}</h2>
              </div>
              <p className="text-sm text-gray-600">{text("config.dashboard.quotes.description", "Global quotes and unit quote curation.")}</p>
            </button>

            <button
              onClick={() => router.push("/units/config/program-manager")}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <ClipboardCheck className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{text("config.dashboard.programs.title", "Program Manager")}</h2>
              </div>
              <p className="text-sm text-gray-600">{text("config.dashboard.programs.description", "Oversee programs, milestones, and outcomes.")}</p>
            </button>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
};

export default ConfigurationLanding;
