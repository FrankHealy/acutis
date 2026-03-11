"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import SuperAdminGuard from "@/areas/config/SuperAdminGuard";
import {
  globalConfigurationService,
  type AppPermissionDto,
  type AppRoleDto,
  type AppUserDto,
  type UnitConfigurationDto,
} from "@/services/globalConfigurationService";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

const globalScope = "__global__";

type RoleForm = {
  key: string;
  name: string;
  description: string;
  externalRoleName: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissionKeys: string[];
};

type UserForm = {
  externalSubject: string;
  userName: string;
  displayName: string;
  email: string;
  isActive: boolean;
};

type AssignmentDraft = {
  roleId: string;
  unitId: string;
  isActive: boolean;
};

const emptyRoleForm = (): RoleForm => ({
  key: "",
  name: "",
  description: "",
  externalRoleName: "",
  isSystemRole: false,
  isActive: true,
  permissionKeys: [],
});

const emptyUserForm = (): UserForm => ({
  externalSubject: "",
  userName: "",
  displayName: "",
  email: "",
  isActive: true,
});

const emptyAssignment = (): AssignmentDraft => ({
  roleId: "",
  unitId: globalScope,
  isActive: true,
});

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function UsersRoles() {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadKeys, t } = useLocalization();
  const accessToken = session?.accessToken;
  const [roles, setRoles] = useState<AppRoleDto[]>([]);
  const [permissions, setPermissions] = useState<AppPermissionDto[]>([]);
  const [users, setUsers] = useState<AppUserDto[]>([]);
  const [units, setUnits] = useState<UnitConfigurationDto[]>([]);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([emptyAssignment()]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const permissionLookup = useMemo(() => {
    return permissions.reduce<Record<string, AppPermissionDto>>((lookup, permission) => {
      lookup[permission.key] = permission;
      return lookup;
    }, {});
  }, [permissions]);

  const roleLookup = useMemo(() => {
    return roles.reduce<Record<string, AppRoleDto>>((lookup, role) => {
      lookup[role.roleId] = role;
      return lookup;
    }, {});
  }, [roles]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, AppPermissionDto[]>>((groups, permission) => {
      const category = permission.category || "other";
      groups[category] ??= [];
      groups[category].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const loadData = useCallback(async () => {
    if (!accessToken && !isAuthorizationDisabled) return;

    setLoading(true);
    try {
      setError(null);
      const [rolesResult, permissionsResult, usersResult, unitsResult] = await Promise.all([
        globalConfigurationService.getRoles(accessToken),
        globalConfigurationService.getPermissions(accessToken),
        globalConfigurationService.getUsers(accessToken),
        globalConfigurationService.getUnits(accessToken),
      ]);

      setRoles(rolesResult);
      setPermissions(permissionsResult);
      setUsers(usersResult);
      setUnits(unitsResult.filter((unit) => unit.isActive));
      setSelectedUserId((current) => current ?? usersResult[0]?.userId ?? null);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadKeys([
      "config.users_roles.title",
      "config.users_roles.description",
      "config.users_roles.back",
      "config.users_roles.loading",
      "config.users_roles.roles.create",
      "config.users_roles.roles.edit",
      "config.users_roles.roles.clear",
      "config.users_roles.roles.catalogue",
      "config.users_roles.roles.permissions",
      "config.users_roles.roles.create_button",
      "config.users_roles.roles.save_button",
      "config.users_roles.users.title",
      "config.users_roles.users.create",
      "config.users_roles.users.edit",
      "config.users_roles.users.load_selected",
      "config.users_roles.users.assignments",
      "config.users_roles.users.add_assignment",
      "config.users_roles.users.remove_assignment",
      "config.users_roles.users.create_button",
      "config.users_roles.users.save_button",
      "config.users_roles.users.clear",
      "config.users_roles.scope.all_units",
      "config.users_roles.state.active",
      "config.users_roles.state.inactive",
      "config.users_roles.state.no_assignments",
      "config.users_roles.external_role.none",
      "config.users_roles.select_role",
    ]);
  }, [loadKeys]);

  const startRoleEdit = (role: AppRoleDto) => {
    setEditingRoleId(role.roleId);
    setRoleForm({
      key: role.key,
      name: role.name,
      description: role.description,
      externalRoleName: role.externalRoleName,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      permissionKeys: [...role.permissionKeys],
    });
  };

  const startUserEdit = (user: AppUserDto) => {
    setEditingUserId(user.userId);
    setSelectedUserId(user.userId);
    setUserForm({
      externalSubject: user.externalSubject,
      userName: user.userName,
      displayName: user.displayName,
      email: user.email,
      isActive: user.isActive,
    });
    setAssignments(
      user.assignments.length > 0
        ? user.assignments.map((assignment) => ({
            roleId: assignment.roleId,
            unitId: assignment.unitId ?? globalScope,
            isActive: assignment.isActive,
          }))
        : [emptyAssignment()],
    );
  };

  const resetRoleForm = () => {
    setEditingRoleId(null);
    setRoleForm(emptyRoleForm());
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm());
    setAssignments([emptyAssignment()]);
  };

  const submitRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) return;

    setSaving(true);
    try {
      setError(null);
      if (editingRoleId) {
        await globalConfigurationService.updateRole(accessToken, editingRoleId, roleForm);
      } else {
        await globalConfigurationService.createRole(accessToken, roleForm);
      }
      resetRoleForm();
      await loadData();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken && !isAuthorizationDisabled) return;

    setSaving(true);
    try {
      setError(null);
      let userId = editingUserId;

      if (editingUserId) {
        await globalConfigurationService.updateUser(accessToken, editingUserId, userForm);
      } else {
        const created = await globalConfigurationService.createUser(accessToken, userForm);
        userId = created.userId;
        setSelectedUserId(created.userId);
      }

      if (!userId) {
        throw new Error("User id not available.");
      }

      await globalConfigurationService.replaceUserAssignments(
        accessToken,
        userId,
        assignments
          .filter((item) => item.roleId)
          .map((item) => ({
            roleId: item.roleId,
            unitId: item.unitId === globalScope ? null : item.unitId,
            isActive: item.isActive,
          })),
      );

      resetUserForm();
      await loadData();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (key: string) => {
    setRoleForm((current) => ({
      ...current,
      permissionKeys: current.permissionKeys.includes(key)
        ? current.permissionKeys.filter((item) => item !== key)
        : [...current.permissionKeys, key].sort(),
    }));
  };

  const updateAssignment = (index: number, patch: Partial<AssignmentDraft>) => {
    setAssignments((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

  const removeAssignment = (index: number) => {
    setAssignments((current) =>
      current.length === 1 ? [emptyAssignment()] : current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const assignmentSummary = (assignment: { roleKey: string; unitName: string; unitId?: string | null }) =>
    assignment.unitId
      ? `${titleCase(assignment.roleKey)} · ${assignment.unitName}`
      : `${titleCase(assignment.roleKey)} · ${text("config.users_roles.scope.all_units", "All units")}`;

  return (
    <SuperAdminGuard
      title={text("config.users_roles.title", "Users, Roles & Permissions")}
      description={text("config.users_roles.description", "This area is reserved for SuperAdmin.")}
    >
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <button
              onClick={() => router.push("/units/config")}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{text("config.users_roles.back", "Back to Configuration")}</span>
            </button>
            <div className="flex items-center gap-3">
              <UserCog className="h-8 w-8 text-gray-700" />
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {text("config.users_roles.title", "Users, Roles & Permissions")}
                </h1>
                <p className="mt-1 text-base text-gray-600">
                  {text(
                    "config.users_roles.description",
                    "Users come first. Roles define permissions, then each user gets the right access globally or per unit.",
                  )}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-base text-gray-600 shadow-sm">
              {text("config.users_roles.loading", "Loading security configuration...")}
            </div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-slate-700" />
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {text("config.users_roles.users.title", "Users")}
                        </h2>
                        <p className="text-sm text-gray-500">{users.length} user records</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      {text("config.users_roles.users.create", "Create user")}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {users.map((user) => {
                      const isSelected = selectedUserId === user.userId;
                      return (
                        <button
                          key={user.userId}
                          type="button"
                          onClick={() => setSelectedUserId(user.userId)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-blue-300 bg-blue-50 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{user.displayName}</p>
                              <p className="mt-1 text-sm text-gray-600">{user.userName}</p>
                              <p className="mt-1 text-sm text-gray-500">{user.email || "No email"}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {user.isActive
                                ? text("config.users_roles.state.active", "Active")
                                : text("config.users_roles.state.inactive", "Inactive")}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {user.assignments.length > 0 ? (
                              user.assignments.map((assignment) => (
                                <span
                                  key={assignment.assignmentId}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                                >
                                  {assignmentSummary(assignment)}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                                {text("config.users_roles.state.no_assignments", "No role access assigned")}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={submitUser} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {editingUserId
                          ? text("config.users_roles.users.edit", "Edit user")
                          : text("config.users_roles.users.create", "Create user")}
                      </h2>
                      <p className="mt-1 text-base text-gray-600">
                        Set user access by assigning roles. Roles carry the permissions.
                      </p>
                    </div>
                    {selectedUser && (
                      <button
                        type="button"
                        onClick={() => startUserEdit(selectedUser)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <PencilLine className="h-4 w-4" />
                        {text("config.users_roles.users.load_selected", "Load selected")}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">External subject</span>
                      <input value={userForm.externalSubject} onChange={(event) => setUserForm((current) => ({ ...current, externalSubject: event.target.value }))} placeholder="User subject from login" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Username</span>
                      <input value={userForm.userName} onChange={(event) => setUserForm((current) => ({ ...current, userName: event.target.value }))} placeholder="Username" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Display name</span>
                      <input value={userForm.displayName} onChange={(event) => setUserForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Display name" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Email</span>
                      <input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                  </div>

                  <label className="mt-5 inline-flex items-center gap-3 text-base font-medium text-gray-700">
                    <input type="checkbox" checked={userForm.isActive} onChange={(event) => setUserForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    {text("config.users_roles.state.active", "Active")} user
                  </label>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-slate-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {text("config.users_roles.users.assignments", "User access")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Choose a role, then decide whether it applies to all units or one specific unit.
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setAssignments((current) => [...current, emptyAssignment()])} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Plus className="h-4 w-4" />
                        {text("config.users_roles.users.add_assignment", "Add role access")}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {assignments.map((assignment, index) => {
                        const selectedRole = assignment.roleId ? roleLookup[assignment.roleId] : null;
                        return (
                          <div key={`${index}-${assignment.roleId}-${assignment.unitId}`} className="rounded-2xl border border-gray-200 bg-white p-4">
                            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
                              <select value={assignment.roleId} onChange={(event) => updateAssignment(index, { roleId: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 text-base">
                                <option value="">{text("config.users_roles.select_role", "Select role")}</option>
                                {roles.filter((role) => role.isActive).map((role) => (
                                  <option key={role.roleId} value={role.roleId}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                              <select value={assignment.unitId} onChange={(event) => updateAssignment(index, { unitId: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 text-base">
                                <option value={globalScope}>{text("config.users_roles.scope.all_units", "All units")}</option>
                                {units.map((unit) => (
                                  <option key={unit.unitId} value={unit.unitId}>
                                    {unit.displayName}
                                  </option>
                                ))}
                              </select>
                              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={assignment.isActive} onChange={(event) => updateAssignment(index, { isActive: event.target.checked })} />
                                {text("config.users_roles.state.active", "Active")}
                              </label>
                              <button type="button" onClick={() => removeAssignment(index)} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">
                                {text("config.users_roles.users.remove_assignment", "Remove access")}
                              </button>
                            </div>

                            {selectedRole && (
                              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-700">Access included in this role</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {selectedRole.permissionKeys.map((permissionKey) => (
                                    <span key={permissionKey} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                      {permissionLookup[permissionKey]?.name ?? titleCase(permissionKey)}
                                    </span>
                                  ))}
                                  {selectedRole.permissionKeys.length === 0 && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                                      No permissions
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-blue-300">
                      <Save className="h-4 w-4" />
                      {editingUserId ? text("config.users_roles.users.save_button", "Save user") : text("config.users_roles.users.create_button", "Create user")}
                    </button>
                    <button type="button" onClick={resetUserForm} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      {text("config.users_roles.users.clear", "Clear")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-slate-700" />
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {text("config.users_roles.roles.catalogue", "Role catalogue")}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Roles define the access bundles available to users.
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={resetRoleForm} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      <Plus className="h-4 w-4" />
                      {text("config.users_roles.roles.create", "Create role")}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div key={role.roleId} className={`rounded-2xl border p-4 transition ${editingRoleId === role.roleId ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{role.key}</span>
                              <span className={`rounded-full px-3 py-1 text-sm font-medium ${role.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {role.isActive ? text("config.users_roles.state.active", "Active") : text("config.users_roles.state.inactive", "Inactive")}
                              </span>
                            </div>
                            <p className="mt-2 text-base text-gray-600">{role.description || "No description."}</p>
                            <p className="mt-2 text-sm text-gray-500">
                              External role: {role.externalRoleName || text("config.users_roles.external_role.none", "none")}
                            </p>
                          </div>
                          <button type="button" onClick={() => startRoleEdit(role)} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {role.permissionKeys.map((permissionKey) => (
                            <span key={permissionKey} className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-800">
                              {permissionLookup[permissionKey]?.name ?? titleCase(permissionKey)}
                            </span>
                          ))}
                          {role.permissionKeys.length === 0 && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                              No permissions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitRole} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {editingRoleId ? text("config.users_roles.roles.edit", "Edit role") : text("config.users_roles.roles.create", "Create role")}
                      </h2>
                      <p className="mt-1 text-base text-gray-600">
                        Add or remove permissions from the role. Users inherit access through the roles assigned to them.
                      </p>
                    </div>
                    {editingRoleId && (
                      <button type="button" onClick={resetRoleForm} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        {text("config.users_roles.roles.clear", "Clear")}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Role key</span>
                      <input value={roleForm.key} onChange={(event) => setRoleForm((current) => ({ ...current, key: event.target.value }))} placeholder="role_key" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Role name</span>
                      <input value={roleForm.name} onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))} placeholder="Role name" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Description</span>
                      <textarea value={roleForm.description} onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Describe what this role is for" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700">External login role reference</span>
                      <input value={roleForm.externalRoleName} onChange={(event) => setRoleForm((current) => ({ ...current, externalRoleName: event.target.value }))} placeholder="Optional legacy mapping" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="checkbox" checked={roleForm.isSystemRole} onChange={(event) => setRoleForm((current) => ({ ...current, isSystemRole: event.target.checked }))} />
                      System role
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="checkbox" checked={roleForm.isActive} onChange={(event) => setRoleForm((current) => ({ ...current, isActive: event.target.checked }))} />
                      {text("config.users_roles.state.active", "Active")}
                    </label>
                  </div>

                  <div className="mt-6 space-y-4">
                    {Object.entries(groupedPermissions).map(([category, group]) => (
                      <div key={category} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{titleCase(category)}</p>
                        <div className="space-y-2">
                          {group.map((permission) => {
                            const selected = roleForm.permissionKeys.includes(permission.key);
                            return (
                              <label key={permission.permissionId} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${selected ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                                <input type="checkbox" checked={selected} onChange={() => togglePermission(permission.key)} className="mt-1" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-gray-900">{permission.name}</span>
                                    {selected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600">{permission.description}</p>
                                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{permission.key}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400">
                      <Save className="h-4 w-4" />
                      {editingRoleId ? text("config.users_roles.roles.save_button", "Save role") : text("config.users_roles.roles.create_button", "Create role")}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </SuperAdminGuard>
  );
}
