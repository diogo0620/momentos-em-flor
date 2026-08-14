import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ProductMapper } from './mappers/product.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response';
import { generateSlug } from '@/common/utils/slug';
import { Exceptions } from '@/common/exceptions/exceptions';
import { CATEGORY_MESSAGES } from '@/categories/constants/category.messages';
import { PRODUCT_MESSAGES } from './constants/product.messages';
import { ProductQueryDto } from './query/product-query.dto';
import { getPagination } from '@/common/database/pagination';
import { ApiResponse } from '@/common/responses/api-response';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly productMapper: ProductMapper,
    ) { }

    async findAll(
        query: ProductQueryDto,
    ) {
        const where = {
            deletedAt: null,
            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        slug: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const orderBy = query.sort
            ? { [query.sort]: query.order }
            : { name: 'asc' as const };

        const products = await this.prisma.product.findMany({
            where,
            orderBy,
            include: {
                category: true,
            },
            ...getPagination(query.page, query.pageSize),
        });

        const total = await this.prisma.product.count({
            where,
        });

        return ApiResponse.paginated(
            this.productMapper.toResponses(products),
            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }

    async findOne(id: number) {
        const product = await this.getProductOrThrow(id);

        return ApiResponse.success(
            this.productMapper.toResponse(product),
        );
    }

    async create(
        createProductDto: CreateProductDto,
    ): Promise<any> {
        const category =
            await this.prisma.category.findFirst({
                where: {
                    id: createProductDto.categoryId,
                    deletedAt: null,
                },
            });

        if (!category) {
            Exceptions.notFound(
                CATEGORY_MESSAGES.NOT_FOUND,
            );
        }

        const slug =
            this.buildSlug(
                createProductDto.name,
            );

        const exists =
            await this.prisma.product.findFirst({
                where: {
                    deletedAt: null,
                    slug,
                },
            });

        if (exists) {
            Exceptions.conflict(
                PRODUCT_MESSAGES.ALREADY_EXISTS,
            );
        }

        if (
            createProductDto.baseFloristCompensation >=
            createProductDto.basePrice
        ) {
            Exceptions.badRequest(
                PRODUCT_MESSAGES
                    .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
            );
        }

        const product =
            await this.prisma.product.create({
                data: {
                    ...createProductDto,
                    slug,
                },
                include: {
                    category: true,
                },
            });

        return this.productMapper.toResponse(
            product,
        );
    }

    async update(
        id: number,
        dto: UpdateProductDto,
    ) {
        const currentProduct =
            await this.getProductOrThrow(id);

        const slug = dto.name
            ? this.buildSlug(dto.name)
            : undefined;

        const exists =
            await this.prisma.product.findFirst({
                where: {
                    deletedAt: null,

                    id: {
                        not: id,
                    },

                    OR: [
                        ...(dto.name
                            ? [
                                {
                                    name: dto.name,
                                },
                            ]
                            : []),

                        ...(slug
                            ? [
                                {
                                    slug,
                                },
                            ]
                            : []),
                    ],
                },
            });

        if (exists) {
            Exceptions.conflict(
                PRODUCT_MESSAGES.ALREADY_EXISTS,
            );
        }

        const newBasePrice =
            dto.basePrice ??
            Number(currentProduct.basePrice);

        const newBaseFloristCompensation =
            dto.baseFloristCompensation ??
            Number(
                currentProduct.baseFloristCompensation,
            );

        if (
            newBaseFloristCompensation >=
            newBasePrice
        ) {
            Exceptions.badRequest(
                PRODUCT_MESSAGES
                    .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
            );
        }

        if (
            dto.basePrice !== undefined &&
            dto.basePrice !==
            Number(currentProduct.basePrice)
        ) {
            const existingRule =
                await this.prisma.floristCompensationRule.findFirst({
                    where: {
                        productId: id,
                        active: true,
                        deletedAt: null,
                        compensationAmount: {
                            gte: newBasePrice,
                        },
                    },
                });

            if (existingRule) {
                Exceptions.badRequest(
                    PRODUCT_MESSAGES
                        .PRICE_CANNOT_BE_LOWER_THAN_COMPENSATION_RULE,
                );
            }
        }

        const product =
            await this.prisma.product.update({
                where: {
                    id,
                },

                data: {
                    ...dto,

                    ...(slug && {
                        slug,
                    }),
                },

                include: {
                    category: true,
                },
            });

        return ApiResponse.success(
            this.productMapper.toResponse(
                product,
            ),
            PRODUCT_MESSAGES.UPDATED,
        );
    }

    async remove(id: number) {
        await this.getProductOrThrow(id);

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

    private async getProductOrThrow(
        id: number,
    ) {
        const product =
            await this.prisma.product.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: {
                    category: true,
                },
            });

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }

        return product;
    }

    private buildSlug(
        name: string,
    ) {
        return generateSlug(name);
    }
}