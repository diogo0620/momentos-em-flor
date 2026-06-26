export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pages: number;
    },
  ) {
    return {
      success: true,
      data,
      pagination,
    };
  }
}