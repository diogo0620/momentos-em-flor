
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    Prisma,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { ProductMapper } from './mappers/product.mapper';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductQueryDto } from './query/product-query.dto';

import { generateSlug } from '@/common/utils/slug';
import { Exceptions } from '@/common/exceptions/exceptions';

import { CATEGORY_MESSAGES } from '@/categories/constants/category.messages';
import { PRODUCT_MESSAGES } from './constants/product.messages';

import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { ProductAdminDetailResponseDto } from './dto/admin/product-admin-detail-response.dto';
import { ProductAdminListResponseDto } from './dto/admin/product-admin-list-response.dto';


@Injectable()
export class ProductsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly productMapper: ProductMapper,
    ) {}

    async findAllAdmin(
    query: ProductQueryDto,
) {
    const where = this.buildListWhere(query);

    const orderBy = query.sort
        ? {
            [query.sort]: query.order,
        }
        : {
            sortOrder: 'asc' as const,
        };

    const products = await this.prisma.product.findMany({
        where,

        ...getPagination(
            query.page,
            query.pageSize,
        ),

        select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            active: true,

            category: {
                select: {
                    id: true,
                    name: true,
                },
            },

            taxCode: {
                select: {
                    rate: true,
                },
            },

            variants: {
                where: {
                    active: true,
                    deletedAt: null,
                },
                orderBy: {
                    price: 'asc',
                },
                take: 1,
                select: {
                    price: true,
                },
            },

            images: {
                where: {
                    deletedAt: null,
                    variantId: null,
                },
                orderBy: [
                    {
                        isPrimary: 'desc',
                    },
                    {
                        sortOrder: 'asc',
                    },
                ],
                take: 1,
                select: {
                    id: true,
                    altText: true,
                    file: {
                        select: {
                            path: true,
                        },
                    },
                },
            },
        },

        orderBy,
    });

    const total = await this.prisma.product.count({
        where,
    });

    return ApiResponse.paginated(
        products.map((product) =>
            this.productMapper.toAdminListResponse(product),
        ),
        getPaginationResponse(
            query.page,
            query.pageSize,
            total,
        ),
    );
}


    async findOneAdmin(
    id: number,
): Promise<ProductAdminDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
        where: {
            id,
            deletedAt: null,
        },

        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            active: true,
            pricingType: true,
            basePrice: true,
            baseFloristCompensation: true,
            taxCodeId: true,
            categoryId: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,

            taxCode: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    rate: true,
                    active: true,
                },
            },

            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    active: true,
                },
            },

            images: {
                where: {
                    deletedAt: null,
                },
                orderBy: [
                    {
                        isPrimary: 'desc',
                    },
                    {
                        sortOrder: 'asc',
                    },
                ],
                select: {
                    id: true,
                    fileId: true,
                    altText: true,
                    sortOrder: true,
                    isPrimary: true,
                    variantId: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,

                    file: {
                        select: {
                            path: true,
                        },
                    },
                },
            },

            components: {
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    sortOrder: 'asc',
                },
                select: {
                    id: true,
                    name: true,
                    minQuantity: true,
                    recommendedQuantity: true,
                    maxQuantity: true,
                    customerPricePerAdditionalUnit: true,
                    floristCompensationPerAdditionalUnit: true,
                    sortOrder: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            },

            variants: {
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    sortOrder: 'asc',
                },
                select: {
                    id: true,
                    type: true,
                    name: true,
                    code: true,
                    price: true,
                    floristCompensation: true,
                    sortOrder: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,

                    image: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            fileId: true,
                            altText: true,
                            sortOrder: true,
                            isPrimary: true,
                            variantId: true,
                            createdAt: true,
                            updatedAt: true,
                            deletedAt: true,

                            file: {
                                select: {
                                    path: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!product) {
        Exceptions.notFound(
            PRODUCT_MESSAGES.NOT_FOUND,
        );
    }

    return this.productMapper.toAdminDetailResponse(
        product,
    );
}

    // =========================================================
    // PUBLIC LIST
    // =========================================================

    async findAll(
        query: ProductQueryDto,
    ) {
        const where =
            this.buildListWhere(query);

        const orderBy =
            query.sort
                ? {
                    [query.sort]:
                        query.order,
                }
                : {
                    sortOrder: 'asc' as const,
                };

        const products =
            await this.prisma.product.findMany({
                where,

                ...getPagination(
                    query.page,
                    query.pageSize,
                ),

                select: {
                    id: true,
                    name: true,
                    basePrice: true,

                    taxCode: {
                        select: {
                            rate: true,
                        },
                    },

                    variants: {
                        where: {
                            active: true,
                            deletedAt: null,
                        },
                        orderBy: {
                            price: 'asc',
                        },
                        take: 1,
                        select: {
                            price: true,
                        },
                    },

                    images: {
                        where: {
                            variantId: null,
                            deletedAt: null,
                        },
                        orderBy: [
                            {
                                isPrimary: 'desc',
                            },
                            {
                                sortOrder: 'asc',
                            },
                        ],
                        take: 1,
                        select: {
                            file: {
                                select: {
                                    path: true,
                                },
                            },
                        },
                    },
                },

                orderBy,
            });

        const total =
            await this.prisma.product.count({
                where,
            });

        return ApiResponse.paginated(
            products.map((product) =>
                this.productMapper.toListResponse(
                    product,
                ),
            ),
            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }


    private buildListWhere(
        query: ProductQueryDto,
    ): Prisma.ProductWhereInput {

        return {

            deletedAt: null,

            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains: query.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: query.search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };
    }


    // =========================================================
    // DETAIL
    // =========================================================

    async findOne(
        id: number,
    ) {
        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    pricingType: true,
                    basePrice: true,

                    taxCode: {
                        select: {
                            rate: true,
                        },
                    },

                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    components: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                        select: {
                            id: true,
                            name: true,
                            minQuantity: true,
                            recommendedQuantity: true,
                            maxQuantity: true,
                            customerPricePerAdditionalUnit: true,
                        },
                    },

                    variants: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            code: true,
                            price: true,
                            active: true,

                            image: {
                                select: {
                                    file: {
                                        select: {
                                            path: true,
                                        },
                                    },
                                },
                            },
                        },
                    },

                    images: {
                        where: {
                            variantId: null,
                            deletedAt: null,
                        },
                        orderBy: [
                            {
                                isPrimary: 'desc',
                            },
                            {
                                sortOrder: 'asc',
                            },
                        ],
                        select: {
                            file: {
                                select: {
                                    path: true,
                                },
                            },
                        },
                    },
                },
            });

        this.ensureProductExists(product);

        return ApiResponse.success(
            this.productMapper.toResponse(product),
        );
    }


    private ensureProductExists(
        product: unknown,
    ): asserts product is NonNullable<typeof product> {

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }
    }


    // =========================================================
    // CREATE
    // =========================================================

    async create(
        dto: CreateProductDto,
    ) {

        await this.validateCategory(
            dto.categoryId,
        );

        await this.validateTaxCode(
            dto.taxCodeId,
        );

        const slug =
            generateSlug(dto.name);

        await this.validateProductUniqueness(
            dto.name,
            slug,
        );

        this.validateProductConfiguration(
            dto.components,
            dto.variants,
        );

        this.validateCreatePricing(
            dto,
        );

        const data =
            this.buildCreateData(
                dto,
                slug,
            );

        const product =
            await this.prisma.product.create({
                data,
            });

        return this.findOne(
            product.id,
        );
    }


    // =========================================================
    // CREATE - VALIDATION
    // =========================================================

    private async validateCategory(
        categoryId: number,
    ): Promise<void> {

        const category =
            await this.prisma.category.findFirst({
                where: {
                    id: categoryId,
                    deletedAt: null,
                    active: true,
                },
            });

        if (!category) {
            Exceptions.notFound(
                CATEGORY_MESSAGES.NOT_FOUND,
            );
        }
    }


    private async validateTaxCode(
        taxCodeId: number,
    ): Promise<void> {

        const taxCode =
            await this.prisma.taxCode.findFirst({
                where: {
                    id: taxCodeId,
                    deletedAt: null,
                    active: true,
                },
            });

        if (!taxCode) {
            Exceptions.notFound(
                'Tax code not found.',
            );
        }
    }


    private async validateProductUniqueness(
        name: string,
        slug: string,
        excludeId?: number,
    ): Promise<void> {

        const product =
            await this.prisma.product.findFirst({

                where: {

                    deletedAt: null,

                    ...(excludeId !== undefined && {
                        id: {
                            not: excludeId,
                        },
                    }),

                    OR: [
                        {
                            name,
                        },
                        {
                            slug,
                        },
                    ],
                },
            });

        if (product) {
            Exceptions.conflict(
                PRODUCT_MESSAGES.ALREADY_EXISTS,
            );
        }
    }


    private validateProductConfiguration(
        components?: CreateProductDto['components'],
        variants?: CreateProductDto['variants'],
    ): void {

        const hasComponents =
            this.hasItems(components);

        const hasVariants =
            this.hasItems(variants);

        if (
            hasComponents &&
            hasVariants
        ) {
            Exceptions.badRequest(
                'A product cannot have both components and variants.',
            );
        }
    }


    private validateCreatePricing(
        dto: CreateProductDto,
    ): void {

        const hasVariants =
            this.hasItems(
                dto.variants,
            );

        /*
         * Products with variants don't use
         * product-level pricing.
         */
        if (hasVariants) {

            this.validateVariantsPricing(
                dto.variants!,
            );

            return;
        }

        /*
         * Products without variants must
         * have valid product-level pricing.
         */
        this.validateBasePricing(
            dto.basePrice,
            dto.baseFloristCompensation,
        );
    }


    private validateBasePricing(
        basePrice: number,
        baseFloristCompensation: number,
    ): void {

        if (
            baseFloristCompensation >=
            basePrice
        ) {
            Exceptions.badRequest(
                PRODUCT_MESSAGES
                    .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
            );
        }
    }


    private validateVariantsPricing(
        variants: CreateProductDto['variants'],
    ): void {

        if (!variants) {
            return;
        }

        for (
            const variant
            of variants
        ) {

            if (
                variant.floristCompensation >=
                variant.price
            ) {
                Exceptions.badRequest(
                    PRODUCT_MESSAGES
                        .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
                );
            }
        }
    }


    // =========================================================
    // CREATE - DATA
    // =========================================================

    private buildCreateData(
        dto: CreateProductDto,
        slug: string,
    ): Prisma.ProductCreateInput {

        const hasVariants =
            this.hasItems(
                dto.variants,
            );

        return {

            name:
                dto.name,

            slug,

            description:
                dto.description,

            pricingType:
                dto.pricingType,

            /*
             * Product-level prices are null
             * when variants exist.
             */
            basePrice:
                hasVariants
                    ? null
                    : dto.basePrice,

            baseFloristCompensation:
                hasVariants
                    ? null
                    : dto.baseFloristCompensation,

            category: {
                connect: {
                    id:
                        dto.categoryId,
                },
            },

            taxCode: {
                connect: {
                    id:
                        dto.taxCodeId,
                },
            },

            active:
                dto.active ??
                true,

            ...(this.hasItems(dto.components) && {
                components: {
                    create:
                        this.buildComponentCreateData(
                            dto.components!,
                        ),
                },
            }),

            ...(this.hasItems(dto.variants) && {
                variants: {
                    create:
                        this.buildVariantCreateData(
                            dto.variants!,
                        ),
                },
            }),
        };
    }


    private buildComponentCreateData(
        components: NonNullable<
            CreateProductDto['components']
        >,
    ) {

        return components.map(
            component => ({

                name:
                    component.name,

                minQuantity:
                    component.minQuantity,

                recommendedQuantity:
                    component.recommendedQuantity,

                maxQuantity:
                    component.maxQuantity,

                customerPricePerAdditionalUnit:
                    component.customerPricePerAdditionalUnit,

                floristCompensationPerAdditionalUnit:
                    component.floristCompensationPerAdditionalUnit,

                sortOrder:
                    component.sortOrder ??
                    0,

                active:
                    component.active ??
                    true,
            }),
        );
    }


    private buildVariantCreateData(
        variants: NonNullable<
            CreateProductDto['variants']
        >,
    ) {

        return variants.map(
            variant => ({

                type:
                    variant.type,

                name:
                    variant.name,

                code:
                    variant.code,

                price:
                    variant.price,

                floristCompensation:
                    variant.floristCompensation,

                sortOrder:
                    variant.sortOrder ??
                    0,

                active:
                    variant.active ??
                    true,
            }),
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    async update(
        id: number,
        dto: UpdateProductDto,
    ) {

        const currentProduct =
            await this.getProductForUpdate(
                id,
            );

        await this.validateUpdateRelations(
            dto,
        );

        const slug =
            await this.getUpdateSlug(
                dto,
            );

        if (slug) {

            await this.validateProductUniqueness(
                dto.name!,
                slug,
                id,
            );
        }

        const configuration =
            this.resolveUpdateConfiguration(
                currentProduct,
                dto,
            );

        this.validateUpdatePricing(
            currentProduct,
            dto,
            configuration.hasVariants,
        );

        const data =
            this.buildUpdateData(
                dto,
                slug,
                configuration,
            );

        await this.prisma.product.update({

            where: {
                id,
            },

            data,
        });

        return this.findOne(id);
    }


    // =========================================================
    // UPDATE - CURRENT PRODUCT
    // =========================================================

    private async getProductForUpdate(
        id: number,
    ) {

        const product =
            await this.prisma.product.findFirst({

                where: {
                    id,
                    deletedAt: null,
                },

                include: {

                    components: {
                        where: {
                            deletedAt: null,
                        },
                    },

                    variants: {
                        where: {
                            deletedAt: null,
                        },
                    },
                },
            });

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }

        return product;
    }


    // =========================================================
    // UPDATE - VALIDATION
    // =========================================================

    private async validateUpdateRelations(
        dto: UpdateProductDto,
    ): Promise<void> {

        if (
            dto.categoryId !== undefined
        ) {
            await this.validateCategory(
                dto.categoryId,
            );
        }

        if (
            dto.taxCodeId !== undefined
        ) {
            await this.validateTaxCode(
                dto.taxCodeId,
            );
        }
    }


    private async getUpdateSlug(
        dto: UpdateProductDto,
    ): Promise<string | undefined> {

        if (
            dto.name === undefined
        ) {
            return undefined;
        }

        return generateSlug(
            dto.name,
        );
    }


    // =========================================================
    // UPDATE - CONFIGURATION
    // =========================================================

    private resolveUpdateConfiguration(
        currentProduct: Awaited<
            ReturnType<
                ProductsService['getProductForUpdate']
            >
        >,
        dto: UpdateProductDto,
    ) {

        const hasComponentUpdate =
            Array.isArray(
                dto.components,
            );

        const hasVariantUpdate =
            Array.isArray(
                dto.variants,
            );

        /*
         * When both are explicitly supplied,
         * both cannot contain items.
         */
        if (
            hasComponentUpdate &&
            hasVariantUpdate &&
            this.hasItems(dto.components) &&
            this.hasItems(dto.variants)
        ) {
            Exceptions.badRequest(
                'A product cannot have both components and variants.',
            );
        }

        let hasComponents =
            currentProduct.components.length > 0;

        let hasVariants =
            currentProduct.variants.length > 0;

        /*
         * An explicitly supplied collection
         * replaces the existing configuration.
         */
        if (hasComponentUpdate) {
            hasComponents =
                this.hasItems(
                    dto.components,
                );
        }

        if (hasVariantUpdate) {
            hasVariants =
                this.hasItems(
                    dto.variants,
                );
        }

        if (
            hasComponents &&
            hasVariants
        ) {
            Exceptions.badRequest(
                'A product cannot have both components and variants.',
            );
        }

        return {
            hasComponents,
            hasVariants,
        };
    }


    // =========================================================
    // UPDATE - PRICING
    // =========================================================

    private validateUpdatePricing(
        currentProduct: Awaited<
            ReturnType<
                ProductsService['getProductForUpdate']
            >
        >,
        dto: UpdateProductDto,
        hasVariants: boolean,
    ): void {

        /*
         * If the final product has variants,
         * product-level price is irrelevant.
         */
        if (hasVariants) {

            if (
                dto.variants !== undefined
            ) {
                this.validateVariantsPricing(
                    dto.variants,
                );
            }

            return;
        }

        const basePrice =
            dto.basePrice !== undefined
                ? dto.basePrice
                : currentProduct.basePrice
                    ?.toNumber() ?? null;

        const baseFloristCompensation =
            dto.baseFloristCompensation !== undefined
                ? dto.baseFloristCompensation
                : currentProduct.baseFloristCompensation
                    ?.toNumber() ?? null;

        /*
         * If neither exists, there is nothing
         * to compare.
         */
        if (
            basePrice === null ||
            baseFloristCompensation === null
        ) {
            return;
        }

        this.validateBasePricing(
            basePrice,
            baseFloristCompensation,
        );
    }


    // =========================================================
    // UPDATE - DATA
    // =========================================================

    private buildUpdateData(
        dto: UpdateProductDto,
        slug: string | undefined,
        configuration: {
            hasComponents: boolean;
            hasVariants: boolean;
        },
    ): Prisma.ProductUpdateInput {

        const data: Prisma.ProductUpdateInput = {

            ...(dto.name !== undefined && {
                name:
                    dto.name,
            }),

            ...(slug !== undefined && {
                slug,
            }),

            ...(dto.description !== undefined && {
                description:
                    dto.description,
            }),

            ...(dto.pricingType !== undefined && {
                pricingType:
                    dto.pricingType,
            }),

            ...(dto.categoryId !== undefined && {
                category: {
                    connect: {
                        id:
                            dto.categoryId,
                    },
                },
            }),

            ...(dto.taxCodeId !== undefined && {
                taxCode: {
                    connect: {
                        id:
                            dto.taxCodeId,
                    },
                },
            }),

            ...(dto.active !== undefined && {
                active:
                    dto.active,
            }),
        };


        /*
         * Product-level prices.
         *
         * Variants => null
         * No variants => supplied values.
         */

        if (
            configuration.hasVariants
        ) {

            data.basePrice = null;

            data.baseFloristCompensation =
                null;

        } else {

            if (
                dto.basePrice !== undefined
            ) {
                data.basePrice =
                    dto.basePrice;
            }

            if (
                dto.baseFloristCompensation !== undefined
            ) {
                data.baseFloristCompensation =
                    dto.baseFloristCompensation;
            }
        }


        /*
         * Replace components.
         */

        if (
            dto.components !== undefined
        ) {

            data.components = {

                deleteMany: {},

                ...(this.hasItems(dto.components) && {
                    create:
                        this.buildComponentCreateData(
                            dto.components,
                        ),
                }),
            };
        }


        /*
         * Replace variants.
         */

        if (
            dto.variants !== undefined
        ) {

            data.variants = {

                deleteMany: {},

                ...(this.hasItems(dto.variants) && {
                    create:
                        this.buildVariantCreateData(
                            dto.variants,
                        ),
                }),
            };
        }

        return data;
    }


    // =========================================================
    // DELETE
    // =========================================================

    async remove(
        id: number,
    ) {

        await this.ensureProductExistsById(
            id,
        );

        await this.prisma.product.update({

            where: {
                id,
            },

            data: {
                active: false,
                deletedAt: new Date(),
            },
        });

        return ApiResponse.success(
            null,
            PRODUCT_MESSAGES.DELETED,
        );
    }


    private async ensureProductExistsById(
        id: number,
    ): Promise<void> {

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private hasItems<T>(
        value: T[] | null | undefined,
    ): value is T[] {

        return (
            Array.isArray(value) &&
            value.length > 0
        );
    }
}
