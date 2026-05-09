import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Author, Book, Genre, PaginationMeta, Publisher, Review } from "../models/entities";
import { AppError } from "../utils/errors";
import { buildPaginationMeta } from "../utils/pagination";
import { AuthorsQuery, BookView, BooksQuery, PublishersQuery, ReviewsQuery } from "./mock-library-service";
import * as booksService from "./prisma/books-service";
import * as authorsService from "./prisma/authors-service";
import * as publishersService from "./prisma/publishers-service";
import * as genresService from "./prisma/genres-service";
import * as reviewsService from "./prisma/reviews-service";

interface PagedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

type BookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;
type AuthorInput = Omit<Author, "id" | "createdAt">;
type PublisherInput = Omit<Publisher, "id" | "createdAt">;
type GenreInput = Omit<Genre, "id">;
type ReviewInput = Omit<Review, "id" | "createdAt" | "bookId">;

type BookWithRelations = Prisma.BookGetPayload<{
  include: { author: true; publisher: true; genres: true };
}>;

function mapPrismaError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined) ?? [];
      const field = target[0] ?? "field";
      throw new AppError("Conflict", 409, [{ field, message: "Must be unique" }]);
    }

    if (error.code === "P2025") {
      throw new AppError("Resource not found", 404);
    }
  }

  throw error;
}

function toAuthor(author: {
  id: number;
  firstName: string;
  lastName: string;
  birthYear: number;
  nationality: string;
  biography: string | null;
  createdAt: Date;
}): Author {
  return {
    id: author.id,
    firstName: author.firstName,
    lastName: author.lastName,
    birthYear: author.birthYear,
    nationality: author.nationality,
    biography: author.biography ?? undefined,
    createdAt: author.createdAt.toISOString(),
  };
}

function toPublisher(publisher: {
  id: number;
  name: string;
  country: string;
  foundedYear: number;
  website: string | null;
  createdAt: Date;
}): Publisher {
  return {
    id: publisher.id,
    name: publisher.name,
    country: publisher.country,
    foundedYear: publisher.foundedYear,
    website: publisher.website ?? undefined,
    createdAt: publisher.createdAt.toISOString(),
  };
}

function toGenre(genre: { id: number; name: string }): Genre {
  return {
    id: genre.id,
    name: genre.name,
  };
}

function toReview(review: {
  id: number;
  bookId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}): Review {
  return {
    id: review.id,
    bookId: review.bookId,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

function toBookView(book: BookWithRelations): BookView {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publishedYear: book.publishedYear,
    pageCount: book.pageCount,
    language: book.language,
    description: book.description,
    coverImage: book.coverImage ?? undefined,
    authorId: book.authorId,
    publisherId: book.publisherId,
    genreIds: book.genres.map((genre) => genre.id),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    authorName: `${book.author.firstName} ${book.author.lastName}`,
    publisherName: book.publisher.name,
    genres: book.genres.map((genre) => genre.name),
  };
}

async function ensureBookExists(id: number): Promise<void> {
  const exists = await prisma.book.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) {
    throw new AppError("Book not found", 404);
  }
}

async function ensureAuthorExists(id: number): Promise<void> {
  const exists = await prisma.author.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) {
    throw new AppError("Author not found", 404);
  }
}

async function ensurePublisherExists(id: number): Promise<void> {
  const exists = await prisma.publisher.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) {
    throw new AppError("Publisher not found", 404);
  }
}

async function ensureGenreIdsExist(genreIds: number[]): Promise<void> {
  const found = await prisma.genre.findMany({
    where: { id: { in: genreIds }, deletedAt: null },
    select: { id: true },
  });
  if (found.length !== genreIds.length) {
    throw new AppError("One or more genres not found", 404);
  }
}

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
