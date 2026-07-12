import { isAuthorizationDisabled } from "@/lib/authMode";

const SUPER_ADMIN_ROLE_ALIASES = new Set([
  "admin",
  "platform_admin",
  "platform admin",
  "super_admin",
  "super admin",
  "superadmin",
]);

const normalizeRole = (role: string) => role.trim().toLowerCase().replace(/[-_]+/g, " ");

export const hasSuperAdminAccess = (roles?: string[] | null) => {
  if (isAuthorizationDisabled) {
    return true;
  }

  return (roles ?? []).some((role) => SUPER_ADMIN_ROLE_ALIASES.has(normalizeRole(role)));
};

export type AppAccess = {
  appUserId?: string | null;
  subject?: string | null;
  roles: string[];
  permissions: string[];
  unitAccess: string[];
  unitPermissions: string[];
};
