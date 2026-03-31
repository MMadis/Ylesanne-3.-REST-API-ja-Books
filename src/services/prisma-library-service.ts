import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Author, Book, Genre, PaginationMeta, Publisher, Review } from "../models/entities";
import { AppError } from "../utils/errors";
import { buildPaginationMeta } from "../utils/pagination";
import { AuthorsQuery, BookView, BooksQuery, PublishersQuery, ReviewsQuery } from "./mock-library-service";

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
  const exists = await prisma.book.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError("Book not found", 404);
  }
}

async function ensureAuthorExists(id: number): Promise<void> {
  const exists = await prisma.author.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError("Author not found", 404);
  }
}

async function ensurePublisherExists(id: number): Promise<void> {
  const exists = await prisma.publisher.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError("Publisher not found", 404);
  }
}

async function ensureGenreIdsExist(genreIds: number[]): Promise<void> {
  const found = await prisma.genre.findMany({
    where: { id: { in: genreIds } },
    select: { id: true },
  });
  if (found.length !== genreIds.length) {
    throw new AppError("One or more genres not found", 404);
  }
}

export async function getBooks(query: BooksQuery): Promise<PagedResult<BookView>> {
  try {
    const sortBy = query.sortBy ?? "title";
    const order = query.order ?? "asc";
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.BookWhereInput = {};

    if (query.title) {
      where.title = { contains: query.title, mode: "insensitive" };
    }

    if (query.language) {
      where.language = { contains: query.language, mode: "insensitive" };
    }

    if (query.year !== undefined) {
      where.publishedYear = query.year;
    }

    if (query.author) {
      where.author = {
        OR: [
          { firstName: { contains: query.author, mode: "insensitive" } },
          { lastName: { contains: query.author, mode: "insensitive" } },
        ],
      };
    }

    if (query.publisher) {
      where.publisher = {
        name: { contains: query.publisher, mode: "insensitive" },
      };
    }

    if (query.genre) {
      where.genres = {
        some: {
          name: { contains: query.genre, mode: "insensitive" },
        },
      };
    }

    const [totalItems, rows] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: { author: true, publisher: true, genres: true },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => toBookView(row)),
      pagination: buildPaginationMeta(totalItems, page, limit),
    };
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getBookById(id: number): Promise<BookView> {
  try {
    const found = await prisma.book.findUnique({
      where: { id },
      include: { author: true, publisher: true, genres: true },
    });
    if (!found) {
      throw new AppError("Book not found", 404);
    }
    return toBookView(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createBook(input: BookInput): Promise<BookView> {
  try {
    const created = await prisma.$transaction(async (tx) => {
      const author = await tx.author.findUnique({ where: { id: input.authorId }, select: { id: true } });
      if (!author) {
        throw new AppError("Author not found", 404);
      }

      const publisher = await tx.publisher.findUnique({ where: { id: input.publisherId }, select: { id: true } });
      if (!publisher) {
        throw new AppError("Publisher not found", 404);
      }

      const foundGenres = await tx.genre.findMany({ where: { id: { in: input.genreIds } }, select: { id: true } });
      if (foundGenres.length !== input.genreIds.length) {
        throw new AppError("One or more genres not found", 404);
      }

      return tx.book.create({
        data: {
          title: input.title,
          isbn: input.isbn,
          publishedYear: input.publishedYear,
          pageCount: input.pageCount,
          language: input.language,
          description: input.description,
          coverImage: input.coverImage,
          authorId: input.authorId,
          publisherId: input.publisherId,
          genres: {
            connect: input.genreIds.map((id) => ({ id })),
          },
        },
        include: { author: true, publisher: true, genres: true },
      });
    });

    return toBookView(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateBook(id: number, input: Partial<BookInput>): Promise<BookView> {
  try {
    await ensureBookExists(id);

    if (input.authorId !== undefined) {
      await ensureAuthorExists(input.authorId);
    }

    if (input.publisherId !== undefined) {
      await ensurePublisherExists(input.publisherId);
    }

    if (input.genreIds !== undefined) {
      await ensureGenreIdsExist(input.genreIds);
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: input.title,
        isbn: input.isbn,
        publishedYear: input.publishedYear,
        pageCount: input.pageCount,
        language: input.language,
        description: input.description,
        coverImage: input.coverImage,
        authorId: input.authorId,
        publisherId: input.publisherId,
        genres: input.genreIds
          ? {
              set: input.genreIds.map((genreId) => ({ id: genreId })),
            }
          : undefined,
      },
      include: { author: true, publisher: true, genres: true },
    });

    return toBookView(updated);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteBook(id: number): Promise<void> {
  try {
    await prisma.book.delete({ where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createBookReview(bookId: number, input: ReviewInput): Promise<Review> {
  try {
    await ensureBookExists(bookId);
    const created = await prisma.review.create({
      data: {
        bookId,
        userName: input.userName,
        rating: input.rating,
        comment: input.comment,
      },
    });
    return toReview(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getBookReviews(bookId: number, query: ReviewsQuery): Promise<Review[]> {
  try {
    await ensureBookExists(bookId);
    const order = query.order ?? "desc";

    const result = await prisma.review.findMany({
      where: {
        bookId,
        rating: query.rating,
      },
      orderBy: {
        createdAt: order,
      },
    });

    return result.map((review) => toReview(review));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getBookAverageRating(
  bookId: number,
): Promise<{ bookId: number; averageRating: number; totalReviews: number }> {
  try {
    await ensureBookExists(bookId);

    const aggregate = await prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      bookId,
      averageRating: Number((aggregate._avg.rating ?? 0).toFixed(2)),
      totalReviews: aggregate._count.rating,
    };
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getReviewById(id: number): Promise<Review> {
  try {
    const found = await prisma.review.findUnique({ where: { id } });
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
    await prisma.review.delete({ where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getAuthors(query: AuthorsQuery): Promise<Author[]> {
  try {
    const order = query.order ?? "asc";
    const result = await prisma.author.findMany({
      where: {
        lastName: query.lastName ? { contains: query.lastName, mode: "insensitive" } : undefined,
        nationality: query.nationality ? { contains: query.nationality, mode: "insensitive" } : undefined,
      },
      orderBy: query.sortBy === "lastName" ? { lastName: order } : undefined,
    });

    return result.map((author) => toAuthor(author));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getAuthorById(id: number): Promise<Author> {
  try {
    const found = await prisma.author.findUnique({ where: { id } });
    if (!found) {
      throw new AppError("Author not found", 404);
    }
    return toAuthor(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createAuthor(input: AuthorInput): Promise<Author> {
  try {
    const created = await prisma.author.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        birthYear: input.birthYear,
        nationality: input.nationality,
        biography: input.biography,
      },
    });
    return toAuthor(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateAuthor(id: number, input: Partial<AuthorInput>): Promise<Author> {
  try {
    const updated = await prisma.author.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        birthYear: input.birthYear,
        nationality: input.nationality,
        biography: input.biography,
      },
    });
    return toAuthor(updated);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteAuthor(id: number): Promise<void> {
  try {
    const hasBooks = await prisma.book.count({ where: { authorId: id } });
    if (hasBooks > 0) {
      throw new AppError("Cannot delete author with existing books", 409);
    }
    await prisma.author.delete({ where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getAuthorBooks(authorId: number): Promise<BookView[]> {
  try {
    await ensureAuthorExists(authorId);
    const result = await prisma.book.findMany({
      where: { authorId },
      include: { author: true, publisher: true, genres: true },
      orderBy: { title: "asc" },
    });
    return result.map((book) => toBookView(book));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getPublishers(query: PublishersQuery): Promise<Publisher[]> {
  try {
    const result = await prisma.publisher.findMany({
      where: {
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
    const found = await prisma.publisher.findUnique({ where: { id } });
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
    const hasBooks = await prisma.book.count({ where: { publisherId: id } });
    if (hasBooks > 0) {
      throw new AppError("Cannot delete publisher with existing books", 409);
    }
    await prisma.publisher.delete({ where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getPublisherBooks(publisherId: number): Promise<BookView[]> {
  try {
    await ensurePublisherExists(publisherId);
    const result = await prisma.book.findMany({
      where: { publisherId },
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
    const result = await prisma.genre.findMany({ orderBy: { name: "asc" } });
    return result.map((genre) => toGenre(genre));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getGenreById(id: number): Promise<Genre> {
  try {
    const found = await prisma.genre.findUnique({ where: { id } });
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
    const exists = await prisma.genre.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new AppError("Genre not found", 404);
    }

    const rows = await prisma.book.findMany({
      where: {
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
