import { getDataSourceMode } from "../config/data-source";
import * as mockService from "./mock-library-service";
import * as prismaService from "./prisma-library-service";

export type { BooksQuery, AuthorsQuery, PublishersQuery, ReviewsQuery, BookView } from "./mock-library-service";

const service = getDataSourceMode() === "prisma" ? prismaService : mockService;

/**
 * Returns a paginated list of books according to `BooksQuery`.
 */
export const getBooks = service.getBooks;

/**
 * Returns a single book by id.
 */
export const getBookById = service.getBookById;

/**
 * Create a new book and return the created view.
 */
export const createBook = service.createBook;

/**
 * Update an existing book and return the updated view.
 */
export const updateBook = service.updateBook;

/**
 * Soft-delete a book by id.
 */
export const deleteBook = service.deleteBook;

/**
 * Create a review for a book.
 */
export const createBookReview = service.createBookReview;

/**
 * Get reviews for a given book id.
 */
export const getBookReviews = service.getBookReviews;

/**
 * Get average rating and review count for a book.
 */
export const getBookAverageRating = service.getBookAverageRating;

/**
 * Get a review by id.
 */
export const getReviewById = service.getReviewById;

/**
 * Update an existing review.
 */
export const updateReview = service.updateReview;

/**
 * Delete a review by id.
 */
export const deleteReview = service.deleteReview;

/**
 * List authors.
 */
export const getAuthors = service.getAuthors;

/**
 * Get author by id.
 */
export const getAuthorById = service.getAuthorById;

/**
 * Create new author.
 */
export const createAuthor = service.createAuthor;

/**
 * Update an author.
 */
export const updateAuthor = service.updateAuthor;

/**
 * Delete an author.
 */
export const deleteAuthor = service.deleteAuthor;

/**
 * Get books for a specific author.
 */
export const getAuthorBooks = service.getAuthorBooks;

/**
 * List publishers.
 */
export const getPublishers = service.getPublishers;

/**
 * Get publisher by id.
 */
export const getPublisherById = service.getPublisherById;

/**
 * Create a publisher.
 */
export const createPublisher = service.createPublisher;

/**
 * Update a publisher.
 */
export const updatePublisher = service.updatePublisher;

/**
 * Delete a publisher.
 */
export const deletePublisher = service.deletePublisher;

/**
 * Get books for a specific publisher.
 */
export const getPublisherBooks = service.getPublisherBooks;

/**
 * List genres.
 */
export const getGenres = service.getGenres;

/**
 * Get genre by id.
 */
export const getGenreById = service.getGenreById;

/**
 * Create a genre.
 */
export const createGenre = service.createGenre;

/**
 * Get books for a specific genre.
 */
export const getGenreBooks = service.getGenreBooks;
