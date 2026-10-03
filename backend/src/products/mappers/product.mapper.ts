import { Injectable } from '@nestjs/common';

import {
    Prisma,
} from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { CategoryMapper } from '@/categories/mappers/category.mapper';

import {
    ProductListResponseDto,
} from '../dto/product-list-response.dto';

import {
    ProductDetailResponseDto,
} from '../dto/product-detail-response.dto';

import {
    ProductAdminDetailResponseDto,
} from '../dto/admin/product-admin-detail-response.dto';

import {
    ProductAdminListResponseDto,
} from '../dto/admin/product-admin-list-response.dto';


/*
 * ============================================================
 * PRISMA TYPES
 * ============================================================
 */

type ProductWithListRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            customerPrice: true;
            type: true;
            featured: true;

            taxCode: {
                select: {
                    rate: true;
                };
            };

            images: {
                select: {
                    file: {
                        select: {
                            id: true;
                        };
                    };
                };
            };
        };
    }>;


type ProductWithDetailRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            slug: true;
            description: true;
            customerPrice: true;
            active: true;
            type: true;
            featured: true;
            rentalDeposit: true;

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
                            id: true;
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
                    customerPrice: true;
                    active: true;

                    image: {
                        select: {
                            file: {
                                select: {
                                    id: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    }>;


type ProductWithAdminDetailRelations =
    Prisma.ProductGetPayload<{
        select: {
            id: true;
            name: true;
            slug: true;
            description: true;
            active: true;
            type: true;
            featured: true;
            rentalDeposit: true;
            customerPrice: true;
            floristPrice: true;
            sortOrder: true;
            createdAt: true;
            updatedAt: true;

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

                    file: {
                        select: {
                            id: true;
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
                    floristPricePerAdditionalUnit: true;
                    sortOrder: true;
                    active: true;
                    createdAt: true;
                    updatedAt: true;
                };
            };

            variants: {
                select: {
                    id: true;
                    type: true;
                    name: true;
                    code: true;
                    customerPrice: true;
                    floristPrice: true;
                    sortOrder: true;
                    active: true;
                    createdAt: true;
                    updatedAt: true;

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

                            file: {
                                select: {
                                    id: true;
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


    // =========================================================
    // HELPERS
    // =========================================================

    private toNumber(
        value: Prisma.Decimal,
    ): number {
        return value.toNumber();
    }


    private mapListImage(
        image: ProductWithListRelations['images'][number],
    ) {
        return {
            url: `/api/files/${image.file.id}`,
        };
    }


    private mapDetailImage(
        image: ProductWithDetailRelations['images'][number],
    ) {
        return {
            url: `/api/files/${image.file.id}`,
        };
    }


    // =========================================================
    // COMPONENTS
    // =========================================================

    private mapComponents(
        components: ProductWithDetailRelations['components'],
    ) {

        return components.map(
            (component) => ({
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
                    this.toNumber(
                        component.customerPricePerAdditionalUnit,
                    ),
            }),
        );
    }


    // =========================================================
    // VARIANTS
    // =========================================================

    private mapPublicVariants(
        variants: ProductWithDetailRelations['variants'],
    ) {

        return variants
            .filter(
                (variant) =>
                    variant.active,
            )
            .map(
                (variant) => ({
                    id:
                        variant.id,

                    type:
                        variant.type,

                    name:
                        variant.name,

                    code:
                        variant.code,

                    price:
                        this.toNumber(
                            variant.customerPrice,
                        ),

                    image:
                        variant.image
                            ? {
                                url: `/api/files/${variant.image.file.id}`,
                            }
                            : null,
                }),
            );
    }


    private mapAdminVariants(
        variants: ProductWithAdminDetailRelations['variants'],
    ) {

        return variants.map(
            (variant) => ({
                id:
                    variant.id,

                type:
                    variant.type,

                name:
                    variant.name,

                code:
                    variant.code,

                customerPrice:
                    this.toNumber(
                        variant.customerPrice,
                    ),

                floristPrice:
                    this.toNumber(
                        variant.floristPrice,
                    ),

                sortOrder:
                    variant.sortOrder,

                active:
                    variant.active,

                image:
                    variant.image
                        ? {
                            id:
                                variant.image.id,

                            fileId:
                                variant.image.fileId,

                            url:
                                `/api/files/${variant.image.file.id}`,

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
                        }
                        : null,

                createdAt:
                    variant.createdAt,

                updatedAt:
                    variant.updatedAt,
            }),
        );
    }


    // =========================================================
    // ADMIN LIST
    // =========================================================

    toAdminListResponse(
        product: {
            id: number;
            name: string;
            slug: string;
            customerPrice: Prisma.Decimal;
            active: boolean;
            type: ProductWithListRelations['type'];
            featured: boolean;

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
                    id: number;
                };
            }[];
        },
    ): ProductAdminListResponseDto {

        const image =
            product.images[0]
                ? {
                    url:
                        `/api/files/${product.images[0].file.id}`,
                }
                : null;

        return {
            id:
                product.id,

            name:
                product.name,

            slug:
                product.slug,

            customerPrice:
                this.toNumber(
                    product.customerPrice,
                ),

            active:
                product.active,

            type:
                product.type,

            featured:
                product.featured,

            image,

            category: {
                id:
                    product.category.id,

                name:
                    product.category.name,
            },
        };
    }


    // =========================================================
    // ADMIN DETAIL
    // =========================================================

    toAdminDetailResponse(
        product: ProductWithAdminDetailRelations,
    ): ProductAdminDetailResponseDto {

        return {
            id:
                product.id,

            name:
                product.name,

            slug:
                product.slug,

            description:
                product.description,

            active:
                product.active,

            type:
                product.type,

            featured:
                product.featured,

            rentalDeposit:
                product.rentalDeposit !== null
                    ? this.toNumber(
                        product.rentalDeposit,
                    )
                    : null,

            customerPrice:
                this.toNumber(
                    product.customerPrice,
                ),

            floristPrice:
                this.toNumber(
                    product.floristPrice,
                ),

            sortOrder:
                product.sortOrder,

            createdAt:
                product.createdAt,

            updatedAt:
                product.updatedAt,

            taxCode: {
                id:
                    product.taxCode.id,

                code:
                    product.taxCode.code,

                name:
                    product.taxCode.name,

                rate:
                    this.toNumber(
                        product.taxCode.rate,
                    ),

                active:
                    product.taxCode.active,
            },

            category: {
                id:
                    product.category.id,

                name:
                    product.category.name,

                slug:
                    product.category.slug,

                description:
                    product.category.description,

                active:
                    product.category.active,
            },

            images:
                product.images.map(
                    (image) => ({
                        id:
                            image.id,

                        fileId:
                            image.fileId,

                        url:
                            `/api/files/${image.file.id}`,

                        altText:
                            image.altText,

                        sortOrder:
                            image.sortOrder,

                        isPrimary:
                            image.isPrimary,

                        variantId:
                            image.variantId,

                        createdAt:
                            image.createdAt,

                        updatedAt:
                            image.updatedAt,
                    }),
                ),

            components:
                product.components.map(
                    (component) => ({
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
                            this.toNumber(
                                component.customerPricePerAdditionalUnit,
                            ),

                        floristPricePerAdditionalUnit:
                            this.toNumber(
                                component.floristPricePerAdditionalUnit,
                            ),

                        sortOrder:
                            component.sortOrder,

                        active:
                            component.active,

                        createdAt:
                            component.createdAt,

                        updatedAt:
                            component.updatedAt,
                    }),
                ),

            variants:
                this.mapAdminVariants(
                    product.variants,
                ),
        };
    }


    // =========================================================
    // PUBLIC LIST
    // =========================================================

    toListResponse(
        product: ProductWithListRelations,
    ): ProductListResponseDto {

        const image =
            product.images[0] ?? null;

        return {
            id:
                product.id,

            name:
                product.name,

            type:
                product.type,

            featured:
                product.featured,

            price:
                this.toNumber(
                    product.customerPrice,
                ),

            image:
                image
                    ? this.mapListImage(image)
                    : null,
        };
    }


    // =========================================================
    // PUBLIC DETAIL
    // =========================================================

    toResponse(
        product: ProductWithDetailRelations,
    ): ProductDetailResponseDto {

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
                this.toNumber(
                    product.customerPrice,
                ),

            category: {
                id:
                    product.category.id,

                name:
                    product.category.name,
            },

            images:
                product.images.map(
                    (image) =>
                        this.mapDetailImage(
                            image,
                        ),
                ),

            components:
                this.mapComponents(
                    product.components,
                ),

            variants:
                this.mapPublicVariants(
                    product.variants,
                ),

            active:
                product.active,

            type:
                product.type,

            featured:
                product.featured,

            rentalDeposit:
                product.rentalDeposit !== null
                    ? this.toNumber(
                        product.rentalDeposit,
                    )
                    : null,
        };
    }
}