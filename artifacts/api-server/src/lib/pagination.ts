interface PaginationQuery {
  page?: unknown;
  pageSize?: unknown;
}

export interface Pagination {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: PaginationQuery): Pagination {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
