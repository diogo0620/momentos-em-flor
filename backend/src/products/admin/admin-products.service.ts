import { Injectable } from '@nestjs/common';

import { AdminCreateProductDto } from './dtos/admin-create-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma, ProductType } from '@prisma/client';
import { AdminProductResponseDto } from './dtos/admin-product-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { AdminProductsMapper } from './mappers/admin-products.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { AdminProductQueryDto } from './dtos/admin-product-query.dto';
import { AdminUpdateProductDto } from './dtos/admin-update-product.dto';


@Injectable()
export class AdminProductsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminProductsMapper,
    ) { }



    async findAll(query: AdminProductQueryDto) {
        const { page, pageSize, search, active, sort, featured, type, categoryId, order } = query;

        const where: Prisma.ProductWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(active !== undefined && { active }),
            ...(featured !== undefined && { featured }),
            ...(type !== undefined && { type }),
            ...(categoryId !== undefined && {
                categories: {
                    some: {
                        id: categoryId,
                    },
                },
            }),
        };

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
                include: { images: { where: { isPrimary: true }, take: 1 } },
            }),
            this.prisma.product.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(products),
            getPaginationResponse(page, pageSize, total),
        );
    }



    async findOne(id: number): Promise<AdminProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                categories: {select: {id: true,name: true,},},
                components: {orderBy: {sortOrder: 'asc'}},
                variants: {orderBy: {sortOrder: 'asc'}},
                taxCode: true,
                images: {orderBy: [{isPrimary: 'desc'}, {sortOrder: 'asc'}]},
            },
        });

        if (!product) {
            Exceptions.notFound(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(product),
        );
    }


    async create(
        dto: AdminCreateProductDto,
    ): Promise<EntityIdResponseDto> {

        if (dto.floristPrice > dto.customerPrice)
            Exceptions.badRequest(ERROR_MESSAGES.FLORIST_PRICE_MUST_BE_LESS_THAN_CUSTOMER_PRICE)

        try {
            const product = await this.prisma.product.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: dto.description,
                    type: dto.type,
                    featured: dto.featured,
                    rentalDeposit: dto.rentalDeposit,
                    customerPrice: dto.customerPrice,
                    floristPrice: dto.floristPrice,
                    taxCodeId: dto.taxCodeId,
                    categories: { connect: dto.categoryIds.map((id) => ({ id })) },
                    variants: {
                        create: (dto.variants ?? []).map((variant, index) => ({
                            type: variant.type,
                            name: variant.name,
                            description: variant.description,
                            customerPrice: variant.customerPrice,
                            floristPrice: variant.floristPrice,
                            active: variant.active ?? true,
                            sortOrder: variant.sortOrder ?? index,
                        })),
                    },
                    components: {
                        create: (dto.components ?? []).map((component, index) => ({
                            name: component.name,
                            minQuantity: component.minQuantity,
                            recommendedQuantity: component.recommendedQuantity,
                            maxQuantity: component.maxQuantity,
                            customerPricePerAdditionalUnit: component.customerPricePerAdditionalUnit,
                            floristPricePerAdditionalUnit: component.floristPricePerAdditionalUnit,
                            active: component.active ?? true,
                            sortOrder: component.sortOrder ?? index,
                        })),
                    },
                    active: dto.active ?? true,

                },
            });

            return ApiResponse.success(
                this.mapper.toCreatedResponse(product),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.PRODUCT_ALREADY_EXISTS);
                    //case 'P2003':
                    //Exceptions.badRequest(ERROR_MESSAGES.INVALID_PRODUCT_REFERENCE);
                }
            }

            throw error;
        }

    }



    async update(
        id: number,
        dto: AdminUpdateProductDto,
    ): Promise<void> {

        try {
            await this.prisma.$transaction(async (tx) => {

                const product = await tx.product.update({
                    where: { id },
                    data: {
                        ...(dto.name !== undefined && { name: dto.name }),
                        ...(dto.slug !== undefined && { slug: dto.slug }),
                        ...(dto.description !== undefined && { description: dto.description }),
                        ...(dto.featured !== undefined && { featured: dto.featured, }),
                        ...(dto.rentalDeposit !== undefined && { rentalDeposit: dto.rentalDeposit, }),
                        ...(dto.customerPrice !== undefined && { customerPrice: dto.customerPrice, }),
                        ...(dto.floristPrice !== undefined && { floristPrice: dto.floristPrice, }),
                        ...(dto.taxCodeId !== undefined && { taxCodeId: dto.taxCodeId, }),
                        ...(dto.active !== undefined && { active: dto.active, }),
                        ...(dto.categoryIds !== undefined && { categories: { set: dto.categoryIds.map((categoryId) => ({ id: categoryId, })) } }),
                    },
                });

                if (dto.variants !== undefined) {
                    const variants = await tx.productVariant.findMany({
                        where: { productId: id },
                        select: { id: true },
                    });

                    const existingIds = new Set(
                        variants.map((variant) => variant.id),
                    );

                    for (const variant of dto.variants) {
                        if (
                            variant.id !== undefined &&
                            !existingIds.has(variant.id)
                        ) {
                            Exceptions.badRequest({
                                code: 'INVALID_PRODUCT_VARIANT',
                                message: 'A variant does not belong to this product.',
                            });
                        }
                    }

                    const idsToKeep = dto.variants
                        .filter((variant) => variant.id !== undefined)
                        .map((variant) => variant.id!);

                    await tx.productVariant.deleteMany({
                        where: {
                            productId: id,
                            ...(idsToKeep.length > 0
                                ? { id: { notIn: idsToKeep } }
                                : {}),
                        },
                    });

                    for (const [index, variant] of dto.variants.entries()) {
                        const data = {
                            type: variant.type,
                            name: variant.name,
                            description: variant.description,
                            customerPrice: variant.customerPrice,
                            floristPrice: variant.floristPrice,
                            active: variant.active ?? true,
                            sortOrder: variant.sortOrder ?? index,
                        };

                        if (variant.id !== undefined) {
                            await tx.productVariant.update({
                                where: { id: variant.id },
                                data,
                            });
                        } else {
                            await tx.productVariant.create({
                                data: {
                                    ...data,
                                    productId: id,
                                },
                            });
                        }
                    }
                }

                if (dto.components !== undefined) {
                    const components = await tx.productComponent.findMany({
                        where: { productId: id },
                        select: { id: true },
                    });

                    const existingIds = new Set(
                        components.map((component) => component.id),
                    );

                    for (const component of dto.components) {
                        if (
                            component.id !== undefined &&
                            !existingIds.has(component.id)
                        ) {
                            Exceptions.badRequest({
                                code: 'INVALID_PRODUCT_COMPONENT',
                                message: 'A component does not belong to this product.',
                            });
                        }
                    }

                    const idsToKeep = dto.components
                        .filter((component) => component.id !== undefined)
                        .map((component) => component.id!);

                    await tx.productComponent.deleteMany({
                        where: {
                            productId: id,
                            ...(idsToKeep.length > 0
                                ? { id: { notIn: idsToKeep } }
                                : {}),
                        },
                    });

                    for (const [index, component] of dto.components.entries()) {
                        const data = {
                            name: component.name,
                            minQuantity: component.minQuantity,
                            recommendedQuantity: component.recommendedQuantity,
                            maxQuantity: component.maxQuantity,
                            customerPricePerAdditionalUnit:
                                component.customerPricePerAdditionalUnit,
                            floristPricePerAdditionalUnit:
                                component.floristPricePerAdditionalUnit,
                            active: component.active ?? true,
                            sortOrder: component.sortOrder ?? index,
                        };

                        if (component.id !== undefined) {
                            await tx.productComponent.update({
                                where: { id: component.id },
                                data,
                            });
                        } else {
                            await tx.productComponent.create({
                                data: {
                                    ...data,
                                    productId: id,
                                },
                            });
                        }
                    }
                }
            });


        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(
                            ERROR_MESSAGES.PRODUCT_ALREADY_EXISTS,
                        );
                }
            }

            throw error;
        }
    }



    async delete(id: number): Promise<void> {
        try {
            await this.prisma.product.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                }
            }

            throw error;
        }
    }
}