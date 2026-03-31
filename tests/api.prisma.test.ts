import type { FastifyInstance } from "fastify";

const runPrismaTests = process.env.RUN_PRISMA_TESTS === "true";

(runPrismaTests ? describe : describe.skip)("Library API integration (prisma mode)", () => {
  let app: FastifyInstance;
  const previousMode = process.env.DATA_SOURCE_MODE;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Prisma integration tests");
    }

    process.env.DATA_SOURCE_MODE = "prisma";
    jest.resetModules();
    const appModule = await import("../src/app");
    app = appModule.buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (previousMode === undefined) {
      delete process.env.DATA_SOURCE_MODE;
    } else {
      process.env.DATA_SOURCE_MODE = previousMode;
    }
  });

  it("creates linked entities and computes average rating", async () => {
    const suffix = Date.now().toString();

    const authorRes = await app.inject({
      method: "POST",
      url: "/api/v1/authors",
      payload: {
        firstName: "Test",
        lastName: `Author-${suffix}`,
        birthYear: 1990,
        nationality: "Estonian",
      },
    });
    expect(authorRes.statusCode).toBe(201);
    const authorId = authorRes.json().data.id as number;

    const publisherRes = await app.inject({
      method: "POST",
      url: "/api/v1/publishers",
      payload: {
        name: `Publisher-${suffix}`,
        country: "Estonia",
        foundedYear: 2020,
      },
    });
    expect(publisherRes.statusCode).toBe(201);
    const publisherId = publisherRes.json().data.id as number;

    const genreRes = await app.inject({
      method: "POST",
      url: "/api/v1/genres",
      payload: { name: `Genre-${suffix}` },
    });
    expect(genreRes.statusCode).toBe(201);
    const genreId = genreRes.json().data.id as number;

    const bookRes = await app.inject({
      method: "POST",
      url: "/api/v1/books",
      payload: {
        title: `Prisma Book ${suffix}`,
        isbn: `97812345${suffix.slice(-5)}`,
        publishedYear: 2024,
        pageCount: 250,
        language: "English",
        description: "Prisma integration test book",
        authorId,
        publisherId,
        genreIds: [genreId],
      },
    });
    expect(bookRes.statusCode).toBe(201);
    const bookId = bookRes.json().data.id as number;

    const reviewRes = await app.inject({
      method: "POST",
      url: `/api/v1/books/${bookId}/reviews`,
      payload: {
        userName: "integration-user",
        rating: 5,
        comment: "Excellent",
      },
    });
    expect(reviewRes.statusCode).toBe(201);

    const avgRes = await app.inject({ method: "GET", url: `/api/v1/books/${bookId}/average-rating` });
    const avgPayload = avgRes.json();

    expect(avgRes.statusCode).toBe(200);
    expect(avgPayload.data.totalReviews).toBeGreaterThanOrEqual(1);
    expect(avgPayload.data.averageRating).toBeGreaterThan(0);
  });
});
