"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { isAuthorizedClient } from "@/lib/authMode";
import type { UnitId } from "../unit/unitTypes";
import type { Resident } from "@/services/mockDataService";
import { residentService } from "@/services/residentService";
import { incidentService, type IncidentTypeRecord } from "@/services/incidentService";

export type IncidentPrefill = {
  scope?: "resident" | "unit" | "centre";
  resident?: Resident | null;
};

type IncidentCaptureModalProps = {
  open: boolean;
  unitId: UnitId;
  unitName: string;
  prefill?: IncidentPrefill | null;
  onClose: () => void;
  onCreated?: () => void;
};

const toLocalDateTimeInput = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function IncidentCaptureModal({
  open,
  unitId,
  unitName,
  prefill,
  onClose,
  onCreated,
}: IncidentCaptureModalProps) {
  const { data: session, status } = useSession();
  const [incidentTypes, setIncidentTypes] = useState<IncidentTypeRecord[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentTypeId, setIncidentTypeId] = useState<number>(0);
  const [scope, setScope] = useState<"resident" | "unit" | "centre">("unit");
  const [selectedResidentGuid, setSelectedResidentGuid] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState(toLocalDateTimeInput(new Date()));
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");

  const residentOptions = useMemo(
    () => residents.filter((resident) => resident.residentGuid),
    [residents],
  );

  const selectedResident = useMemo(
    () => residentOptions.find((resident) => resident.residentGuid === selectedResidentGuid) ?? null,
    [residentOptions, selectedResidentGuid],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [typeRows, residentRows] = await Promise.all([
          incidentService.getIncidentTypes(session?.accessToken),
          residentService.getResidents(unitId, session?.accessToken),
        ]);

        if (!active) {
          return;
        }

        setIncidentTypes(typeRows);
        setResidents(residentRows);
        setIncidentTypeId((current) => current || typeRows[0]?.id || 0);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load incident form.");
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
  }, [open, session?.accessToken, unitId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setScope(prefill?.resident?.residentGuid ? "resident" : prefill?.scope ?? "unit");
    setSelectedResidentGuid(prefill?.resident?.residentGuid ?? "");
    setOccurredAt(toLocalDateTimeInput(new Date()));
    setSummary("");
    setNotes("");
    setError(null);
  }, [open, prefill]);

  const handleSubmit = async () => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      setError("Session expired. Please sign in again.");
      return;
    }

    if (!incidentTypeId) {
      setError("Incident type is required.");
      return;
    }

    if (!summary.trim()) {
      setError("Summary is required.");
      return;
    }

    if (scope === "resident" && !selectedResident?.residentGuid) {
      setError("Resident is required for resident-scope incidents.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await incidentService.createIncident(
        unitId,
        {
          incidentTypeId,
          scope,
          residentId: scope === "resident" ? selectedResident?.residentGuid ?? null : null,
          residentCaseId: scope === "resident" ? selectedResident?.residentCaseId ?? null : null,
          episodeId: scope === "resident" ? selectedResident?.episodeId ?? null : null,
          occurredAtUtc: new Date(occurredAt).toISOString(),
          summary: summary.trim(),
          notes: notes.trim() || null,
          detailsJson: "{}",
        },
        session?.accessToken,
      );

      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create incident.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">New Incident</h2>
          <p className="mt-1 text-sm text-gray-500">{unitName} incident capture</p>
        </div>

        <div className="space-y-5 px-6 py-5">
          {loading ? (
            <div className="text-sm text-gray-500">Loading incident form...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Incident Type</label>
                  <select
                    value={incidentTypeId}
                    onChange={(event) => setIncidentTypeId(Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value={0}>Select type</option>
                    {incidentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.defaultName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Occurred At</label>
                  <input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(event) => setOccurredAt(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Scope</label>
                <div className="flex flex-wrap gap-3">
                  {(["resident", "unit", "centre"] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                      <input
                        type="radio"
                        name="incidentScope"
                        value={value}
                        checked={scope === value}
                        onChange={() => setScope(value)}
                        className="accent-blue-600"
                      />
                      <span className="capitalize">{value}</span>
                    </label>
                  ))}
                </div>
              </div>

              {scope === "resident" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Resident</label>
                    <select
                      value={selectedResidentGuid}
                      onChange={(event) => setSelectedResidentGuid(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select resident</option>
                      {residentOptions.map((resident) => (
                        <option key={resident.id} value={resident.residentGuid ?? ""}>
                          {resident.firstName} {resident.surname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <div>Episode: {selectedResident?.centreEpisodeCode ?? "Not set"}</div>
                    <div>Case: {selectedResident?.residentCaseId ?? "Not set"}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Notes / Details</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading || saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Incident"}
          </button>
        </div>
      </div>
    </div>
  );
}
