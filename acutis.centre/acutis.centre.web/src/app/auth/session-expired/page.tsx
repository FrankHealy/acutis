"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getProviderForCallbackUrl } from "@/lib/authProviders";

function SessionExpiredContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const providerId = getProviderForCallbackUrl(callbackUrl);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-surface-muted)] p-6">
      <section className="app-card w-full max-w-md rounded-xl p-6 text-center">
        <img src="/acutis-logo-light.svg" alt="Acutis" className="mx-auto mb-6 w-64 max-w-full" />
        <h1 className="text-xl font-semibold text-[var(--app-text)]">Session expired</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">
          Your Acutis session has ended. Sign in again to continue where you left off.
        </p>
        <button
          type="button"
          onClick={() => void signIn(providerId, { callbackUrl })}
          className="mt-6 rounded-lg bg-[var(--app-primary)] px-4 py-2 font-semibold text-white"
        >
          Sign in again
        </button>
      </section>
    </main>
  );
}

export default function SessionExpiredPage() {
  return (
    <Suspense fallback={null}>
      <SessionExpiredContent />
    </Suspense>
  );
}
