import { Author, Book, Genre, Publisher, Review } from "../models/entities";

const now = new Date().toISOString();

export const authors: Author[] = [
  { id: 1, firstName: "J.K.", lastName: "Rowling", birthYear: 1965, nationality: "British", biography: "Author of Harry Potter series.", createdAt: now },
  { id: 2, firstName: "George", lastName: "Orwell", birthYear: 1903, nationality: "British", biography: "Known for dystopian fiction.", createdAt: now },
  { id: 3, firstName: "J.R.R.", lastName: "Tolkien", birthYear: 1892, nationality: "British", biography: "Author of The Lord of the Rings.", createdAt: now },
  { id: 4, firstName: "Harper", lastName: "Lee", birthYear: 1926, nationality: "American", biography: "Author of To Kill a Mockingbird.", createdAt: now },
  { id: 5, firstName: "Andrus", lastName: "Kivirahk", birthYear: 1970, nationality: "Estonian", biography: "Estonian novelist and satirist.", createdAt: now },
  { id: 6, firstName: "Agatha", lastName: "Christie", birthYear: 1890, nationality: "British", biography: "Detective novels writer.", createdAt: now },
];

export const publishers: Publisher[] = [
  { id: 1, name: "Bloomsbury", country: "United Kingdom", foundedYear: 1986, website: "https://www.bloomsbury.com", createdAt: now },
  { id: 2, name: "Penguin Books", country: "United Kingdom", foundedYear: 1935, website: "https://www.penguin.com", createdAt: now },
  { id: 3, name: "Varrak", country: "Estonia", foundedYear: 1991, website: "https://www.varrak.ee", createdAt: now },
  { id: 4, name: "HarperCollins", country: "United States", foundedYear: 1989, website: "https://www.harpercollins.com", createdAt: now },
];

export const genres: Genre[] = [
  { id: 1, name: "Fantasy" },
  { id: 2, name: "Dystopian" },
  { id: 3, name: "Classic" },
  { id: 4, name: "Mystery" },
  { id: 5, name: "Drama" },
  { id: 6, name: "Satire" },
];

export const books: Book[] = [
  { id: 1, title: "Harry Potter and the Philosopher's Stone", isbn: "9780747532699", publishedYear: 1997, pageCount: 223, language: "English", description: "First Harry Potter novel.", authorId: 1, publisherId: 1, genreIds: [1], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 2, title: "Harry Potter and the Deathly Hallows", isbn: "9780545010221", publishedYear: 2007, pageCount: 607, language: "English", description: "Final Harry Potter novel.", authorId: 1, publisherId: 1, genreIds: [1], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 3, title: "1984", isbn: "9780451524935", publishedYear: 1949, pageCount: 328, language: "English", description: "Dystopian social science fiction novel.", authorId: 2, publisherId: 2, genreIds: [2, 6], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 4, title: "Animal Farm", isbn: "9780451526342", publishedYear: 1945, pageCount: 112, language: "English", description: "Political satire novella.", authorId: 2, publisherId: 2, genreIds: [6, 3], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 5, title: "The Hobbit", isbn: "9780547928227", publishedYear: 1937, pageCount: 310, language: "English", description: "Fantasy adventure novel.", authorId: 3, publisherId: 2, genreIds: [1], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 6, title: "The Fellowship of the Ring", isbn: "9780261102354", publishedYear: 1954, pageCount: 423, language: "English", description: "First volume of The Lord of the Rings.", authorId: 3, publisherId: 2, genreIds: [1], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 7, title: "To Kill a Mockingbird", isbn: "9780061120084", publishedYear: 1960, pageCount: 281, language: "English", description: "Classic of modern American literature.", authorId: 4, publisherId: 4, genreIds: [3, 5], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 8, title: "Rehepapp", isbn: "9789985312711", publishedYear: 2000, pageCount: 256, language: "Estonian", description: "Estonian satirical novel.", authorId: 5, publisherId: 3, genreIds: [6, 1], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 9, title: "Mees, kes teadis ussisonu", isbn: "9789985319963", publishedYear: 2007, pageCount: 420, language: "Estonian", description: "A famous Estonian fantasy novel.", authorId: 5, publisherId: 3, genreIds: [1, 3], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 10, title: "Murder on the Orient Express", isbn: "9780062693662", publishedYear: 1934, pageCount: 256, language: "English", description: "Classic detective novel.", authorId: 6, publisherId: 4, genreIds: [4], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 11, title: "And Then There Were None", isbn: "9780062073488", publishedYear: 1939, pageCount: 300, language: "English", description: "One of the best-selling mystery novels.", authorId: 6, publisherId: 4, genreIds: [4], coverImage: undefined, createdAt: now, updatedAt: now },
  { id: 12, title: "The Silmarillion", isbn: "9780261102736", publishedYear: 1977, pageCount: 365, language: "English", description: "Mythopoeic works by Tolkien.", authorId: 3, publisherId: 2, genreIds: [1], coverImage: undefined, createdAt: now, updatedAt: now },
];

export const reviews: Review[] = [
  { id: 1, bookId: 1, userName: "alice", rating: 5, comment: "Magical and fun.", createdAt: now },
  { id: 2, bookId: 1, userName: "bob", rating: 4, comment: "Great start to the series.", createdAt: now },
  { id: 3, bookId: 2, userName: "charlie", rating: 5, comment: "Perfect ending.", createdAt: now },
  { id: 4, bookId: 3, userName: "diana", rating: 5, comment: "Still relevant today.", createdAt: now },
  { id: 5, bookId: 3, userName: "eve", rating: 4, comment: "Dark and thought-provoking.", createdAt: now },
  { id: 6, bookId: 4, userName: "frank", rating: 4, comment: "Sharp satire.", createdAt: now },
  { id: 7, bookId: 5, userName: "grace", rating: 5, comment: "Timeless adventure.", createdAt: now },
  { id: 8, bookId: 6, userName: "henry", rating: 5, comment: "Epic world-building.", createdAt: now },
  { id: 9, bookId: 7, userName: "irene", rating: 5, comment: "A moving story.", createdAt: now },
  { id: 10, bookId: 8, userName: "jaan", rating: 4, comment: "Very Estonian and witty.", createdAt: now },
  { id: 11, bookId: 9, userName: "kati", rating: 5, comment: "Excellent language and ideas.", createdAt: now },
  { id: 12, bookId: 10, userName: "liam", rating: 4, comment: "Classic mystery setup.", createdAt: now },
  { id: 13, bookId: 11, userName: "mona", rating: 5, comment: "Suspense until the end.", createdAt: now },
  { id: 14, bookId: 12, userName: "nina", rating: 4, comment: "Dense but rewarding.", createdAt: now },
  { id: 15, bookId: 2, userName: "oskar", rating: 5, comment: "Loved every chapter.", createdAt: now },
];

export const idCounters = {
  author: 7,
  publisher: 5,
  genre: 7,
  book: 13,
  review: 16,
};
