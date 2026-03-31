import { buildApp } from "../src/app";

describe("Library API", () => {
  const app = buildApp();
  let token: string;

  beforeAll(async () => {
    await app.ready();
    const res = await app.inject({ method: "POST", url: "/api/auth/login" });
    token = res.json().token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health status", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("returns paginated books", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/books?page=1&limit=5&sortBy=title&order=asc",
    });
    const payload = res.json();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.pagination.currentPage).toBe(1);
    expect(payload.pagination.itemsPerPage).toBe(5);
  });

  it("creates review for existing book", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/books/1/reviews",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        userName: "test-user",
        rating: 5,
        comment: "Great",
      },
    });
    const payload = res.json();

    expect(res.statusCode).toBe(201);
    expect(payload.data.bookId).toBe(1);
    expect(payload.data.rating).toBe(5);
  });

  it("returns 400 for invalid isbn", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/books",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Broken ISBN",
        isbn: "abc",
        publishedYear: 2020,
        pageCount: 100,
        language: "English",
        description: "Invalid data",
        authorId: 1,
        publisherId: 1,
        genreIds: [1],
      },
    });
    const payload = res.json();

    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Validation failed");
  });
});
