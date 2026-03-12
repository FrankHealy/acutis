"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

type TranslationsMap = Record<string, string>;

type LocalizationContextValue = {
  locale: string;
  setLocale: (nextLocale: string) => void;
  t: (key: string | null | undefined) => string;
  loadKeys: (keys: string[]) => Promise<void>;
  mergeTranslations: (translations: TranslationsMap) => void;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

const fetchTranslations = async (locale: string, keys: string[]): Promise<TranslationsMap> => {
  if (keys.length === 0) {
    return {};
  }

  const params = new URLSearchParams({ locale });
  for (const key of keys) {
    params.append("keys", key);
  }

  const response = await fetch(`${getApiBaseUrl()}/api/localization/translations?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {};
  }

  return (await response.json()) as TranslationsMap;
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("en-IE");
  const [translations, setTranslations] = useState<TranslationsMap>({});

  useEffect(() => {
    const stored = window.localStorage.getItem("acutis.locale");
    if (stored) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale.startsWith("ar") ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((nextLocale: string) => {
    const localeToUse = nextLocale || "en-IE";
    setLocaleState(localeToUse);
    setTranslations({});
    window.localStorage.setItem("acutis.locale", localeToUse);
  }, []);

  const mergeTranslations = useCallback((next: TranslationsMap) => {
    setTranslations((current) => ({ ...current, ...next }));
  }, []);

  const loadKeys = useCallback(
    async (keys: string[]) => {
      const normalized = Array.from(
        new Set(keys.map((key) => key?.trim()).filter((key): key is string => Boolean(key)))
      );
      const missing = normalized.filter((key) => !translations[key]);
      if (missing.length === 0) {
        return;
      }
      const fetched = await fetchTranslations(locale, missing);
      setTranslations((current) => ({ ...current, ...fetched }));
    },
    [locale, translations]
  );

  const t = useCallback(
    (key: string | null | undefined) => {
      if (!key) return "";
      return translations[key] ?? key;
    },
    [translations]
  );

  const value = useMemo<LocalizationContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      loadKeys,
      mergeTranslations,
    }),
    [locale, setLocale, t, loadKeys, mergeTranslations]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used inside LocalizationProvider.");
  }
  return context;
};
