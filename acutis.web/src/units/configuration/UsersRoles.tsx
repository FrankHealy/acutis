"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserCog,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  GripVertical,
} from "lucide-react";

type Role = string;

type StaffMember = {
  id: string;
  name: string;
  role: Role;
  unit: "Alcohol" | "Detox" | "Drugs" | "Ladies";
};

const InitialRoles: Role[] = [
  "Reception",
  "Unit Admin",
  "Nurse",
  "Unit Counsellor",
  "Unit Facilitator",
  "Super Admin",
];

const InitialStaff: StaffMember[] = [
  { id: "staff-01", name: "Ava Murphy", role: "Reception", unit: "Detox" },
  { id: "staff-02", name: "Liam O'Brien", role: "Unit Admin", unit: "Alcohol" },
  { id: "staff-03", name: "Ella Byrne", role: "Nurse", unit: "Drugs" },
  { id: "staff-04", name: "Noah Walsh", role: "Unit Counsellor", unit: "Detox" },
  { id: "staff-05", name: "Saoirse Kelly", role: "Unit Facilitator", unit: "Ladies" },
  { id: "staff-06", name: "Jack Ryan", role: "Nurse", unit: "Alcohol" },
  { id: "staff-07", name: "Grace Doyle", role: "Unit Counsellor", unit: "Drugs" },
  { id: "staff-08", name: "Ethan Nolan", role: "Reception", unit: "Alcohol" },
  { id: "staff-09", name: "Mia Casey", role: "Unit Admin", unit: "Ladies" },
  { id: "staff-10", name: "Finn Gallagher", role: "Unit Facilitator", unit: "Detox" },
  { id: "staff-11", name: "Olivia Bennett", role: "Nurse", unit: "Ladies" },
  { id: "staff-12", name: "Oisin Farrell", role: "Unit Counsellor", unit: "Alcohol" },
  { id: "staff-13", name: "Emma Keane", role: "Unit Facilitator", unit: "Drugs" },
  { id: "staff-14", name: "Cillian Moran", role: "Unit Admin", unit: "Detox" },
  { id: "staff-15", name: "Aoife Byrne", role: "Reception", unit: "Drugs" },
  { id: "staff-16", name: "Darragh Byrne", role: "Nurse", unit: "Detox" },
  { id: "staff-17", name: "Hannah Reid", role: "Unit Counsellor", unit: "Ladies" },
  { id: "staff-18", name: "Luke Moore", role: "Unit Facilitator", unit: "Alcohol" },
  { id: "staff-19", name: "Clara Walsh", role: "Unit Admin", unit: "Drugs" },
  { id: "staff-20", name: "James O'Connor", role: "Nurse", unit: "Alcohol" },
  { id: "staff-21", name: "Orla Fitzgerald", role: "Unit Counsellor", unit: "Detox" },
  { id: "staff-22", name: "Callum Lynch", role: "Unit Facilitator", unit: "Drugs" },
  { id: "staff-23", name: "Niamh Roche", role: "Reception", unit: "Ladies" },
  { id: "staff-24", name: "Conor Byrne", role: "Unit Admin", unit: "Alcohol" },
  { id: "staff-25", name: "Isla Brady", role: "Nurse", unit: "Ladies" },
  { id: "staff-26", name: "Ronan Quinn", role: "Unit Counsellor", unit: "Drugs" },
  { id: "staff-27", name: "Zoe Carroll", role: "Unit Facilitator", unit: "Detox" },
  { id: "staff-28", name: "Sean Kavanagh", role: "Nurse", unit: "Drugs" },
  { id: "staff-29", name: "Lucy Hayes", role: "Reception", unit: "Alcohol" },
  { id: "staff-30", name: "Frank Doyle", role: "Super Admin", unit: "Alcohol" },
];
const rolePalette = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-gray-900 text-white",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];

const UsersRoles: React.FC = () => {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(() => [...InitialRoles]);
  const [staff, setStaff] = useState<StaffMember[]>(() => [...InitialStaff]);
  const [activeRole, setActiveRole] = useState<Role | "All">("All");
  const [newRoleName, setNewRoleName] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    role: InitialRoles[0],
    unit: "Alcohol" as StaffMember["unit"],
  });
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [reassignRole, setReassignRole] = useState<Role | null>(null);

  const filteredStaff = useMemo(() => {
    if (activeRole === "All") return staff;
    return staff.filter((member) => member.role === activeRole);
  }, [activeRole, staff]);

  const getRoleColor = (role: Role) => {
    const index = roles.findIndex((r) => r === role);
    return rolePalette[index % rolePalette.length];
  };

  const addRole = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed || roles.includes(trimmed)) return;
    setRoles((prev) => [...prev, trimmed]);
    setNewRoleName("");
  };

  const addUser = () => {
    const trimmed = newUser.name.trim();
    if (!trimmed) return;
    const nextId = `staff-${String(staff.length + 1).padStart(2, "0")}`;
    setStaff((prev) => [
      ...prev,
      { id: nextId, name: trimmed, role: newUser.role, unit: newUser.unit },
    ]);
    setNewUser((prev) => ({ ...prev, name: "" }));
  };

  const removeUser = (userId: string) => {
    setStaff((prev) => prev.filter((member) => member.id !== userId));
  };

  const requestDeleteRole = (role: Role) => {
    const remainingRoles = roles.filter((r) => r !== role);
    if (remainingRoles.length === 0) return;
    setRoleToDelete(role);
    setReassignRole(remainingRoles[0]);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete || !reassignRole) return;
    setStaff((prev) =>
      prev.map((member) =>
        member.role === roleToDelete ? { ...member, role: reassignRole } : member,
      ),
    );
    setRoles((prev) => prev.filter((role) => role !== roleToDelete));
    setRoleToDelete(null);
    setReassignRole(null);
  };

  const cancelDeleteRole = () => {
    setRoleToDelete(null);
    setReassignRole(null);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, userId: string) => {
    event.dataTransfer.setData("text/plain", userId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, role: Role) => {
    event.preventDefault();
    const userId = event.dataTransfer.getData("text/plain");
    if (!userId) return;
    setStaff((prev) =>
      prev.map((member) => (member.id === userId ? { ...member, role } : member)),
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/configuration")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Configuration</span>
          </button>
          <div className="flex items-center gap-3">
            <UserCog className="h-7 w-7 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Users & Roles</h1>
              <p className="text-gray-600">Manage staff assignments and permissions.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total staff</p>
                <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveRole("All")}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  activeRole === "All" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                All ({staff.length})
              </button>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    activeRole === role ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {role} ({staff.filter((member) => member.role === role).length})
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                  Role management
                </h2>
                <span className="text-xs text-gray-500">{roles.length} roles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    <span>{role}</span>
                    {roles.length > 1 && (
                      <button
                        onClick={() => requestDeleteRole(role)}
                        className="text-gray-400 hover:text-red-500"
                        title={`Delete ${role}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="Add new role"
                  className="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={addRole}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add role
                </button>
              </div>
              {roleToDelete && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Delete role: {roleToDelete}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Reassign users to keep access intact.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={reassignRole ?? ""}
                      onChange={(event) => setReassignRole(event.target.value)}
                      className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-sm"
                    >
                      {roles
                        .filter((role) => role !== roleToDelete)
                        .map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={confirmDeleteRole}
                      className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm font-semibold"
                    >
                      Delete & reassign
                    </button>
                    <button
                      onClick={cancelDeleteRole}
                      className="px-3 py-1 rounded-lg bg-white border border-amber-200 text-amber-700 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Add staff member
                </h2>
              </div>
              <div className="grid gap-3">
                <input
                  value={newUser.name}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Full name"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={newUser.role}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newUser.unit}
                    onChange={(event) =>
                      setNewUser((prev) => ({ ...prev, unit: event.target.value as StaffMember["unit"] }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {["Alcohol", "Detox", "Drugs", "Ladies"].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addUser}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add user
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => {
              const roleMembers = staff.filter((member) => member.role === role);
              return (
                <div
                  key={role}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  onDrop={(event) => handleDrop(event, role)}
                  onDragOver={handleDragOver}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRoleColor(role)}`}>
                      {role}
                    </span>
                    <span className="text-xs text-gray-500">{roleMembers.length} staff</span>
                  </div>
                  <div className="space-y-2 min-h-[120px]">
                    {roleMembers.length === 0 ? (
                      <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg p-3 text-center">
                        Drop staff here
                      </div>
                    ) : (
                      roleMembers.map((member) => (
                        <div
                          key={member.id}
                          draggable
                          onDragStart={(event) => handleDragStart(event, member.id)}
                          className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 cursor-grab hover:shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.unit} Unit</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <GripVertical className="h-4 w-4" />
                            <button
                              onClick={() => removeUser(member.id)}
                              className="text-gray-400 hover:text-red-500"
                              title={`Remove ${member.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
            Tip: Drag staff cards between roles to reassign. Deleting a role requires reassignment.
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersRoles;
