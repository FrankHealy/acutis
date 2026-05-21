import { UNIT_GUIDS } from "./unitIdentity";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { createAuthHeaders } from "@/lib/authMode";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type QuoteOfDay = {
  date: string;
  quote: {
    id: string;
    text: string;
    attribution: string;
    language: string;
    pronunciationGuide?: string | null;
  };
};

export type QuoteRecord = {
  id: string;
  text: string;
  attribution: string;
  sourceWork?: string | null;
  sourceNotes?: string | null;
  language: string;
  pronunciationGuide?: string | null;
  tags: string[];
  isActive: boolean;
};

export type UnitQuoteCuration = {
  id: string;
  unitId: string;
  quoteId: string;
  weight?: number | null;
  displayOrder?: number | null;
  pinnedFrom?: string | null;
  pinnedTo?: string | null;
  isExcluded: boolean;
};

export const quoteService = {
  async getQuoteOfDay(unitId: UnitId): Promise<QuoteOfDay> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/quote-of-the-day`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to load quote of the day (${response.status})`);
    }
    return (await response.json()) as QuoteOfDay;
  },

  async getQuotes(
    filters?: { attribution?: string; language?: string; tag?: string; active?: boolean },
    accessToken?: string | null,
  ): Promise<QuoteRecord[]> {
    const params = new URLSearchParams();
    if (filters?.attribution) params.set("attribution", filters.attribution);
    if (filters?.language) params.set("language", filters.language);
    if (filters?.tag) params.set("tag", filters.tag);
    if (filters?.active !== undefined) params.set("active", String(filters.active));
    const response = await fetch(`${getApiBaseUrl()}/api/quotes?${params.toString()}`, {
      cache: "no-store",
      headers: createAuthHeaders(accessToken),
    });
    if (!response.ok) throw new Error(`Failed to load quotes (${response.status})`);
    return (await response.json()) as QuoteRecord[];
  },

  async createQuote(payload: Omit<QuoteRecord, "id">, accessToken?: string | null): Promise<QuoteRecord> {
    const response = await fetch(`${getApiBaseUrl()}/api/quotes`, {
      method: "POST",
      headers: { ...createAuthHeaders(accessToken), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to create quote (${response.status})`);
    return (await response.json()) as QuoteRecord;
  },

  async updateQuote(id: string, payload: Omit<QuoteRecord, "id">, accessToken?: string | null): Promise<QuoteRecord> {
    const response = await fetch(`${getApiBaseUrl()}/api/quotes/${id}`, {
      method: "PUT",
      headers: { ...createAuthHeaders(accessToken), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to update quote (${response.status})`);
    return (await response.json()) as QuoteRecord;
  },

  async deleteQuote(id: string, accessToken?: string | null): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/api/quotes/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });
    if (!response.ok && response.status !== 204) throw new Error(`Failed to delete quote (${response.status})`);
  },

  async getUnitCuration(unitId: UnitId, accessToken?: string | null): Promise<UnitQuoteCuration[]> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/quote-curation`, {
      cache: "no-store",
      headers: createAuthHeaders(accessToken),
    });
    if (!response.ok) throw new Error(`Failed to load unit curation (${response.status})`);
    return (await response.json()) as UnitQuoteCuration[];
  },

  async upsertUnitCuration(
    unitId: UnitId,
    payload: Omit<UnitQuoteCuration, "id" | "unitId">,
    accessToken?: string | null,
  ): Promise<UnitQuoteCuration> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(`${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/quote-curation`, {
      method: "POST",
      headers: { ...createAuthHeaders(accessToken), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to save unit curation (${response.status})`);
    return (await response.json()) as UnitQuoteCuration;
  },

  async deleteUnitCuration(unitId: UnitId, curationId: string, accessToken?: string | null): Promise<void> {
    const unitGuid = UNIT_GUIDS[unitId];
    const response = await fetch(
      `${getApiBaseUrl()}/api/units/${encodeURIComponent(unitGuid)}/quote-curation/${encodeURIComponent(curationId)}`,
      { method: "DELETE", headers: createAuthHeaders(accessToken) }
    );
    if (!response.ok && response.status !== 204) throw new Error(`Failed to delete curation row (${response.status})`);
  },
};
