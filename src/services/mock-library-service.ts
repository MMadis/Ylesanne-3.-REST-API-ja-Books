import { authors, books, genres, idCounters, publishers, reviews } from "../data/mock-data";
import { Author, Book, Genre, PaginationMeta, Publisher, Review } from "../models/entities";
import { AppError } from "../utils/errors";
import { buildPaginationMeta, paginate } from "../utils/pagination";

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

export interface AuthorsQuery {
  lastName?: string;
  nationality?: string;
  sortBy?: "lastName";
  order?: "asc" | "desc";
}

export interface PublishersQuery {
  name?: string;
  country?: string;
}

export interface ReviewsQuery {
  rating?: number;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
}

interface PagedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

type BookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;
type AuthorInput = Omit<Author, "id" | "createdAt">;
type PublisherInput = Omit<Publisher, "id" | "createdAt">;
type GenreInput = Omit<Genre, "id">;
type ReviewInput = Omit<Review, "id" | "createdAt" | "bookId">;

function containsInsensitive(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function sortCompare(a: string | number, b: string | number, order: "asc" | "desc"): number {
  if (a < b) {
    return order === "asc" ? -1 : 1;
  }
  if (a > b) {
    return order === "asc" ? 1 : -1;
  }
  return 0;
}

function ensureBookExists(id: number): Book {
  const found = books.find((book) => book.id === id);
  if (!found) {
    throw new AppError("Book not found", 404);
  }
  return found;
}

function ensureAuthorExists(id: number): Author {
  const found = authors.find((author) => author.id === id);
  if (!found) {
    throw new AppError("Author not found", 404);
  }
  return found;
}

function ensurePublisherExists(id: number): Publisher {
  const found = publishers.find((publisher) => publisher.id === id);
  if (!found) {
    throw new AppError("Publisher not found", 404);
  }
  return found;
}

function ensureGenreExists(id: number): Genre {
  const found = genres.find((genre) => genre.id === id);
  if (!found) {
    throw new AppError("Genre not found", 404);
  }
  return found;
}

function ensureReviewExists(id: number): Review {
  const found = reviews.find((review) => review.id === id);
  if (!found) {
    throw new AppError("Review not found", 404);
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
  genreIds.forEach((genreId) => {
    ensureGenreExists(genreId);
  });
}

export interface BookView extends Book {
  authorName: string;
  publisherName: string;
  genres: string[];
}

function toBookView(book: Book): BookView {
  const author = ensureAuthorExists(book.authorId);
  const publisher = ensurePublisherExists(book.publisherId);
  const genreNames = book.genreIds.map((genreId) => ensureGenreExists(genreId).name);

  return {
    ...book,
    authorName: `${author.firstName} ${author.lastName}`,
    publisherName: publisher.name,
    genres: genreNames,
  };
}

export function getBooks(query: BooksQuery): PagedResult<BookView> {
  const sortBy = query.sortBy ?? "title";
  const order = query.order ?? "asc";
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  let filtered = [...books];

  if (query.title) {
    filtered = filtered.filter((book) => containsInsensitive(book.title, query.title as string));
  }

  if (query.language) {
    filtered = filtered.filter((book) => containsInsensitive(book.language, query.language as string));
  }

  if (query.year !== undefined) {
    filtered = filtered.filter((book) => book.publishedYear === query.year);
  }

  if (query.author) {
    filtered = filtered.filter((book) => {
      const author = authors.find((candidate) => candidate.id === book.authorId);
      if (!author) {
        return false;
      }
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
      const names = book.genreIds
        .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
        .filter((value): value is string => value !== undefined);
      return names.some((name) => containsInsensitive(name, query.genre as string));
    });
  }

  filtered.sort((a, b) => {
    const aValue = sortBy === "title" ? a.title.toLowerCase() : a.publishedYear;
    const bValue = sortBy === "title" ? b.title.toLowerCase() : b.publishedYear;
    return sortCompare(aValue, bValue, order);
  });

  const paged = paginate(filtered, page, limit);
  const pagination = buildPaginationMeta(paged.totalItems, page, limit);

  return {
    data: paged.data.map((book) => toBookView(book)),
    pagination,
  };
}

export function getBookById(id: number): BookView {
  return toBookView(ensureBookExists(id));
}

export function createBook(input: BookInput): BookView {
  ensureIsbnUnique(input.isbn);
  validateRelations(input.authorId, input.publisherId, input.genreIds);

  const now = new Date().toISOString();
  const created: Book = {
    ...input,
    id: idCounters.book,
    createdAt: now,
    updatedAt: now,
  };
  idCounters.book += 1;
  books.push(created);

  return toBookView(created);
}

export function updateBook(id: number, input: Partial<BookInput>): BookView {
  const existing = ensureBookExists(id);

  if (input.isbn) {
    ensureIsbnUnique(input.isbn, id);
  }

  const merged: Book = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

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
    if (reviews[i].bookId === id) {
      reviews.splice(i, 1);
    }
  }
}

export function createBookReview(bookId: number, input: ReviewInput): Review {
  ensureBookExists(bookId);
  const review: Review = {
    ...input,
    id: idCounters.review,
    bookId,
    createdAt: new Date().toISOString(),
  };
  idCounters.review += 1;
  reviews.push(review);
  return review;
}

export function getBookReviews(bookId: number, query: ReviewsQuery): Review[] {
  ensureBookExists(bookId);
  const order = query.order ?? "desc";

  let filtered = reviews.filter((review) => review.bookId === bookId);

  if (query.rating !== undefined) {
    filtered = filtered.filter((review) => review.rating === query.rating);
  }

  filtered.sort((a, b) => sortCompare(a.createdAt, b.createdAt, order));
  return filtered;
}

export function getBookAverageRating(bookId: number): { bookId: number; averageRating: number; totalReviews: number } {
  ensureBookExists(bookId);
  const related = reviews.filter((review) => review.bookId === bookId);
  if (related.length === 0) {
    return { bookId, averageRating: 0, totalReviews: 0 };
  }

  const sum = related.reduce((acc, review) => acc + review.rating, 0);
  const avg = sum / related.length;
  return {
    bookId,
    averageRating: Number(avg.toFixed(2)),
    totalReviews: related.length,
  };
}

export function getReviewById(id: number): Review {
  return ensureReviewExists(id);
}

export function updateReview(id: number, input: Partial<ReviewInput>): Review {
  const existing = ensureReviewExists(id);
  const updated: Review = {
    ...existing,
    ...input,
  };
  const index = reviews.findIndex((review) => review.id === id);
  reviews[index] = updated;
  return updated;
}

export function deleteReview(id: number): void {
  ensureReviewExists(id);
  const index = reviews.findIndex((review) => review.id === id);
  reviews.splice(index, 1);
}

export function getAuthors(query: AuthorsQuery): Author[] {
  const order = query.order ?? "asc";
  let filtered = [...authors];

  if (query.lastName) {
    filtered = filtered.filter((author) => containsInsensitive(author.lastName, query.lastName as string));
  }

  if (query.nationality) {
    filtered = filtered.filter((author) => containsInsensitive(author.nationality, query.nationality as string));
  }

  if (query.sortBy === "lastName") {
    filtered.sort((a, b) => sortCompare(a.lastName.toLowerCase(), b.lastName.toLowerCase(), order));
  }

  return filtered;
}

export function getAuthorById(id: number): Author {
  return ensureAuthorExists(id);
}

export function createAuthor(input: AuthorInput): Author {
  const author: Author = {
    ...input,
    id: idCounters.author,
    createdAt: new Date().toISOString(),
  };
  idCounters.author += 1;
  authors.push(author);
  return author;
}

export function updateAuthor(id: number, input: Partial<AuthorInput>): Author {
  const existing = ensureAuthorExists(id);
  const updated: Author = {
    ...existing,
    ...input,
  };
  const index = authors.findIndex((author) => author.id === id);
  authors[index] = updated;
  return updated;
}

export function deleteAuthor(id: number): void {
  ensureAuthorExists(id);
  const hasBooks = books.some((book) => book.authorId === id);
  if (hasBooks) {
    throw new AppError("Cannot delete author with existing books", 409);
  }
  const index = authors.findIndex((author) => author.id === id);
  authors.splice(index, 1);
}

export function getAuthorBooks(authorId: number): BookView[] {
  ensureAuthorExists(authorId);
  return books.filter((book) => book.authorId === authorId).map((book) => toBookView(book));
}

export function getPublishers(query: PublishersQuery): Publisher[] {
  let filtered = [...publishers];

  if (query.name) {
    filtered = filtered.filter((publisher) => containsInsensitive(publisher.name, query.name as string));
  }

  if (query.country) {
    filtered = filtered.filter((publisher) => containsInsensitive(publisher.country, query.country as string));
  }

  return filtered;
}

export function getPublisherById(id: number): Publisher {
  return ensurePublisherExists(id);
}

export function createPublisher(input: PublisherInput): Publisher {
  const exists = publishers.some((publisher) => publisher.name.toLowerCase() === input.name.toLowerCase());
  if (exists) {
    throw new AppError("Publisher already exists", 409, [{ field: "name", message: "Must be unique" }]);
  }

  const publisher: Publisher = {
    ...input,
    id: idCounters.publisher,
    createdAt: new Date().toISOString(),
  };
  idCounters.publisher += 1;
  publishers.push(publisher);
  return publisher;
}

export function updatePublisher(id: number, input: Partial<PublisherInput>): Publisher {
  const existing = ensurePublisherExists(id);

  if (input.name) {
    const conflict = publishers.some(
      (publisher) => publisher.id !== id && publisher.name.toLowerCase() === input.name?.toLowerCase(),
    );
    if (conflict) {
      throw new AppError("Publisher already exists", 409, [{ field: "name", message: "Must be unique" }]);
    }
  }

  const updated: Publisher = {
    ...existing,
    ...input,
  };
  const index = publishers.findIndex((publisher) => publisher.id === id);
  publishers[index] = updated;
  return updated;
}

export function deletePublisher(id: number): void {
  ensurePublisherExists(id);
  const hasBooks = books.some((book) => book.publisherId === id);
  if (hasBooks) {
    throw new AppError("Cannot delete publisher with existing books", 409);
  }
  const index = publishers.findIndex((publisher) => publisher.id === id);
  publishers.splice(index, 1);
}

export function getPublisherBooks(publisherId: number): BookView[] {
  ensurePublisherExists(publisherId);
  return books.filter((book) => book.publisherId === publisherId).map((book) => toBookView(book));
}

export function getGenres(): Genre[] {
  return [...genres];
}

export function getGenreById(id: number): Genre {
  return ensureGenreExists(id);
}

export function createGenre(input: GenreInput): Genre {
  const exists = genres.some((genre) => genre.name.toLowerCase() === input.name.toLowerCase());
  if (exists) {
    throw new AppError("Genre already exists", 409, [{ field: "name", message: "Must be unique" }]);
  }

  const genre: Genre = {
    ...input,
    id: idCounters.genre,
  };
  idCounters.genre += 1;
  genres.push(genre);
  return genre;
}

export function getGenreBooks(id: number): BookView[] {
  ensureGenreExists(id);
  return books.filter((book) => book.genreIds.includes(id)).map((book) => toBookView(book));
}
