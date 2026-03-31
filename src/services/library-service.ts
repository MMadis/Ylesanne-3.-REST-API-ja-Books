import { getDataSourceMode } from "../config/data-source";
import * as mockService from "./mock-library-service";
import * as prismaService from "./prisma-library-service";

export type { BooksQuery, AuthorsQuery, PublishersQuery, ReviewsQuery, BookView } from "./mock-library-service";

const service = getDataSourceMode() === "prisma" ? prismaService : mockService;

export const getBooks = service.getBooks;
export const getBookById = service.getBookById;
export const createBook = service.createBook;
export const updateBook = service.updateBook;
export const deleteBook = service.deleteBook;

export const createBookReview = service.createBookReview;
export const getBookReviews = service.getBookReviews;
export const getBookAverageRating = service.getBookAverageRating;

export const getReviewById = service.getReviewById;
export const updateReview = service.updateReview;
export const deleteReview = service.deleteReview;

export const getAuthors = service.getAuthors;
export const getAuthorById = service.getAuthorById;
export const createAuthor = service.createAuthor;
export const updateAuthor = service.updateAuthor;
export const deleteAuthor = service.deleteAuthor;
export const getAuthorBooks = service.getAuthorBooks;

export const getPublishers = service.getPublishers;
export const getPublisherById = service.getPublisherById;
export const createPublisher = service.createPublisher;
export const updatePublisher = service.updatePublisher;
export const deletePublisher = service.deletePublisher;
export const getPublisherBooks = service.getPublisherBooks;

export const getGenres = service.getGenres;
export const getGenreById = service.getGenreById;
export const createGenre = service.createGenre;
export const getGenreBooks = service.getGenreBooks;
