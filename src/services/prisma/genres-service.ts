import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { Genre } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { BookView } from "../mock-library-service";

type GenreInput = Omit<Genre, "id">;

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

function toGenre(genre: { id: number; name: string }): Genre {
  return {
    id: genre.id,
    name: genre.name,
  };
}

function toBookView(book: any): BookView {
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
