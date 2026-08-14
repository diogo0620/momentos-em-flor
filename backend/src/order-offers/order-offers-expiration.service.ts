import {
    Injectable,
    Logger,
} from '@nestjs/common';

import {
    Cron,
    CronExpression,
} from '@nestjs/schedule';

import {
    OrderCancellationReason,
    OrderOfferStatus,
    OrderStatus,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { OrderStatusService } from '@/orders/services/order-status.service';

@Injectable()
export class OrderOfferExpirationService {
    private readonly logger =
        new Logger(
            OrderOfferExpirationService.name,
        );

    constructor(
        private readonly prisma: PrismaService,

        private readonly orderStatusService:
            OrderStatusService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async expireOffers() {
        const now = new Date();

        /*
         * 1. Expire offers whose expiration
         *    date has been reached.
         */
        const expiredOffers =
            await this.prisma.orderOffer.updateMany({
                where: {
                    status: {
                        in: [
                            OrderOfferStatus.PENDING,
                            OrderOfferStatus.VIEWED,
                        ],
                    },

                    expiresAt: {
                        lte: now,
                    },
                },

                data: {
                    status:
                        OrderOfferStatus.EXPIRED,
                },
            });

        if (expiredOffers.count > 0) {
            this.logger.log(
                `Expired ${expiredOffers.count} order offer(s).`,
            );
        }

        /*
         * 2. Find orders that are still waiting
         *    for a florist and have no active offers.
         */
        const orders =
            await this.prisma.order.findMany({
                where: {
                    status:
                        OrderStatus.WAITING_FOR_FLORISTS,

                    assignedFloristId: null,

                    deletedAt: null,

                    offers: {
                        none: {
                            status: {
                                in: [
                                    OrderOfferStatus.PENDING,
                                    OrderOfferStatus.VIEWED,
                                ],
                            },
                        },
                    },
                },

                select: {
                    id: true,
                    orderNumber: true,
                },
            });

            
        /*
         * 3. Cancel orders where all offers
         *    have expired/cancelled.
         */

        /*
        for (const order of orders) {
            const cancelled =
                await this.orderStatusService
                    .cancelAutomatically(
                        order.id,
                        OrderCancellationReason
                            .NO_FLORIST_AVAILABLE,
                    );

            if (cancelled) {
                this.logger.log(
                    `Order ${order.orderNumber} (${order.id}) cancelled: no florist available.`,
                );
            }
        }
        */
    }
}