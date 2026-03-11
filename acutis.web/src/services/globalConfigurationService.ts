import { createAuthHeaders } from "@/lib/authMode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5009";

export type UnitConfigurationDto = {
  unitId: string;
  unitCode: string;
  displayName: string;
  description: string;
  unitCapacity: number;
  currentOccupancy: number;
  freeBeds: number;
  capacityWarningThreshold: number;
  displayOrder: number;
  isActive: boolean;
};

export type UpsertUnitRequest = {
  unitCode: string;
  displayName: string;
  description: string;
  unitCapacity: number;
  currentOccupancy: number;
  capacityWarningThreshold: number;
  displayOrder: number;
  isActive: boolean;
};

export type AppPermissionDto = {
  permissionId: string;
  key: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
};

export type AppRoleDto = {
  roleId: string;
  key: string;
  name: string;
  description: string;
  externalRoleName: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissionKeys: string[];
};

export type UpsertAppRoleRequest = {
  key: string;
  name: string;
  description: string;
  externalRoleName: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissionKeys: string[];
};

export type AppUserRoleAssignmentDto = {
  assignmentId: string;
  roleId: string;
  roleKey: string;
  unitId?: string | null;
  unitCode: string;
  unitName: string;
  isActive: boolean;
};

export type AppUserDto = {
  userId: string;
  externalSubject: string;
  userName: string;
  displayName: string;
  email: string;
  isActive: boolean;
  lastSeenAtUtc?: string | null;
  assignments: AppUserRoleAssignmentDto[];
};

export type UpsertAppUserRequest = {
  externalSubject: string;
  userName: string;
  displayName: string;
  email: string;
  isActive: boolean;
};

export type UpsertUserRoleAssignmentItem = {
  roleId: string;
  unitId?: string | null;
  isActive: boolean;
};

async function request<T>(path: string, accessToken: string | undefined, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...createAuthHeaders(accessToken),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const globalConfigurationService = {
  getUnits(accessToken?: string, includeInactive = true) {
    return request<UnitConfigurationDto[]>(
      `/api/configuration/units?includeInactive=${includeInactive ? "true" : "false"}`,
      accessToken,
    );
  },
  createUnit(accessToken: string | undefined, payload: UpsertUnitRequest) {
    return request<UnitConfigurationDto>("/api/configuration/units", accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUnit(accessToken: string | undefined, unitId: string, payload: UpsertUnitRequest) {
    return request<UnitConfigurationDto>(`/api/configuration/units/${encodeURIComponent(unitId)}`, accessToken, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  archiveUnit(accessToken: string | undefined, unitId: string) {
    return request<void>(`/api/configuration/units/${encodeURIComponent(unitId)}`, accessToken, {
      method: "DELETE",
    });
  },
  getPermissions(accessToken?: string) {
    return request<AppPermissionDto[]>("/api/configuration/permissions", accessToken);
  },
  getRoles(accessToken?: string) {
    return request<AppRoleDto[]>("/api/configuration/roles", accessToken);
  },
  createRole(accessToken: string | undefined, payload: UpsertAppRoleRequest) {
    return request<AppRoleDto>("/api/configuration/roles", accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateRole(accessToken: string | undefined, roleId: string, payload: UpsertAppRoleRequest) {
    return request<AppRoleDto>(`/api/configuration/roles/${encodeURIComponent(roleId)}`, accessToken, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  archiveRole(accessToken: string | undefined, roleId: string) {
    return request<void>(`/api/configuration/roles/${encodeURIComponent(roleId)}`, accessToken, {
      method: "DELETE",
    });
  },
  getUsers(accessToken?: string) {
    return request<AppUserDto[]>("/api/configuration/users", accessToken);
  },
  createUser(accessToken: string | undefined, payload: UpsertAppUserRequest) {
    return request<AppUserDto>("/api/configuration/users", accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUser(accessToken: string | undefined, userId: string, payload: UpsertAppUserRequest) {
    return request<AppUserDto>(`/api/configuration/users/${encodeURIComponent(userId)}`, accessToken, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  replaceUserAssignments(
    accessToken: string | undefined,
    userId: string,
    assignments: UpsertUserRoleAssignmentItem[],
  ) {
    return request<AppUserRoleAssignmentDto[]>(
      `/api/configuration/users/${encodeURIComponent(userId)}/assignments`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({ assignments }),
      },
    );
  },
};
