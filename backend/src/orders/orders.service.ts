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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '@/events/order/order-created.event';
import { OrderCreateResponseDto } from './dto/order-create-response.dto';
import { GeocodingService } from '@/geocoding/geocoding.service';



@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: OrderMapper,
        private readonly eventEmitter: EventEmitter2,
        private readonly geocodingService:
            GeocodingService,
    ) { }

    async findAll(
        user: AuthenticatedUser,
        query: OrderQueryDto,
    ) {
        if (
            user.role !== UserRole.SYSTEM_ADMIN &&
            user.role !== UserRole.CUSTOMER &&
            user.role !== UserRole.FLORIST
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        if (
            user.role === UserRole.FLORIST &&
            !user.floristId
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

            ...(user.role === UserRole.FLORIST && {
                offers: {
                    some: {
                        floristId: user.floristId!,
                    },
                },
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
            this.mapper.toListResponses(orders),
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
    /*
     * Florist must be associated with a
     * florist account.
     */
    if (
        user.role === UserRole.FLORIST &&
        !user.floristId
    ) {
        Exceptions.forbidden(
            ORDER_MESSAGES.FLORIST_REQUIRED,
        );
    }

    const where = {
        id,
        deletedAt: null,

        /*
         * CUSTOMER can only access their own orders.
         */
        ...(user.role === UserRole.CUSTOMER && {
            customerId: user.id,
        }),

        /*
         * FLORIST can only access orders
         * assigned to their florist.
         */
        ...(user.role === UserRole.FLORIST && {
            assignedFloristId:
                user.floristId!,
        }),
    };

    /*
     * Only SYSTEM_ADMIN, CUSTOMER and FLORIST
     * are allowed to access orders.
     */
    if (
        user.role !== UserRole.SYSTEM_ADMIN &&
        user.role !== UserRole.CUSTOMER &&
        user.role !== UserRole.FLORIST
    ) {
        Exceptions.forbidden(
            ORDER_MESSAGES.FORBIDDEN,
        );
    }

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

                statusHistory: {
                    orderBy: {
                        createdAt: 'asc',
                    },

                    include: {
                        changedByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                            },
                        },
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
        this.mapper.toResponse(
            order,
        ),
    );
}


    async create(
        user: AuthenticatedUser | null,
        dto: CreateOrderDto,
    ) {
        let customerId: number | null = null;

        let customerFirstName: string;
        let customerLastName: string | null;
        let customerEmail: string | null;
        let customerPhone: string | null;

        /*
         * Authenticated CUSTOMER
         */
        if (
            user &&
            user.role === UserRole.CUSTOMER
        ) {
            const customer =
                await this.prisma.user.findFirst({
                    where: {
                        id: user.id,
                        role: UserRole.CUSTOMER,
                        deletedAt: null,
                        active: true,
                    },
                });

            if (!customer) {
                Exceptions.notFound(
                    ORDER_MESSAGES.CUSTOMER_NOT_FOUND,
                );
            }

            customerId = customer.id;

            customerFirstName =
                customer.firstName;

            customerLastName =
                customer.lastName;

            customerEmail =
                customer.email;

            customerPhone =
                customer.phone;
        }

        /*
         * Guest / Admin
         */
        else {
            if (
                !dto.customerEmail?.trim() &&
                !dto.customerPhone?.trim()
            ) {
                Exceptions.badRequest(
                    ORDER_MESSAGES
                        .CUSTOMER_CONTACT_REQUIRED,
                );
            }

            if (
                !dto.customerFirstName?.trim()
            ) {
                Exceptions.badRequest(
                    ORDER_MESSAGES
                        .CUSTOMER_FIRST_NAME_REQUIRED,
                );
            }

            customerFirstName =
                dto.customerFirstName.trim();

            customerLastName =
                dto.customerLastName?.trim() ||
                null;

            customerEmail =
                dto.customerEmail?.trim() ||
                null;

            customerPhone =
                dto.customerPhone?.trim() ||
                null;
        }

        /*
         * Validate items
         */
        if (dto.items.length === 0) {
            Exceptions.badRequest(
                ORDER_MESSAGES.EMPTY_ORDER,
            );
        }

        const productIds = dto.items.map(
            (item) => item.productId,
        );

        if (
            new Set(productIds).size !==
            productIds.length
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES.DUPLICATE_PRODUCTS,
            );
        }

        /*
         * Validate products
         */
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

        if (
            products.length !==
            productIds.length
        ) {
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

        /*
         * Build order items
         */
        const items = dto.items.map((item) => {
            const product =
                productsById.get(
                    item.productId,
                )!;

            const unitPrice =
                Number(product.basePrice);

            const lineTotal =
                unitPrice *
                item.quantity;

            return {
                productId:
                    product.id,

                productName:
                    product.name,

                productDescription:
                    product.description,

                quantity:
                    item.quantity,

                unitPrice,

                lineTotal,
            };
        });

        /*
         * Calculate totals
         */
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

        /*
         * Geocode delivery address.
         *
         * Latitude and longitude are generated
         * by the backend and are not provided
         * by the client.
         */
        const coordinates =
            await this.geocodingService
                .geocodeAddress({
                    street:
                        dto.deliveryStreet,

                    street2:
                        dto.deliveryStreet2,

                    postalCode:
                        dto.deliveryPostalCode,

                    city:
                        dto.deliveryCity,

                    district:
                        dto.deliveryDistrict,

                    countryCode:
                        dto.deliveryCountryCode,
                });

        /*
         * Generate order number
         */
        const orderNumber =
            await this.generateOrderNumber();

        /*
         * Create order
         */
        const order =
            await this.prisma.$transaction(
                async (tx) => {
                    return tx.order.create({
                        data: {
                            orderNumber,

                            customerId,

                            customerFirstName,
                            customerLastName,
                            customerEmail,
                            customerPhone,

                            recipientFirstName:
                                dto.recipientFirstName,

                            recipientLastName:
                                dto.recipientLastName,

                            recipientPhone:
                                dto.recipientPhone,

                            occasion:
                                dto.occasion,

                            deliveryDate:
                                new Date(
                                    dto.deliveryDate,
                                ),

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
                                dto.deliveryCountryCode
                                    .toUpperCase(),

                            deliveryLatitude:
                                coordinates.latitude,

                            deliveryLongitude:
                                coordinates.longitude,

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
                    });
                },
            );

        /*
         * Notify listeners.
         *
         * Distribution will be handled
         * asynchronously by OrderCreatedListener.
         */
        this.eventEmitter.emit(
            'order.created',
            new OrderCreatedEvent(
                order.id,
            ),
        );

        /*
         * Return only creation information.
         *
         * No items.
         * No offers.
         */
        return ApiResponse.success(
            this.mapper.toCreateResponse(
                order,
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

        /*
         * Check whether the delivery address
         * is being changed.
         */
        const addressChanged =
            dto.deliveryStreet !== undefined ||
            dto.deliveryStreet2 !== undefined ||
            dto.deliveryPostalCode !== undefined ||
            dto.deliveryCity !== undefined ||
            dto.deliveryDistrict !== undefined ||
            dto.deliveryCountryCode !== undefined;

        /*
         * Geocode the final address only when
         * one of the address fields changes.
         */
        let coordinates:
            | {
                latitude: number;
                longitude: number;
            }
            | undefined;

        if (addressChanged) {
            coordinates =
                await this.geocodingService
                    .geocodeAddress({
                        street:
                            dto.deliveryStreet ??
                            existingOrder.deliveryStreet,

                        street2:
                            dto.deliveryStreet2 ??
                            existingOrder.deliveryStreet2,

                        postalCode:
                            dto.deliveryPostalCode ??
                            existingOrder.deliveryPostalCode,

                        city:
                            dto.deliveryCity ??
                            existingOrder.deliveryCity,

                        district:
                            dto.deliveryDistrict ??
                            existingOrder.deliveryDistrict,

                        countryCode:
                            (
                                dto.deliveryCountryCode ??
                                existingOrder.deliveryCountryCode
                            ).toUpperCase(),
                    });
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
                        occasion:
                            dto.occasion,
                    }),

                    ...(dto.deliveryDate !== undefined && {
                        deliveryDate:
                            new Date(
                                dto.deliveryDate,
                            ),
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

                    /*
                     * Update coordinates only when
                     * the delivery address changed.
                     */
                    ...(coordinates && {
                        deliveryLatitude:
                            coordinates.latitude,

                        deliveryLongitude:
                            coordinates.longitude,
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