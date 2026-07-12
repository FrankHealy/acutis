"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRightLeft, GripVertical, ShieldCheck, User } from "lucide-react";
import { operationsService, type UnitOtRoleAssignment, type UnitOtRoleDefinition } from "@/services/operationsService";
import { residentService } from "@/services/residentService";
import type { Resident } from "@/services/mockDataService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { isAuthorizedClient } from "@/lib/authMode";

type DragResident = {
  episodeId: string;
  residentName: string;
  currentAssignmentId?: string;
  currentRoleId?: string;
};

type RoleGroup = {
  key: string;
  title: string;
  subtitle: string;
  accentClass: string;
  roles: UnitOtRoleDefinition[];
};

const getResidentDisplayPhoto = (resident: Resident): string | null =>
  resident.photo?.trim() ? resident.photo.trim() : resident.fallbackPhoto;

const formatCapacity = (role: UnitOtRoleDefinition): string => {
  if (role.capacity == null) {
    return `${role.occupiedCount} assigned`;
  }

  return `${role.occupiedCount}/${role.capacity}`;
};

const getRoleGroupMeta = (roleType: string) => {
  switch (roleType.toLowerCase()) {
    case "internal":
      return {
        key: "internal",
        title: "Internal Roles",
        subtitle: "House jobs, reception, kitchens, corridors and fixed indoor duties.",
        accentClass: "from-amber-50 via-white to-orange-50 border-amber-200",
      };
    case "external":
      return {
        key: "external",
        title: "External Roles",
        subtitle: "Grounds, sheds, avenue, smoking area and outdoor work allocation.",
        accentClass: "from-emerald-50 via-white to-lime-50 border-emerald-200",
      };
    default:
      return {
        key: "hybrid",
        title: "Mixed And Split",
        subtitle: "Roles that cross indoor and outdoor duties or need flexible placement.",
        accentClass: "from-sky-50 via-white to-cyan-50 border-sky-200",
      };
  }
};

const canDropResidentIntoRole = (resident: DragResident | null, role: UnitOtRoleDefinition) => {
  if (!resident) {
    return false;
  }

  if (resident.currentRoleId === role.id) {
    return true;
  }

  if (role.capacity == null) {
    return true;
  }

  return role.occupiedCount < role.capacity;
};

const getDietaryNeedsLabel = (code: number): string | null => {
  const labels: Record<number, string> = {
    1: "Vegetarian",
    2: "Vegan",
    3: "Gluten free",
    4: "Diabetic",
    5: "Soft diet",
    6: "Low sugar",
  };

  return labels[code] ?? null;
};

const getResidentHealthFlags = (resident: Resident): string[] => {
  const flags: string[] = [];

  const dietary = getDietaryNeedsLabel(resident.dietaryNeedsCode);
  if (dietary) {
    flags.push(dietary);
  }

  if (resident.isSnorer) {
    flags.push("Snorer");
  }

  if ((resident.learningDifficultyScale ?? 0) > 0) {
    flags.push("Learning support");
  }

  return flags;
};

const ResidentTile: React.FC<{
  resident: Resident;
  roleLabel?: string | null;
  onDragStart: (resident: DragResident) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}> = ({ resident, roleLabel, onDragStart, onDragEnd, isDragging }) => {
  const photo = getResidentDisplayPhoto(resident);
  const healthFlags = getResidentHealthFlags(resident);

  return (
    <div
      draggable={Boolean(resident.episodeId)}
      onDragStart={() => {
        if (!resident.episodeId) {
          return;
        }

        onDragStart({
          episodeId: resident.episodeId,
          residentName: `${resident.firstName} ${resident.surname}`,
        });
      }}
      onDragEnd={onDragEnd}
      className={`group flex cursor-grab items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition ${isDragging ? "scale-[0.98] opacity-50" : "hover:-translate-y-0.5 hover:shadow-md"}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
        {photo ? (
          <img src={photo} alt={`${resident.firstName} ${resident.surname}`} className="h-full w-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-slate-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{resident.firstName} {resident.surname}</p>
        <p className="text-xs text-slate-500">Age {resident.age} | Week {resident.weekNumber} | Room {resident.roomNumber || "-"}</p>
        <p className="truncate text-xs text-slate-600">{roleLabel ?? "Unassigned"}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {healthFlags.length > 0 ? (
            healthFlags.map((flag) => (
              <span key={flag} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                {flag}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              No health flags
            </span>
          )}
        </div>
      </div>
      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-500" />
    </div>
  );
};

const cloneRoles = (items: UnitOtRoleDefinition[]) =>
  items.map((role) => ({
    ...role,
    assignments: role.assignments.map((assignment) => ({ ...assignment })),
  }));

const updateRoleCounts = (roles: UnitOtRoleDefinition[]) =>
  roles.map((role) => {
    const occupiedCount = role.assignments.length;
    return {
      ...role,
      occupiedCount,
      availableSlots: role.capacity == null ? null : Math.max(role.capacity - occupiedCount, 0),
    };
  });

const moveAssignmentLocally = (
  roles: UnitOtRoleDefinition[],
  resident: Resident,
  targetRoleId: string,
) => {
  const residentName = `${resident.firstName} ${resident.surname}`;
  const existingRole = roles.find((role) => role.assignments.some((assignment) => assignment.episodeId === resident.episodeId));
  const existingAssignment = existingRole?.assignments.find((assignment) => assignment.episodeId === resident.episodeId) ?? null;
  const nextRoles = roles.map((role) => ({
    ...role,
    assignments: role.assignments.filter((assignment) => assignment.episodeId !== resident.episodeId),
  }));

  const targetRole = nextRoles.find((role) => role.id === targetRoleId);
  if (!targetRole || !resident.episodeId) {
    return { roles, message: `${residentName} could not be moved.` };
  }

  const nextAssignment: UnitOtRoleAssignment = existingAssignment
    ? { ...existingAssignment, roleId: targetRole.id }
    : {
        id: `temp-${resident.episodeId}`,
        roleId: targetRole.id,
        residentGuid: resident.residentGuid ?? "",
        episodeId: resident.episodeId,
        residentCaseId: resident.residentCaseId ?? null,
        residentId: resident.id,
        firstName: resident.firstName,
        surname: resident.surname,
        weekNumber: resident.weekNumber,
        roomNumber: resident.roomNumber,
        photoUrl: resident.photo,
        assignedAtUtc: new Date().toISOString(),
        notes: null,
      };

  targetRole.assignments = [...targetRole.assignments, nextAssignment].sort((left, right) => {
    const surnameCompare = left.surname.localeCompare(right.surname, undefined, { sensitivity: "base" });
    return surnameCompare !== 0 ? surnameCompare : left.firstName.localeCompare(right.firstName, undefined, { sensitivity: "base" });
  });

  return {
    roles: updateRoleCounts(nextRoles),
    message: existingAssignment
      ? `${residentName} moved to ${targetRole.name}.`
      : `${residentName} assigned to ${targetRole.name}.`,
  };
};

const releaseAssignmentLocally = (roles: UnitOtRoleDefinition[], resident: Resident) => {
  const residentName = `${resident.firstName} ${resident.surname}`;
  const nextRoles = roles.map((role) => ({
    ...role,
    assignments: role.assignments.filter((assignment) => assignment.episodeId !== resident.episodeId),
  }));

  return {
    roles: updateRoleCounts(nextRoles),
    message: `${residentName} moved back to unassigned.`,
  };
};

export default function OperationsSection({ unitId }: { unitId: UnitId }) {
  const { data: session, status } = useSession();
  const { loadKeys, t } = useLocalization();
  const [roles, setRoles] = useState<UnitOtRoleDefinition[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [dragResident, setDragResident] = useState<DragResident | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadKeys([
      "operations.loading",
      "operations.unable_to_load",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const loadData = React.useCallback(async () => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [roleResponse, residentResponse] = await Promise.all([
        operationsService.getOtRoles(unitId, session?.accessToken),
        residentService.getResidents(unitId, session?.accessToken),
      ]);

      setRoles(updateRoleCounts(cloneRoles(roleResponse)));
      setResidents(
        residentResponse
          .filter((resident) => resident.episodeId)
          .sort((left, right) => {
            const roomCompare = left.roomNumber.localeCompare(right.roomNumber, undefined, { numeric: true, sensitivity: "base" });
            if (roomCompare !== 0) {
              return roomCompare;
            }

            const surnameCompare = left.surname.localeCompare(right.surname, undefined, { sensitivity: "base" });
            return surnameCompare !== 0 ? surnameCompare : left.firstName.localeCompare(right.firstName, undefined, { sensitivity: "base" });
          }),
      );
      setError(null);
    } catch (loadError) {
      setRoles([]);
      setResidents([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load OT roles.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, unitId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeAssignments = useMemo(
    () => roles.flatMap((role) => role.assignments.map((assignment) => ({ ...assignment, roleName: role.name, roleType: role.roleType }))),
    [roles],
  );

  const assignmentByEpisodeId = useMemo(
    () => new Map(activeAssignments.map((assignment) => [assignment.episodeId, assignment])),
    [activeAssignments],
  );

  const residentsByEpisodeId = useMemo(
    () => new Map(residents.filter((resident) => resident.episodeId).map((resident) => [resident.episodeId as string, resident])),
    [residents],
  );

  const unassignedResidents = useMemo(
    () => residents.filter((resident) => !resident.episodeId || !assignmentByEpisodeId.has(resident.episodeId)),
    [assignmentByEpisodeId, residents],
  );

  const groupedRoles = useMemo<RoleGroup[]>(() => {
    const buckets = new Map<string, RoleGroup>();

    roles.forEach((role) => {
      const meta = getRoleGroupMeta(role.roleType);
      const current = buckets.get(meta.key) ?? { ...meta, roles: [] };
      current.roles.push(role);
      buckets.set(meta.key, current);
    });

    return ["internal", "external", "hybrid"]
      .map((key) => buckets.get(key))
      .filter((group): group is RoleGroup => Boolean(group));
  }, [roles]);

  const beginDrag = (payload: DragResident) => {
    const currentAssignment = assignmentByEpisodeId.get(payload.episodeId);
    setDragResident({
      ...payload,
      currentAssignmentId: currentAssignment?.id,
      currentRoleId: currentAssignment?.roleId,
    });
    setMessage(null);
  };

  const endDrag = () => {
    setDragResident(null);
    setDropTarget(null);
  };

  const assignResidentToRole = async (role: UnitOtRoleDefinition) => {
    if (!dragResident) {
      return;
    }

    const resident = residentsByEpisodeId.get(dragResident.episodeId);
    if (!resident) {
      endDrag();
      return;
    }

    const previousRoles = cloneRoles(roles);
    const optimistic = moveAssignmentLocally(cloneRoles(roles), resident, role.id);

    setRoles(optimistic.roles);
    setMessage(optimistic.message);
    setSaving(true);
    endDrag();

    try {
      const persistedAssignment = await operationsService.assignOtRole(
        unitId,
        {
          episodeId: resident.episodeId ?? "",
          roleId: role.id,
        },
        session?.accessToken,
      );

      setRoles((current) =>
        updateRoleCounts(current.map((currentRole) => (
          currentRole.id !== role.id
            ? currentRole
            : {
                ...currentRole,
                assignments: currentRole.assignments.map((assignment) => (
                  assignment.episodeId === persistedAssignment.episodeId
                    ? { ...persistedAssignment }
                    : assignment
                )),
              }
        ))),
      );
    } catch (nextError) {
      setRoles(updateRoleCounts(previousRoles));
      setMessage(nextError instanceof Error ? nextError.message : "Unable to assign OT role.");
    } finally {
      setSaving(false);
    }
  };

  const releaseResidentRole = async () => {
    if (!dragResident?.currentAssignmentId) {
      endDrag();
      return;
    }

    const resident = residentsByEpisodeId.get(dragResident.episodeId);
    if (!resident) {
      endDrag();
      return;
    }

    const previousRoles = cloneRoles(roles);
    const optimistic = releaseAssignmentLocally(cloneRoles(roles), resident);

    setRoles(optimistic.roles);
    setMessage(optimistic.message);
    setSaving(true);
    endDrag();

    try {
      await operationsService.releaseOtRole(unitId, dragResident.currentAssignmentId, session?.accessToken);
    } catch (nextError) {
      setRoles(updateRoleCounts(previousRoles));
      setMessage(nextError instanceof Error ? nextError.message : "Unable to release OT role.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">{text("operations.loading", "Loading OT roles...")}</div>;
  }

  if (!isAuthorizedClient(status, session?.accessToken)) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">Please sign in to manage OT roles.</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_32%,#eff6ff_100%)] shadow-sm">
        <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Unit Operations</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">OT Role Board</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Drag residents directly onto roles. Internal and external duties are split out, capacity is visible, and dropping a resident into the unassigned lane releases their current role without refreshing the board.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 backdrop-blur">
              <span className="font-semibold text-slate-900">{unassignedResidents.length}</span> unassigned
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 backdrop-blur">
              <span className="font-semibold text-slate-900">{activeAssignments.length}</span> active placements
            </div>
          </div>
        </div>
        {message ? (
          <div className="border-t border-slate-200 bg-white/70 px-6 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.95fr)_minmax(0,2.05fr)]">
        <section
          onDragOver={(event) => {
            if (!dragResident?.currentAssignmentId || saving) {
              return;
            }

            event.preventDefault();
            setDropTarget("unassigned");
          }}
          onDragLeave={() => {
            if (dropTarget === "unassigned") {
              setDropTarget(null);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            void releaseResidentRole();
          }}
          className={`rounded-[26px] border bg-white p-5 shadow-sm transition ${
            dropTarget === "unassigned"
              ? "border-rose-300 bg-rose-50 ring-2 ring-rose-200"
              : "border-slate-200"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Residents Awaiting Role</h3>
              <p className="mt-1 text-sm text-slate-600">Drag any resident into a role card. Drop an assigned resident back here to release them.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {unassignedResidents.length} open
            </div>
          </div>

          {dragResident?.currentAssignmentId ? (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              <ArrowRightLeft className="h-4 w-4" />
              Drop here to remove the current OT role.
            </div>
          ) : null}

          <div className="space-y-3">
            {unassignedResidents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Everyone currently has a role.
              </div>
            ) : (
              unassignedResidents.map((resident) => (
                <ResidentTile
                  key={resident.episodeId ?? resident.id}
                  resident={resident}
                  roleLabel={null}
                  onDragStart={beginDrag}
                  onDragEnd={endDrag}
                  isDragging={dragResident?.episodeId === resident.episodeId}
                />
              ))
            )}
          </div>
        </section>

        <div className="space-y-6">
          {groupedRoles.map((group) => (
            <section key={group.key} className={`rounded-[26px] border bg-gradient-to-br ${group.accentClass} p-5 shadow-sm`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{group.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{group.subtitle}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur">
                  {group.roles.length} roles
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {group.roles.map((role) => {
                  const canDrop = canDropResidentIntoRole(dragResident, role);
                  const isDropTarget = dropTarget === role.id;
                  return (
                    <article
                      key={role.id}
                      onDragOver={(event) => {
                        if (!canDrop || saving) {
                          return;
                        }

                        event.preventDefault();
                        setDropTarget(role.id);
                      }}
                      onDragLeave={() => {
                        if (dropTarget === role.id) {
                          setDropTarget(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!canDrop || saving) {
                          endDrag();
                          return;
                        }

                        void assignResidentToRole(role);
                      }}
                      className={`rounded-[24px] border bg-white/85 p-4 shadow-sm backdrop-blur transition ${
                        isDropTarget
                          ? "border-blue-300 ring-2 ring-blue-200"
                          : canDrop && dragResident
                            ? "border-slate-300"
                            : "border-white/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-slate-950">{role.name}</h4>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{role.roleType}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {formatCapacity(role)}
                          </span>
                          {role.requiresTraining ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Training
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {dragResident ? (
                        <div className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${
                          canDrop
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}>
                          {canDrop ? `Drop ${dragResident.residentName} here` : "Role is full"}
                        </div>
                      ) : null}

                      <div className="mt-4 space-y-3">
                        {role.assignments.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            No residents assigned.
                          </div>
                        ) : (
                          role.assignments.map((assignment) => {
                            const resident = residentsByEpisodeId.get(assignment.episodeId);
                            if (!resident) {
                              return null;
                            }

                            return (
                              <ResidentTile
                                key={assignment.id}
                                resident={resident}
                                roleLabel={`${role.name} | ${role.roleType}`}
                                onDragStart={beginDrag}
                                onDragEnd={endDrag}
                                isDragging={dragResident?.episodeId === resident.episodeId}
                              />
                            );
                          })
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
