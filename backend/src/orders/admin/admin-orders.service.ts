import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { OrderItemType, OrderOfferStatus, OrderStatus, Prisma, StoreSettings } from '@prisma/client';
import { AdminOrderResponseDto } from './dtos/admin-order-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { AdminOrdersMapper } from './mappers/admin-orders.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { AdminStoreSettingsService } from '@/store-settings/admin/admin-store-settings.service';
import { AdminOrderQueryDto } from './dtos/admin-order-query.dto';
import { AdminCancelOrderDto } from './dtos/admin-cancel-order.dto';


@Injectable()
export class AdminOrdersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminOrdersMapper,
    ) { }



    async findAll(query: AdminOrderQueryDto) {
        const { page, pageSize, search, sort, status, order } = query;

        const where: Prisma.OrderWhereInput = {
            ...(search && {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                    { customerEmail: { contains: search, mode: 'insensitive' } }
                ],
            }),
            ...(status !== undefined && { status }),
        };

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.order.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(orders),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(id: number): Promise<AdminOrderResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                assignedFlorist: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                items: {
                    include: {
                        components: true,
                        taxCode: true,
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                offers: {
                    include: {
                        florist: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                taxTotals: {
                    include: {
                        taxCode: true
                    }
                }
            }
        });

        if (!order) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(order),
        );
    }

    async startProduction(id: number): Promise<void> {
        await this.transition(
            id,
            OrderStatus.ASSIGNED,
            OrderStatus.IN_PRODUCTION,
            {
                inProductionAt: new Date(),
            },
        );
    }

    async setReadyForDelivery(id: number): Promise<void> {
        await this.transition(
            id,
            OrderStatus.IN_PRODUCTION,
            OrderStatus.READY_FOR_DELIVERY,
            {
                readyForDeliveryAt: new Date(),
            },
        );
    }

    async deliver(id: number): Promise<void> {
        await this.transition(
            id,
            OrderStatus.READY_FOR_DELIVERY,
            OrderStatus.DELIVERED,
            {
                deliveredAt: new Date(),
            },
        );
    }

    async cancel(
        id: number,
        dto: AdminCancelOrderDto,
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!order) {
                Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            if (
                order.status === OrderStatus.DELIVERED ||
                order.status === OrderStatus.CANCELLED
            ) {
                Exceptions.badRequest(
                    ERROR_MESSAGES.ORDER_CANNOT_BE_CANCELLED,
                );
            }

            const updated = await tx.order.updateMany({
                where: {
                    id: order.id,
                    status: order.status,
                },
                data: {
                    status: OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancellationReason: dto.cancellationReason,
                    cancellationReasonDetails: dto.cancellationReasonDetails,
                },
            });

            if (updated.count !== 1) {
                Exceptions.badRequest(
                    ERROR_MESSAGES.INVALID_ORDER_STATUS_TRANSITION,
                );
            }

            await tx.orderOffer.updateMany({
                where: {
                    orderId: order.id,
                    status: {
                        in: [
                            OrderOfferStatus.PENDING,
                            OrderOfferStatus.VIEWED,
                        ],
                    },
                },
                data: {
                    status: OrderOfferStatus.CANCELLED,
                },
            });
        });
    }

    private async transition(
        id: number,
        currentStatus: OrderStatus,
        nextStatus: OrderStatus,
        statusData: Prisma.OrderUpdateManyMutationInput = {},
    ): Promise<void> {
        const updated = await this.prisma.order.updateMany({
            where: {
                id,
                status: currentStatus,
            },
            data: {
                ...statusData,
                status: nextStatus,
            },
        });

        if (updated.count === 1) {
            return;
        }

        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!order) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        Exceptions.badRequest(
            ERROR_MESSAGES.INVALID_ORDER_STATUS_TRANSITION,
        );
    }


}