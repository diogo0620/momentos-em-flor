
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Category } from '@prisma/client';

import { AdminCategoryResponseDto } from '../dtos/admin-category-response.dto';
import { AdminCategoryListResponseDto } from '../dtos/admin-category-list-response.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

@Injectable()
export class AdminCategoriesMapper extends BaseMapper<
  Category,
  AdminCategoryResponseDto,
  AdminCategoryListResponseDto
> {

  constructor(
    private readonly storageService: SupabaseStorageService,
  ) {
    super();
  }

  toDetailResponse(category: Category): AdminCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      active: category.active,
      image: category.imagePath ? this.storageService.getPublicUrl(category.imagePath) : "",
      featured: category.featured,
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
      image: category.imagePath ? this.storageService.getPublicUrl(category.imagePath) : "",
      featured: category.featured,
      active: category.active
    };
  }
}
