import { FastifyInstance } from "fastify";
import {
  createPublisher,
  deletePublisher,
  getPublisherBooks,
  getPublisherById,
  getPublishers,
  updatePublisher,
} from "../services/library-service";
import {
  createPublisherSchema,
  idParamSchema,
  publishersQuerySchema,
  updatePublisherSchema,
  validate,
} from "../validators/schemas";

export async function publishersRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/publishers", async (request, reply) => {
    const body = validate(createPublisherSchema, request.body);
    const created = createPublisher(body);
    reply.status(201).send({ data: created });
  });

  app.get("/api/v1/publishers", async (request) => {
    const query = validate(publishersQuerySchema, request.query);
    const result = getPublishers(query);
    return { data: result };
  });

  app.get("/api/v1/publishers/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = getPublisherById(params.id);
    return { data: result };
  });

  app.put("/api/v1/publishers/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const body = validate(updatePublisherSchema, request.body);
    const updated = updatePublisher(params.id, body);
    return { data: updated };
  });

  app.delete("/api/v1/publishers/:id", async (request, reply) => {
    const params = validate(idParamSchema, request.params);
    deletePublisher(params.id);
    reply.status(204).send();
  });

  app.get("/api/v1/publishers/:id/books", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = getPublisherBooks(params.id);
    return { data: result };
  });
}
