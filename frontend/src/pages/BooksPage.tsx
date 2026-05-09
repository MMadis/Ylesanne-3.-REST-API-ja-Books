import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createBook, deleteBook, fetchBooks, getApiErrorMessage } from "../api";
import type { BookView, BooksListResponse } from "../api";
import { BookForm } from "../components/BookForm";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";

function parseYear(value: string): number | undefined {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}

export function BooksPage() {
  const [titleInput, setTitleInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "publishedYear">("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);

  const [data, setData] = useState<BooksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setTitle(titleInput), 350);
    return () => window.clearTimeout(t);
  }, [titleInput]);

  useEffect(() => {
    const t = window.setTimeout(() => setYear(yearInput), 350);
    return () => window.clearTimeout(t);
  }, [yearInput]);

  useEffect(() => {
    const t = window.setTimeout(() => setLanguage(languageInput), 350);
    return () => window.clearTimeout(t);
  }, [languageInput]);

  const query = useMemo(() => {
    const q: Record<string, unknown> = {
      sortBy,
      order,
      page,
      limit,
    };
    if (title.trim().length > 0) q.title = title.trim();
    const parsedYear = parseYear(year);
    if (parsedYear !== undefined) q.year = parsedYear;
    if (language.trim().length > 0) q.language = language.trim();
    return q as {
      title?: string;
      year?: number;
      language?: string;
      sortBy: "title" | "publishedYear";
      order: "asc" | "desc";
      page: number;
      limit: number;
    };
  }, [language, limit, order, page, sortBy, title, year]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchBooks(query, controller.signal)
      .then((res) => {
        setData(res);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [query, reloadKey]);

  const books: BookView[] = data?.data ?? [];
  const meta = data?.pagination;
  const rangeText = useMemo(() => {
    if (!meta || meta.totalItems === 0) return "Näitan 0 tulemust";
    const start = (meta.currentPage - 1) * meta.itemsPerPage + 1;
    const end = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems);
    return `Näitan ${start}–${end} / ${meta.totalItems}`;
  }, [meta]);

  const onDelete = async (id: number) => {
    const ok = window.confirm("Kas oled kindel, et soovid raamatu kustutada?");
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteBook(id);
      setReloadKey((x) => x + 1);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const onCreate = async (values: Parameters<typeof createBook>[0]) => {
    setCreateSubmitting(true);
    try {
      await createBook(values);
      setCreateOpen(false);
      setReloadKey((x) => x + 1);
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Raamatud</h1>
          <div className="mt-1 text-sm text-slate-600">{meta ? rangeText : "Otsing, sorteerimine ja pagination"}</div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreateOpen(true)}
        >
          Lisa raamat
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <label className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium text-slate-800">Pealkiri</div>
              <input
                className="input"
                value={titleInput}
                onChange={(e) => {
                  setTitleInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Otsi pealkirja järgi..."
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-800">Aasta</div>
              <input
                className="input"
                inputMode="numeric"
                value={yearInput}
                onChange={(e) => {
                  setYearInput(e.target.value);
                  setPage(1);
                }}
                placeholder="nt 2019"
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-800">Keel</div>
              <input
                className="input"
                value={languageInput}
                onChange={(e) => {
                  setLanguageInput(e.target.value);
                  setPage(1);
                }}
                placeholder="nt EN"
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-800">Sort</div>
              <select
                className="select"
                value={sortBy}
                onChange={(e) => {
                  const next = e.target.value === "publishedYear" ? "publishedYear" : "title";
                  setSortBy(next);
                  setPage(1);
                }}
              >
                <option value="title">Pealkiri</option>
                <option value="publishedYear">Aasta</option>
              </select>
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-800">Suund</div>
              <select
                className="select"
                value={order}
                onChange={(e) => {
                  const next = e.target.value === "desc" ? "desc" : "asc";
                  setOrder(next);
                  setPage(1);
                }}
              >
                <option value="asc">Kasvav</option>
                <option value="desc">Kahanev</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setTitleInput("");
                setYearInput("");
                setLanguageInput("");
                setSortBy("title");
                setOrder("asc");
                setPage(1);
              }}
            >
              Puhasta filtrid
            </button>
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Laen raamatuid..." /> : null}
      {error ? (
        <ErrorBanner
          message={error}
          action={
            <button
              type="button"
              className="btn btn-danger px-3 py-1.5 text-sm"
              onClick={() => setReloadKey((x) => x + 1)}
            >
              Proovi uuesti
            </button>
          }
        />
      ) : null}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Pealkiri</th>
                <th className="px-4 py-3 font-semibold">Autor</th>
                <th className="px-4 py-3 font-semibold">Aasta</th>
                <th className="px-4 py-3 font-semibold">Žanrid</th>
                <th className="px-4 py-3 font-semibold">Keel</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                        {(b.title.trim().slice(0, 1) || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{b.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{b.authorName}</td>
                  <td className="px-4 py-3 text-slate-800">{b.publishedYear}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {b.genres.slice(0, 3).map((g) => (
                        <span key={g} className="badge">
                          {g}
                        </span>
                      ))}
                      {b.genres.length > 3 ? <span className="badge">+{b.genres.length - 3}</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-blue">{b.language}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`/books/${b.id}`}
                        className="btn btn-outline px-3 py-1.5 text-sm font-semibold"
                      >
                        Vaata
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-outline px-3 py-1.5 text-sm font-semibold"
                        onClick={() => onDelete(b.id)}
                        disabled={deletingId === b.id}
                      >
                        {deletingId === b.id ? "Kustutan..." : "Kustuta"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && books.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-600" colSpan={6}>
                    Tulemusi ei leitud. Proovi teisi filtreid.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {meta ? (
          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              meta={meta}
              page={page}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        ) : null}
      </div>

      {createOpen ? (
        <Modal
          title="Lisa raamat"
          onClose={() => {
            if (createSubmitting) return;
            setCreateOpen(false);
          }}
        >
          <BookForm
            submitLabel="Lisa"
            submitting={createSubmitting}
            onCancel={() => {
              if (createSubmitting) return;
              setCreateOpen(false);
            }}
            onSubmit={onCreate}
          />
        </Modal>
      ) : null}
    </div>
  );
}
