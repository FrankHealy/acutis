"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { hasSuperAdminAccess } from "@/lib/adminAccess";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { useAppAccess } from "@/areas/shared/hooks/useAppAccess";

type SuperAdminGuardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function SuperAdminGuard({ title, description, children }: SuperAdminGuardProps) {
  const router = useRouter();
  const { status } = useSession();
  const { loadKeys, t } = useLocalization();
  const { access, loading } = useAppAccess();

  useEffect(() => {
    void loadKeys([
      "config.guard.checking_access",
      "config.guard.superadmin_only",
      "config.guard.back_to_startup",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  if (!isAuthorizationDisabled && (status === "loading" || loading)) {
    return (
      <div className="px-4 py-10">
        <div className="app-card mx-auto max-w-6xl rounded-xl p-6">
          <p className="text-sm text-[var(--app-text-muted)]">{text("config.guard.checking_access", "Checking administrator access...")}</p>
        </div>
      </div>
    );
  }

  if (!hasSuperAdminAccess(access.roles)) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[color:color-mix(in_srgb,var(--app-danger)_20%,var(--app-border))] bg-[var(--app-surface)] p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[color:color-mix(in_srgb,var(--app-danger)_10%,white)] p-3 text-[var(--app-danger)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-semibold text-[var(--app-text)]">{title}</h1>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">{description}</p>
              </div>
              <p className="text-sm text-[var(--app-danger)]">
                {text("config.guard.superadmin_only", "Only SuperAdmin can see and administer all units, roles, and assignments.")}
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="app-outline-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                {text("config.guard.back_to_startup", "Back to startup")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
