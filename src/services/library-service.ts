import { getDataSourceMode } from "../config/data-source";
import * as mockService from "./mock-library-service";

export type { BooksQuery, AuthorsQuery, PublishersQuery, ReviewsQuery, BookView } from "./mock-library-service";

type Service = typeof mockService;

let cachedPrismaService: Service | null = null;

function getService(): Service {
  if (getDataSourceMode() === "prisma") {
    if (!cachedPrismaService) {
      cachedPrismaService = require("./prisma-library-service") as Service;
    }
    return cachedPrismaService;
  }
  return mockService;
}

export const getBooks = (...args: Parameters<typeof mockService.getBooks>) => getService().getBooks(...args);
export const getBookById = (...args: Parameters<typeof mockService.getBookById>) => getService().getBookById(...args);
export const createBook = (...args: Parameters<typeof mockService.createBook>) => getService().createBook(...args);
export const updateBook = (...args: Parameters<typeof mockService.updateBook>) => getService().updateBook(...args);
export const deleteBook = (...args: Parameters<typeof mockService.deleteBook>) => getService().deleteBook(...args);

export const createBookReview = (...args: Parameters<typeof mockService.createBookReview>) => getService().createBookReview(...args);
export const getBookReviews = (...args: Parameters<typeof mockService.getBookReviews>) => getService().getBookReviews(...args);
export const getBookAverageRating = (...args: Parameters<typeof mockService.getBookAverageRating>) => getService().getBookAverageRating(...args);

export const getReviewById = (...args: Parameters<typeof mockService.getReviewById>) => getService().getReviewById(...args);
export const updateReview = (...args: Parameters<typeof mockService.updateReview>) => getService().updateReview(...args);
export const deleteReview = (...args: Parameters<typeof mockService.deleteReview>) => getService().deleteReview(...args);

export const getAuthors = (...args: Parameters<typeof mockService.getAuthors>) => getService().getAuthors(...args);
export const getAuthorById = (...args: Parameters<typeof mockService.getAuthorById>) => getService().getAuthorById(...args);
export const createAuthor = (...args: Parameters<typeof mockService.createAuthor>) => getService().createAuthor(...args);
export const updateAuthor = (...args: Parameters<typeof mockService.updateAuthor>) => getService().updateAuthor(...args);
export const deleteAuthor = (...args: Parameters<typeof mockService.deleteAuthor>) => getService().deleteAuthor(...args);
export const getAuthorBooks = (...args: Parameters<typeof mockService.getAuthorBooks>) => getService().getAuthorBooks(...args);

export const getPublishers = (...args: Parameters<typeof mockService.getPublishers>) => getService().getPublishers(...args);
export const getPublisherById = (...args: Parameters<typeof mockService.getPublisherById>) => getService().getPublisherById(...args);
export const createPublisher = (...args: Parameters<typeof mockService.createPublisher>) => getService().createPublisher(...args);
export const updatePublisher = (...args: Parameters<typeof mockService.updatePublisher>) => getService().updatePublisher(...args);
export const deletePublisher = (...args: Parameters<typeof mockService.deletePublisher>) => getService().deletePublisher(...args);
export const getPublisherBooks = (...args: Parameters<typeof mockService.getPublisherBooks>) => getService().getPublisherBooks(...args);

export const getGenres = (...args: Parameters<typeof mockService.getGenres>) => getService().getGenres(...args);
export const getGenreById = (...args: Parameters<typeof mockService.getGenreById>) => getService().getGenreById(...args);
export const createGenre = (...args: Parameters<typeof mockService.createGenre>) => getService().createGenre(...args);
export const getGenreBooks = (...args: Parameters<typeof mockService.getGenreBooks>) => getService().getGenreBooks(...args);

/**
 * Creates and returns the appropriate library service based on the environment mode.
 * Evaluates dynamically on startup.
 */
export function createLibraryService(mode: "mock" | "prisma") {
  if (mode === "prisma") {
    if (!cachedPrismaService) {
      cachedPrismaService = require("./prisma-library-service") as Service;
    }
    return cachedPrismaService;
  }
  return mockService;
}
