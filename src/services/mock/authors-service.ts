import { authors, books, idCounters } from "../../data/mock-data";
import { Author } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { AuthorsQuery, BookView } from "../mock-library-service";

type AuthorInput = Omit<Author, "id" | "createdAt">;

function containsInsensitive(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function sortCompare(a: string | number, b: string | number, order: "asc" | "desc"): number {
  if (a < b) {
    return order === "asc" ? -1 : 1;
  }
  if (a > b) {
    return order === "asc" ? 1 : -1;
  }
  return 0;
}

function ensureAuthorExists(id: number): Author {
  const found = authors.find((author) => author.id === id);
  if (!found) {
    throw new AppError("Author not found", 404);
  }
  return found;
}

function toBookView(book: any): BookView {
  // Re-use logic for mock-book if needed, mock implementation uses minimal expansion
  // Real implementation is in books-service, but for getAuthorBooks we need to return book view
  // In mock, finding authors/publishers manually
  const { authors: memAuthors, publishers, genres } = require("../../data/mock-data");
  
  const author = ensureAuthorExists(book.authorId);
  const publisher = publishers.find((p: any) => p.id === book.publisherId);
  const genreNames = book.genreIds.map((genreId: number) => {
    return genres.find((g: any) => g.id === genreId)?.name ?? "Unknown";
  });

  return {
    ...book,
    authorName: `${author.firstName} ${author.lastName}`,
    publisherName: publisher ? publisher.name : "Unknown",
    genres: genreNames,
  };
}

export function getAuthors(query: AuthorsQuery): Author[] {
  const order = query.order ?? "asc";
  let filtered = [...authors];

  if (query.lastName) {
    filtered = filtered.filter((author) => containsInsensitive(author.lastName, query.lastName as string));
  }

  if (query.nationality) {
    filtered = filtered.filter((author) => containsInsensitive(author.nationality, query.nationality as string));
  }

  if (query.sortBy === "lastName") {
    filtered.sort((a, b) => sortCompare(a.lastName.toLowerCase(), b.lastName.toLowerCase(), order));
  }

  return filtered;
}

export function getAuthorById(id: number): Author {
  return ensureAuthorExists(id);
}

export function createAuthor(input: AuthorInput): Author {
  const author: Author = {
    ...input,
    id: idCounters.author,
    createdAt: new Date().toISOString(),
  };
  idCounters.author += 1;
  authors.push(author);
  return author;
}

export function updateAuthor(id: number, input: Partial<AuthorInput>): Author {
  const existing = ensureAuthorExists(id);
  const updated: Author = {
    ...existing,
    ...input,
  };
  const index = authors.findIndex((author) => author.id === id);
  authors[index] = updated;
  return updated;
}

export function deleteAuthor(id: number): void {
  ensureAuthorExists(id);
  const hasBooks = books.some((book) => book.authorId === id);
  if (hasBooks) {
    throw new AppError("Cannot delete author with existing books", 409);
  }
  const index = authors.findIndex((author) => author.id === id);
  authors.splice(index, 1);
}

export function getAuthorBooks(authorId: number): BookView[] {
  ensureAuthorExists(authorId);
  return books.filter((book) => book.authorId === authorId).map((book) => toBookView(book));
}
