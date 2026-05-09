import { z } from "zod";
import { ErrorDetail } from "../models/entities";
import { AppError } from "../utils/errors";

const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;

/**
 * Schema for routes with `:id` path parameter.
 */
export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

// Note: `bookIdParamSchema` was removed as it was unused; use `idParamSchema`
// for routes that include a single numeric id parameter.

export const createBookSchema = z.object({
  title: z.string().min(1),
  isbn: z.string().regex(isbnRegex, "Invalid ISBN format"),
  publishedYear: z.number().int().min(1000).max(2100),
  pageCount: z.number().int().positive(),
  language: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().url().optional(),
  authorId: z.number().int().positive(),
  publisherId: z.number().int().positive(),
  genreIds: z.array(z.number().int().positive()).min(1),
});

export const updateBookSchema = createBookSchema.partial();

export const booksQuerySchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  year: z.coerce.number().int().optional(),
  publisher: z.string().optional(),
  sortBy: z.enum(["title", "publishedYear"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createReviewSchema = z.object({
  userName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewsQuerySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createAuthorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthYear: z.number().int(),
  nationality: z.string().min(1),
  biography: z.string().optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export const authorsQuerySchema = z.object({
  lastName: z.string().optional(),
  nationality: z.string().optional(),
  sortBy: z.enum(["lastName"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createPublisherSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  foundedYear: z.number().int(),
  website: z.string().url().optional(),
});

export const updatePublisherSchema = createPublisherSchema.partial();

export const publishersQuerySchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
});

export const createGenreSchema = z.object({
  name: z.string().min(1),
});

function normalizePath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "body";
  }
  return path
    .map((item) => (typeof item === "symbol" ? item.toString() : String(item)))
    .join(".");
}

function zodDetails(error: z.ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: normalizePath(issue.path),
    message: issue.message,
  }));
}

/**
 * Validate `input` against `schema`. Throws `AppError(400)` on failure.
 */
export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("Validation failed", 400, zodDetails(parsed.error));
  }
  return parsed.data;
}
