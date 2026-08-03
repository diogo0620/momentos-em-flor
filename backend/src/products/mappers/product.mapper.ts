import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';

import { ProductResponseDto } from '../dto/product-response';
import { CategoryMapper } from '@/categories/mappers/category.mapper';

type ProductWithCategory =
    Prisma.ProductGetPayload<{
        include: {
            category: true;
        };
    }>;

@Injectable()
export class ProductMapper
    extends BaseMapper<
        ProductWithCategory,
        ProductResponseDto
    > {

        constructor(
    private readonly categoryMapper: CategoryMapper,
){
    super();
}

    toResponse(product: ProductWithCategory): ProductResponseDto {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? undefined,
            active: product.active,

            pricingType: product.pricingType,
            basePrice: product.basePrice.toNumber(),
            category: this.categoryMapper.toResponse(product.category),

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}