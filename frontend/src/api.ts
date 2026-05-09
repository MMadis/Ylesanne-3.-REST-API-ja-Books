import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details: ErrorDetail[];
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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

export interface BookView extends Book {
  authorName: string;
  publisherName: string;
  genres: string[];
}

export interface Review {
  id: number;
  bookId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BooksQuery {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  year?: number;
  publisher?: string;
  sortBy?: "title" | "publishedYear";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ReviewsQuery {
  rating?: number;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
}

export type CreateBookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;
export type UpdateBookInput = Partial<CreateBookInput>;

export type CreateReviewInput = Omit<Review, "id" | "createdAt" | "bookId">;

export interface BooksListResponse {
  data: BookView[];
  pagination: PaginationMeta;
}

export interface AverageRating {
  bookId: number;
  averageRating: number;
  totalReviews: number;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const serverMessage = axiosError.response?.data?.error;
    if (serverMessage) return serverMessage;
    if (axiosError.code === "ERR_CANCELED") return "Päring tühistati";
    return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return "Tekkis ootamatu viga";
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export async function fetchBooks(query: BooksQuery, signal?: AbortSignal): Promise<BooksListResponse> {
  const res = await api.get<BooksListResponse>("/books", { params: query, signal });
  return res.data;
}

export async function fetchBook(id: number, signal?: AbortSignal): Promise<BookView> {
  const res = await api.get<ApiResponse<BookView>>(`/books/${id}`, { signal });
  return res.data.data;
}

export async function createBook(input: CreateBookInput): Promise<BookView> {
  const res = await api.post<ApiResponse<BookView>>("/books", input);
  return res.data.data;
}

export async function updateBook(id: number, input: UpdateBookInput): Promise<BookView> {
  const res = await api.put<ApiResponse<BookView>>(`/books/${id}`, input);
  return res.data.data;
}

export async function deleteBook(id: number): Promise<void> {
  await api.delete(`/books/${id}`);
}

export async function fetchAuthors(signal?: AbortSignal): Promise<Author[]> {
  const res = await api.get<ApiResponse<Author[]>>("/authors", { signal });
  return res.data.data;
}

export async function fetchPublishers(signal?: AbortSignal): Promise<Publisher[]> {
  const res = await api.get<ApiResponse<Publisher[]>>("/publishers", { signal });
  return res.data.data;
}

export async function fetchGenres(signal?: AbortSignal): Promise<Genre[]> {
  const res = await api.get<ApiResponse<Genre[]>>("/genres", { signal });
  return res.data.data;
}

export async function fetchBookReviews(bookId: number, query: ReviewsQuery, signal?: AbortSignal): Promise<Review[]> {
  const res = await api.get<ApiResponse<Review[]>>(`/books/${bookId}/reviews`, { params: query, signal });
  return res.data.data;
}

export async function createBookReview(bookId: number, input: CreateReviewInput): Promise<Review> {
  const res = await api.post<ApiResponse<Review>>(`/books/${bookId}/reviews`, input);
  return res.data.data;
}

export async function fetchBookAverageRating(bookId: number, signal?: AbortSignal): Promise<AverageRating> {
  const res = await api.get<ApiResponse<AverageRating>>(`/books/${bookId}/average-rating`, { signal });
  return res.data.data;
}
