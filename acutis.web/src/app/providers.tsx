"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import BrowserBrandingSync from "@/areas/shared/branding/BrowserBrandingSync";
import FeedbackButton from "@/areas/shared/feedback/FeedbackButton";
import { LocalizationProvider } from "@/areas/shared/i18n/LocalizationProvider";
import { ThemeProvider } from "@/areas/shared/theme/ThemeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LocalizationProvider>
        <ThemeProvider>
          <BrowserBrandingSync />
          {children}
          <FeedbackButton />
        </ThemeProvider>
      </LocalizationProvider>
    </SessionProvider>
  );
}
