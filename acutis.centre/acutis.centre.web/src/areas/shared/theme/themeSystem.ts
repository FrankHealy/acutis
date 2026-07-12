export type ThemeKey = "acutis" | "harbor" | "evergreen" | "high_contrast";

export type ThemeDefinition = {
  key: ThemeKey;
  name: string;
  vars: Record<string, string>;
};

export const DEFAULT_THEME_KEY: ThemeKey = "acutis";

export const APP_THEMES: Record<ThemeKey, ThemeDefinition> = {
  acutis: {
    key: "acutis",
    name: "Natural",
    vars: {
      "--app-bg": "#eef4ff",
      "--app-bg-accent": "#f7fbff",
      "--app-surface": "#ffffff",
      "--app-surface-muted": "#f3f7fd",
      "--app-border": "#d7e2f1",
      "--app-text": "#0f172a",
      "--app-text-muted": "#5b6b82",
      "--app-primary": "#2563eb",
      "--app-primary-strong": "#1d4ed8",
      "--app-primary-soft": "#dbeafe",
      "--app-accent": "#0891b2",
      "--app-accent-soft": "#cffafe",
      "--app-success": "#0f9f6e",
      "--app-warning": "#d97706",
      "--app-danger": "#dc2626",
      "--app-shadow": "37 99 235",
    },
  },
  harbor: {
    key: "harbor",
    name: "Harbor",
    vars: {
      "--app-bg": "#f4f7fb",
      "--app-bg-accent": "#edf2f7",
      "--app-surface": "#ffffff",
      "--app-surface-muted": "#eef3f8",
      "--app-border": "#d7dee8",
      "--app-text": "#142235",
      "--app-text-muted": "#62748a",
      "--app-primary": "#1d4ed8",
      "--app-primary-strong": "#1e40af",
      "--app-primary-soft": "#dbeafe",
      "--app-accent": "#0f766e",
      "--app-accent-soft": "#ccfbf1",
      "--app-success": "#15803d",
      "--app-warning": "#b45309",
      "--app-danger": "#b91c1c",
      "--app-shadow": "29 78 216",
    },
  },
  evergreen: {
    key: "evergreen",
    name: "Evergreen",
    vars: {
      "--app-bg": "#f2f7f2",
      "--app-bg-accent": "#ecf5ea",
      "--app-surface": "#ffffff",
      "--app-surface-muted": "#f4faf3",
      "--app-border": "#d6e6d2",
      "--app-text": "#163123",
      "--app-text-muted": "#5b6f64",
      "--app-primary": "#2f855a",
      "--app-primary-strong": "#276749",
      "--app-primary-soft": "#d1fae5",
      "--app-accent": "#0f766e",
      "--app-accent-soft": "#ccfbf1",
      "--app-success": "#15803d",
      "--app-warning": "#b45309",
      "--app-danger": "#b91c1c",
      "--app-shadow": "47 133 90",
    },
  },
  high_contrast: {
    key: "high_contrast",
    name: "High Contrast",
    vars: {
      "--app-bg": "#f3f4f6",
      "--app-bg-accent": "#ffffff",
      "--app-surface": "#ffffff",
      "--app-surface-muted": "#f8fafc",
      "--app-border": "#111827",
      "--app-text": "#000000",
      "--app-text-muted": "#1f2937",
      "--app-primary": "#000000",
      "--app-primary-strong": "#111827",
      "--app-primary-soft": "#e5e7eb",
      "--app-accent": "#1d4ed8",
      "--app-accent-soft": "#dbeafe",
      "--app-success": "#166534",
      "--app-warning": "#92400e",
      "--app-danger": "#991b1b",
      "--app-shadow": "17 24 39",
    },
  },
};

export function applyThemeToDocument(themeKey: ThemeKey) {
  if (typeof document === "undefined") {
    return;
  }

  const theme = APP_THEMES[themeKey] ?? APP_THEMES[DEFAULT_THEME_KEY];
  const root = document.documentElement;
  root.dataset.theme = theme.key;

  for (const [name, value] of Object.entries(theme.vars)) {
    root.style.setProperty(name, value);
  }
}
