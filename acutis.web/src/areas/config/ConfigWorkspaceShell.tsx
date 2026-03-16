"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, ClipboardCheck, ClipboardList, FileEdit, Quote, Settings, UserCog } from "lucide-react";
import Header from "@/areas/shared/layout/Header";

const navItems = [
  { href: "/units/config", label: "Overview", icon: Settings },
  { href: "/units/config/centres", label: "Centres", icon: Building2 },
  { href: "/units/config/units", label: "Units", icon: Building2 },
  { href: "/units/config/forms", label: "Forms", icon: ClipboardList },
  { href: "/units/config/forms/new", label: "Designer", icon: FileEdit },
  { href: "/units/config/quotes", label: "Quote Library", icon: Quote },
  { href: "/units/config/program-manager", label: "Program Manager", icon: ClipboardCheck },
  { href: "/units/config/day-planner", label: "Day Planner", icon: CalendarClock },
  { href: "/units/config/users-roles", label: "Users & Roles", icon: UserCog },
];

type ConfigWorkspaceShellProps = {
  children: React.ReactNode;
};

export default function ConfigWorkspaceShell({ children }: ConfigWorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-page-shell min-h-screen">
      <div className="sticky top-0 z-40">
        <Header showCapacity={false} />
        <div className="border-b border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-surface)_94%,white)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Startup</span>
                </Link>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-text-muted)]">
                    Global Configuration
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">Configuration Workspace</h1>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    Shared administration header and fast navigation across forms, quotes, centres, units, and access.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex min-w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:border-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
