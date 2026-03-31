import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { booksRoutes } from "./routes/books-routes";
import { authorsRoutes } from "./routes/authors-routes";
import { publishersRoutes } from "./routes/publishers-routes";
import { genresRoutes } from "./routes/genres-routes";
import { reviewsRoutes } from "./routes/reviews-routes";
import { errorHandler } from "./middleware/error-handler";
import { getDataSourceMode } from "./config/data-source";
import { prisma } from "./lib/prisma";

export function buildApp() {
  const app = Fastify({ logger: true });
  const dataSourceMode = getDataSourceMode();

  app.register(cors, { origin: true });

  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      error: "Too many requests",
      details: [],
    }),
  });

  app.setErrorHandler(errorHandler);

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: "Resource not found",
      details: [],
    });
  });

  app.get("/health", async () => ({ status: "ok" }));

  if (dataSourceMode === "prisma") {
    app.addHook("onClose", async () => {
      await prisma.$disconnect();
    });
  }

  app.register(booksRoutes);
  app.register(authorsRoutes);
  app.register(publishersRoutes);
  app.register(genresRoutes);
  app.register(reviewsRoutes);

  return app;
}
