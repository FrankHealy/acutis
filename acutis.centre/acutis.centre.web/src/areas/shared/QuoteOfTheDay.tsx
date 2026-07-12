"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { quoteService, type QuoteOfDay } from "@/services/quoteService";
import type { UnitId } from "./unit/unitTypes";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

type QuoteOfTheDayProps = {
  unitId: UnitId;
};

export default function QuoteOfTheDay({ unitId }: QuoteOfTheDayProps) {
  const { loadKeys, t } = useLocalization();
  const [data, setData] = useState<QuoteOfDay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadKeys([
      "quote_of_day.loading",
      "quote_of_day.title",
      "quote_of_day.pronunciation",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const quote = await quoteService.getQuoteOfDay(unitId);
        if (!canceled) {
          setData(quote);
          setError(null);
        }
      } catch (e) {
        if (!canceled) {
          setError((e as Error).message);
        }
      }
    };

    void load();
    return () => {
      canceled = true;
    };
  }, [unitId]);

  if (error) {
    return null;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
        {text("quote_of_day.loading", "Loading quote of the day...")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Quote className="h-4 w-4" />
        {text("quote_of_day.title", "Quote Of The Day")}
      </div>
      <p className="text-base leading-relaxed text-slate-800">&quot;{data.quote.text}&quot;</p>
      <p className="mt-3 text-sm font-semibold text-slate-700">{data.quote.attribution}</p>
      {data.quote.language !== "en" && data.quote.pronunciationGuide && (
        <p className="mt-1 text-xs text-slate-500">
          {text("quote_of_day.pronunciation", "Pronunciation")}: {data.quote.pronunciationGuide}
        </p>
      )}
    </div>
  );
}

