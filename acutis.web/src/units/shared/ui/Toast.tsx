type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "warning" | "error" | "info";
  onClose: () => void;
  closeLabel?: string;
};

const typeToClasses: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "border-green-300 bg-green-50 text-green-800",
  warning: "border-yellow-300 bg-yellow-50 text-yellow-800",
  error: "border-red-300 bg-red-50 text-red-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
};

export default function Toast({ open, message, type = "info", onClose, closeLabel = "Close" }: ToastProps) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
