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
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">{text("config.guard.checking_access", "Checking administrator access...")}</p>
        </div>
      </div>
    );
  }

  if (!hasSuperAdminAccess(access.roles)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-50 p-3 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </div>
              <p className="text-sm text-red-700">
                {text("config.guard.superadmin_only", "Only SuperAdmin can see and administer all units, roles, and assignments.")}
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
