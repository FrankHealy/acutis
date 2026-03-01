"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { LocalizationProvider } from "@/areas/shared/i18n/LocalizationProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LocalizationProvider>{children}</LocalizationProvider>
    </SessionProvider>
  );
}
