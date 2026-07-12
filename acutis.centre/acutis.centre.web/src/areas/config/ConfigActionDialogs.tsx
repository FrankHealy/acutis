"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type EditorDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  size?: "medium" | "large";
};

export function ConfigEditorDialog({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
  size = "large",
}: EditorDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-3 sm:p-6" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-editor-title"
        className={`app-surface my-auto flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${
          size === "medium" ? "max-w-2xl" : "max-w-4xl"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--app-border)] px-5 py-4 sm:px-6">
          <div>
            <h2 id="config-editor-title" className="text-xl font-semibold text-[var(--app-text)]">{title}</h2>
            {description && <p className="mt-1 text-sm text-[var(--app-text-muted)]">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel} className="app-outline-button rounded-lg p-2">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
      </section>
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfigConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <section role="alertdialog" aria-modal="true" aria-labelledby="config-confirm-title" className="app-surface w-full max-w-md rounded-2xl border border-[var(--app-border)] p-6 shadow-2xl">
        <h2 id="config-confirm-title" className="text-lg font-semibold text-[var(--app-text)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="app-outline-button rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="rounded-lg bg-[var(--app-danger)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
