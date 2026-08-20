import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ApiResponse } from '@/common/responses/api-response';

import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { OrderOfferMapper } from './mappers/order-offer.mapper';
import {
    OrderOfferStatus,
    OrderStatus,
    UserRole,
} from '@prisma/client';
import { OrderOfferQueryDto } from './query/order-offer-query.dto';
import { ORDER_OFFER_MESSAGES } from './constants/order-offer-messages';
import { DeclineOrderOfferDto } from './dto/decline-order-offer.dto';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { OrderDistributionService } from '@/orders/services/order-distribution.service';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderOfferAcceptedEvent } from '@/events/order-offer/order-offer-accepted.event';
import { OrderStatusService } from '@/orders/services/order-status.service';

@Injectable()
export class OrderOffersService {
    constructor(
        private readonly prisma: PrismaService,

        private readonly mapper:
            OrderOfferMapper,

        private readonly eventEmitter:
            EventEmitter2,

        private readonly orderDistributionService:
            OrderDistributionService,

        private readonly orderStatusService:
            OrderStatusService,
    ) { }

    async create(
        dto: CreateOrderOfferDto,
    ) {
        const offer =
            await this.orderDistributionService.createOffer(
                dto.orderId,
                dto.floristId,
                dto.compensationAmount,
            );

        return ApiResponse.success(
            this.mapper.toResponse(
                offer,
            ),
        );
    }

    async update(
        id: number,
        dto: UpdateOrderOfferDto,
    ) {
        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,

                    order: {
                        deletedAt: null,
                    },
                },

                include: {
                    order: true,

                    orderOfferItems: true,

                    florist: true,
                },
            });

        if (!offer) {
            Exceptions.notFound(
                ORDER_OFFER_MESSAGES.NOT_FOUND,
            );
        }

        if (
            offer.status !==
            OrderOfferStatus.PENDING &&
            offer.status !==
            OrderOfferStatus.VIEWED
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES.INVALID_STATUS,
            );
        }

        /*
         * Determine the new florist.
         */
        const floristId =
            dto.floristId ??
            offer.floristId;

        /*
         * Validate florist if it is being changed.
         */
        if (
            dto.floristId !== undefined
        ) {
            const florist =
                await this.prisma.florist.findFirst({
                    where: {
                        id:
                            dto.floristId,

                        active:
                            true,

                        acceptingOrders:
                            true,

                        deletedAt:
                            null,
                    },
                });

            if (!florist) {
                Exceptions.notFound(
                    ORDER_OFFER_MESSAGES.FLORIST_NOT_FOUND,
                );
            }

            /*
             * Do not allow two active offers
             * for the same order + florist.
             */
            if (
                dto.floristId !==
                offer.floristId
            ) {
                const existingActiveOffer =
                    await this.prisma.orderOffer.findFirst({
                        where: {
                            orderId:
                                offer.orderId,

                            floristId:
                                dto.floristId,

                            status: {
                                in: [
                                    OrderOfferStatus.PENDING,
                                    OrderOfferStatus.VIEWED,
                                ],
                            },

                            id: {
                                not:
                                    offer.id,
                            },
                        },
                    });

                if (existingActiveOffer) {
                    Exceptions.conflict(
                        ORDER_OFFER_MESSAGES
                            .ACTIVE_OFFER_EXISTS,
                    );
                }
            }
        }

        /*
         * Determine the new compensation.
         *
         * If it was not provided, keep the
         * current value.
         */
        const compensationAmount =
            dto.compensationAmount ??
            Number(
                offer.compensationAmount,
            );

        /*
         * Compensation cannot exceed the
         * order subtotal.
         */
        if (
            compensationAmount >
            Number(
                offer.order.subtotal,
            )
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES
                    .COMPENSATION_TOO_HIGH,
            );
        }

        if (
            compensationAmount <= 0
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES
                    .COMPENSATION_MUST_BE_POSITIVE,
            );
        }

        /*
         * Recalculate the existing item
         * distribution proportionally.
         */
        const currentItemsTotal =
            offer.orderOfferItems.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.totalCompensation,
                    ),
                0,
            );

        if (
            currentItemsTotal <= 0
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES
                    .COMPENSATION_INVALID,
            );
        }

        const factor =
            compensationAmount /
            currentItemsTotal;

        const updatedItems =
            offer.orderOfferItems.map(
                (item) => {
                    const totalCompensation =
                        this.roundMoney(
                            Number(
                                item.totalCompensation,
                            ) * factor,
                        );

                    return {
                        id:
                            item.id,

                        quantity:
                            item.quantity,

                        totalCompensation,

                        unitCompensation:
                            this.roundMoney(
                                totalCompensation /
                                item.quantity,
                            ),
                    };
                },
            );

        /*
         * Correct rounding difference on
         * the last item.
         */
        const distributedTotal =
            this.roundMoney(
                updatedItems.reduce(
                    (total, item) =>
                        total +
                        item.totalCompensation,
                    0,
                ),
            );

        const roundingDifference =
            this.roundMoney(
                compensationAmount -
                distributedTotal,
            );

        if (
            roundingDifference !== 0 &&
            updatedItems.length > 0
        ) {
            const lastIndex =
                updatedItems.length - 1;

            const lastItem =
                updatedItems[lastIndex];

            const correctedTotal =
                this.roundMoney(
                    lastItem.totalCompensation +
                    roundingDifference,
                );

            updatedItems[lastIndex] = {
                ...lastItem,

                totalCompensation:
                    correctedTotal,

                unitCompensation:
                    this.roundMoney(
                        correctedTotal /
                        lastItem.quantity,
                    ),
            };
        }

        /*
         * Update everything atomically.
         */
        const updatedOffer =
            await this.prisma.$transaction(
                async (tx) => {
                    await Promise.all(
                        updatedItems.map(
                            (item) =>
                                tx.orderOfferItem.update({
                                    where: {
                                        id:
                                            item.id,
                                    },

                                    data: {
                                        unitCompensation:
                                            item.unitCompensation,

                                        totalCompensation:
                                            item.totalCompensation,
                                    },
                                }),
                        ),
                    );

                    return tx.orderOffer.update({
                        where: {
                            id:
                                offer.id,
                        },

                        data: {
                            floristId,

                            compensationAmount,

                            ...(dto.floristId !==
                                undefined &&
                                dto.floristId !==
                                offer.floristId
                                ? {
                                    viewedAt:
                                        null,

                                    status:
                                        OrderOfferStatus.PENDING,
                                }
                                : {}),
                        },

                        include: {
                            order: true,

                            orderOfferItems:
                                true,

                            florist:
                                true,
                        },
                    });
                },
            );

        return ApiResponse.success(
            this.mapper.toResponse(
                updatedOffer,
            ),
        );
    }

    async findAll(
        user: AuthenticatedUser,
        query: OrderOfferQueryDto,
    ) {
        if (
            user.role === UserRole.FLORIST &&
            !user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES
                    .FLORIST_REQUIRED,
            );
        }

        const where = {
            ...(user.role === UserRole.FLORIST && {
                floristId:
                    user.floristId!,
            }),

            status: {
                in: [
                    OrderOfferStatus.PENDING,
                    OrderOfferStatus.VIEWED,
                ],
            },

            order: {
                deletedAt: null,
            },
        };

        const offers =
            await this.prisma.orderOffer.findMany({
                where,

                include: {
                    order: true,

                    orderOfferItems:
                        true,

                    florist:
                        true,
                },

                orderBy: {
                    createdAt:
                        'desc',
                },

                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
            });

        const total =
            await this.prisma.orderOffer.count({
                where,
            });

        return ApiResponse.paginated(
            this.mapper.toResponses(
                offers,
            ),

            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }

    async findOne(
        user: AuthenticatedUser,
        id: number,
    ) {
        if (
            user.role === UserRole.FLORIST &&
            !user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES
                    .FLORIST_REQUIRED,
            );
        }

        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,

                    ...(user.role === UserRole.FLORIST && {
                        floristId:
                            user.floristId!,
                    }),

                    order: {
                        deletedAt: null,
                    },
                },

                include: {
                    order: true,

                    orderOfferItems:
                        true,

                    florist:
                        true,
                },
            });

        if (!offer) {
            Exceptions.notFound(
                ORDER_OFFER_MESSAGES.NOT_FOUND,
            );
        }

        if (
            user.role === UserRole.FLORIST &&
            offer.status ===
                OrderOfferStatus.PENDING
        ) {
            const viewedAt =
                new Date();

            await this.prisma.orderOffer.update({
                where: {
                    id:
                        offer.id,
                },

                data: {
                    status:
                        OrderOfferStatus.VIEWED,

                    viewedAt,
                },
            });

            offer.status =
                OrderOfferStatus.VIEWED;

            offer.viewedAt =
                viewedAt;
        }

        return ApiResponse.success(
            this.mapper.toResponse(
                offer,
            ),
        );
    }

    async accept(
        user: AuthenticatedUser,
        id: number,
    ) {
        /*
         * Florist must be associated with a
         * florist account.
         */
        if (
            user.role === UserRole.FLORIST &&
            !user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES
                    .FLORIST_REQUIRED,
            );
        }

        /*
         * Find the offer.
         *
         * Florists can only access their own
         * offers.
         */
        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,

                    ...(user.role === UserRole.FLORIST && {
                        floristId:
                            user.floristId!,
                    }),

                    order: {
                        deletedAt: null,
                    },
                },
            });

        if (!offer) {
            Exceptions.notFound(
                ORDER_OFFER_MESSAGES.NOT_FOUND,
            );
        }

        /*
         * Only pending or viewed offers can
         * be accepted.
         */
        if (
            offer.status !==
            OrderOfferStatus.PENDING &&
            offer.status !==
            OrderOfferStatus.VIEWED
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES
                    .INVALID_STATUS,
            );
        }

        /*
         * Check expiration.
         */
        if (
            offer.expiresAt <=
            new Date()
        ) {
            await this.prisma.orderOffer.update({
                where: {
                    id:
                        offer.id,
                },

                data: {
                    status:
                        OrderOfferStatus.EXPIRED,
                },
            });

            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES
                    .OFFER_EXPIRED,
            );
        }

        /*
         * Everything below happens in one
         * transaction:
         *
         * 1. Assign order
         * 2. Create status history
         * 3. Accept offer
         * 4. Cancel other offers
         */
        const result =
            await this.prisma.$transaction(
                async (tx) => {
                    /*
                     * Assign the order through the
                     * centralized OrderStatusService.
                     *
                     * This also:
                     * - sets assignedFloristId
                     * - sets assignedAt
                     * - changes status to ASSIGNED
                     * - creates OrderStatusHistory
                     */
                    await this.orderStatusService
                        .assignWithTransaction(
                            tx,

                            offer.orderId,

                            offer.floristId,

                            user,

                            `Order assigned through accepted offer ${offer.id}.`,
                        );

                    /*
                     * Accept the selected offer.
                     */
                    const acceptedOffer =
                        await tx.orderOffer.update({
                            where: {
                                id:
                                    offer.id,
                            },

                            data: {
                                status:
                                    OrderOfferStatus.ACCEPTED,

                                acceptedAt:
                                    new Date(),
                            },

                            include: {
                                order:
                                    true,

                                florist:
                                    true,

                                orderOfferItems:
                                    true,
                            },
                        });

                    /*
                     * Cancel all other active offers
                     * belonging to this order.
                     */
                    await tx.orderOffer.updateMany({
                        where: {
                            orderId:
                                offer.orderId,

                            id: {
                                not:
                                    offer.id,
                            },

                            status: {
                                in: [
                                    OrderOfferStatus.PENDING,
                                    OrderOfferStatus.VIEWED,
                                ],
                            },
                        },

                        data: {
                            status:
                                OrderOfferStatus.CANCELLED,
                        },
                    });

                    return acceptedOffer;
                },
            );

        return ApiResponse.success(
            this.mapper.toResponse(
                result,
            ),
        );
    }

    async decline(
        user: AuthenticatedUser,
        id: number,
        dto: DeclineOrderOfferDto,
    ) {
        if (
            user.role === UserRole.FLORIST &&
            !user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES
                    .FLORIST_REQUIRED,
            );
        }

        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,

                    ...(user.role === UserRole.FLORIST && {
                        floristId:
                            user.floristId!,
                    }),

                    order: {
                        deletedAt: null,
                    },
                },
            });

        if (!offer) {
            Exceptions.notFound(
                ORDER_OFFER_MESSAGES.NOT_FOUND,
            );
        }

        if (
            offer.status !==
            OrderOfferStatus.PENDING &&
            offer.status !==
            OrderOfferStatus.VIEWED
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES.INVALID_STATUS,
            );
        }

        if (
            offer.expiresAt <=
            new Date()
        ) {
            await this.prisma.orderOffer.update({
                where: {
                    id:
                        offer.id,
                },

                data: {
                    status:
                        OrderOfferStatus.EXPIRED,
                },
            });

            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES.OFFER_EXPIRED,
            );
        }

        const declinedOffer =
            await this.prisma.orderOffer.update({
                where: {
                    id:
                        offer.id,
                },

                data: {
                    status:
                        OrderOfferStatus.DECLINED,

                    declinedAt:
                        new Date(),

                    declineReason:
                        dto.reason.trim(),
                },

                include: {
                    order:
                        true,

                    orderOfferItems:
                        true,

                    florist:
                        true,
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(
                declinedOffer,
            ),
        );
    }

    private roundMoney(
        value: number,
    ): number {
        return (
            Math.round(
                (value +
                    Number.EPSILON) *
                    100,
            ) / 100
        );
    }
}