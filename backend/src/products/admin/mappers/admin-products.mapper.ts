
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Prisma, Product } from '@prisma/client';
import { AdminProductListResponseDto } from '../dtos/admin-product-list-response.dto';
import { AdminProductResponseDto } from '../dtos/admin-product-response.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

type AdminProductDetail = Prisma.ProductGetPayload<{
    include: {
        categories: { select: { id: true; name: true; } };
        taxCode: true,
        components: true;
        variants: true;
    };
}>;


@Injectable()
export class AdminProductsMapper extends BaseMapper<
    Product,
    AdminProductResponseDto,
    AdminProductListResponseDto
> {

    constructor(
        private readonly storageService: SupabaseStorageService,
    ) {
        super();
    }


    toDetailResponse(
        product: AdminProductDetail,
    ): AdminProductResponseDto {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,

            customerPrice: Number(product.customerPrice),
            floristPrice: Number(product.floristPrice),

            categories: product.categories.map((category) => ({
                id: category.id,
                name: category.name,
            })),

            image: product.imagePath ? this.storageService.getPublicUrl(product.imagePath) : undefined,

            components: product.components.map((component) => ({
                id: component.id,
                name: component.name,
                minQuantity: component.minQuantity,
                recommendedQuantity: component.recommendedQuantity,
                maxQuantity: component.maxQuantity,
                customerPricePerAdditionalUnit: Number(component.customerPricePerAdditionalUnit),
                floristPricePerAdditionalUnit: Number(component.floristPricePerAdditionalUnit),
            })),

            variants: product.variants.map((variant) => ({
                id: variant.id,
                type: variant.type,
                name: variant.name,
                description: variant.description,
                customerPrice: Number(variant.customerPrice),
                floristPrice: Number(variant.floristPrice),
                image: variant.imagePath ? this.storageService.getPublicUrl(variant.imagePath) : undefined,
            })),
            taxCode: {
                id: product.taxCode.id,
                name: product.taxCode.name
            },

            active: product.active,
            type: product.type,
            featured: product.featured,
            rentalDeposit: product.rentalDeposit ? Number(product.rentalDeposit) : undefined,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }

    protected toListItemResponse(
        product: AdminProductDetail,
    ): AdminProductListResponseDto {

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            type: product.type,
            featured: product.featured,
            customerPrice: Number(product.customerPrice),
            floristPrice: Number(product.floristPrice),
            image: product.imagePath ? this.storageService.getPublicUrl(product.imagePath) : undefined,
            active: product.active
        };
    }
}
