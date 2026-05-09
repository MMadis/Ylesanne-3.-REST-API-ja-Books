import { Review } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { mockData } from "../mock-library-service";

type ReviewInput = Omit<Review, "id" | "createdAt" | "bookId">;

export async function getReviewById(id: number): Promise<Review> {
  const review = mockData.reviews.find((r) => r.id === id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  return { ...review };
}

export async function updateReview(id: number, input: Partial<ReviewInput>): Promise<Review> {
  const index = mockData.reviews.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new AppError("Review not found", 404);
  }

  const updated = {
    ...mockData.reviews[index],
    ...input,
  };
  mockData.reviews[index] = updated;

  return { ...updated };
}

export async function deleteReview(id: number): Promise<void> {
  const index = mockData.reviews.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new AppError("Review not found", 404);
  }

  mockData.reviews.splice(index, 1);
}
