import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { OrderStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { OrderCreatedEvent } from './order-created.event';
import { OrderDistributionService } from '@/orders/services/order-distribution.service';

@Injectable()
export class OrderCreatedListener {
    constructor(
        private readonly prisma: PrismaService,

        private readonly orderDistributionService:
            OrderDistributionService,
    ) {}

    @OnEvent('order.created')
    async handle(
        event: OrderCreatedEvent,
    ) {
        /*
         * Distribute the order to all eligible
         * florists.
         */
        await this.orderDistributionService
            .distributeOrder(
                event.orderId,
            );

        /*
         * The order is now waiting for a florist.
         *
         * This is true even if no eligible florist
         * was found. An administrator can manually
         * create an offer / assign a florist later.
         */
        await this.prisma.order.updateMany({
            where: {
                id: event.orderId,
                status: OrderStatus.CREATED,
                deletedAt: null,
            },

            data: {
                status:
                    OrderStatus.WAITING_FOR_FLORISTS,
            },
        });
    }
}