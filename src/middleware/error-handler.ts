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

  if ("statusCode" in error && typeof error.statusCode === "number") {
    reply.status(error.statusCode).send({
      error: error.message,
      details: [],
    });
    return;
  }

  _request.log.error({ err: error }, "Unhandled error");

  reply.status(500).send({
    error: "Internal server error",
    details: [],
  });
}
