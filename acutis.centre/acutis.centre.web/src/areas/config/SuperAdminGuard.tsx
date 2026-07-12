"use client";

import type { ReactNode } from "react";

type SuperAdminGuardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  // TODO: Restore SuperAdmin-only enforcement after pilot/pre-pilot configuration review.
  return <>{children}</>;
}
