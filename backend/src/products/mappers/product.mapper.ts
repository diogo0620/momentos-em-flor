import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';

import { Mapper } from '@/common/mappers/mapper.interface';

import { ProductResponseDto } from '../dto/product-response';

@Injectable()
export class ProductMapper
    implements Mapper<Product, ProductResponseDto> {
    toResponse(product: Product): ProductResponseDto {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? undefined,
            active: product.active,

            pricingType: product.pricingType,
            basePrice: product.basePrice.toNumber(),
            categoryId: product.categoryId,

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }

    toResponses(
        products: Product[],
    ): ProductResponseDto[] {
        return products.map(product =>
            this.toResponse(product),
        );
    }
}