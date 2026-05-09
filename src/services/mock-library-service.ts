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

import * as booksService from "./mock/books-service";
import * as authorsService from "./mock/authors-service";

export const getBooks = booksService.getBooks;

export const getBookById = booksService.getBookById;

export const createBook = booksService.createBook;

export const updateBook = booksService.updateBook;

export const deleteBook = booksService.deleteBook;

export const createBookReview = booksService.createBookReview;

export const getBookReviews = booksService.getBookReviews;

export const getBookAverageRating = booksService.getBookAverageRating;

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

export const getAuthors = authorsService.getAuthors;

export const getAuthorById = authorsService.getAuthorById;

export const createAuthor = authorsService.createAuthor;

export const updateAuthor = authorsService.updateAuthor;

export const deleteAuthor = authorsService.deleteAuthor;

export const getAuthorBooks = authorsService.getAuthorBooks;

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
