import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { fetchBooks, getApiErrorMessage } from "./api";
import { BookDetailPage } from "./pages/BookDetailPage";
import { BooksPage } from "./pages/BooksPage";

export default function App() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setApiStatus("checking");
    setApiError(null);
    fetchBooks({ page: 1, limit: 1, sortBy: "title", order: "asc" }, controller.signal)
      .then(() => setApiStatus("ok"))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setApiStatus("error");
        setApiError(getApiErrorMessage(e));
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link to="/books" className="text-lg font-semibold text-slate-900">
              Books
            </Link>
            <div className="sm:hidden">
              {apiStatus === "checking" ? <span className="badge">API: kontrollin...</span> : null}
              {apiStatus === "ok" ? <span className="badge badge-green">API: ühendatud</span> : null}
              {apiStatus === "error" ? (
                <span className="badge badge-red" title={apiError ?? undefined}>
                  API: viga
                </span>
              ) : null}
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Link to="/books" className="btn btn-outline px-3 py-1.5 text-sm font-semibold">
                Raamatud
              </Link>
            </div>
            <div className="hidden sm:block">
              {apiStatus === "checking" ? <span className="badge">API: kontrollin...</span> : null}
              {apiStatus === "ok" ? <span className="badge badge-green">API: ühendatud</span> : null}
              {apiStatus === "error" ? (
                <span className="badge badge-red" title={apiError ?? undefined}>
                  API: viga
                </span>
              ) : null}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </main>
    </div>
  );
}
