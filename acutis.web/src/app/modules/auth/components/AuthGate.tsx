"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";
import { isAuthorizationDisabled } from "@/lib/authMode";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (isAuthorizationDisabled) {
      return;
    }

    if (status === "unauthenticated") {
      signIn("keycloak");
    }
  }, [status]);

  if (isAuthorizationDisabled) {
    return <>{children}</>;
  }

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
