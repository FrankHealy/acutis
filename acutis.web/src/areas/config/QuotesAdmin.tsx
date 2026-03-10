"use client";

import { useEffect, useMemo, useState } from "react";
import { quoteService, type QuoteRecord, type UnitQuoteCuration } from "@/services/quoteService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";

const units: UnitId[] = ["alcohol", "detox", "drugs", "ladies"];

const emptyQuote: Omit<QuoteRecord, "id"> = {
  text: "",
  attribution: "",
  sourceWork: "",
  sourceNotes: "",
  language: "en",
  pronunciationGuide: "",
  tags: [],
  isActive: true,
};

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [curation, setCuration] = useState<UnitQuoteCuration[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitId>("alcohol");
  const [form, setForm] = useState<Omit<QuoteRecord, "id">>(emptyQuote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterAttribution, setFilterAttribution] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = async () => {
    const result = await quoteService.getQuotes({
      attribution: filterAttribution || undefined,
      language: filterLanguage || undefined,
      tag: filterTag || undefined,
    });
    setQuotes(result);
  };

  const loadCuration = async () => {
    const result = await quoteService.getUnitCuration(selectedUnit);
    setCuration(result);
  };

  useEffect(() => {
    void loadQuotes();
  }, []);

  useEffect(() => {
    void loadCuration();
  }, [selectedUnit]);

  const onSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await loadQuotes();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const submitQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      const payload = {
        ...form,
        tags: form.tags.filter(Boolean),
      };
      if (editingId) {
        await quoteService.updateQuote(editingId, payload);
      } else {
        await quoteService.createQuote(payload);
      }
      setForm(emptyQuote);
      setEditingId(null);
      await loadQuotes();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEdit = (quote: QuoteRecord) => {
    setEditingId(quote.id);
    setForm({
      text: quote.text,
      attribution: quote.attribution,
      sourceWork: quote.sourceWork ?? "",
      sourceNotes: quote.sourceNotes ?? "",
      language: quote.language,
      pronunciationGuide: quote.pronunciationGuide ?? "",
      tags: quote.tags,
      isActive: quote.isActive,
    });
  };

  const filteredCuration = useMemo(
    () =>
      curation
        .map((row) => ({
          ...row,
          quote: quotes.find((quote) => quote.id === row.quoteId),
        }))
        .sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)),
    [curation, quotes]
  );

  const setCurationField = async (
    quoteId: string,
    patch: Partial<Pick<UnitQuoteCuration, "weight" | "displayOrder" | "pinnedFrom" | "pinnedTo" | "isExcluded">>
  ) => {
    const current = curation.find((x) => x.quoteId === quoteId);
    try {
      setError(null);
      await quoteService.upsertUnitCuration(selectedUnit, {
        quoteId,
        weight: patch.weight ?? current?.weight ?? null,
        displayOrder: patch.displayOrder ?? current?.displayOrder ?? null,
        pinnedFrom: patch.pinnedFrom ?? current?.pinnedFrom ?? null,
        pinnedTo: patch.pinnedTo ?? current?.pinnedTo ?? null,
        isExcluded: patch.isExcluded ?? current?.isExcluded ?? false,
      });
      await loadCuration();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Quote Library (Global)</h2>
        <p className="mt-1 text-sm text-gray-600">Search and edit intellectually serious + wry quotes, multilingual supported.</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <form onSubmit={onSearch} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm grid gap-3 md:grid-cols-4">
        <input value={filterAttribution} onChange={(e) => setFilterAttribution(e.target.value)} placeholder="Filter attribution" className="rounded border px-3 py-2 text-sm" />
        <input value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} placeholder="Filter language" className="rounded border px-3 py-2 text-sm" />
        <input value={filterTag} onChange={(e) => setFilterTag(e.target.value)} placeholder="Filter tag" className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
      </form>

      <form onSubmit={submitQuote} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{editingId ? "Edit Quote" : "Add Quote"}</h3>
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Quote text" className="w-full rounded border px-3 py-2 text-sm" rows={3} />
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.attribution} onChange={(e) => setForm({ ...form, attribution: e.target.value })} placeholder="Attribution" className="rounded border px-3 py-2 text-sm" />
          <input value={form.sourceWork ?? ""} onChange={(e) => setForm({ ...form, sourceWork: e.target.value })} placeholder="Source work" className="rounded border px-3 py-2 text-sm" />
          <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Language (BCP-47)" className="rounded border px-3 py-2 text-sm" />
          <input value={form.tags.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Tags (comma separated)" className="rounded border px-3 py-2 text-sm" />
        </div>
        <textarea value={form.sourceNotes ?? ""} onChange={(e) => setForm({ ...form, sourceNotes: e.target.value })} placeholder="Source notes / disputed attribution notes" className="w-full rounded border px-3 py-2 text-sm" rows={2} />
        {form.language.trim().toLowerCase() !== "en" && (
          <input value={form.pronunciationGuide ?? ""} onChange={(e) => setForm({ ...form, pronunciationGuide: e.target.value })} placeholder="Pronunciation guide" className="w-full rounded border px-3 py-2 text-sm" />
        )}
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-2">
          <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{editingId ? "Save Quote" : "Create Quote"}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyQuote); }} className="rounded border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Quotes</h3>
        <div className="mt-3 space-y-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded border border-gray-200 p-3">
              <p className="text-sm text-gray-800">“{quote.text}”</p>
              <p className="mt-1 text-xs font-semibold text-gray-600">{quote.attribution}</p>
              <p className="mt-1 text-xs text-gray-500">{quote.language} | {quote.isActive ? "active" : "inactive"}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => startEdit(quote)} className="rounded border px-2 py-1 text-xs">Edit</button>
                <button onClick={() => void quoteService.deleteQuote(quote.id).then(loadQuotes)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Unit Quote Curation</h3>
          <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value as UnitId)} className="rounded border px-3 py-2 text-sm">
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          {quotes.map((quote) => {
            const row = filteredCuration.find((x) => x.quoteId === quote.id);
            return (
              <div key={quote.id} className="rounded border border-gray-200 p-3">
                <p className="text-sm text-gray-800">{quote.attribution}: {quote.text.slice(0, 100)}...</p>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <input type="number" placeholder="Weight" value={row?.weight ?? ""} onChange={(e) => void setCurationField(quote.id, { weight: e.target.value ? Number(e.target.value) : null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="number" placeholder="Order" value={row?.displayOrder ?? ""} onChange={(e) => void setCurationField(quote.id, { displayOrder: e.target.value ? Number(e.target.value) : null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="date" value={row?.pinnedFrom ?? ""} onChange={(e) => void setCurationField(quote.id, { pinnedFrom: e.target.value || null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="date" value={row?.pinnedTo ?? ""} onChange={(e) => void setCurationField(quote.id, { pinnedTo: e.target.value || null })} className="rounded border px-2 py-1 text-xs" />
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={row?.isExcluded ?? false} onChange={(e) => void setCurationField(quote.id, { isExcluded: e.target.checked })} />
                    Excluded
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
