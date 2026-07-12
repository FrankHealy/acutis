"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: JitsiMeetOptions) => JitsiMeetApi;
  }
}

type JitsiMeetApi = {
  dispose: () => void;
  addListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type JitsiMeetOptions = {
  roomName: string;
  parentNode: HTMLElement;
  jwt?: string;
  width?: string | number;
  height?: string | number;
  userInfo?: {
    displayName?: string;
  };
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
};

type JitsiSessionFrameProps = {
  roomName: string;
  displayName: string;
  jwt?: string | null;
  authorised: boolean;
};

const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.acutis.local";

const clinicalToolbarButtons = [
  "microphone",
  "camera",
  "desktop",
  "chat",
  "participants-pane",
  "raisehand",
  "tileview",
  "settings",
  "hangup",
];

let loadPromise: Promise<void> | null = null;

function loadJitsiScript(domain: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Acutis video service."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function JitsiSessionFrame({ roomName, displayName, jwt, authorised }: JitsiSessionFrameProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiMeetApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!authorised || !jwt || !roomName || !parentRef.current) {
      return undefined;
    }

    void loadJitsiScript(jitsiDomain)
      .then(() => {
        if (cancelled || !parentRef.current || !window.JitsiMeetExternalAPI) return;

        apiRef.current?.dispose();
        apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, {
          roomName,
          parentNode: parentRef.current,
          jwt,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableInviteFunctions: true,
            disableThirdPartyRequests: true,
            toolbarButtons: clinicalToolbarButtons,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
          },
        });
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [authorised, displayName, jwt, roomName]);

  if (!authorised || !jwt) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
        This remote session can only be joined from an authorised Acutis session.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-slate-950">
      <div ref={parentRef} className="h-[420px] w-full" />
      {error && <p className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
