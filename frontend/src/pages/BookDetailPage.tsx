import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createBookReview,
  deleteBook,
  fetchBook,
  fetchBookAverageRating,
  fetchBookReviews,
  getApiErrorMessage,
  updateBook,
} from "../api";
import type { AverageRating, BookView, Review } from "../api";
import { BookForm } from "../components/BookForm";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";
import { ReviewForm } from "../components/ReviewForm";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function BookDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const bookId = useMemo(() => {
    const raw = params.id ?? "";
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [params.id]);

  const [book, setBook] = useState<BookView | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);

  const [avg, setAvg] = useState<AverageRating | null>(null);
  const [avgLoading, setAvgLoading] = useState(true);
  const [avgError, setAvgError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);

  useEffect(() => {
    if (bookId === null) {
      setBook(null);
      setBookLoading(false);
      setBookError("Vigane raamatu id");
      return;
    }
    const controller = new AbortController();
    setBookLoading(true);
    setBookError(null);
    fetchBook(bookId, controller.signal)
      .then((b) => {
        setBook(b);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setBookError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setBookLoading(false);
      });
    return () => controller.abort();
  }, [bookId]);

  useEffect(() => {
    if (bookId === null) {
      setAvg(null);
      setAvgLoading(false);
      setAvgError("Vigane raamatu id");
      return;
    }
    const controller = new AbortController();
    setAvgLoading(true);
    setAvgError(null);
    fetchBookAverageRating(bookId, controller.signal)
      .then((r) => {
        setAvg(r);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setAvgError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setAvgLoading(false);
      });
    return () => controller.abort();
  }, [bookId, reviewsReloadKey]);

  useEffect(() => {
    if (bookId === null) {
      setReviews([]);
      setReviewsLoading(false);
      setReviewsError("Vigane raamatu id");
      return;
    }
    const controller = new AbortController();
    setReviewsLoading(true);
    setReviewsError(null);
    fetchBookReviews(bookId, { sortBy: "createdAt", order: "desc" }, controller.signal)
      .then((r) => {
        setReviews(r);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setReviewsError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setReviewsLoading(false);
      });
    return () => controller.abort();
  }, [bookId, reviewsReloadKey]);

  const onDelete = async () => {
    if (bookId === null) return;
    const ok = window.confirm("Kas oled kindel, et soovid raamatu kustutada?");
    if (!ok) return;
    setDeleteSubmitting(true);
    try {
      await deleteBook(bookId);
      navigate("/books");
    } catch (e: unknown) {
      setBookError(getApiErrorMessage(e));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const onEdit = async (values: Parameters<typeof updateBook>[1]) => {
    if (bookId === null) return;
    setEditSubmitting(true);
    try {
      const updated = await updateBook(bookId, values);
      setBook(updated);
      setEditOpen(false);
    } finally {
      setEditSubmitting(false);
    }
  };

  const onCreateReview = async (values: Parameters<typeof createBookReview>[1]) => {
    if (bookId === null) return;
    setReviewSubmitting(true);
    try {
      await createBookReview(bookId, values);
      setReviewsReloadKey((x) => x + 1);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-slate-600">
            <Link to="/books" className="text-slate-900 underline hover:text-slate-700">
              Raamatud
            </Link>{" "}
            / Detail
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{book?.title ?? "Raamatu detail"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
            onClick={() => navigate("/books")}
          >
            Tagasi nimekirja
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => setEditOpen(true)}
            disabled={!book || bookLoading}
          >
            Muuda
          </button>
          <button
            type="button"
            className="rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
            onClick={onDelete}
            disabled={deleteSubmitting || bookLoading || !book}
          >
            {deleteSubmitting ? "Kustutan..." : "Kustuta"}
          </button>
        </div>
      </div>

      {bookLoading ? <LoadingSpinner label="Laen raamatu andmeid..." /> : null}
      {bookError ? <ErrorBanner message={bookError} /> : null}

      {book ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pealkiri</div>
                <div className="mt-1 text-slate-900">{book.title}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">ISBN</div>
                <div className="mt-1 text-slate-900">{book.isbn}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aasta</div>
                <div className="mt-1 text-slate-900">{book.publishedYear}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lehekülgi</div>
                <div className="mt-1 text-slate-900">{book.pageCount}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Keel</div>
                <div className="mt-1 text-slate-900">{book.language}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autor</div>
                <div className="mt-1 text-slate-900">{book.authorName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kirjastus</div>
                <div className="mt-1 text-slate-900">{book.publisherName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Žanrid</div>
                <div className="mt-1 text-slate-900">{book.genres.join(", ")}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kirjeldus</div>
                <div className="mt-1 whitespace-pre-wrap text-slate-900">{book.description}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta</div>
                <div className="mt-1 text-sm text-slate-700">
                  Loodud: {formatDate(book.createdAt)} · Uuendatud: {formatDate(book.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Keskmine hinnang</div>
              {avgLoading ? <div className="mt-3"><LoadingSpinner /></div> : null}
              {avgError ? <div className="mt-3"><ErrorBanner message={avgError} /></div> : null}
              {avg ? (
                <div className="mt-3">
                  <div className="text-3xl font-semibold text-slate-900">{avg.averageRating.toFixed(2)}</div>
                  <div className="mt-1 text-sm text-slate-600">Arvustusi: {avg.totalReviews}</div>
                </div>
              ) : null}
            </div>

            {book.coverImage ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img src={book.coverImage} alt={book.title} className="h-64 w-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Arvustused</div>
            <div className="text-sm text-slate-600">GET /api/v1/books/:id/reviews</div>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-800 hover:bg-slate-50"
            onClick={() => setReviewsReloadKey((x) => x + 1)}
          >
            Värskenda
          </button>
        </div>

        {reviewsLoading ? <div className="mt-4"><LoadingSpinner label="Laen arvustusi..." /></div> : null}
        {reviewsError ? <div className="mt-4"><ErrorBanner message={reviewsError} /></div> : null}

        {!reviewsLoading && reviews.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">Arvustusi pole veel.</div>
        ) : null}

        {reviews.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">{r.userName}</div>
                  <div className="text-sm text-slate-700">Hinnang: {r.rating}/5</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">{formatDate(r.createdAt)}</div>
                <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{r.comment}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="text-lg font-semibold text-slate-900">Lisa arvustus</div>
          <div className="mt-3">
            <ReviewForm submitting={reviewSubmitting || bookId === null} onSubmit={onCreateReview} />
          </div>
        </div>
      </div>

      {editOpen && book ? (
        <Modal
          title="Muuda raamatut"
          onClose={() => {
            if (editSubmitting) return;
            setEditOpen(false);
          }}
        >
          <BookForm
            initialValues={{
              title: book.title,
              isbn: book.isbn,
              publishedYear: book.publishedYear,
              pageCount: book.pageCount,
              language: book.language,
              description: book.description,
              coverImage: book.coverImage,
              authorId: book.authorId,
              publisherId: book.publisherId,
              genreIds: book.genreIds,
            }}
            submitLabel="Salvesta"
            submitting={editSubmitting}
            onCancel={() => {
              if (editSubmitting) return;
              setEditOpen(false);
            }}
            onSubmit={onEdit}
          />
        </Modal>
      ) : null}
    </div>
  );
}
