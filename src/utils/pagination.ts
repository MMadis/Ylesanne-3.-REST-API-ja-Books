import { PaginationMeta } from "../models/entities";

export function buildPaginationMeta(totalItems: number, currentPage: number, itemsPerPage: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

export function paginate<T>(items: T[], page: number, limit: number): { data: T[]; totalItems: number } {
  const offset = (page - 1) * limit;
  return {
    data: items.slice(offset, offset + limit),
    totalItems: items.length,
  };
}
