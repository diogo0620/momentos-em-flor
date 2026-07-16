export class CategoryResponseDto {
  id: number;

  name: string;

  slug: string;

  description?: string | null;

  active: boolean;

  createdAt: Date;

  updatedAt: Date;
}