"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import type { UnitId } from "../unit/unitTypes";
import { incidentService, type IncidentRecord } from "@/services/incidentService";

type IncidentsSectionProps = {
  unitId: UnitId;
  unitName: string;
  refreshKey?: number;
  onOpenIncidentCapture: () => void;
};

const formatScope = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function IncidentsSection({
  unitId,
  unitName,
  refreshKey = 0,
  onOpenIncidentCapture,
}: IncidentsSectionProps) {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await incidentService.getIncidents(unitId, session?.accessToken);
        if (active) {
          setIncidents(rows);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load incidents.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [refreshKey, session?.accessToken, unitId]);

  const summary = useMemo(() => {
    const residentCount = incidents.filter((incident) => incident.scope === "resident").length;
    const unitCount = incidents.filter((incident) => incident.scope === "unit").length;
    const centreCount = incidents.filter((incident) => incident.scope === "centre").length;
    return { residentCount, unitCount, centreCount };
  }, [incidents]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Incidents
            </h2>
            <p className="mt-1 text-sm text-gray-500">{unitName} operational incidents across resident, unit, and centre scope.</p>
          </div>
          <button
            type="button"
            onClick={onOpenIncidentCapture}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            New Incident
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">Resident Scope</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{summary.residentCount}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">Unit Scope</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{summary.unitCount}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">Centre Scope</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{summary.centreCount}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading incidents...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No incidents recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Occurred</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Resident</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(incident.occurredAtUtc).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{incident.incidentTypeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatScope(incident.scope)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{incident.residentName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{incident.summary}</div>
                      {incident.notes && <div className="mt-1 text-xs text-gray-500">{incident.notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
