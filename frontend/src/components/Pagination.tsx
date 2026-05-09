import type { PaginationMeta } from "../api";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function Pagination({
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const totalPages = meta.totalPages || 1;
  const safePage = clamp(page, 1, totalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-700">
        Leht <span className="font-semibold">{safePage}</span> /{" "}
        <span className="font-semibold">{totalPages}</span> · Kokku{" "}
        <span className="font-semibold">{meta.totalItems}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Limit
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(safePage - 1)}
        >
          Eelmine
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(safePage + 1)}
        >
          Järgmine
        </button>
      </div>
    </div>
  );
}
