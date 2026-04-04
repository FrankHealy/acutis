"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/areas/shared/layout/Header";

const primaryNavItems = [
  { href: "/units/config", label: "Overview" },
  { href: "/units/config/centres", label: "Centres" },
  { href: "/units/config/units", label: "Units" },
  { href: "/units/config/forms", label: "Forms" },
  { href: "/units/config/forms/new", label: "Designer" },
  { href: "/units/config/quotes", label: "Quotes" },
  { href: "/units/config/program-manager", label: "Program Manager" },
  { href: "/units/config/day-planner", label: "Day Planner" },
  { href: "/units/config/users-roles", label: "Users & Roles" },
];

type ConfigWorkspaceShellProps = {
  children: React.ReactNode;
};

export default function ConfigWorkspaceShell({ children }: ConfigWorkspaceShellProps) {
  const pathname = usePathname();
  const isActivePath = (href: string) => pathname === href;

  return (
    <div className="app-page-shell min-h-screen">
      <div className="sticky top-0 z-40">
        <Header showCapacity={false} unitName="Configuration" unitLabel="Current Area" unitIconKey="shield" />
        <nav className="app-surface border-b border-[var(--app-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-14 items-center py-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      isActivePath(item.href)
                        ? "text-[var(--app-primary)]"
                        : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
