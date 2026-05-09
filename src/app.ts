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

/**
 * Build and configure the Fastify application instance.
 * Throws when required environment variables (e.g. `JWT_SECRET`) are missing.
 */
export function buildApp() {
  const app = Fastify({ logger: true });
  const dataSourceMode = getDataSourceMode();

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET environment variable. Set JWT_SECRET to a secure value.");
  }

  app.register(jwt, { secret: jwtSecret });

  app.addHook("onRequest", async (request, reply) => {
    if (["POST", "PUT", "DELETE"].includes(request.method as string) && request.url.startsWith("/api/v1")) {
       try {
         await request.jwtVerify();
       } catch (err) {
         return reply.status(401).send({ error: "Unauthorized", details: [] });
       }
    }
  });

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

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
      const { prisma } = await import("./lib/prisma");
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
