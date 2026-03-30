import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../utils/errors";

export function errorHandler(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.message,
      details: error.details ?? [],
    });
    return;
  }

  reply.status(500).send({
    error: "Internal server error",
    details: [],
  });
}
