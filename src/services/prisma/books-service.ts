import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errors";
import { buildPaginationMeta } from "../../utils/pagination";

interface PagedResult<T> {
  data: T[];
  pagination: any;
}

type BookInput = any;
type ReviewInput = any;

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

function toReview(review: any) {
  return {
    id: review.id,
    bookId: review.bookId,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

function toBookView(book: any) {
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
    genreIds: book.genres.map((genre: any) => genre.id),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    authorName: `${book.author.firstName} ${book.author.lastName}`,
    publisherName: book.publisher.name,
    genres: book.genres.map((genre: any) => genre.name),
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
  const found = await prisma.genre.findMany({ where: { id: { in: genreIds }, deletedAt: null }, select: { id: true } });
  if (found.length !== genreIds.length) {
    throw new AppError("One or more genres not found", 404);
  }
}

export async function getBooks(query: any): Promise<PagedResult<any>> {
  try {
    const sortBy = query.sortBy ?? "title";
    const order = query.order ?? "asc";
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = { deletedAt: null };

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
      where.publisher = { name: { contains: query.publisher, mode: "insensitive" } };
    }

    if (query.genre) {
      where.genres = { some: { name: { contains: query.genre, mode: "insensitive" } } };
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

export async function getBookById(id: number): Promise<any> {
  try {
    const found = await prisma.book.findFirst({ where: { id, deletedAt: null }, include: { author: true, publisher: true, genres: true } });
    if (!found) {
      throw new AppError("Book not found", 404);
    }
    return toBookView(found);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createBook(input: BookInput): Promise<any> {
  try {
    const created = await prisma.$transaction(async (tx) => {
      const author = await tx.author.findFirst({ where: { id: input.authorId, deletedAt: null }, select: { id: true } });
      if (!author) {
        throw new AppError("Author not found", 404);
      }

      const publisher = await tx.publisher.findFirst({ where: { id: input.publisherId, deletedAt: null }, select: { id: true } });
      if (!publisher) {
        throw new AppError("Publisher not found", 404);
      }

      const foundGenres = await tx.genre.findMany({ where: { id: { in: input.genreIds }, deletedAt: null }, select: { id: true } });
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
          genres: { connect: input.genreIds.map((id: number) => ({ id })) },
        },
        include: { author: true, publisher: true, genres: true },
      });
    });

    return toBookView(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateBook(id: number, input: Partial<BookInput>): Promise<any> {
  try {
    await ensureBookExists(id);

    if (input.authorId !== undefined) {
      await ensureAuthorExists(input.authorId);
    }

    if (input.publisherId !== undefined) {
      await ensurePublisherExists(input.publisherId);
    }

    if (input.genreIds !== undefined) {
      await ensureGenreIdsExist(input.genreIds as number[]);
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
        genres: input.genreIds ? { set: (input.genreIds as number[]).map((genreId) => ({ id: genreId })) } : undefined,
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
    await prisma.book.update({ data: { deletedAt: new Date() }, where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function createBookReview(bookId: number, input: ReviewInput): Promise<any> {
  try {
    await ensureBookExists(bookId);
    const created = await prisma.review.create({ data: { bookId, userName: input.userName, rating: input.rating, comment: input.comment } });
    return toReview(created);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getBookReviews(bookId: number, query: any): Promise<any[]> {
  try {
    await ensureBookExists(bookId);
    const order = query.order ?? "desc";

    const result = await prisma.review.findMany({
      where: { bookId, deletedAt: null, rating: query.rating },
      orderBy: { createdAt: order },
    });

    return result.map((review) => toReview(review));
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getBookAverageRating(bookId: number): Promise<{ bookId: number; averageRating: number; totalReviews: number }> {
  try {
    await ensureBookExists(bookId);

    const aggregate = await prisma.review.aggregate({ where: { bookId, deletedAt: null }, _avg: { rating: true }, _count: { rating: true } });

    return {
      bookId,
      averageRating: Number((aggregate._avg.rating ?? 0).toFixed(2)),
      totalReviews: aggregate._count.rating,
    };
  } catch (error) {
    mapPrismaError(error);
  }
}
