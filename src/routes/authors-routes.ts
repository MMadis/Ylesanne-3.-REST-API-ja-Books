import { FastifyInstance } from "fastify";
import {
  createAuthor,
  deleteAuthor,
  getAuthorBooks,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../services/library-service";
import {
  authorsQuerySchema,
  createAuthorSchema,
  idParamSchema,
  updateAuthorSchema,
  validate,
} from "../validators/schemas";

export async function authorsRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/authors", async (request, reply) => {
    const body = validate(createAuthorSchema, request.body);
    const created = await createAuthor(body);
    reply.status(201).send({ data: created });
  });

  app.get("/api/v1/authors", async (request) => {
    const query = validate(authorsQuerySchema, request.query);
    const result = await getAuthors(query);
    return { data: result };
  });

  app.get("/api/v1/authors/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = await getAuthorById(params.id);
    return { data: result };
  });

  app.put("/api/v1/authors/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const body = validate(updateAuthorSchema, request.body);
    const updated = await updateAuthor(params.id, body);
    return { data: updated };
  });

  app.delete("/api/v1/authors/:id", async (request, reply) => {
    const params = validate(idParamSchema, request.params);
    await deleteAuthor(params.id);
    reply.status(204).send();
  });

  app.get("/api/v1/authors/:id/books", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = await getAuthorBooks(params.id);
    return { data: result };
  });
}
