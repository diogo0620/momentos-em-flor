import { Injectable } from '@nestjs/common';
import { OrderOfferStatus, OrderStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { PrismaService } from '@/prisma/prisma.service';
import { FloristOrderQueryDto } from './dtos/florist-order-query.dto';
import { FloristOrdersMapper } from './mappers/florist-orders.mapper';
import { FloristCompensationLifecycleService } from '@/florist-compensations/florist-compensation-lifecycle.service';

@Injectable()
export class FloristOrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: FloristOrdersMapper,
        private readonly compensationLifecycle: FloristCompensationLifecycleService,
    ) { }

    async findAll(user: AuthenticatedUser, query: FloristOrderQueryDto) {
        const floristId = this.getFloristId(user);
        const where: Prisma.OrderWhereInput = { assignedFloristId: floristId, ...(query.status !== undefined && { status: query.status }) };
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where, orderBy: { [query.sort]: query.order }, ...getPagination(query.page, query.pageSize), include: {
                    offers: {
                        where: {
                            floristId,
                            status: OrderOfferStatus.ACCEPTED,
                        },
                        select: {
                            price: true,
                        },
                    },
                }
            }),
            this.prisma.order.count({ where }),
        ]);
        return ApiResponse.paginated(this.mapper.toListResponse(orders), getPaginationResponse(query.page, query.pageSize, total));
    }

    async findOne(user: AuthenticatedUser, id: number) {
        const floristId = this.getFloristId(user);
        const order = await this.prisma.order.findFirst({
            where: { id, assignedFloristId: floristId},
            include: {
                items: {
                    include: {
                        components: true,
                    },
                },
                offers: {
                    where: {
                        floristId,
                        status: OrderOfferStatus.ACCEPTED,
                    },
                    select: {
                        price: true,
                    },
                },
            },
        });
        if (!order) Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        return ApiResponse.success(this.mapper.toDetailResponse(order));
    }

    async startProduction(user: AuthenticatedUser, id: number): Promise<void> {
        await this.transition(
            user,
            id,
            OrderStatus.ASSIGNED,
            OrderStatus.IN_PRODUCTION,
            { inProductionAt: new Date() },
        );
    }

    async setReadyForDelivery(user: AuthenticatedUser, id: number): Promise<void> {
        await this.transition(
            user,
            id,
            OrderStatus.IN_PRODUCTION,
            OrderStatus.READY_FOR_DELIVERY,
            { readyForDeliveryAt: new Date() },
        );
    }

    async deliver(user: AuthenticatedUser, id: number): Promise<void> {
        await this.transition(
            user,
            id,
            OrderStatus.READY_FOR_DELIVERY,
            OrderStatus.DELIVERED,
            { deliveredAt: new Date() },
        );
    }

    private async transition(
        user: AuthenticatedUser,
        id: number,
        currentStatus: OrderStatus,
        nextStatus: OrderStatus,
        statusData: Prisma.OrderUpdateManyMutationInput,
    ): Promise<void> {
        const floristId = this.getFloristId(user);
        await this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.updateMany({
                where: {
                    id,
                    assignedFloristId: floristId,
                    status: currentStatus,
                },
                data: {
                    ...statusData,
                    status: nextStatus,
                },
            });

            if (updated.count !== 1) {
                const order = await tx.order.findFirst({
                    where: { id, assignedFloristId: floristId },
                    select: { id: true },
                });

                if (!order) Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);

                Exceptions.badRequest(ERROR_MESSAGES.INVALID_ORDER_STATUS_TRANSITION);
            }

            if (nextStatus === OrderStatus.DELIVERED) {
                await this.compensationLifecycle.markDue(tx, id, new Date());
            }
        });
    }

    private getFloristId(user: AuthenticatedUser): number {
        if (!user.floristId) Exceptions.forbidden();
        return user.floristId;
    }
}
