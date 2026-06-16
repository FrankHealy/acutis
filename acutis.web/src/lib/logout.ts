"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

const canonicalAppUrl = "https://acutis.salientrecovery.com";

export async function logoutFromAcutis(session: Session | null) {
  await signOut({ redirect: false });

  if (session?.issuer && session.idToken) {
    const logoutUrl = new URL(`${session.issuer}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.set("id_token_hint", session.idToken);
    logoutUrl.searchParams.set("post_logout_redirect_uri", canonicalAppUrl);
    window.location.assign(logoutUrl.toString());
    return;
  }

  window.location.assign(canonicalAppUrl);
}
