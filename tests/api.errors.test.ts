import { buildApp } from "../src/app";

describe("Library API error behavior (mock mode)", () => {
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

  it("returns 404 for missing book", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/books/99999" });
    const payload = res.json();

    expect(res.statusCode).toBe(404);
    expect(payload.error).toBe("Book not found");
  });

  it("returns 409 for duplicate ISBN", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/books",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Duplicate ISBN",
        isbn: "9780747532699",
        publishedYear: 2020,
        pageCount: 123,
        language: "English",
        description: "Conflict case",
        authorId: 1,
        publisherId: 1,
        genreIds: [1],
      },
    });
    const payload = res.json();

    expect(res.statusCode).toBe(409);
    expect(payload.error).toContain("ISBN");
  });

  it("returns 409 when deleting author with books", async () => {
    const res = await app.inject({ method: "DELETE", url: "/api/v1/authors/1", headers: { authorization: `Bearer ${token}` } });
    const payload = res.json();

    expect(res.statusCode).toBe(409);
    expect(payload.error).toContain("Cannot delete author");
  });

  it("returns 404 for missing review", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/reviews/99999" });
    const payload = res.json();

    expect(res.statusCode).toBe(404);
    expect(payload.error).toBe("Review not found");
  });

  it("returns 404 for unknown route", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/unknown" });
    const payload = res.json();

    expect(res.statusCode).toBe(404);
    expect(payload.error).toBe("Resource not found");
  });
});
