import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { Author } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { AuthorsQuery, BookView } from "../mock-library-service";

type AuthorInput = Omit<Author, "id" | "createdAt">;

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

async function ensureAuthorExists(id: number): Promise<void> {
  const exists = await prisma.author.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) {
    throw new AppError("Author not found", 404);
  }
}

export async function getAuthors(query: AuthorsQuery): Promise<Author[]> {
  try {
    const order = query.order ?? "asc";
    const result = await prisma.author.findMany({
      where: {
        deletedAt: null,
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
    const found = await prisma.author.findFirst({ where: { id, deletedAt: null } });
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
    await ensureAuthorExists(id);

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
    const hasBooks = await prisma.book.count({ where: { authorId: id, deletedAt: null } });
    if (hasBooks > 0) {
      throw new AppError("Cannot delete author with existing books", 409);
    }
    await prisma.author.update({ data: { deletedAt: new Date() }, where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getAuthorBooks(authorId: number): Promise<BookView[]> {
  try {
    await ensureAuthorExists(authorId);
    const result = await prisma.book.findMany({
      where: { authorId, deletedAt: null },
      include: { author: true, publisher: true, genres: true },
      orderBy: { title: "asc" },
    });
    return result.map((book) => toBookView(book));
  } catch (error) {
    mapPrismaError(error);
  }
}
