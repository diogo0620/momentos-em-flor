import { Injectable } from '@nestjs/common';
import {
    Prisma,
    ProductVariantType,
} from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { CategoryMapper } from '@/categories/mappers/category.mapper';

import {
    ProductListResponseDto,
} from '../dto/product-list-response.dto';

import {
    ProductDetailResponseDto,
} from '../dto/product-detail-response.dto';
import { ProductAdminDetailResponseDto } from '../dto/admin/product-admin-detail-response.dto';
import { ProductAdminListResponseDto } from '../dto/admin/product-admin-list-response.dto';


/*
 * ============================================================
 * PRISMA TYPES
 * ============================================================
 *
 * List:
 * Only load what is necessary to calculate/display the card.
 *
 * Detail:
 * Load all information required by the product detail page.
 */


/**
 * Product used by the catalogue/list endpoint.
 */
type ProductWithListRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            basePrice: true;

            taxCode: {
                select: {
                    rate: true;
                };
            };

            images: {
                select: {
                    file: {
                        select: {
                            path: true;
                        };
                    };
                };
            };
        };
    }>;


/**
 * Product used by the detail endpoint.
 */
/**
 * Product used by the detail endpoint.
 */
type ProductWithDetailRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            slug: true;
            description: true;
            basePrice: true;

            taxCode: {
                select: {
                    rate: true;
                };
            };

            category: {
                select: {
                    id: true;
                    name: true;
                };
            };

            images: {
                select: {
                    file: {
                        select: {
                            path: true;
                        };
                    };
                };
            };

            components: {
                select: {
                    id: true;
                    name: true;
                    minQuantity: true;
                    recommendedQuantity: true;
                    maxQuantity: true;
                    customerPricePerAdditionalUnit: true;
                };
            };

            variants: {
                select: {
                    id: true;
                    type: true;
                    name: true;
                    code: true;
                    price: true;
                    active: true;

                    image: {
                        select: {
                            file: {
                                select: {
                                    path: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    }>;

    /**
 * Product used by the admin detail endpoint.
 */
type ProductWithAdminDetailRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            slug: true;
            description: true;
            active: true;
            basePrice: true;
            baseFloristCompensation: true;
            sortOrder: true;
            createdAt: true;
            updatedAt: true;
            deletedAt: true;

            taxCode: {
                select: {
                    id: true;
                    code: true;
                    name: true;
                    rate: true;
                    active: true;
                };
            };

            category: {
                select: {
                    id: true;
                    name: true;
                    slug: true;
                    description: true;
                    active: true;
                };
            };

            images: {
                select: {
                    id: true;
                    fileId: true;
                    altText: true;
                    sortOrder: true;
                    isPrimary: true;
                    variantId: true;
                    createdAt: true;
                    updatedAt: true;
                    deletedAt: true;

                    file: {
                        select: {
                            path: true;
                        };
                    };
                };
            };

            components: {
                select: {
                    id: true;
                    name: true;
                    minQuantity: true;
                    recommendedQuantity: true;
                    maxQuantity: true;
                    customerPricePerAdditionalUnit: true;
                    floristCompensationPerAdditionalUnit: true;
                    sortOrder: true;
                    active: true;
                    createdAt: true;
                    updatedAt: true;
                    deletedAt: true;
                };
            };

            variants: {
                select: {
                    id: true;
                    type: true;
                    name: true;
                    code: true;
                    price: true;
                    floristCompensation: true;
                    sortOrder: true;
                    active: true;
                    createdAt: true;
                    updatedAt: true;
                    deletedAt: true;

                    image: {
                        select: {
                            id: true;
                            fileId: true;
                            altText: true;
                            sortOrder: true;
                            isPrimary: true;
                            variantId: true;
                            createdAt: true;
                            updatedAt: true;
                            deletedAt: true;

                            file: {
                                select: {
                                    path: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    }>;

@Injectable()
export class ProductMapper extends BaseMapper<
    ProductWithDetailRelations,
    ProductDetailResponseDto
> {

    constructor(
        private readonly categoryMapper: CategoryMapper,
    ) {
        super();
    }

    private toNumber(value: Prisma.Decimal): number {
    return Number(value);
}


    /*
     * ============================================================
     * PRICE
     * ============================================================
     */

    /**
     * Calculates the final price including VAT.
     */
    private calculateGrossAmount(
        netAmount: number,
        taxRate: number,
    ): number {

        const taxAmount =
            Number(
                (
                    netAmount *
                    taxRate /
                    100
                ).toFixed(2),
            );

        return Number(
            (
                netAmount +
                taxAmount
            ).toFixed(2),
        );
    }


private getProductNetPrice(
    product: {
        basePrice: Prisma.Decimal | null;
        variants?: Array<{
            price: Prisma.Decimal;
        }>;
    },
): number {
    const variantPrice = product.variants?.[0]?.price;

    if (variantPrice) {
        return variantPrice.toNumber();
    }

    return product.basePrice?.toNumber() ?? 0;
}

toAdminListResponse(
    product: {
        id: number;
        name: string;
        slug: string;
        basePrice: Prisma.Decimal;
        active: boolean;
        category: {
            id: number;
            name: string;
        };
        taxCode: {
            rate: Prisma.Decimal;
        };
        images: {
            id: number;
            altText: string | null;
            file: {
                path: string;
            };
        }[];
    },
): ProductAdminListResponseDto {
    const taxRate = product.taxCode.rate.toNumber();
    const netPrice = product.basePrice.toNumber();
    const grossPrice = this.calculateGrossAmount(netPrice, taxRate);

    const image = product.images[0]
        ? {
              url: product.images[0].file.path,
          }
        : null;

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: grossPrice,
        active: product.active,

        image,

        category: {
            id: product.category.id,
            name: product.category.name,
        },
    };
}

toAdminDetailResponse(product: ProductWithAdminDetailRelations) : ProductAdminDetailResponseDto {
    const taxRate = product.taxCode.rate.toNumber();
    const netPrice = product.basePrice.toNumber();
    const grossPrice = this.calculateGrossAmount(netPrice, taxRate);

    return {
        // Product
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        active: product.active,

        basePrice: this.toNumber(product.basePrice),

        baseFloristCompensation: this.toNumber(product.baseFloristCompensation),
        price: grossPrice,
        sortOrder: product.sortOrder,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,

        // Tax code
        taxCode: {
            id: product.taxCode.id,
            code: product.taxCode.code,
            name: product.taxCode.name,
            rate: this.toNumber(
                product.taxCode.rate,
            ),
            active: product.taxCode.active,
        },

        // Category
        category: {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description:
                product.category.description,
            active: product.category.active,
        },

        // Product images
        images: product.images.map((image) => ({
            id: image.id,
            fileId: image.fileId,
            url: image.file.path,
            altText: image.altText,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
            variantId: image.variantId,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
            deletedAt: image.deletedAt,
        })),

        // Components
        components: product.components.map(
            (component) => ({
                id: component.id,
                name: component.name,
                minQuantity:
                    component.minQuantity,
                recommendedQuantity:
                    component.recommendedQuantity,
                maxQuantity:
                    component.maxQuantity,

                customerPricePerAdditionalUnit:
                    this.toNumber(
                        component.customerPricePerAdditionalUnit,
                    ),

                floristCompensationPerAdditionalUnit:
                    this.toNumber(
                        component.floristCompensationPerAdditionalUnit,
                    ),

                sortOrder: component.sortOrder,
                active: component.active,
                createdAt: component.createdAt,
                updatedAt: component.updatedAt,
                deletedAt: component.deletedAt,
            }),
        ),

        // Variants
        variants: product.variants.map(
            (variant) => ({
                id: variant.id,
                type: variant.type,
                name: variant.name,
                code: variant.code,

                // Persisted value — NO VAT calculation
                price: this.toNumber(
                    variant.price,
                ),

                // Persisted value — NO calculation
                floristCompensation:
                    this.toNumber(
                        variant.floristCompensation,
                    ),

                sortOrder: variant.sortOrder,
                active: variant.active,

                image: variant.image
                    ? {
                          id: variant.image.id,
                          fileId:
                              variant.image.fileId,
                          url:
                              variant.image.file.path,
                          altText:
                              variant.image.altText,
                          sortOrder:
                              variant.image.sortOrder,
                          isPrimary:
                              variant.image.isPrimary,
                          variantId:
                              variant.image.variantId,
                          createdAt:
                              variant.image.createdAt,
                          updatedAt:
                              variant.image.updatedAt,
                          deletedAt:
                              variant.image.deletedAt,
                      }
                    : null,

                createdAt: variant.createdAt,
                updatedAt: variant.updatedAt,
                deletedAt: variant.deletedAt,
            }),
        ),
    };
}



    private mapListImage(
    image: ProductWithListRelations['images'][number],
) {
    return {
        url: image.file.path,
    };
}


    /**
     * Maps a detail image.
     */
    private mapDetailImage(
        image: ProductWithDetailRelations['images'][number],
    ) {

        return {
            url: image.file.path,
        };
    }


    /*
     * ============================================================
     * COMPONENTS
     * ============================================================
     */

    private mapComponents(
        components: ProductWithDetailRelations['components'],
    ) {

        return components
            .map(
                component => ({
                    id:
                        component.id,

                    name:
                        component.name,

                    minQuantity:
                        component.minQuantity,

                    recommendedQuantity:
                        component.recommendedQuantity,

                    maxQuantity:
                        component.maxQuantity,

                    customerPricePerAdditionalUnit:
                        component
                            .customerPricePerAdditionalUnit
                            .toNumber(),
                }),
            );
    }


    /*
     * ============================================================
     * VARIANTS
     * ============================================================
     */

    private mapVariants(
        product: ProductWithDetailRelations,
        taxRate: number,
    ) {

        return product.variants
            .filter(
                variant =>
                    variant.active,
            )
            .map(
                variant => {

                    const variantNetPrice =
                        variant.price.toNumber();

                    const variantGrossPrice =
                        this.calculateGrossAmount(
                            variantNetPrice,
                            taxRate,
                        );

                    return {

                        id:
                            variant.id,

                        type:
                            variant.type,

                        name:
                            variant.name,

                        code:
                            variant.code,

                        price:
                            variantGrossPrice,

                        image:
                            variant.image
                                ? {
                                    url:
                                        variant
                                            .image
                                            .file
                                            .path,
                                }
                                : null,
                    };
                },
            );
    }


    /*
     * ============================================================
     * LIST RESPONSE
     * ============================================================
     */

    toListResponse(
    product: ProductWithListRelations,
): ProductListResponseDto {
    const taxRate =
        product.taxCode.rate.toNumber();

    const netPrice = product.basePrice?.toNumber() ?? 0;

    const grossPrice =
        this.calculateGrossAmount(
            netPrice,
            taxRate,
        );

    const image =
        product.images[0] ?? null;

    return {
        id: product.id,

        name: product.name,

        price: grossPrice,

        image: image
            ? this.mapListImage(image)
            : null,
    };
}


    /*
     * ============================================================
     * DETAIL RESPONSE
     * ============================================================
     */

    toResponse(
        product: ProductWithDetailRelations,
    ): ProductDetailResponseDto {

        const taxRate =
            product.taxCode.rate.toNumber();


        /*
         * --------------------------------------------------------
         * PRODUCT PRICE
         * --------------------------------------------------------
         *
         * No variants:
         *   basePrice
         *
         * With variants:
         *   lowest active variant price
         *
         * Always returned including VAT.
         */

        const netPrice =
            this.getProductNetPrice(
                product,
            );

        const grossPrice =
            this.calculateGrossAmount(
                netPrice,
                taxRate,
            );


        /*
         * --------------------------------------------------------
         * PRODUCT IMAGES
         * --------------------------------------------------------
         */

        const productImages =
            product.images
                .map(
                    image =>
                        this.mapDetailImage(
                            image,
                        ),
                );


        /*
         * --------------------------------------------------------
         * COMPONENTS
         * --------------------------------------------------------
         */

        const components =
            this.mapComponents(
                product.components,
            );


        /*
         * --------------------------------------------------------
         * VARIANTS
         * --------------------------------------------------------
         */

        const variants =
            this.mapVariants(
                product,
                taxRate,
            );


        /*
         * --------------------------------------------------------
         * RESPONSE
         * --------------------------------------------------------
         */

        return {

            id:
                product.id,

            name:
                product.name,

            slug:
                product.slug,

            description:
                product.description,


            price:
                grossPrice,

            category: {

                id:
                    product.category.id,

                name:
                    product.category.name,
            },

            images:
                productImages,

            components:
                components,

            variants:
                variants,
        };
    }
}
