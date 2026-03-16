"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { globalConfigurationService } from "@/services/globalConfigurationService";
import { unitIdentityService } from "@/services/unitIdentityService";

const DEFAULT_TITLE = "Acutis";
const DEFAULT_ICON = "/acutis-icon.svg";
const NON_UNIT_SEGMENTS = new Set(["config", "screening"]);

const ensureIconLink = (rel: string) => {
  let link = document.head.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  return link;
};

const applyBranding = (title?: string | null, iconUrl?: string | null) => {
  document.title = title?.trim() || DEFAULT_TITLE;
  const resolvedIcon = iconUrl?.trim() || DEFAULT_ICON;
  ensureIconLink("icon").href = resolvedIcon;
  ensureIconLink("shortcut icon").href = resolvedIcon;
  ensureIconLink("apple-touch-icon").href = resolvedIcon;
};

export default function BrowserBrandingSync() {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    let active = true;

    const syncBranding = async () => {
      const segments = pathname.split("/").filter(Boolean);
      const unitCode = segments[0] === "units" ? segments[1] : undefined;

      try {
        if (unitCode && !NON_UNIT_SEGMENTS.has(unitCode)) {
          const unit = await unitIdentityService.resolveByCode(unitCode, session?.accessToken);
          if (active) {
            applyBranding(unit.browserTitle, unit.faviconUrl);
          }
          return;
        }

        const centres = await globalConfigurationService.getCentres(session?.accessToken, false);
        if (active) {
          const centre = centres[0];
          applyBranding(centre?.browserTitle, centre?.faviconUrl);
        }
      } catch {
        if (active) {
          applyBranding();
        }
      }
    };

    void syncBranding();

    return () => {
      active = false;
    };
  }, [pathname, session?.accessToken]);

  return null;
}
