import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SectionToggleProps = {
  icon: LucideIcon;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor?: string;
};

export default function SectionToggle({
  icon: Icon,
  title,
  isExpanded,
  onToggle,
  iconColor = "text-slate-600",
}: SectionToggleProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
      onClick={onToggle}
    >
      <span className="flex items-center gap-2 text-left">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className="font-semibold text-slate-900">{title}</span>
      </span>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-slate-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-slate-500" />
      )}
    </button>
  );
}
