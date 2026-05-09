import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { fetchAuthors, fetchGenres, fetchPublishers, getApiErrorMessage } from "../api";
import type { Author, CreateBookInput, Genre, Publisher } from "../api";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingSpinner } from "./LoadingSpinner";

function nonEmpty(value: string): string | null {
  return value.trim().length > 0 ? null : "Väli on kohustuslik";
}

function parsePositiveInt(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function BookForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: {
  initialValues?: Partial<CreateBookInput>;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: CreateBookInput) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [isbn, setIsbn] = useState(initialValues?.isbn ?? "");
  const [publishedYear, setPublishedYear] = useState(
    initialValues?.publishedYear ? String(initialValues.publishedYear) : ""
  );
  const [pageCount, setPageCount] = useState(initialValues?.pageCount ? String(initialValues.pageCount) : "");
  const [language, setLanguage] = useState(initialValues?.language ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  const [authorId, setAuthorId] = useState(initialValues?.authorId ? String(initialValues.authorId) : "");
  const [publisherId, setPublisherId] = useState(initialValues?.publisherId ? String(initialValues.publisherId) : "");
  const [genreIds, setGenreIds] = useState<number[]>(initialValues?.genreIds ?? []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setOptionsLoading(true);
    setOptionsError(null);
    Promise.all([fetchAuthors(controller.signal), fetchPublishers(controller.signal), fetchGenres(controller.signal)])
      .then(([a, p, g]) => {
        setAuthors(a);
        setPublishers(p);
        setGenres(g);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setOptionsError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setOptionsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    const titleErr = nonEmpty(title);
    if (titleErr) errors.title = titleErr;
    const isbnErr = nonEmpty(isbn);
    if (isbnErr) errors.isbn = isbnErr;
    if (parsePositiveInt(publishedYear) === null) errors.publishedYear = "Sisesta korrektne aasta";
    if (parsePositiveInt(pageCount) === null) errors.pageCount = "Sisesta korrektne lehekülgede arv";
    const langErr = nonEmpty(language);
    if (langErr) errors.language = langErr;
    const descErr = nonEmpty(description);
    if (descErr) errors.description = descErr;
    if (parsePositiveInt(authorId) === null) errors.authorId = "Vali autor";
    if (parsePositiveInt(publisherId) === null) errors.publisherId = "Vali kirjastus";
    if (genreIds.length === 0) errors.genreIds = "Vali vähemalt 1 žanr";
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [authorId, description, genreIds.length, isbn, language, pageCount, publishedYear, publisherId, title]);

  const toggleGenre = (id: number) => {
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validation.isValid) {
      setSubmitError("Kontrolli vormi välju");
      return;
    }

    const parsedYear = parsePositiveInt(publishedYear);
    const parsedPageCount = parsePositiveInt(pageCount);
    const parsedAuthorId = parsePositiveInt(authorId);
    const parsedPublisherId = parsePositiveInt(publisherId);
    if (parsedYear === null || parsedPageCount === null || parsedAuthorId === null || parsedPublisherId === null) {
      setSubmitError("Kontrolli vormi välju");
      return;
    }

    const payload: CreateBookInput = {
      title: title.trim(),
      isbn: isbn.trim(),
      publishedYear: parsedYear,
      pageCount: parsedPageCount,
      language: language.trim(),
      description: description.trim(),
      coverImage: coverImage.trim().length > 0 ? coverImage.trim() : undefined,
      authorId: parsedAuthorId,
      publisherId: parsedPublisherId,
      genreIds,
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  return (
    <form className="space-y-4" onSubmit={onFormSubmit}>
      {optionsLoading ? <LoadingSpinner label="Laen valikuid..." /> : null}
      {optionsError ? <ErrorBanner message={optionsError} /> : null}
      {submitError ? <ErrorBanner title="Vormi viga" message={submitError} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Pealkiri</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {validation.errors.title ? <div className="text-xs text-rose-700">{validation.errors.title}</div> : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">ISBN</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
          {validation.errors.isbn ? <div className="text-xs text-rose-700">{validation.errors.isbn}</div> : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Aasta</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            inputMode="numeric"
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value)}
          />
          {validation.errors.publishedYear ? (
            <div className="text-xs text-rose-700">{validation.errors.publishedYear}</div>
          ) : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Lehekülgi</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            inputMode="numeric"
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
          />
          {validation.errors.pageCount ? (
            <div className="text-xs text-rose-700">{validation.errors.pageCount}</div>
          ) : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Keel</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
          {validation.errors.language ? <div className="text-xs text-rose-700">{validation.errors.language}</div> : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Pildi URL (valikuline)</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Autor</div>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            disabled={optionsLoading}
          >
            <option value="">Vali...</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
          {validation.errors.authorId ? <div className="text-xs text-rose-700">{validation.errors.authorId}</div> : null}
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Kirjastus</div>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            value={publisherId}
            onChange={(e) => setPublisherId(e.target.value)}
            disabled={optionsLoading}
          >
            <option value="">Vali...</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {validation.errors.publisherId ? (
            <div className="text-xs text-rose-700">{validation.errors.publisherId}</div>
          ) : null}
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-800">Kirjeldus</div>
        <textarea
          className="h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {validation.errors.description ? (
          <div className="text-xs text-rose-700">{validation.errors.description}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-800">Žanrid</div>
          {validation.errors.genreIds ? <div className="text-xs text-rose-700">{validation.errors.genreIds}</div> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {genres.map((g) => (
            <label key={g.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={genreIds.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
                disabled={optionsLoading}
              />
              <span className="text-sm text-slate-800">{g.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
          onClick={onCancel}
          disabled={submitting}
        >
          Tühista
        </button>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Salvestan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
