export function getPaginationResponse(
  page: number,
  pageSize: number,
  total: number,
) {
  return {
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
  };
}