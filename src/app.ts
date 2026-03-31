import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import { booksRoutes } from "./routes/books-routes";
import { authorsRoutes } from "./routes/authors-routes";
import { publishersRoutes } from "./routes/publishers-routes";
import { genresRoutes } from "./routes/genres-routes";
import { reviewsRoutes } from "./routes/reviews-routes";
import { authRoutes } from "./routes/auth-routes";
import { errorHandler } from "./middleware/error-handler";
import { getDataSourceMode } from "./config/data-source";
import { prisma } from "./lib/prisma";

export function buildApp() {
  const app = Fastify({ logger: true });
  const dataSourceMode = getDataSourceMode();

  app.register(jwt, { secret: "super_secret_jwt_key_123" });

  app.addHook("onRequest", async (request, reply) => {
    if (["POST", "PUT", "DELETE"].includes(request.method as string) && request.url.startsWith("/api/v1")) {
       try {
         await request.jwtVerify();
       } catch (err) {
         reply.status(401).send({ error: "Unauthorized" });
       }
    }
  });

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

  app.register(authRoutes);
  app.register(booksRoutes);
  app.register(authorsRoutes);
  app.register(publishersRoutes);
  app.register(genresRoutes);
  app.register(reviewsRoutes);

  return app;
}
