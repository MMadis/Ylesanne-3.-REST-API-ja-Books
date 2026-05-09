import { authors, books, genres, idCounters, publishers, reviews } from "../../data/mock-data";
import { AppError } from "../../utils/errors";
import { buildPaginationMeta, paginate } from "../../utils/pagination";

export interface BooksQuery {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  year?: number;
  publisher?: string;
  sortBy?: "title" | "publishedYear";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface PagedResult<T> {
  data: T[];
  pagination: any;
}

type BookInput = any;
type ReviewInput = any;

function containsInsensitive(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function sortCompare(a: string | number, b: string | number, order: "asc" | "desc"): number {
  if (a < b) return order === "asc" ? -1 : 1;
  if (a > b) return order === "asc" ? 1 : -1;
  return 0;
}

function ensureBookExists(id: number) {
  const found = books.find((book) => book.id === id);
  if (!found) {
    throw new AppError("Book not found", 404);
  }
  return found;
}

function ensureAuthorExists(id: number) {
  const found = authors.find((author) => author.id === id);
  if (!found) {
    throw new AppError("Author not found", 404);
  }
  return found;
}

function ensurePublisherExists(id: number) {
  const found = publishers.find((publisher) => publisher.id === id);
  if (!found) {
    throw new AppError("Publisher not found", 404);
  }
  return found;
}

function ensureGenreExists(id: number) {
  const found = genres.find((genre) => genre.id === id);
  if (!found) {
    throw new AppError("Genre not found", 404);
  }
  return found;
}

function ensureIsbnUnique(isbn: string, excludeBookId?: number): void {
  const found = books.find((book) => book.isbn === isbn && book.id !== excludeBookId);
  if (found) {
    throw new AppError("Book with this ISBN already exists", 409, [{ field: "isbn", message: "Must be unique" }]);
  }
}

function validateRelations(authorId: number, publisherId: number, genreIds: number[]): void {
  ensureAuthorExists(authorId);
  ensurePublisherExists(publisherId);
  genreIds.forEach((genreId) => ensureGenreExists(genreId));
}

function toBookView(book: any) {
  const author = ensureAuthorExists(book.authorId);
  const publisher = ensurePublisherExists(book.publisherId);
  const genreNames = book.genreIds.map((genreId: number) => ensureGenreExists(genreId).name);

  return {
    ...book,
    authorName: `${author.firstName} ${author.lastName}`,
    publisherName: publisher.name,
    genres: genreNames,
  };
}

export function getBooks(query: BooksQuery): PagedResult<any> {
  const sortBy = query.sortBy ?? "title";
  const order = query.order ?? "asc";
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  let filtered = [...books];

  if (query.title) filtered = filtered.filter((book) => containsInsensitive(book.title, query.title as string));
  if (query.language) filtered = filtered.filter((book) => containsInsensitive(book.language, query.language as string));
  if (query.year !== undefined) filtered = filtered.filter((book) => book.publishedYear === query.year);

  if (query.author) {
    filtered = filtered.filter((book) => {
      const author = authors.find((candidate) => candidate.id === book.authorId);
      if (!author) return false;
      const fullName = `${author.firstName} ${author.lastName}`;
      return containsInsensitive(fullName, query.author as string) || containsInsensitive(author.lastName, query.author as string);
    });
  }

  if (query.publisher) {
    filtered = filtered.filter((book) => {
      const publisher = publishers.find((candidate) => candidate.id === book.publisherId);
      return publisher ? containsInsensitive(publisher.name, query.publisher as string) : false;
    });
  }

  if (query.genre) {
    filtered = filtered.filter((book) => {
      const names = book.genreIds.map((genreId: number) => genres.find((genre) => genre.id === genreId)?.name).filter((v: any) => v !== undefined);
      return names.some((name: any) => containsInsensitive(name as string, query.genre as string));
    });
  }

  filtered.sort((a, b) => {
    const aValue = sortBy === "title" ? a.title.toLowerCase() : a.publishedYear;
    const bValue = sortBy === "title" ? b.title.toLowerCase() : b.publishedYear;
    return sortCompare(aValue, bValue, order);
  });

  const paged = paginate(filtered, page, limit);
  const pagination = buildPaginationMeta(paged.totalItems, page, limit);

  return { data: paged.data.map((book) => toBookView(book)), pagination };
}

export function getBookById(id: number) {
  return toBookView(ensureBookExists(id));
}

export function createBook(input: BookInput) {
  ensureIsbnUnique(input.isbn);
  validateRelations(input.authorId, input.publisherId, input.genreIds);

  const now = new Date().toISOString();
  const created = { ...input, id: idCounters.book, createdAt: now, updatedAt: now };
  idCounters.book += 1;
  books.push(created);
  return toBookView(created);
}

export function updateBook(id: number, input: Partial<BookInput>) {
  const existing = ensureBookExists(id);
  if (input.isbn) ensureIsbnUnique(input.isbn, id);
  const merged = { ...existing, ...input, updatedAt: new Date().toISOString() };
  validateRelations(merged.authorId, merged.publisherId, merged.genreIds);
  const index = books.findIndex((book) => book.id === id);
  books[index] = merged;
  return toBookView(merged);
}

export function deleteBook(id: number): void {
  ensureBookExists(id);
  const bookIndex = books.findIndex((book) => book.id === id);
  books.splice(bookIndex, 1);
  for (let i = reviews.length - 1; i >= 0; i -= 1) {
    if (reviews[i].bookId === id) reviews.splice(i, 1);
  }
}

export function createBookReview(bookId: number, input: ReviewInput) {
  ensureBookExists(bookId);
  const review = { ...input, id: idCounters.review, bookId, createdAt: new Date().toISOString() };
  idCounters.review += 1;
  reviews.push(review);
  return review;
}

export function getBookReviews(bookId: number, query: any) {
  ensureBookExists(bookId);
  const order = query.order ?? "desc";
  let filtered = reviews.filter((r) => r.bookId === bookId);
  if (query.rating !== undefined) filtered = filtered.filter((r) => r.rating === query.rating);
  filtered.sort((a, b) => sortCompare(a.createdAt, b.createdAt, order));
  return filtered;
}

export function getBookAverageRating(bookId: number) {
  ensureBookExists(bookId);
  const related = reviews.filter((r) => r.bookId === bookId);
  if (related.length === 0) return { bookId, averageRating: 0, totalReviews: 0 };
  const sum = related.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / related.length;
  return { bookId, averageRating: Number(avg.toFixed(2)), totalReviews: related.length };
}
