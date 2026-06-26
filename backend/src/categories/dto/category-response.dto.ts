import { Category } from '@prisma/client';

export class CategoryResponseDto {
  id: number;

  name: string;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(
    category: Category,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static fromEntities(
    categories: Category[],
  ): CategoryResponseDto[] {
    return categories.map(
      CategoryResponseDto.fromEntity,
    );
  }
}