"use client";

import React, { useMemo, useState } from "react";
import html2canvas from "html2canvas";
import { Bug, Lightbulb, MessageSquare, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { isAuthorizationDisabled } from "@/lib/authMode";

type FeedbackType = "Bug" | "Suggestion";

type FeedbackPayload = {
  type: FeedbackType;
  title: string;
  description: string;
  contact?: string;
  route: string;
  timestamp: string;
  userAgent: string;
  viewport: string;
  platform: string;
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };
  appVersion?: string;
  screenshotDataUrl?: string;
};

const isFeedbackEnabled = () =>
  process.env.NEXT_PUBLIC_FEEDBACK_ENABLED?.toLowerCase() !== "false";

const getAppVersion = () =>
  process.env.NEXT_PUBLIC_APP_VERSION ??
  process.env.NEXT_PUBLIC_BUILD_NUMBER ??
  "0.1.0";

const captureScreenshot = async (): Promise<string | undefined> => {
  try {
    const canvas = await html2canvas(document.body, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: Math.min(window.devicePixelRatio || 1, 1.25),
      useCORS: true,
      ignoreElements: (element) => element.hasAttribute("data-feedback-ui"),
    });

    const dataUrl = canvas.toDataURL("image/jpeg", 0.45);
    return dataUrl.length <= 25_000 ? dataUrl : undefined;
  } catch {
    return undefined;
  }
};

export default function FeedbackButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("Bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canShow = useMemo(
    () => isFeedbackEnabled() && (isAuthorizationDisabled || status === "authenticated"),
    [status],
  );

  if (!canShow) {
    return null;
  }

  const resetForm = () => {
    setType("Bug");
    setTitle("");
    setDescription("");
    setContact("");
  };

  const submitFeedback = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please add a short title and description.");
      return;
    }

    const lastSubmittedAt = Number(window.localStorage.getItem("acutis.feedback.lastSubmittedAt") ?? "0");
    if (Date.now() - lastSubmittedAt < 60_000) {
      setError("Please wait a minute before sending more feedback.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const screenshotDataUrl = await captureScreenshot();
    const payload: FeedbackPayload = {
      type,
      title: title.trim(),
      description: description.trim(),
      contact: contact.trim() || undefined,
      route: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      platform: window.navigator.platform,
      user: {
        name: session?.user?.name,
        email: session?.user?.email,
        username: session?.username,
      },
      appVersion: getAppVersion(),
      screenshotDataUrl,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Feedback could not be submitted.");
      }

      window.localStorage.setItem("acutis.feedback.lastSubmittedAt", String(Date.now()));
      setMessage("Feedback sent. Thank you.");
      resetForm();
      window.setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Feedback could not be submitted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-feedback-ui="true">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setMessage(null);
        }}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:bottom-6 sm:right-6"
        aria-label="Open feedback form"
      >
        <MessageSquare className="h-4 w-4 text-blue-600" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Feedback</h2>
                <p className="text-sm text-slate-500">Send a quick pilot note.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close feedback form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Bug", "Suggestion"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setType(item)}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        type === item
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item === "Bug" ? <Bug className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-title" className="mb-1 block text-sm font-semibold text-slate-700">
                  Short title
                </label>
                <input
                  id="feedback-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="feedback-description" className="mb-1 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  maxLength={4000}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="feedback-contact" className="mb-1 block text-sm font-semibold text-slate-700">
                  Email or name <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="feedback-contact"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  maxLength={160}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              {message && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitFeedback()}
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-slate-300"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
