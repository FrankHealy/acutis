"use client";

import { useMemo, useState } from "react";
import type { JsonValue } from "@/areas/screening/forms/ApiClient";
import { useSectionDictation } from "@/features/voice/useSectionDictation";
import {
  mapTranscriptToSectionFields,
  type SectionDefinition,
  type SuggestedPatch,
} from "@/features/voice/voiceAssistMapper";

type SectionDictationPanelProps = {
  sectionDefinition: SectionDefinition;
  currentValues: Record<string, JsonValue>;
  locale: string;
  onApplyPatches: (patches: SuggestedPatch[]) => void;
};

const formatProposedValue = (value: JsonValue): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null) {
    return "Empty";
  }

  return JSON.stringify(value);
};

export default function SectionDictationPanel({
  sectionDefinition,
  currentValues,
  locale,
  onApplyPatches,
}: SectionDictationPanelProps) {
  const dictation = useSectionDictation(locale);
  const [suggestedPatches, setSuggestedPatches] = useState<SuggestedPatch[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [isTranscriptCollapsed, setIsTranscriptCollapsed] = useState(false);
  const [hasMappedTranscript, setHasMappedTranscript] = useState(false);

  const selectedPatches = useMemo(
    () => suggestedPatches.filter((patch) => selectedFieldKeys.includes(patch.fieldKey)),
    [selectedFieldKeys, suggestedPatches]
  );

  const applyToFields = () => {
    const patches = mapTranscriptToSectionFields(sectionDefinition, currentValues, dictation.transcript);
    setSuggestedPatches(patches);
    setSelectedFieldKeys(patches.map((patch) => patch.fieldKey));
    setIsTranscriptCollapsed(false);
    setHasMappedTranscript(true);
  };

  const confirmSelectedPatches = () => {
    onApplyPatches(selectedPatches);
    setIsTranscriptCollapsed(true);
  };

  const clearAll = () => {
    dictation.clear();
    setSuggestedPatches([]);
    setSelectedFieldKeys([]);
    setIsTranscriptCollapsed(false);
    setHasMappedTranscript(false);
  };

  return (
    <div className="space-y-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-sky-950">Dictate section notes</h3>
          <p className="mt-1 text-xs text-sky-800">
            Voice assist is a drafting aid. Review all suggested values before saving.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
            onClick={dictation.start}
            disabled={dictation.isListening}
          >
            Start
          </button>
          <button
            type="button"
            className="rounded border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
            onClick={dictation.stop}
            disabled={!dictation.isListening}
          >
            Stop
          </button>
          <button
            type="button"
            className="rounded border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100"
            onClick={clearAll}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
            onClick={applyToFields}
            disabled={!dictation.transcript.trim()}
          >
            Find Suggestions
          </button>
        </div>
      </div>

      {!dictation.isSupported && (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Browser dictation is not available here. You can type or paste section notes below and still map them to fields.
        </p>
      )}
      {dictation.error && <p className="text-xs text-rose-700">{dictation.error}</p>}

      <div className="space-y-2">
        {isTranscriptCollapsed ? (
          <button
            type="button"
            className="text-xs font-semibold text-sky-800 underline"
            onClick={() => setIsTranscriptCollapsed(false)}
          >
            Show transcript preview
          </button>
        ) : (
          <textarea
            className="min-h-20 w-full rounded border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900"
            value={dictation.transcript}
            placeholder="Dictated or typed notes for this section only."
            onChange={(event) => {
              dictation.setTranscript(event.target.value);
              setHasMappedTranscript(false);
            }}
          />
        )}
      </div>

      {suggestedPatches.length > 0 && (
        <div className="space-y-2 rounded border border-amber-200 bg-amber-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
              Suggested values
            </p>
            <button
              type="button"
              className="rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
              onClick={confirmSelectedPatches}
              disabled={selectedPatches.length === 0}
            >
              Confirm Apply Suggestions
            </button>
          </div>
          <div className="space-y-2">
            {suggestedPatches.map((patch) => {
              const checked = selectedFieldKeys.includes(patch.fieldKey);
              const label = sectionDefinition.labels[patch.fieldKey] ?? patch.fieldKey;
              return (
                <label
                  key={patch.fieldKey}
                  className="flex gap-3 rounded border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-amber-300"
                    checked={checked}
                    onChange={(event) => {
                      setSelectedFieldKeys((current) =>
                        event.target.checked
                          ? [...current, patch.fieldKey]
                          : current.filter((fieldKey) => fieldKey !== patch.fieldKey)
                      );
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{label}</span>
                    <span className="mt-1 block rounded bg-amber-100 px-2 py-1 font-medium text-amber-950">
                      {formatProposedValue(patch.proposedValue)}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">{patch.rationale}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {hasMappedTranscript && suggestedPatches.length === 0 && dictation.transcript.trim() && (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No field suggestions were found for this section. Try saying field names such as “First name is...”,
          “Surname is...”, or “Date of birth is...”.
        </p>
      )}

      {!hasMappedTranscript && suggestedPatches.length === 0 && dictation.transcript.trim() && (
        <p className="text-xs text-sky-800">
          Use Find Suggestions to generate candidate values for this section. Nothing is saved until you confirm suggestions
          and use the form save controls.
        </p>
      )}
    </div>
  );
}
