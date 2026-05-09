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
import * as publishersService from "./mock/publishers-service";
import * as genresService from "./mock/genres-service";
import * as reviewsService from "./mock/reviews-service";

export const mockData = { authors, books, genres, publishers, reviews };

export const getBooks = booksService.getBooks;

export const getBookById = booksService.getBookById;

export const createBook = booksService.createBook;

export const updateBook = booksService.updateBook;

export const deleteBook = booksService.deleteBook;

export const createBookReview = booksService.createBookReview;

export const getBookReviews = booksService.getBookReviews;

export const getBookAverageRating = booksService.getBookAverageRating;

export const getReviewById = reviewsService.getReviewById;

export const updateReview = reviewsService.updateReview;

export const deleteReview = reviewsService.deleteReview;

export const getAuthors = authorsService.getAuthors;

export const getAuthorById = authorsService.getAuthorById;

export const createAuthor = authorsService.createAuthor;

export const updateAuthor = authorsService.updateAuthor;

export const deleteAuthor = authorsService.deleteAuthor;

export const getAuthorBooks = authorsService.getAuthorBooks;

export const getPublishers = publishersService.getPublishers;

export const getPublisherById = publishersService.getPublisherById;

export const createPublisher = publishersService.createPublisher;

export const updatePublisher = publishersService.updatePublisher;

export const deletePublisher = publishersService.deletePublisher;

export const getPublisherBooks = publishersService.getPublisherBooks;

export const getGenres = genresService.getGenres;

export const getGenreById = genresService.getGenreById;

export const createGenre = genresService.createGenre;

export const getGenreBooks = genresService.getGenreBooks;
