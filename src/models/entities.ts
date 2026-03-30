export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  birthYear: number;
  nationality: string;
  biography?: string;
  createdAt: string;
}

export interface Publisher {
  id: number;
  name: string;
  country: string;
  foundedYear: number;
  website?: string;
  createdAt: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number;
  pageCount: number;
  language: string;
  description: string;
  coverImage?: string;
  authorId: number;
  publisherId: number;
  genreIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  bookId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorDetail {
  field: string;
  message: string;
}
