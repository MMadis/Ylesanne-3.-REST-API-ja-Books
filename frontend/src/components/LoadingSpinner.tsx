import type { ReactNode } from "react";

export function LoadingSpinner({ label }: { label?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-slate-700">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
        aria-hidden="true"
      />
      <div className="text-sm">{label ?? "Laen..."}</div>
    </div>
  );
}
