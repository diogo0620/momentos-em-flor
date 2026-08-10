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
        /*
         * Validate product
         */
        const product =
            await this.prisma.product.findFirst({
                where: {
                    id: dto.productId,
                    deletedAt: null,
                },
            });

        if (!product) {
            Exceptions.notFound(
                PRODUCT_MESSAGES.NOT_FOUND,
            );
        }

        /*
         * Validate florist when this is
         * a florist-specific rule.
         */
        if (dto.floristId !== undefined) {
            const florist =
                await this.prisma.florist.findFirst({
                    where: {
                        id: dto.floristId,
                        deletedAt: null,
                    },
                });

            if (!florist) {
                Exceptions.notFound(
                    FLORIST_MESSAGES.NOT_FOUND,
                );
            }
        }

        /*
         * Check if the rule already exists.
         *
         * We cannot rely only on @@unique([productId, floristId])
         * because PostgreSQL allows multiple NULL values.
         */
        const existingRule =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    deletedAt: null,
                    productId: dto.productId,
                    floristId: dto.floristId ?? null,
                },
            });

        if (existingRule) {
            Exceptions.conflict(
                'A compensation rule already exists for this product and florist.',
            );
        }

        const rule =
            await this.prisma.floristCompensationRule.create({
                data: {
                    productId: dto.productId,
                    floristId: dto.floristId ?? null,
                    compensationAmount: dto.compensationAmount,
                    active: dto.active ?? true,
                },
                include: {
                    product: true,
                    florist: true,
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(rule),
        );
    }

    async update(
        id: number,
        dto: UpdateFloristCompensationRuleDto,
    ) {
        const existingRule =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });

        if (!existingRule) {
            Exceptions.notFound(
                FLORIST_COMPENSATION_RULE_MESSAGES.NOT_FOUND,
            );
        }

        const productId =
            dto.productId ?? existingRule.productId;

        const floristId =
            dto.floristId !== undefined
                ? dto.floristId
                : existingRule.floristId;

        /*
         * Validate product when changing it.
         */
        if (dto.productId !== undefined) {
            const product =
                await this.prisma.product.findFirst({
                    where: {
                        id: dto.productId,
                        deletedAt: null,
                    },
                });

            if (!product) {
                Exceptions.notFound(
                    PRODUCT_MESSAGES.NOT_FOUND,
                );
            }
        }

        /*
         * Validate florist when changing it.
         */
        if (
            dto.floristId !== undefined &&
            dto.floristId !== null
        ) {
            const florist =
                await this.prisma.florist.findFirst({
                    where: {
                        id: dto.floristId,
                        deletedAt: null,
                    },
                });

            if (!florist) {
                Exceptions.notFound(
                    FLORIST_MESSAGES.NOT_FOUND,
                );
            }
        }

        /*
         * Make sure another active rule does not
         * already exist for the same product + florist.
         */
        const duplicate =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    productId,
                    floristId,
                    deletedAt: null,
                    NOT: {
                        id,
                    },
                },
            });

        if (duplicate) {
            Exceptions.conflict(
                FLORIST_COMPENSATION_RULE_MESSAGES.ALREADY_EXISTS,
            );
        }

        const rule =
            await this.prisma.floristCompensationRule.update({
                where: {
                    id,
                },
                data: {
                    ...(dto.productId !== undefined && {
                        productId: dto.productId,
                    }),

                    ...(dto.floristId !== undefined && {
                        floristId: dto.floristId,
                    }),

                    ...(dto.compensationAmount !== undefined && {
                        compensationAmount:
                            dto.compensationAmount,
                    }),

                    ...(dto.active !== undefined && {
                        active: dto.active,
                    }),
                },
                include: {
                    product: true,
                    florist: true,
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(rule),
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