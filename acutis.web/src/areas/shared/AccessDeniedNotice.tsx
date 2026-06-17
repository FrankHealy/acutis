import { Lock } from "lucide-react";

type AccessDeniedNoticeProps = {
  message?: string | null;
};

export default function AccessDeniedNotice({ message }: AccessDeniedNoticeProps) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Access restricted</h2>
          <p className="mt-1 text-sm leading-6">
            {message || "You do not have permission to access this area. Ask an administrator to update your role or unit access."}
          </p>
        </div>
      </div>
    </section>
  );
}
