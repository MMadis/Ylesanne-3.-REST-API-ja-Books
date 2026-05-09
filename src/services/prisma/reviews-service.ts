import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { Review } from "../../models/entities";
import { AppError } from "../../utils/errors";

type ReviewInput = Omit<Review, "id" | "createdAt" | "bookId">;

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
