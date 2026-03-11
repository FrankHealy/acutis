"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { AppAccess } from "@/lib/adminAccess";
import { appAccessService } from "@/services/appAccessService";
import { isAuthorizationDisabled } from "@/lib/authMode";

const emptyAccess: AppAccess = {
  appUserId: null,
  subject: null,
  roles: [],
  permissions: [],
  unitAccess: [],
  unitPermissions: [],
};

const developmentAccess: AppAccess = {
  ...emptyAccess,
  roles: ["platform_admin"],
  permissions: ["configuration.manage"],
};

export const useAppAccess = () => {
  const { data: session, status } = useSession();
  const [access, setAccess] = useState<AppAccess>(isAuthorizationDisabled ? developmentAccess : emptyAccess);
  const [fetching, setFetching] = useState(!isAuthorizationDisabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthorizationDisabled) {
      return;
    }

    if (status !== "authenticated" || !session?.accessToken) {
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setFetching(true);
      setError(null);
    });

    void appAccessService
      .getCurrent(session.accessToken)
      .then((result) => {
        if (!active) return;
        setAccess(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError((nextError as Error).message);
        setAccess(emptyAccess);
      })
      .finally(() => {
        if (!active) return;
        setFetching(false);
      });

    return () => {
      active = false;
    };
  }, [session?.accessToken, status]);

  const resolvedAccess = useMemo(() => {
    if (isAuthorizationDisabled) {
      return developmentAccess;
    }

    if (status !== "authenticated" || !session?.accessToken) {
      return emptyAccess;
    }

    return access;
  }, [access, session?.accessToken, status]);

  const loading = !isAuthorizationDisabled && (status === "loading" || fetching);

  return { access: resolvedAccess, loading, error };
};
