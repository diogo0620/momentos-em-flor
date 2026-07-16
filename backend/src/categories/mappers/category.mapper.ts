import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';

import { Mapper } from '@/common/mappers/mapper.interface';

import { CategoryResponseDto } from '../dto/category-response.dto';

@Injectable()
export class CategoryMapper
  implements Mapper<Category, CategoryResponseDto>
{
  toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  toResponses(
    categories: Category[],
  ): CategoryResponseDto[] {
    return categories.map(category =>
      this.toResponse(category),
    );
  }
}