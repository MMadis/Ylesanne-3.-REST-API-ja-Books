import type { ReactNode } from "react";

export function ErrorBanner({
  title,
  message,
  action,
}: {
  title?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{title ?? "Viga"}</div>
          <div className="mt-1 text-sm">{message}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
