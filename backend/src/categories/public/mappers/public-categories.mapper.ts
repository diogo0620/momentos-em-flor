import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';

import { PublicCategoryListResponseDto } from '../dtos/public-category-list-response.dto';

@Injectable()
export class PublicCategoriesMapper {
    toListResponse(
        categories: Category[],
    ): PublicCategoryListResponseDto[] {
        return categories.map((category) => ({
            id: category.id,
            name: category.name,
        }));
    }
}