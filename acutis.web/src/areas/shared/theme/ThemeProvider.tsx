"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [centreThemeKey, setCentreThemeKey] = useState<ThemeKey>(DEFAULT_THEME_KEY);
  const [userThemeKey, setUserThemeKeyState] = useState<ThemeKey | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedThemeKey = window.sessionStorage.getItem(USER_THEME_STORAGE_KEY);
    if (storedThemeKey && storedThemeKey in APP_THEMES) {
      setUserThemeKeyState(storedThemeKey as ThemeKey);
    }
  }, []);

  const themeKey = userThemeKey ?? centreThemeKey;

  useEffect(() => {
    applyThemeToDocument(themeKey);
  }, [themeKey]);

  const setUserThemeKey = (theme: ThemeKey | null) => {
    setUserThemeKeyState(theme);

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
