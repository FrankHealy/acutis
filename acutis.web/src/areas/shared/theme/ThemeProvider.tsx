"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { APP_THEMES, applyThemeToDocument, DEFAULT_THEME_KEY, type ThemeKey } from "./themeSystem";

type ThemeContextValue = {
  themeKey: ThemeKey;
  centreThemeKey: ThemeKey;
  userThemeKey: ThemeKey | null;
  setCentreThemeKey: (themeKey: ThemeKey) => void;
  setUserThemeKey: (themeKey: ThemeKey | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const USER_THEME_STORAGE_KEY = "acutis.user-theme";

const subscribeToTheme = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === USER_THEME_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
};

const getThemeSnapshot = (): ThemeKey | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedThemeKey = window.sessionStorage.getItem(USER_THEME_STORAGE_KEY);
  if (storedThemeKey && storedThemeKey in APP_THEMES) {
    return storedThemeKey as ThemeKey;
  }

  return null;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [centreThemeKey, setCentreThemeKey] = useState<ThemeKey>(DEFAULT_THEME_KEY);
  const storedThemeKey = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => null);
  const [userThemeOverride, setUserThemeOverride] = useState<ThemeKey | null | undefined>(undefined);
  const userThemeKey = userThemeOverride === undefined ? storedThemeKey : userThemeOverride;

  const themeKey = userThemeKey ?? centreThemeKey;

  useEffect(() => {
    applyThemeToDocument(themeKey);
  }, [themeKey]);

  const setUserThemeKey = (theme: ThemeKey | null) => {
    setUserThemeOverride(theme);

    if (typeof window === "undefined") {
      return;
    }

    if (!theme) {
      window.sessionStorage.removeItem(USER_THEME_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(USER_THEME_STORAGE_KEY, theme);
  };

  const value = useMemo(
    () => ({
      themeKey,
      centreThemeKey,
      userThemeKey,
      setCentreThemeKey,
      setUserThemeKey,
    }),
    [centreThemeKey, themeKey, userThemeKey],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}

export const availableThemes = Object.values(APP_THEMES);
