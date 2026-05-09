import { Publisher } from "../../models/entities";
import { AppError } from "../../utils/errors";
import { BookView, PublishersQuery, mockData } from "../mock-library-service";

type PublisherInput = Omit<Publisher, "id" | "createdAt">;

let nextPublisherId = 5;

// We need to copy `toBookViewMock` or adjust it. Better to re-import it from a shared place or just mock-library-service!
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

export async function getPublishers(query: PublishersQuery): Promise<Publisher[]> {
  let result = [...mockData.publishers];

  if (query.name) {
    const searchName = query.name.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(searchName));
  }
  if (query.country) {
    const searchCountry = query.country.toLowerCase();
    result = result.filter((p) => p.country.toLowerCase().includes(searchCountry));
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublisherById(id: number): Promise<Publisher> {
  const publisher = mockData.publishers.find((p) => p.id === id);
  if (!publisher) {
    throw new AppError("Publisher not found", 404);
  }
  return { ...publisher };
}

export async function createPublisher(input: PublisherInput): Promise<Publisher> {
  const publisher: Publisher = {
    ...input,
    id: nextPublisherId++,
    createdAt: new Date().toISOString(),
  };

  mockData.publishers.push(publisher);
  return { ...publisher };
}

export async function updatePublisher(id: number, input: Partial<PublisherInput>): Promise<Publisher> {
  const index = mockData.publishers.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new AppError("Publisher not found", 404);
  }

  const updated = {
    ...mockData.publishers[index],
    ...input,
  };
  mockData.publishers[index] = updated;

  return { ...updated };
}

export async function deletePublisher(id: number): Promise<void> {
  const index = mockData.publishers.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new AppError("Publisher not found", 404);
  }

  const hasBooks = mockData.books.some((b) => b.publisherId === id);
  if (hasBooks) {
    throw new AppError("Cannot delete publisher with existing books", 409);
  }

  mockData.publishers.splice(index, 1);
}

export async function getPublisherBooks(publisherId: number): Promise<BookView[]> {
  const publisher = mockData.publishers.find((p) => p.id === publisherId);
  if (!publisher) {
    throw new AppError("Publisher not found", 404);
  }

  return mockData.books
    .filter((b) => b.publisherId === publisherId)
    .map(toBookViewMock)
    .sort((a, b) => a.title.localeCompare(b.title));
}
