import { FastifyInstance } from "fastify";
import {
  createBook,
  createBookReview,
  deleteBook,
  getBookAverageRating,
  getBookById,
  getBookReviews,
  getBooks,
  updateBook,
} from "../services/library-service";
import {
  bookIdParamSchema,
  booksQuerySchema,
  createBookSchema,
  createReviewSchema,
  idParamSchema,
  reviewsQuerySchema,
  updateBookSchema,
  validate,
} from "../validators/schemas";

export async function booksRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/books", async (request, reply) => {
    const body = validate(createBookSchema, request.body);
    const created = createBook(body);
    reply.status(201).send({ data: created });
  });

  app.get("/api/v1/books", async (request) => {
    const query = validate(booksQuerySchema, request.query);
    const result = getBooks(query);
    return result;
  });

  app.get("/api/v1/books/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const found = getBookById(params.id);
    return { data: found };
  });

  app.put("/api/v1/books/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const body = validate(updateBookSchema, request.body);
    const updated = updateBook(params.id, body);
    return { data: updated };
  });

  app.delete("/api/v1/books/:id", async (request, reply) => {
    const params = validate(idParamSchema, request.params);
    deleteBook(params.id);
    reply.status(204).send();
  });

  app.post("/api/v1/books/:bookId/reviews", async (request, reply) => {
    const params = validate(bookIdParamSchema, request.params);
    const body = validate(createReviewSchema, request.body);
    const created = createBookReview(params.bookId, body);
    reply.status(201).send({ data: created });
  });

  app.get("/api/v1/books/:bookId/reviews", async (request) => {
    const params = validate(bookIdParamSchema, request.params);
    const query = validate(reviewsQuerySchema, request.query);
    const result = getBookReviews(params.bookId, query);
    return { data: result };
  });

  app.get("/api/v1/books/:id/average-rating", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = getBookAverageRating(params.id);
    return { data: result };
  });
}
