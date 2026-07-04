export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_PAGINATION: Required<PaginationParams> = { page: 1, pageSize: 20 };

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  params: Required<PaginationParams> = DEFAULT_PAGINATION
): PaginatedResult<T> {
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}
