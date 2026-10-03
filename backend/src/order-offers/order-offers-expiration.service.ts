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
        /*
        const now = new Date();


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


        const orders =
            await this.prisma.order.findMany({
                where: {
                    status:
                        OrderStatus.WAITING_FOR_FLORISTS,

                    assignedFloristId: null,

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

            */

    }
}