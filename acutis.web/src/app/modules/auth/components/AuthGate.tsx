"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("keycloak");
    }
  }, [status]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
