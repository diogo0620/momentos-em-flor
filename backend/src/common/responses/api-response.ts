
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends PaginationMetadata {
  items: T[];
}

export class ApiResponse {
  static success<T>(data: T): T {
    return data;
  }

  static paginated<T>(
    items: T[],
    pagination: PaginationMetadata,
  ): PaginatedResponse<T> {
    return {
      items,
      ...pagination,
    };
  }
}
