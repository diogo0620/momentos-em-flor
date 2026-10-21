
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Category } from '@prisma/client';

import { AdminCategoryResponseDto } from '../dtos/admin-category-response.dto';
import { AdminCategoryListResponseDto } from '../dtos/admin-category-list-response.dto';

@Injectable()
export class AdminCategoriesMapper extends BaseMapper<
  Category,
  AdminCategoryResponseDto,
  AdminCategoryListResponseDto
> {
  toDetailResponse(category: Category): AdminCategoryResponseDto {
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

  protected toListItemResponse(
    category: Category,
  ): AdminCategoryListResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      active: category.active
    };
  }
}
