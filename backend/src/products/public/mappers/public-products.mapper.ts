
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Prisma, Product } from '@prisma/client';
import { PublicProductListResponseDto } from '../dtos/public-product-list-response.dto';
import { PublicProductResponseDto } from '../dtos/public-product-response.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

type PublicProductDetail = Prisma.ProductGetPayload<{
    include: {
        categories: { select: { id: true; name: true } };
        components: true;
        variants: true;
        images: true;
    };
}>;

export type PublicProductWithImages = Prisma.ProductGetPayload<{
    include: {
        images: {
            where: {
                isPrimary: true;
            };
            take: 1;
        };
    };
}>;

@Injectable()
export class PublicProductsMapper extends BaseMapper<
    Product,
    PublicProductResponseDto,
    PublicProductListResponseDto
> {

    constructor(
        private readonly storageService: SupabaseStorageService,
    ) {
        super();
    }


    toDetailResponse(
        product: PublicProductDetail,
    ): PublicProductResponseDto {

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.customerPrice),
            categories: product.categories.map((category) => ({ id: category.id, name: category.name })),

            images: product.images.map((image) =>this.storageService.getPublicUrl(image.path)),

            components: product.components.map((component) => ({
                id: component.id,
                name: component.name,
                minQuantity: component.minQuantity,
                recommendedQuantity: component.recommendedQuantity,
                maxQuantity: component.maxQuantity,
                pricePerAdditionalUnit: Number(component.customerPricePerAdditionalUnit),
            })),

            variants: product.variants.map((variant) => ({
                id: variant.id,
                type: variant.type,
                name: variant.name,
                description: variant.description,
                price: Number(variant.customerPrice),
                image: '',
            })),

            type: product.type,
            rentalDeposit: product.rentalDeposit === null ? undefined : Number(product.rentalDeposit),
        };
    }

    protected toListItemResponse(
        product: PublicProductWithImages,
    ): PublicProductListResponseDto {
        const primaryImage = product.images[0];

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            type: product.type,
            price: product.customerPrice.toNumber(),
            image: primaryImage ? this.storageService.getPublicUrl(primaryImage.path): '',
        };
    }
}
