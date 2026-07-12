"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthenticationErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message =
    error === "OAuthCallback"
      ? "The login response could not be completed. It may have expired or already been used."
      : "Acutis could not complete sign-in.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-surface-muted)] p-6">
      <section className="app-card w-full max-w-md rounded-xl p-6 text-center">
        <img src="/acutis-logo-light.svg" alt="Acutis" className="mx-auto mb-6 w-64 max-w-full" />
        <h1 className="text-xl font-semibold text-[var(--app-text)]">Sign-in problem</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">{message}</p>
        <button
          type="button"
          onClick={() => void signIn("keycloak", { callbackUrl: "/" })}
          className="mt-6 rounded-lg bg-[var(--app-primary)] px-4 py-2 font-semibold text-white"
        >
          Try signing in again
        </button>
      </section>
    </main>
  );
}

export default function AuthenticationErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthenticationErrorContent />
    </Suspense>
  );
}
