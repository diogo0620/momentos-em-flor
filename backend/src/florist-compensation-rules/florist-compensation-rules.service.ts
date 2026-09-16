import {
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { ApiResponse } from '@/common/responses/api-response';


import { Exceptions } from '@/common/exceptions/exceptions';

import { CreateFloristCompensationRuleDto } from './dto/create-florist-compensation-rule.dto';
import { UpdateFloristCompensationRuleDto } from './dto/update-florist-compensation-rule.dto';
import { FloristCompensationRuleQueryDto } from './query/florist-compensation-rule-query.dto';
import { FloristCompensationRuleMapper } from './mappers/florist-compensation-rule.mapper';
import { PRODUCT_MESSAGES } from '@/products/constants/product.messages';
import { FLORIST_MESSAGES } from '@/florists/constants/florist.messages';
import { FLORIST_COMPENSATION_RULE_MESSAGES } from './constants/florist-compensation-rule.messages';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

@Injectable()
export class FloristCompensationRulesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: FloristCompensationRuleMapper,
    ) { }
    async findAll(
        query: FloristCompensationRuleQueryDto,
    ) {
        const where = {
            ...(query.search && {
                deletedAt: null,
                product: {
                    name: {
                        contains: query.search,
                        mode: 'insensitive' as const,
                    },
                },
            }),
        };

        const orderBy = query.sort
            ? {
                [query.sort]: query.order,
            }
            : {
                createdAt: 'desc' as const,
            };

        const rules =
            await this.prisma.floristCompensationRule.findMany({
                where,
                include: {
                    product: true,
                    variant: true,
                    florist: true,
                },
                orderBy,
                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
            });

        const total =
            await this.prisma.floristCompensationRule.count({
                where,
            });

        return ApiResponse.paginated(
            this.mapper.toResponses(rules),
            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }

    async findById(id: number) {
        const rule =
            await this.prisma.floristCompensationRule.findUnique({
                where: {
                    id,
                    deletedAt: null
                },
                include: {
                    product: true,
                    variant: true,
                    florist: true,
                },
            });

        if (!rule) {
            Exceptions.notFound(
                'Compensation rule not found.',
            );
        }

        return ApiResponse.success(
            this.mapper.toResponse(rule),
        );
    }

    async create(
    dto: CreateFloristCompensationRuleDto,
) {
    const product =
        await this.prisma.product.findFirst({
            where: {
                id: dto.productId,
                active: true,
                deletedAt: null,
            },
            select: {
                id: true,
                basePrice: true,
            },
        });

    if (!product) {
        Exceptions.notFound(
            PRODUCT_MESSAGES.NOT_FOUND,
        );
    }

    let price =
        Number(product.basePrice);

    if (dto.variantId) {
        const variant =
            await this.prisma.productVariant.findFirst({
                where: {
                    id: dto.variantId,
                    productId: dto.productId,
                    active: true,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    price: true,
                },
            });

        if (!variant) {
            Exceptions.notFound(
                'Product variant not found.',
            );
        }

        price =
            Number(variant.price);
    }

    if (
        dto.compensationAmount >=
        price
    ) {
        Exceptions.badRequest(
            FLORIST_COMPENSATION_RULE_MESSAGES
                .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
        );
    }

    const florist =
        await this.prisma.florist.findFirst({
            where: {
                id: dto.floristId,
                active: true,
                deletedAt: null,
            },
        });

    if (!florist) {
        Exceptions.notFound(
            FLORIST_MESSAGES.NOT_FOUND,
        );
    }

    const exists =
        await this.prisma.floristCompensationRule.findFirst({
            where: {
                productId:
                    dto.productId,

                floristId:
                    dto.floristId,

                variantId:
                    dto.variantId ?? null,

                deletedAt: null,
            },
        });

    if (exists) {
        Exceptions.conflict(
            FLORIST_COMPENSATION_RULE_MESSAGES
                .ALREADY_EXISTS,
        );
    }

    const rule =
        await this.prisma.floristCompensationRule.create({
            data: {
                productId:
                    dto.productId,

                floristId:
                    dto.floristId,

                variantId:
                    dto.variantId ?? null,

                compensationAmount:
                    dto.compensationAmount,

                active:
                    dto.active ?? true,
            },

            include: {
                product: true,
                variant: true,
                florist: true,
            },
        });

    return ApiResponse.success(
        this.mapper.toResponse(rule),

        FLORIST_COMPENSATION_RULE_MESSAGES
            .CREATED,
    );
}


async update(
    id: number,
    dto: UpdateFloristCompensationRuleDto,
) {
    const rule =
        await this.prisma.floristCompensationRule.findFirst({
            where: {
                id,
                deletedAt: null,
            },

            include: {
                product: {
                    select: {
                        id: true,
                        basePrice: true,
                    },
                },

                variant: {
                    select: {
                        id: true,
                        price: true,
                    },
                },
            },
        });

    if (!rule) {
        Exceptions.notFound(
            FLORIST_COMPENSATION_RULE_MESSAGES
                .NOT_FOUND,
        );
    }

    const price =
        rule.variant
            ? Number(rule.variant.price)
            : Number(rule.product.basePrice);

    const newCompensation =
        dto.compensationAmount ??
        Number(rule.compensationAmount);

    if (
        newCompensation >= price
    ) {
        Exceptions.badRequest(
            FLORIST_COMPENSATION_RULE_MESSAGES
                .COMPENSATION_MUST_BE_LESS_THAN_PRICE,
        );
    }

    const updatedRule =
        await this.prisma.floristCompensationRule.update({
            where: {
                id,
            },

            data: {
                ...(dto.compensationAmount !==
                    undefined
                    ? {
                        compensationAmount:
                            dto.compensationAmount,
                    }
                    : {}),

                ...(dto.active !== undefined
                    ? {
                        active:
                            dto.active,
                    }
                    : {}),
            },

            include: {
                product: true,
                variant: true,
                florist: true,
            },
        });

    return ApiResponse.success(
        this.mapper.toResponse(
            updatedRule,
        ),
        FLORIST_COMPENSATION_RULE_MESSAGES.UPDATED,
    );
}


    async remove(id: number) {
        const rule =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });

        if (!rule) {
            Exceptions.notFound(
                FLORIST_COMPENSATION_RULE_MESSAGES.NOT_FOUND,
            );
        }

        await this.prisma.floristCompensationRule.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return ApiResponse.success({
            message:
                FLORIST_COMPENSATION_RULE_MESSAGES.DELETED,
        });
    }
}