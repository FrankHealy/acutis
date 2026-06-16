"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { isAuthorizationDisabled } from "@/lib/authMode";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthStatusPage = pathname.startsWith("/auth/");

  useEffect(() => {
    if (isAuthorizationDisabled || isAuthStatusPage) {
      return;
    }

    const sessionIsUnusable =
      status === "authenticated" &&
      (!session?.accessToken || session.error === "RefreshAccessTokenError");

    if (sessionIsUnusable) {
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/auth/session-expired?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (status === "unauthenticated") {
      void signIn("keycloak", { callbackUrl: window.location.href });
    }
  }, [isAuthStatusPage, session?.accessToken, session?.error, status]);

  if (isAuthorizationDisabled) {
    return <>{children}</>;
  }

  if (isAuthStatusPage) {
    return <>{children}</>;
  }

  if (
    status !== "authenticated" ||
    !session?.accessToken ||
    session.error === "RefreshAccessTokenError"
  ) {
    return null;
  }

  return <>{children}</>;
}
