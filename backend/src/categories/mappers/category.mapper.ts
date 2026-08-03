import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';


import { CategoryResponseDto } from '../dto/category-response.dto';
import { BaseMapper } from '@/common/mappers/base.mapper';

@Injectable()
export class CategoryMapper
  extends BaseMapper<Category, CategoryResponseDto>
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

}