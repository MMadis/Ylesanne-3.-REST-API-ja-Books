import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getApiErrorMessage } from "../api";
import type { CreateReviewInput } from "../api";
import { ErrorBanner } from "./ErrorBanner";

function nonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function ReviewForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (values: CreateReviewInput) => void | Promise<void>;
}) {
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    const r = Number(rating);
    return nonEmpty(userName) && nonEmpty(comment) && Number.isInteger(r) && r >= 1 && r <= 5;
  }, [comment, rating, userName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError("Kontrolli vormi välju");
      return;
    }
    try {
      await onSubmit({
        userName: userName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      });
      setUserName("");
      setRating("5");
      setComment("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error ? <ErrorBanner title="Arvustuse viga" message={error} /> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 sm:col-span-2">
          <div className="text-sm font-medium text-slate-800">Kasutajanimi</div>
          <input
            className="input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={submitting}
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-800">Hinnang</div>
          <select
            className="select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            disabled={submitting}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1">
        <div className="text-sm font-medium text-slate-800">Kommentaar</div>
        <textarea
          className="textarea h-24"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Lisan..." : "Lisa arvustus"}
        </button>
      </div>
    </form>
  );
}
