import { FastifyInstance } from "fastify";
import { createGenre, getGenreBooks, getGenreById, getGenres } from "../services/library-service";
import { createGenreSchema, idParamSchema, validate } from "../validators/schemas";

export async function genresRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/genres", async () => {
    const result = getGenres();
    return { data: result };
  });

  app.post("/api/v1/genres", async (request, reply) => {
    const body = validate(createGenreSchema, request.body);
    const created = createGenre(body);
    reply.status(201).send({ data: created });
  });

  app.get("/api/v1/genres/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = getGenreById(params.id);
    return { data: result };
  });

  app.get("/api/v1/genres/:id/books", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = getGenreBooks(params.id);
    return { data: result };
  });
}
