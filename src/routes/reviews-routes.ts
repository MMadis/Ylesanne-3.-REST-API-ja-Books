import { FastifyInstance } from "fastify";
import { deleteReview, getReviewById, updateReview } from "../services/library-service";
import { idParamSchema, updateReviewSchema, validate } from "../validators/schemas";

export async function reviewsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/reviews/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const result = await getReviewById(params.id);
    return { data: result };
  });

  app.put("/api/v1/reviews/:id", async (request) => {
    const params = validate(idParamSchema, request.params);
    const body = validate(updateReviewSchema, request.body);
    const result = await updateReview(params.id, body);
    return { data: result };
  });

  app.delete("/api/v1/reviews/:id", async (request, reply) => {
    const params = validate(idParamSchema, request.params);
    await deleteReview(params.id);
    reply.status(204).send();
  });
}
