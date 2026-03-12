"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { LocalizationProvider } from "@/areas/shared/i18n/LocalizationProvider";
import { ThemeProvider } from "@/areas/shared/theme/ThemeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LocalizationProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </LocalizationProvider>
    </SessionProvider>
  );
}
