import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';

import { PublicCategoryListResponseDto } from '../dtos/public-category-list-response.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';
import { BaseMapper } from '@/common/mappers/base.mapper';

@Injectable()
export class PublicCategoriesMapper{



    constructor(
        private readonly storageService: SupabaseStorageService,
    ) {
    }

    toListResponse(
        categories: Category[],
    ): PublicCategoryListResponseDto[] {
        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description ?? undefined,
            image: category.imagePath ? this.storageService.getPublicUrl(category.imagePath) : undefined
        }));
    }
}