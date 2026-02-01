"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  LayoutGrid,
  ClipboardList,
  UserCog,
  Plug,
  FileEdit,
  CalendarClock,
  ClipboardCheck,
  ArrowLeft,
} from "lucide-react";

const ConfigurationLanding: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Startup</span>
          </button>
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Configuration Dashboard</h1>
              <p className="text-gray-600">Manage forms, templates, and system settings.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => router.push("/configuration/forms")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Form Configuration</h2>
            </div>
            <p className="text-sm text-gray-600">
              View and manage admission forms, versions, and statuses.
            </p>
          </button>

          <button
            onClick={() => router.push("/configuration/forms/elements-library")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <LayoutGrid className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Elements Library</h2>
            </div>
            <p className="text-sm text-gray-600">
              Browse reusable form elements and field groups.
            </p>
          </button>

          <button
            onClick={() => router.push("/configuration/forms/new")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <FileEdit className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Form Designer</h2>
            </div>
            <p className="text-sm text-gray-600">
              Create a new admission form from scratch.
            </p>
          </button>

          <button
            onClick={() => router.push("/configuration/users-roles")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <UserCog className="h-6 w-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Users & Roles</h2>
            </div>
            <p className="text-sm text-gray-600">Access control and staff permissions.</p>
          </button>

          <div className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Plug className="h-6 w-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
            </div>
            <p className="text-sm text-gray-600">Connect external systems and data sources.</p>
            <span className="inline-block mt-3 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Coming soon
            </span>
          </div>

          <button
            onClick={() => router.push("/configuration/day-planner")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarClock className="h-6 w-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Day Planner</h2>
            </div>
            <p className="text-sm text-gray-600">Plan daily activities, staffing, and schedules.</p>
          </button>

          <button
            onClick={() => router.push("/configuration/program-manager")}
            className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardCheck className="h-6 w-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Program Manager</h2>
            </div>
            <p className="text-sm text-gray-600">Oversee programs, milestones, and outcomes.</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ConfigurationLanding;
