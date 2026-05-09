import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { Publisher } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { BookView, PublishersQuery } from "../mock-library-service";

type PublisherInput = Omit<Publisher, "id" | "createdAt">;

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

async function ensurePublisherExists(id: number): Promise<void> {
  const exists = await prisma.publisher.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) {
    throw new AppError("Publisher not found", 404);
  }
}

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
