type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "warning" | "error" | "info";
  onClose: () => void;
  closeLabel?: string;
};

const typeToClasses: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "border-[color:color-mix(in_srgb,var(--app-success)_35%,var(--app-border))] bg-[var(--app-surface)] text-[var(--app-success)]",
  warning: "border-[color:color-mix(in_srgb,var(--app-warning)_35%,var(--app-border))] bg-[var(--app-surface)] text-[var(--app-warning)]",
  error: "border-[color:color-mix(in_srgb,var(--app-danger)_35%,var(--app-border))] bg-[var(--app-surface)] text-[var(--app-danger)]",
  info: "border-[color:color-mix(in_srgb,var(--app-primary)_35%,var(--app-border))] bg-[var(--app-surface)] text-[var(--app-primary)]",
};

export default function Toast({ open, message, type = "info", onClose, closeLabel = "Close" }: ToastProps) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 end-4 z-[70] max-w-[calc(100vw-2rem)]">
      <div className={`rounded-lg border px-4 py-3 shadow-md ${typeToClasses[type]}`}>
        <div className="flex items-start gap-3">
          <p className="text-sm font-medium">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
