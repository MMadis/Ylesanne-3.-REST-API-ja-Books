import { Genre } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { BookView, mockData } from "../mock-library-service";

type GenreInput = Omit<Genre, "id">;
let nextGenreId = 6;

function toBookViewMock(book: any): BookView {
  const author = mockData.authors.find((a) => a.id === book.authorId);
  const publisher = mockData.publishers.find((p) => p.id === book.publisherId);
  const genres = mockData.genres.filter((g) => book.genreIds.includes(g.id));

  return {
    ...book,
    authorName: author ? `${author.firstName} ${author.lastName}` : "Unknown Author",
    publisherName: publisher?.name || "Unknown Publisher",
    genres: genres.map((g) => g.name),
  };
}

export async function getGenres(): Promise<Genre[]> {
  return [...mockData.genres].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGenreById(id: number): Promise<Genre> {
  const genre = mockData.genres.find((g) => g.id === id);
  if (!genre) {
    throw new AppError("Genre not found", 404);
  }
  return { ...genre };
}

export async function createGenre(input: GenreInput): Promise<Genre> {
  if (mockData.genres.some((g) => g.name.toLowerCase() === input.name.toLowerCase())) {
    throw new AppError("Conflict", 409, [{ field: "name", message: "Genre already exists" }]);
  }

  const genre: Genre = {
    ...input,
    id: nextGenreId++,
  };

  mockData.genres.push(genre);
  return { ...genre };
}

export async function getGenreBooks(id: number): Promise<BookView[]> {
  const genre = mockData.genres.find((g) => g.id === id);
  if (!genre) {
    throw new AppError("Genre not found", 404);
  }

  return mockData.books
    .filter((b) => b.genreIds.includes(id))
    .map(toBookViewMock)
    .sort((a, b) => a.title.localeCompare(b.title));
}
