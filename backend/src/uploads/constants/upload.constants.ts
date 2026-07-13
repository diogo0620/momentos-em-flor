export const UPLOAD_PATHS = {
  TEMP: 'uploads/temp',
  PRODUCTS: 'uploads/products',
  CATEGORIES: 'uploads/categories',
  FLORISTS: 'uploads/florists',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;