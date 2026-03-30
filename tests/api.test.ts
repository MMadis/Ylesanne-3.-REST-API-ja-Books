import request from "supertest";
import { buildApp } from "../src/app";

describe("Library API", () => {
  const app = buildApp();

  afterAll(async () => {
    await app.close();
  });

  it("returns health status", async () => {
    const res = await request(app.server).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns paginated books", async () => {
    const res = await request(app.server).get("/api/v1/books?page=1&limit=5&sortBy=title&order=asc");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.pagination.itemsPerPage).toBe(5);
  });

  it("creates review for existing book", async () => {
    const res = await request(app.server).post("/api/v1/books/1/reviews").send({
      userName: "test-user",
      rating: 5,
      comment: "Great",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.bookId).toBe(1);
    expect(res.body.data.rating).toBe(5);
  });

  it("returns 400 for invalid isbn", async () => {
    const res = await request(app.server).post("/api/v1/books").send({
      title: "Broken ISBN",
      isbn: "abc",
      publishedYear: 2020,
      pageCount: 100,
      language: "English",
      description: "Invalid data",
      authorId: 1,
      publisherId: 1,
      genreIds: [1],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
