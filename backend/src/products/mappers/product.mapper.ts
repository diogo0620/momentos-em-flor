import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { CategoryMapper } from '@/categories/mappers/category.mapper';

import {
    ProductListResponseDto,
} from '../dto/product-list-response.dto';

import {
    ProductDetailResponseDto,
} from '../dto/product-detail-response.dto';
import { ProductAdminDetailResponseDto } from '../dto/admin/product-admin-detail-response.dto';


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

            category: {
                select: {
                    id: true;
                    name: true;
                };
            };

            taxCode: {
                select: {
                    rate: true;
                };
            };

            images: {
                include: {
                    file: {
                        select: {
                            path: true;
                        };
                    };
                };
            };

            variants: {
                select: {
                    price: true
                };
            };
        };
    }>;


/**
 * Product used by the detail endpoint.
 */
type ProductWithDetailRelations =
    Prisma.ProductGetPayload<{
        include: {
            category: {
                select: {
                    id: true;
                    name: true;
                };
            };

            taxCode: {
                select: {
                    rate: true;
                };
            };

            images: {
                include: {
                    file: {
                        select: {
                            path: true;
                        };
                    };
                };
            };

            components: true;

            variants: {
                include: {
                    image: {
                        include: {
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


    /**
     * Gets the product net price.
     *
     * Product without variants:
     *   basePrice
     *
     * Product with variants:
     *   lowest active variant price
     */
    private getProductNetPrice(
    product: {
        basePrice: Prisma.Decimal | null;
        variants?: Array<{
            price: Prisma.Decimal;
        }>;
    },
): number {

    if (
        product.variants &&
        product.variants.length > 0
    ) {
        return Math.min(
            ...product.variants.map(
                variant =>
                    variant.price.toNumber(),
            ),
        );
    }

    return product.basePrice?.toNumber() ?? 0;
}

toAdminListResponse(
    product: {
        id: number;
        name: string;
        slug: string;
        basePrice: Prisma.Decimal | null;
        active: boolean;
        category: {
            id: number;
            name: string;
        };
        taxCode: {
            rate: Prisma.Decimal;
        };
        variants: {
            price: Prisma.Decimal;
        }[];
        images: {
            id: number;
            altText: string | null;
            file: {
                path: string;
            };
        }[];
    },
): ProductAdminListResponseDto {
    const netPrice =
        product.basePrice ??
        product.variants[0]?.price ??
        new Prisma.Decimal(0);

    const taxRate = product.taxCode.rate;

    const grossPrice =
        netPrice.mul(
            new Prisma.Decimal(1).add(
                taxRate.div(100),
            ),
        );

    const image = product.images[0]
        ? {
              url: product.images[0].file.path,
          }
        : null;

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: this.toNumber(grossPrice),
        active: product.active,

        image,

        category: {
            id: product.category.id,
            name: product.category.name,
        },
    };
}

toAdminDetailResponse(
    product: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        pricingType: ProductPricingType;
        basePrice: Prisma.Decimal | null;
        baseFloristCompensation: Prisma.Decimal | null;
        active: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;

        taxCode: {
            rate: Prisma.Decimal;
        };

        category: {
            id: number;
            name: string;
        };

        images: {
            id: number;
            altText: string | null;
            file: {
                path: string;
            };
        }[];

        components: {
            id: number;
            name: string;
            minQuantity: number;
            recommendedQuantity: number;
            maxQuantity: number;
            customerPricePerAdditionalUnit: Prisma.Decimal;
            floristCompensationPerAdditionalUnit: Prisma.Decimal;
            sortOrder: number;
            active: boolean;
        }[];

        variants: {
            id: number;
            type: ProductVariantType;
            name: string;
            code: string | null;
            price: Prisma.Decimal;
            floristCompensation: Prisma.Decimal;
            sortOrder: number;
            active: boolean;

            image: {
                id: number;
                altText: string | null;
                file: {
                    path: string;
                };
            } | null;
        }[];
    },
): ProductAdminDetailResponseDto {
    const taxRate = product.taxCode.rate;

    /*
     * Determine the customer price displayed for the product.
     *
     * No variants:
     *   basePrice
     *
     * With variants:
     *   lowest active variant price
     */
    const variantPrices = product.variants
        .filter((variant) => variant.active)
        .map((variant) => variant.price);

    const netPrice =
        variantPrices.length > 0
            ? variantPrices.reduce((lowest, current) =>
                  current.lessThan(lowest)
                      ? current
                      : lowest,
              )
            : product.basePrice ?? new Prisma.Decimal(0);

    const taxAmount =
        netPrice.mul(taxRate).div(100);

    const grossPrice =
        netPrice.add(taxAmount);

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        pricingType: product.pricingType,

        netPrice: this.toNumber(netPrice),
        taxAmount: this.toNumber(taxAmount),
        grossPrice: this.toNumber(grossPrice),
        taxRate: this.toNumber(taxRate),

        basePrice: product.basePrice
            ? this.toNumber(product.basePrice)
            : null,

        baseFloristCompensation:
            product.baseFloristCompensation
                ? this.toNumber(
                      product.baseFloristCompensation,
                  )
                : null,

        categoryId: product.category.id,
        categoryName: product.category.name,

        images: product.images.map((image) => ({
            url: image.file.path,
        })),

        components: product.components.map(
            (component) => ({
                id: component.id,
                name: component.name,
                minQuantity: component.minQuantity,
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
            }),
        ),

        variants: product.variants.map(
            (variant) => ({
                id: variant.id,
                type: variant.type,
                name: variant.name,
                code: variant.code,

                netPrice: this.toNumber(
                    variant.price,
                ),

                grossPrice: this.toNumber(
                    variant.price
                        .mul(
                            new Prisma.Decimal(1).add(
                                taxRate.div(100),
                            ),
                        ),
                ),

                floristCompensation:
                    this.toNumber(
                        variant.floristCompensation,
                    ),

                image: variant.image
                    ? {
                          url:
                              variant.image.file.path,
                      }
                    : null,

                sortOrder: variant.sortOrder,
                active: variant.active,
            }),
        ),

        active: product.active,
        sortOrder: product.sortOrder,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}


    /*
     * ============================================================
     * IMAGES
     * ============================================================
     */

    /**
     * Gets the first product-level image.
     *
     * Variant images are ignored.
     */
    private getFirstProductImage(
        images: ProductWithListRelations['images'],
    ) {

        return (
            images
                .filter(
                    image =>
                        image.variantId === null,
                )
                .sort(
                    (a, b) =>
                        a.sortOrder -
                        b.sortOrder,
                )[0] ?? null
        );
    }


    /**
     * Maps a list image.
     */
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
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder,
            )
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
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder,
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

        const netPrice =
            this.getProductNetPrice(
                product,
            );

        const grossPrice =
            this.calculateGrossAmount(
                netPrice,
                taxRate,
            );

        const firstImage =
            this.getFirstProductImage(
                product.images,
            );

        return {

            id:
                product.id,

            name:
                product.name,

            price:
                grossPrice,

            image:
                firstImage
                    ? this.mapListImage(
                        firstImage,
                    )
                    : null,

            category: {

                id:
                    product.category.id,

                name:
                    product.category.name,
            },
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
                .filter(
                    image =>
                        image.variantId === null,
                )
                .sort(
                    (a, b) =>
                        a.sortOrder -
                        b.sortOrder,
                )
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

            pricingType:
                product.pricingType,

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
