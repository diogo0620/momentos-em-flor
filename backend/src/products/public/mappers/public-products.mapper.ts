
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
        addons: { include: { addonProduct: true } };
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
            featured: product.featured,
            categories: product.categories.map((category) => ({ id: category.id, name: category.name })),

            image: product.imagePath ? this.storageService.getPublicUrl(product.imagePath) : undefined,

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
                image: variant.imagePath ? this.storageService.getPublicUrl(variant.imagePath) : '',
            })),
            addons: product.addons.map(({ addonProduct }) => ({
                id: addonProduct.id,
                name: addonProduct.name,
                slug: addonProduct.slug,
                price: Number(addonProduct.customerPrice),
                image: addonProduct.imagePath ? this.storageService.getPublicUrl(addonProduct.imagePath) : '',
                type: addonProduct.type,
                featured: addonProduct.featured,
            })),

            type: product.type,
            rentalDeposit: product.rentalDeposit === null ? undefined : Number(product.rentalDeposit),
            reviews: [],
            reviewSummary: { averageRating: 0, reviewCount: 0 },
        };
    }

    protected toListItemResponse(
        product: Product,
    ): PublicProductListResponseDto {

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            type: product.type,
            featured: product.featured,
            price: product.customerPrice.toNumber(),
            image: product.imagePath ? this.storageService.getPublicUrl(product.imagePath) : undefined,
        };
    }
}
