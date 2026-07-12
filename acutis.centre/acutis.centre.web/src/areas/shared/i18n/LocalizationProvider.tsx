"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
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
const LOCALE_STORAGE_KEY = "acutis.locale";

const subscribeToLocale = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
};

const getLocaleSnapshot = () => {
  if (typeof window === "undefined") {
    return "en-IE";
  }

  return window.localStorage.getItem(LOCALE_STORAGE_KEY) || "en-IE";
};

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
  const storedLocale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, () => "en-IE");
  const [localeOverride, setLocaleOverride] = useState<string | null>(null);
  const locale = localeOverride ?? storedLocale;
  const [translations, setTranslations] = useState<TranslationsMap>({});
  const translationsRef = useRef<TranslationsMap>({});

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale.startsWith("ar") ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  const setLocale = useCallback((nextLocale: string) => {
    const localeToUse = nextLocale || "en-IE";
    setLocaleOverride(localeToUse);
    translationsRef.current = {};
    setTranslations({});
    window.localStorage.setItem(LOCALE_STORAGE_KEY, localeToUse);
  }, []);

  const mergeTranslations = useCallback((next: TranslationsMap) => {
    translationsRef.current = { ...translationsRef.current, ...next };
    setTranslations((current) => ({ ...current, ...next }));
  }, []);

  const loadKeys = useCallback(
    async (keys: string[]) => {
      const normalized = Array.from(
        new Set(keys.map((key) => key?.trim()).filter((key): key is string => Boolean(key)))
      );
      const missing = normalized.filter((key) => !translationsRef.current[key]);
      if (missing.length === 0) {
        return;
      }
      try {
        const fetched = await fetchTranslations(locale, missing);
        translationsRef.current = { ...translationsRef.current, ...fetched };
        setTranslations((current) => ({ ...current, ...fetched }));
      } catch {
        return;
      }
    },
    [locale]
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
