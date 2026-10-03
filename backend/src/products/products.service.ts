import {
    Injectable,
} from '@nestjs/common';

import {
    Prisma,
} from '@prisma/client';

import {
    ProductType,
} from '@prisma/client';

import {
    PrismaService,
} from '@/prisma/prisma.service';

import {
    ProductMapper,
} from './mappers/product.mapper';

import {
    CreateProductDto,
} from './dto/create-product.dto';

import {
    UpdateProductDto,
} from './dto/update-product.dto';

import {
    ProductQueryDto,
} from './query/product-query.dto';

import {
    generateSlug,
} from '@/common/utils/slug';

import {
    Exceptions,
} from '@/common/exceptions/exceptions';

import {
    CATEGORY_MESSAGES,
} from '@/categories/constants/category.messages';

import {
    PRODUCT_MESSAGES,
} from './constants/product.messages';

import {
    ApiResponse,
} from '@/common/responses/api-response';

import {
    getPagination,
} from '@/common/database/pagination';

import {
    getPaginationResponse,
} from '@/common/database/pagination-response';

import {
    ProductAdminDetailResponseDto,
} from './dto/admin/product-admin-detail-response.dto';

import {
    ProductAdminListResponseDto,
} from './dto/admin/product-admin-list-response.dto';


@Injectable()
export class ProductsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly productMapper: ProductMapper,
    ) { }


    // =========================================================
    // ADMIN LIST
    // =========================================================

    async findAllAdmin(
        query: ProductQueryDto,
    ) {

        const where = this.buildListWhere(query);
        const orderBy = this.buildOrderBy(query);

        const [
            products,
            total,
        ] = await Promise.all([
            this.prisma.product.findMany({
                where,
                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
                select: this.getAdminListSelect(),
                orderBy,
            }),

            this.prisma.product.count({
                where,
            }),
        ]);

        return ApiResponse.paginated(
            products.map(
                (product) =>
                    this.productMapper.toAdminListResponse(
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


    // =========================================================
    // ADMIN DETAIL
    // =========================================================

    async findOneAdmin(
        id: number,
    ): Promise<ProductAdminDetailResponseDto> {

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                },
                select: this.getAdminDetailSelect(),
            });

        this.ensureProductExists(product);

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

        const where = this.buildListWhere(query);
        const orderBy = this.buildOrderBy(query);

        const [
            products,
            total,
        ] = await Promise.all([
            this.prisma.product.findMany({
                where,
                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
                select: this.getPublicListSelect(),
                orderBy,
            }),

            this.prisma.product.count({
                where,
            }),
        ]);

        return ApiResponse.paginated(
            products.map(
                (product) =>
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


    // =========================================================
    // PUBLIC DETAIL
    // =========================================================

    async findOne(
        id: number,
    ) {

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                },
                select: this.getPublicDetailSelect(),
            });

        this.ensureProductExists(product);

        return ApiResponse.success(
            this.productMapper.toResponse(
                product,
            ),
        );
    }


    // =========================================================
    // CREATE
    // =========================================================

    async create(
        dto: CreateProductDto,
    ) {

        await this.validateCreate(dto);

        const slug =
            generateSlug(dto.name);

        await this.validateProductUniqueness(
            dto.name,
            slug,
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

    private async validateCreate(
        dto: CreateProductDto,
    ): Promise<void> {

        await this.validateCategory(
            dto.categoryId,
        );

        await this.validateTaxCode(
            dto.taxCodeId,
        );

        this.validateProductConfiguration(
            dto.components,
            dto.variants,
        );

        this.validateProductPricing(
            dto.customerPrice,
            dto.floristPrice,
        );

        this.validateRentalDeposit(
            dto.type,
            dto.rentalDeposit,
        );

        if (this.hasItems(dto.variants)) {
            this.validateVariants(
                dto.customerPrice,
                dto.variants,
            );
        }
    }


    private async validateCategory(
        categoryId: number,
    ): Promise<void> {

        const category =
            await this.prisma.category.findFirst({
                where: {
                    id: categoryId,
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
            this.hasItems(
                components,
            );

        const hasVariants =
            this.hasItems(
                variants,
            );

        if (
            hasComponents &&
            hasVariants
        ) {
            Exceptions.badRequest(
                'A product cannot have both components and variants.',
            );
        }
    }


    private validateProductPricing(
        customerPrice: number,
        floristPrice: number,
    ): void {

        if (customerPrice < 0) {
            Exceptions.badRequest(
                'Customer price cannot be negative.',
            );
        }

        if (floristPrice < 0) {
            Exceptions.badRequest(
                'Florist price cannot be negative.',
            );
        }

        if (floristPrice >= customerPrice) {
            Exceptions.badRequest(
                'Florist price must be less than customer price.',
            );
        }
    }


    private validateRentalDeposit(
        type: ProductType | undefined,
        rentalDeposit: number | null | undefined,
    ): void {

        if (
            type === ProductType.RENTAL &&
            (
                rentalDeposit === undefined ||
                rentalDeposit === null
            )
        ) {
            Exceptions.badRequest(
                'Rental products must have a rental deposit.',
            );
        }

        if (
            type === ProductType.SALE &&
            rentalDeposit !== undefined &&
            rentalDeposit !== null
        ) {
            Exceptions.badRequest(
                'Sale products cannot have a rental deposit.',
            );
        }
    }


    private validateVariants(
        baseCustomerPrice: number,
        variants: Array<{
            customerPrice: number | Prisma.Decimal;
            floristPrice: number | Prisma.Decimal;
        }>,
    ): void {

        for (const variant of variants) {

            const customerPrice =
                this.toNumber(
                    variant.customerPrice,
                );

            const floristPrice =
                this.toNumber(
                    variant.floristPrice,
                );

            if (
                customerPrice <
                baseCustomerPrice
            ) {
                Exceptions.badRequest(
                    'Base customer price must be less than or equal to every variant customer price.',
                );
            }

            this.validateProductPricing(
                customerPrice,
                floristPrice,
            );
        }
    }


    // =========================================================
    // CREATE - DATA
    // =========================================================

    private buildCreateData(
        dto: CreateProductDto,
        slug: string,
    ): Prisma.ProductCreateInput {

        return {
            name: dto.name,

            slug,

            description:
                dto.description,

            customerPrice:
                dto.customerPrice,

            floristPrice:
                dto.floristPrice,

            category: {
                connect: {
                    id: dto.categoryId,
                },
            },

            taxCode: {
                connect: {
                    id: dto.taxCodeId,
                },
            },

            active:
                dto.active ??
                true,

            type:
                dto.type ??
                ProductType.SALE,

            featured:
                dto.featured ??
                false,

            rentalDeposit:
                dto.rentalDeposit ??
                null,

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

            ...(this.hasItems(dto.images) && {
                images: {
                    create:
                        this.buildImageCreateData(
                            dto.images!,
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
            (component) => ({
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

                floristPricePerAdditionalUnit:
                    component.floristPricePerAdditionalUnit,

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
            (variant) => ({
                type:
                    variant.type,

                name:
                    variant.name,

                code:
                    variant.code ??
                    null,

                customerPrice:
                    variant.customerPrice,

                floristPrice:
                    variant.floristPrice,

                sortOrder:
                    variant.sortOrder ??
                    0,

                active:
                    variant.active ??
                    true,
            }),
        );
    }


    private buildImageCreateData(
        images: NonNullable<
            CreateProductDto['images']
        >,
    ) {

        return images.map(
            (image) => ({
                file: {
                    connect: {
                        id: image.fileId,
                    },
                },

                altText:
                    image.altText ??
                    null,

                sortOrder:
                    image.sortOrder ??
                    0,

                isPrimary:
                    image.isPrimary ??
                    false,

                ...(image.variantId !== undefined &&
                    image.variantId !== null && {
                    variant: {
                        connect: {
                            id: image.variantId,
                        },
                    },
                }),
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

        await this.validateUpdate(
            currentProduct,
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

        const data =
            this.buildUpdateData(
                dto,
                slug,
            );

        await this.prisma.product.update({
            where: {
                id,
            },
            data,
        });

        return this.findOne(id);
    }


    private async validateUpdate(
        currentProduct: Awaited<
            ReturnType<
                ProductsService['getProductForUpdate']
            >
        >,
        dto: UpdateProductDto,
    ): Promise<void> {

        await this.validateUpdateRelations(
            dto,
        );

        const configuration =
            this.resolveUpdateConfiguration(
                currentProduct,
                dto,
            );

        const customerPrice =
            dto.customerPrice !== undefined
                ? dto.customerPrice
                : this.toNumber(
                    currentProduct.customerPrice,
                );

        const floristPrice =
            dto.floristPrice !== undefined
                ? dto.floristPrice
                : this.toNumber(
                    currentProduct.floristPrice,
                );

        this.validateProductPricing(
            customerPrice,
            floristPrice,
        );

        this.validateRentalDeposit(
            currentProduct.type,
            dto.rentalDeposit,
        );

        if (configuration.hasVariants) {

            const variants =
                dto.variants !== undefined
                    ? dto.variants
                    : currentProduct.variants;

            this.validateVariants(
                customerPrice,
                variants,
            );
        }
    }


    private async getProductForUpdate(
        id: number,
    ) {

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                },
                include: {
                    components: true,
                    variants: true,
                },
            });

        this.ensureProductExists(
            product,
        );

        return product;
    }


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
    // UPDATE - DATA
    // =========================================================

    private buildUpdateData(
        dto: UpdateProductDto,
        slug: string | undefined,
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

            ...(dto.customerPrice !== undefined && {
                customerPrice:
                    dto.customerPrice,
            }),

            ...(dto.floristPrice !== undefined && {
                floristPrice:
                    dto.floristPrice,
            }),

            ...(dto.featured !== undefined && {
                featured:
                    dto.featured,
            }),

            ...(dto.rentalDeposit !== undefined && {
                rentalDeposit:
                    dto.rentalDeposit,
            }),
        };


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


        if (
            dto.images !== undefined
        ) {

            data.images = {
                deleteMany: {},

                ...(this.hasItems(dto.images) && {
                    create:
                        this.buildImageCreateData(
                            dto.images,
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

        await this.prisma.product.delete({
            where: {
                id,
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
                },
                select: {
                    id: true,
                },
            });

        this.ensureProductExists(
            product,
        );
    }


    // =========================================================
    // QUERIES
    // =========================================================

    private buildListWhere(
        query: ProductQueryDto,
    ): Prisma.ProductWhereInput {

        return {

            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains:
                                query.search,
                            mode:
                                'insensitive',
                        },
                    },
                    {
                        description: {
                            contains:
                                query.search,
                            mode:
                                'insensitive',
                        },
                    },
                ],
            }),
        };
    }


    private buildOrderBy(
        query: ProductQueryDto,
    ) {

        if (query.sort) {
            return {
                [query.sort]:
                    query.order,
            };
        }

        return {
            sortOrder:
                'asc' as const,
        };
    }


    private getAdminListSelect() {

        return {
            id: true,
            name: true,
            slug: true,
            customerPrice: true,
            active: true,
            type: true,
            featured: true,

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

            images: {
                where: {
                    variantId: null,
                },

                orderBy: [
                    {
                        isPrimary:
                            'desc' as const,
                    },
                    {
                        sortOrder:
                            'asc' as const,
                    },
                ],

                take: 1,

                select: {
                    id: true,
                    altText: true,

                    file: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        };
    }


    private getAdminDetailSelect() {

        return {
            id: true,
            name: true,
            slug: true,
            description: true,
            active: true,
            type: true,
            featured: true,
            rentalDeposit: true,
            customerPrice: true,
            floristPrice: true,
            taxCodeId: true,
            categoryId: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,

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

            images: this.getImageSelect(),

            components: {
                orderBy: {
                    sortOrder:
                        'asc' as const,
                },

                select: {
                    id: true,
                    name: true,
                    minQuantity: true,
                    recommendedQuantity: true,
                    maxQuantity: true,
                    customerPricePerAdditionalUnit: true,
                    floristPricePerAdditionalUnit: true,
                    sortOrder: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },

            variants: {
                orderBy: {
                    sortOrder:
                        'asc' as const,
                },

                select: {
                    id: true,
                    type: true,
                    name: true,
                    code: true,
                    customerPrice: true,
                    floristPrice: true,
                    sortOrder: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,

                    image: this.getVariantImageSelect(),
                },
            },
        };
    }


    private getPublicListSelect() {

        return {
            id: true,
            name: true,
            customerPrice: true,
            type: true,
            featured: true,

            taxCode: {
                select: {
                    rate: true,
                },
            },

            images: {
                where: {
                    variantId: null,
                },

                orderBy: [
                    {
                        isPrimary:
                            'desc' as const,
                    },
                    {
                        sortOrder:
                            'asc' as const,
                    },
                ],

                take: 1,

                select: {
                    file: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        };
    }


    private getPublicDetailSelect() {

        return {
            id: true,
            name: true,
            slug: true,
            description: true,
            customerPrice: true,
            active: true,
            type: true,
            featured: true,
            rentalDeposit: true,

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
                orderBy: {
                    sortOrder:
                        'asc' as const,
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
                orderBy: {
                    sortOrder:
                        'asc' as const,
                },

                select: {
                    id: true,
                    type: true,
                    name: true,
                    code: true,
                    customerPrice: true,
                    active: true,

                    image: {
                        select: {
                            file: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            },

            images: {
                where: {
                    variantId: null,
                },

                orderBy: [
                    {
                        isPrimary:
                            'desc' as const,
                    },
                    {
                        sortOrder:
                            'asc' as const,
                    },
                ],

                select: {
                    file: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        };
    }


    private getImageSelect() {

        return {
            orderBy: [
                {
                    isPrimary:
                        'desc' as const,
                },
                {
                    sortOrder:
                        'asc' as const,
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

                file: {
                    select: {
                        id: true,
                    },
                },
            },
        };
    }


    private getVariantImageSelect() {

        return {
            select: {
                id: true,
                fileId: true,
                altText: true,
                sortOrder: true,
                isPrimary: true,
                variantId: true,
                createdAt: true,
                updatedAt: true,

                file: {
                    select: {
                        id: true,
                    },
                },
            },
        };
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private ensureProductExists(
        product: unknown,
    ): asserts product is NonNullable<typeof product> {

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }
    }


    private hasItems<T>(
        value:
            | T[]
            | null
            | undefined,
    ): value is T[] {

        return (
            Array.isArray(value) &&
            value.length > 0
        );
    }


    private toNumber(
        value: number | Prisma.Decimal,
    ): number {

        return typeof value === 'number'
            ? value
            : value.toNumber();
    }
}