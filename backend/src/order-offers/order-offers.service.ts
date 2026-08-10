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
} from '@prisma/client';
import { OrderOfferQueryDto } from './query/order-offer-query.dto';
import { ORDER_OFFER_MESSAGES } from './constants/order-offer-messages';
import { DeclineOrderOfferDto } from './dto/decline-order-offer.dto';

@Injectable()
export class OrderOffersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: OrderOfferMapper,
    ) { }

    async findAll(
        user: AuthenticatedUser,
        query: OrderOfferQueryDto,
    ) {
        if (!user.floristId) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES.FLORIST_REQUIRED,
            );
        }

        const where = {
            floristId: user.floristId,

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
                    orderOfferItems: true,
                    florist: true,
                },

                orderBy: {
                    createdAt: 'desc',
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
            this.mapper.toResponses(offers),
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
        if (!user.floristId) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES.FLORIST_REQUIRED,
            );
        }

        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,
                    floristId: user.floristId,
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
            offer.status === OrderOfferStatus.PENDING
        ) {
            const viewedAt = new Date();

            await this.prisma.orderOffer.update({
                where: {
                    id: offer.id,
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
            this.mapper.toResponse(offer),
        );
    }

    async accept(
        user: AuthenticatedUser,
        id: number,
    ) {
        if (!user.floristId) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES.FLORIST_REQUIRED,
            );
        }

        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,
                    floristId: user.floristId,
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
            offer.status !== OrderOfferStatus.PENDING &&
            offer.status !== OrderOfferStatus.VIEWED
        ) {
            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES.INVALID_STATUS,
            );
        }

        if (offer.expiresAt <= new Date()) {
            await this.prisma.orderOffer.update({
                where: {
                    id: offer.id,
                },
                data: {
                    status: OrderOfferStatus.EXPIRED,
                },
            });

            Exceptions.badRequest(
                ORDER_OFFER_MESSAGES.OFFER_EXPIRED,
            );
        }

        const result =
            await this.prisma.$transaction(
                async (tx) => {
                    /*
                     * Only the first florist that reaches this
                     * update while assignedFloristId is null
                     * can assign the order.
                     */
                    const assignment =
                        await tx.order.updateMany({
                            where: {
                                id: offer.orderId,
                                deletedAt: null,
                                assignedFloristId: null,
                            },
                            data: {
                                assignedFloristId:
                                    user.floristId,
                            },
                        });

                    if (assignment.count === 0) {
                        Exceptions.conflict(
                            ORDER_OFFER_MESSAGES.ORDER_ALREADY_ASSIGNED,
                        );
                    }

                    const acceptedOffer =
                        await tx.orderOffer.update({
                            where: {
                                id: offer.id,
                            },
                            data: {
                                status:
                                    OrderOfferStatus.ACCEPTED,
                                acceptedAt:
                                    new Date(),
                            },
                            include: {
                                orderOfferItems: true,
                                florist: true,
                                order: true,
                            },
                        });

                    await tx.orderOffer.updateMany({
                        where: {
                            orderId: offer.orderId,

                            id: {
                                not: offer.id,
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
                                OrderOfferStatus.EXPIRED,
                        },
                    });

                    return acceptedOffer;
                },
            );

        return ApiResponse.success(
            this.mapper.toResponse(result),
        );
    }

    async decline(
        user: AuthenticatedUser,
        id: number,
        dto: DeclineOrderOfferDto,
    ) {
        if (!user.floristId) {
            Exceptions.forbidden(
                ORDER_OFFER_MESSAGES.FLORIST_REQUIRED,
            );
        }

        const offer =
            await this.prisma.orderOffer.findFirst({
                where: {
                    id,
                    floristId: user.floristId,
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

        if (offer.expiresAt <= new Date()) {
            await this.prisma.orderOffer.update({
                where: {
                    id: offer.id,
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
                    id: offer.id,
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
                    orderOfferItems: true,
                    florist: true,
                    order: true,
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(
                declinedOffer,
            ),
        );
    }


}