"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { quoteService, type QuoteRecord, type UnitQuoteCuration } from "@/services/quoteService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

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
  const { loadKeys, t } = useLocalization();
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [curation, setCuration] = useState<UnitQuoteCuration[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitId>("alcohol");
  const [form, setForm] = useState<Omit<QuoteRecord, "id">>(emptyQuote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterAttribution, setFilterAttribution] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadKeys([
      "quotes.title",
      "quotes.description",
      "quotes.filter_attribution",
      "quotes.filter_language",
      "quotes.filter_tag",
      "quotes.search",
      "quotes.edit",
      "quotes.add",
      "quotes.text",
      "quotes.attribution",
      "quotes.source_work",
      "quotes.language",
      "quotes.tags",
      "quotes.source_notes",
      "quotes.pronunciation",
      "quotes.active",
      "quotes.save",
      "quotes.create",
      "quotes.cancel",
      "quotes.list_title",
      "quotes.state.active",
      "quotes.state.inactive",
      "quotes.delete",
      "quotes.curation_title",
      "quotes.weight",
      "quotes.order",
      "quotes.excluded",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const fetchQuotes = useCallback(async () => {
    return quoteService.getQuotes({
      attribution: filterAttribution || undefined,
      language: filterLanguage || undefined,
      tag: filterTag || undefined,
    });
  }, [filterAttribution, filterLanguage, filterTag]);

  const fetchCuration = useCallback(async () => {
    return quoteService.getUnitCuration(selectedUnit);
  }, [selectedUnit]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const result = await fetchQuotes();
      if (active) {
        setQuotes(result);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [fetchQuotes]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const result = await fetchCuration();
      if (active) {
        setCuration(result);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [fetchCuration]);

  const onSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      setQuotes(await fetchQuotes());
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
      setQuotes(await fetchQuotes());
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
      setCuration(await fetchCuration());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{text("quotes.title", "Quote Library (Global)")}</h2>
        <p className="mt-1 text-sm text-gray-600">{text("quotes.description", "Search and edit multilingual quotes.")}</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <form onSubmit={onSearch} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm grid gap-3 md:grid-cols-4">
        <input value={filterAttribution} onChange={(e) => setFilterAttribution(e.target.value)} placeholder={text("quotes.filter_attribution", "Filter attribution")} className="rounded border px-3 py-2 text-sm" />
        <input value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} placeholder={text("quotes.filter_language", "Filter language")} className="rounded border px-3 py-2 text-sm" />
        <input value={filterTag} onChange={(e) => setFilterTag(e.target.value)} placeholder={text("quotes.filter_tag", "Filter tag")} className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{text("quotes.search", "Search")}</button>
      </form>

      <form onSubmit={submitQuote} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{editingId ? text("quotes.edit", "Edit Quote") : text("quotes.add", "Add Quote")}</h3>
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder={text("quotes.text", "Quote text")} className="w-full rounded border px-3 py-2 text-sm" rows={3} />
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.attribution} onChange={(e) => setForm({ ...form, attribution: e.target.value })} placeholder={text("quotes.attribution", "Attribution")} className="rounded border px-3 py-2 text-sm" />
          <input value={form.sourceWork ?? ""} onChange={(e) => setForm({ ...form, sourceWork: e.target.value })} placeholder={text("quotes.source_work", "Source work")} className="rounded border px-3 py-2 text-sm" />
          <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder={text("quotes.language", "Language (BCP-47)")} className="rounded border px-3 py-2 text-sm" />
          <input value={form.tags.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder={text("quotes.tags", "Tags (comma separated)")} className="rounded border px-3 py-2 text-sm" />
        </div>
        <textarea value={form.sourceNotes ?? ""} onChange={(e) => setForm({ ...form, sourceNotes: e.target.value })} placeholder={text("quotes.source_notes", "Source notes / disputed attribution notes")} className="w-full rounded border px-3 py-2 text-sm" rows={2} />
        {form.language.trim().toLowerCase() !== "en" && (
          <input value={form.pronunciationGuide ?? ""} onChange={(e) => setForm({ ...form, pronunciationGuide: e.target.value })} placeholder={text("quotes.pronunciation", "Pronunciation guide")} className="w-full rounded border px-3 py-2 text-sm" />
        )}
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          {text("quotes.active", "Active")}
        </label>
        <div className="flex gap-2">
          <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{editingId ? text("quotes.save", "Save Quote") : text("quotes.create", "Create Quote")}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyQuote); }} className="rounded border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {text("quotes.cancel", "Cancel")}
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{text("quotes.list_title", "Quotes")}</h3>
        <div className="mt-3 space-y-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded border border-gray-200 p-3">
              <p className="text-sm text-gray-800">&quot;{quote.text}&quot;</p>
              <p className="mt-1 text-xs font-semibold text-gray-600">{quote.attribution}</p>
              <p className="mt-1 text-xs text-gray-500">{quote.language} | {quote.isActive ? text("quotes.state.active", "active") : text("quotes.state.inactive", "inactive")}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => startEdit(quote)} className="rounded border px-2 py-1 text-xs">{text("quotes.edit", "Edit Quote")}</button>
                <button onClick={() => void quoteService.deleteQuote(quote.id).then(async () => setQuotes(await fetchQuotes()))} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">{text("quotes.delete", "Delete")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{text("quotes.curation_title", "Unit Quote Curation")}</h3>
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
                  <input type="number" placeholder={text("quotes.weight", "Weight")} value={row?.weight ?? ""} onChange={(e) => void setCurationField(quote.id, { weight: e.target.value ? Number(e.target.value) : null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="number" placeholder={text("quotes.order", "Order")} value={row?.displayOrder ?? ""} onChange={(e) => void setCurationField(quote.id, { displayOrder: e.target.value ? Number(e.target.value) : null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="date" value={row?.pinnedFrom ?? ""} onChange={(e) => void setCurationField(quote.id, { pinnedFrom: e.target.value || null })} className="rounded border px-2 py-1 text-xs" />
                  <input type="date" value={row?.pinnedTo ?? ""} onChange={(e) => void setCurationField(quote.id, { pinnedTo: e.target.value || null })} className="rounded border px-2 py-1 text-xs" />
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={row?.isExcluded ?? false} onChange={(e) => void setCurationField(quote.id, { isExcluded: e.target.checked })} />
                    {text("quotes.excluded", "Excluded")}
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

