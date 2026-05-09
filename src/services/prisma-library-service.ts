import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Author, Book, Genre, PaginationMeta, Publisher, Review } from "../models/entities";
import { AppError } from "../utils/errors";
import { buildPaginationMeta } from "../utils/pagination";
import { AuthorsQuery, BookView, BooksQuery, PublishersQuery, ReviewsQuery } from "./mock-library-service";
import * as booksService from "./prisma/books-service";
import * as authorsService from "./prisma/authors-service";

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

export async function getReviewById(id: number): Promise<Review> {
  try {
    const found = await prisma.review.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError("Review not found", 404);
    }
    return toReview(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateReview(id: number, input: Partial<ReviewInput>): Promise<Review> {
  try {
    const exists = await prisma.review.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!exists) {
      throw new AppError("Review not found", 404);
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        userName: input.userName,
        rating: input.rating,
        comment: input.comment,
      },
    });
    return toReview(updated);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteReview(id: number): Promise<void> {
  try {
    await prisma.review.update({ data: { deletedAt: new Date() }, where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export const getAuthors = authorsService.getAuthors;

export const getAuthorById = authorsService.getAuthorById;

export const createAuthor = authorsService.createAuthor;

export const updateAuthor = authorsService.updateAuthor;

export const deleteAuthor = authorsService.deleteAuthor;

export const getAuthorBooks = authorsService.getAuthorBooks;

export async function getPublishers(query: PublishersQuery): Promise<Publisher[]> {
  try {
    const result = await prisma.publisher.findMany({
      where: {
        deletedAt: null,
        name: query.name ? { contains: query.name, mode: "insensitive" } : undefined,
        country: query.country ? { contains: query.country, mode: "insensitive" } : undefined,
      },
      orderBy: { name: "asc" },
    });

    return result.map((publisher) => toPublisher(publisher));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getPublisherById(id: number): Promise<Publisher> {
  try {
    const found = await prisma.publisher.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError("Publisher not found", 404);
    }
    return toPublisher(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createPublisher(input: PublisherInput): Promise<Publisher> {
  try {
    const created = await prisma.publisher.create({
      data: {
        name: input.name,
        country: input.country,
        foundedYear: input.foundedYear,
        website: input.website,
      },
    });
    return toPublisher(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updatePublisher(id: number, input: Partial<PublisherInput>): Promise<Publisher> {
  try {
    await ensurePublisherExists(id);

    const updated = await prisma.publisher.update({
      where: { id },
      data: {
        name: input.name,
        country: input.country,
        foundedYear: input.foundedYear,
        website: input.website,
      },
    });
    return toPublisher(updated);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deletePublisher(id: number): Promise<void> {
  try {
    const hasBooks = await prisma.book.count({ where: { publisherId: id, deletedAt: null } });
    if (hasBooks > 0) {
      throw new AppError("Cannot delete publisher with existing books", 409);
    }
    await prisma.publisher.update({ data: { deletedAt: new Date() }, where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getPublisherBooks(publisherId: number): Promise<BookView[]> {
  try {
    await ensurePublisherExists(publisherId);
    const result = await prisma.book.findMany({
      where: { publisherId, deletedAt: null },
      include: { author: true, publisher: true, genres: true },
      orderBy: { title: "asc" },
    });
    return result.map((book) => toBookView(book));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const result = await prisma.genre.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
    return result.map((genre) => toGenre(genre));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getGenreById(id: number): Promise<Genre> {
  try {
    const found = await prisma.genre.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError("Genre not found", 404);
    }
    return toGenre(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createGenre(input: GenreInput): Promise<Genre> {
  try {
    const created = await prisma.genre.create({
      data: {
        name: input.name,
      },
    });
    return toGenre(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getGenreBooks(id: number): Promise<BookView[]> {
  try {
    const exists = await prisma.genre.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!exists) {
      throw new AppError("Genre not found", 404);
    }

    const rows = await prisma.book.findMany({
      where: {
        deletedAt: null,
        genres: {
          some: {
            id,
          },
        },
      },
      include: { author: true, publisher: true, genres: true },
      orderBy: { title: "asc" },
    });

    return rows.map((book) => toBookView(book));
  } catch (error) {
    mapPrismaError(error);
  }
}
