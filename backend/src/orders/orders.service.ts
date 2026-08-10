import {
    Injectable,
} from '@nestjs/common';

import {
    OrderStatus,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { ApiResponse } from '@/common/responses/api-response';
import { Exceptions } from '@/common/exceptions/exceptions';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderMapper } from './mappers/order.mapper';
import { ORDER_MESSAGES } from './constants/order.messages';
import { OrderQueryDto } from './query/order-query.dto';

import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { UserRole } from '@prisma/client';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDistributionService } from './services/order-distribution.service';



@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: OrderMapper,
        private readonly distributionService: OrderDistributionService
    ) { }

    async findAll(
        user: AuthenticatedUser,
        query: OrderQueryDto,
    ) {
        if (
            user.role !== UserRole.SYSTEM_ADMIN &&
            user.role !== UserRole.CUSTOMER
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        const where = {
            deletedAt: null,

            ...(user.role === UserRole.CUSTOMER && {
                customerId: user.id,
            }),

            ...(query.status && {
                status: query.status,
            }),

            ...(query.customerId &&
                user.role === UserRole.SYSTEM_ADMIN && {
                customerId: query.customerId,
            }),

            ...(query.search && {
                OR: [
                    {
                        orderNumber: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        customerEmail: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        customerFirstName: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        customerLastName: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const orderBy = query.sort
            ? {
                [query.sort]: query.order,
            }
            : {
                createdAt: 'desc' as const,
            };

        const orders =
            await this.prisma.order.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy,
                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
            });

        const total =
            await this.prisma.order.count({
                where,
            });

        return ApiResponse.paginated(
            this.mapper.toResponses(orders),
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
            user.role !== UserRole.SYSTEM_ADMIN &&
            user.role !== UserRole.CUSTOMER
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        const where = {
            id,
            deletedAt: null,

            ...(user.role === UserRole.CUSTOMER && {
                customerId: user.id,
            }),
        };

        const order =
            await this.prisma.order.findFirst({
                where,
                include: {
                    items: true,
                    offers: {
                        include: {
                            orderOfferItems: true,
                            florist: true,
                        },
                    },
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        return ApiResponse.success(
            this.mapper.toResponse(order),
        );
    }


    async create(
        customerId: number,
        dto: CreateOrderDto,
    ) {
        const customer =
            await this.prisma.user.findFirst({
                where: {
                    id: customerId,
                    deletedAt: null,
                    active: true,
                },
            });

        if (!customer) {
            Exceptions.notFound(
                ORDER_MESSAGES.CUSTOMER_NOT_FOUND,
            );
        }

        if (dto.items.length === 0) {
            Exceptions.badRequest(
                ORDER_MESSAGES.EMPTY_ORDER,
            );
        }

        const productIds = dto.items.map(
            (item) => item.productId,
        );

        if (
            new Set(productIds).size !== productIds.length
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES.DUPLICATE_PRODUCTS,
            );
        }

        const products =
            await this.prisma.product.findMany({
                where: {
                    id: {
                        in: productIds,
                    },
                    active: true,
                    deletedAt: null,
                },
            });

        if (products.length !== productIds.length) {
            Exceptions.badRequest(
                ORDER_MESSAGES.PRODUCT_NOT_AVAILABLE,
            );
        }

        const productsById = new Map(
            products.map((product) => [
                product.id,
                product,
            ]),
        );

        const items = dto.items.map((item) => {
            const product =
                productsById.get(item.productId)!;

            const unitPrice = Number(
                product.basePrice,
            );

            const lineTotal =
                unitPrice * item.quantity;

            return {
                productId: product.id,
                productName: product.name,
                productDescription:
                    product.description,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
            };
        });

        const subtotal = items.reduce(
            (total, item) =>
                total + item.lineTotal,
            0,
        );

        const deliveryFee = 0;
        const discount = 0;

        const total =
            subtotal +
            deliveryFee -
            discount;

        const orderNumber =
            await this.generateOrderNumber();

        const order =
            await this.prisma.$transaction(
                async (tx) => {
                    return tx.order.create({
                        data: {
                            orderNumber,

                            customerId,

                            customerFirstName:
                                customer.firstName,
                            customerLastName:
                                customer.lastName,
                            customerEmail:
                                customer.email,
                            customerPhone:
                                customer.phone,

                            recipientFirstName:
                                dto.recipientFirstName,
                            recipientLastName:
                                dto.recipientLastName,
                            recipientPhone:
                                dto.recipientPhone,

                            occasion:
                                dto.occasion,

                            deliveryDate:
                                new Date(dto.deliveryDate),
                            deliveryTimeSlot:
                                dto.deliveryTimeSlot,
                            deliveryInstructions:
                                dto.deliveryInstructions,

                            deliveryStreet:
                                dto.deliveryStreet,
                            deliveryStreet2:
                                dto.deliveryStreet2,
                            deliveryPostalCode:
                                dto.deliveryPostalCode,
                            deliveryCity:
                                dto.deliveryCity,
                            deliveryDistrict:
                                dto.deliveryDistrict,
                            deliveryCountryCode:
                                dto.deliveryCountryCode.toUpperCase(),

                            deliveryLatitude:
                                dto.deliveryLatitude,
                            deliveryLongitude:
                                dto.deliveryLongitude,

                            cardMessage:
                                dto.cardMessage,

                            subtotal,
                            deliveryFee,
                            discount,
                            total,

                            status:
                                OrderStatus.CREATED,

                            items: {
                                create: items,
                            },
                        },

                        include: {
                            items: true,
                        },
                    });
                },
            );

        /*
         * Distribute the order to eligible florists.
         */
        await this.distributionService.distributeOrder(
            order.id,
        );

        /*
         * Reload the order including the offers
         * created during distribution.
         */
        const createdOrder =
            await this.prisma.order.findUnique({
                where: {
                    id: order.id,
                },
                include: {
                    items: true,

                    offers: {
                        include: {
                            orderOfferItems: true,
                            florist: true,
                        },
                    },
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(
                createdOrder,
            ),
        );
    }

    async update(
        id: number,
        dto: UpdateOrderDto,
    ) {
        const existingOrder =
            await this.prisma.order.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });

        if (!existingOrder) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        const order =
            await this.prisma.order.update({
                where: {
                    id,
                },
                data: {
                    ...(dto.recipientFirstName !== undefined && {
                        recipientFirstName:
                            dto.recipientFirstName,
                    }),

                    ...(dto.recipientLastName !== undefined && {
                        recipientLastName:
                            dto.recipientLastName,
                    }),

                    ...(dto.recipientPhone !== undefined && {
                        recipientPhone:
                            dto.recipientPhone,
                    }),

                    ...(dto.occasion !== undefined && {
                        occasion: dto.occasion,
                    }),

                    ...(dto.deliveryDate !== undefined && {
                        deliveryDate:
                            new Date(dto.deliveryDate),
                    }),

                    ...(dto.deliveryTimeSlot !== undefined && {
                        deliveryTimeSlot:
                            dto.deliveryTimeSlot,
                    }),

                    ...(dto.deliveryInstructions !== undefined && {
                        deliveryInstructions:
                            dto.deliveryInstructions,
                    }),

                    ...(dto.deliveryStreet !== undefined && {
                        deliveryStreet:
                            dto.deliveryStreet,
                    }),

                    ...(dto.deliveryStreet2 !== undefined && {
                        deliveryStreet2:
                            dto.deliveryStreet2,
                    }),

                    ...(dto.deliveryPostalCode !== undefined && {
                        deliveryPostalCode:
                            dto.deliveryPostalCode,
                    }),

                    ...(dto.deliveryCity !== undefined && {
                        deliveryCity:
                            dto.deliveryCity,
                    }),

                    ...(dto.deliveryDistrict !== undefined && {
                        deliveryDistrict:
                            dto.deliveryDistrict,
                    }),

                    ...(dto.deliveryCountryCode !== undefined && {
                        deliveryCountryCode:
                            dto.deliveryCountryCode.toUpperCase(),
                    }),

                    ...(dto.cardMessage !== undefined && {
                        cardMessage:
                            dto.cardMessage,
                    }),
                },
                include: {
                    items: true,
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(order),
        );
    }

    async remove(id: number) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        await this.prisma.order.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return ApiResponse.success({
            message:
                ORDER_MESSAGES.DELETED,
        });
    }

    async findEligibleFloristsForOrder(
        orderId: number,
    ) {
        return this.distributionService
            .findEligibleFloristsForOrder(
                orderId,
            );
    }

    private async generateOrderNumber(): Promise<string> {
        const year = new Date()
            .getFullYear();

        let orderNumber: string;

        do {
            const random =
                Math.floor(
                    100000 +
                    Math.random() * 900000,
                );

            orderNumber =
                `MF-${year}-${random}`;

            const existing =
                await this.prisma.order.findUnique({
                    where: {
                        orderNumber,
                    },
                });

            if (!existing) {
                return orderNumber;
            }
        } while (true);
    }

}