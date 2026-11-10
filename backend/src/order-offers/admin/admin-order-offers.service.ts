import { Injectable } from '@nestjs/common';

import { AdminCreateOrderOfferDto } from './dtos/admin-create-order-offer.dto';
import { AdminUpdateOrderOfferDto } from './dtos/admin-update-order-offer.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { OrderOfferStatus, OrderOfferCancellationReason, OrderStatus, Prisma } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { AdminOrderOffersMapper } from './mappers/admin-order-offers.mapper';
import { AdminOrderOfferQueryDto } from './dtos/admin-order-offer-query.dto';
import { AdminOrderOfferResponseDto } from './dtos/admin-order-offer-response.dto';
import { AdminDeclineOrderOfferDto } from './dtos/admin-decline-order-offer.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderOfferCreatedEvent } from '@/events/order-offers/order-offer-created.event';
import { FloristCompensationLifecycleService } from '@/florist-compensations/florist-compensation-lifecycle.service';
import { GeocodingService } from '@/geocoding/geocoding.service';


@Injectable()
export class AdminOrderOffersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminOrderOffersMapper,
        private readonly eventEmitter: EventEmitter2,
        private readonly compensationLifecycle: FloristCompensationLifecycleService,
        private readonly geocoding: GeocodingService,
    ) { }



    async findAll(query: AdminOrderOfferQueryDto) {
        await this.expireOpenOffers();
        const { page, pageSize, status, orderId, floristId, sort, order } = query;

        const where: Prisma.OrderOfferWhereInput = {
            ...(status !== undefined && { status }),
            ...(orderId !== undefined && { orderId }),
            ...(floristId !== undefined && { floristId }),
        };

        const [orderOffers, total] = await Promise.all([
            this.prisma.orderOffer.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                        },
                    },
                    florist: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            this.prisma.orderOffer.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(orderOffers),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(id: number): Promise<AdminOrderOfferResponseDto> {
        await this.expireOpenOffers(id);
        const orderOffer = await this.prisma.orderOffer.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true
                    }
                },
                florist: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!orderOffer) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(orderOffer),
        );
    }

    async create(
        dto: AdminCreateOrderOfferDto,
    ): Promise<EntityIdResponseDto> {
        const [order, florist] = await Promise.all([
            this.prisma.order.findUnique({
                where: { id: dto.orderId },
                select: {
                    id: true,
                    status: true,
                    total: true,
                    expectedFloristTotal: true,
                    deliveryStreet: true,
                    deliveryStreetNumber: true,
                    deliveryStreet2: true,
                    deliveryPostalCode: true,
                    deliveryCity: true,
                    deliveryDistrict: true,
                    deliveryCountryCode: true,
                    deliveryLatitude: true,
                    deliveryLongitude: true,
                },
            }),
            this.prisma.florist.findUnique({
                where: { id: dto.floristId },
                select: {
                    id: true,
                    addressStreet: true,
                    addressStreetNumber: true,
                    addressStreet2: true,
                    addressPostalCode: true,
                    addressCity: true,
                    addressDistrict: true,
                    addressCountryCode: true,
                    addressLatitude: true,
                    addressLongitude: true,
                },
            }),
        ]);

        if (!order)
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);

        if (!florist)
            Exceptions.notFound(ERROR_MESSAGES.FLORIST_NOT_FOUND);

        if (order.status !== OrderStatus.WAITING_FOR_FLORISTS)
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_NOT_WAITING_FOR_FLORIST);

        const orderTotal = Number(order.expectedFloristTotal);

        if (dto.price > orderTotal)
            Exceptions.badRequest({ code: 'ORDER_OFFER_PRICE_EXCEEDS_COMPENSATION', message: 'O valor da proposta excede a compensação prevista da florista após descontos.' });

        const existingOffer = await this.prisma.orderOffer.findFirst({
            where: {
                orderId: dto.orderId,
                floristId: dto.floristId,
                status: {
                    in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED]
                },
            },
            select: {
                id: true,
            },
        });

        if (existingOffer) {
            Exceptions.conflict(
                ERROR_MESSAGES.ORDER_OFFER_ALREADY_EXISTS,
            );
        }

        const deliveryCoordinates = order.deliveryLatitude !== null && order.deliveryLongitude !== null
            ? {
                latitude: Number(order.deliveryLatitude),
                longitude: Number(order.deliveryLongitude),
            }
            : await this.geocoding.coordinates({
                street: order.deliveryStreet,
                streetNumber: order.deliveryStreetNumber,
                street2: order.deliveryStreet2,
                postalCode: order.deliveryPostalCode,
                city: order.deliveryCity,
                district: order.deliveryDistrict,
                countryCode: order.deliveryCountryCode,
            });
        const floristCoordinates = florist.addressLatitude !== null && florist.addressLongitude !== null
            ? {
                latitude: Number(florist.addressLatitude),
                longitude: Number(florist.addressLongitude),
            }
            : await this.geocoding.coordinates({
                street: florist.addressStreet,
                streetNumber: florist.addressStreetNumber,
                street2: florist.addressStreet2,
                postalCode: florist.addressPostalCode,
                city: florist.addressCity,
                district: florist.addressDistrict,
                countryCode: florist.addressCountryCode,
            });
        const distanceKm = this.geocoding.distanceKm(
            floristCoordinates,
            deliveryCoordinates,
        );

        await Promise.all([
            order.deliveryLatitude === null || order.deliveryLongitude === null
                ? this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        deliveryLatitude: deliveryCoordinates.latitude,
                        deliveryLongitude: deliveryCoordinates.longitude,
                    },
                })
                : Promise.resolve(),
            florist.addressLatitude === null || florist.addressLongitude === null
                ? this.prisma.florist.update({
                    where: { id: florist.id },
                    data: {
                        addressLatitude: floristCoordinates.latitude,
                        addressLongitude: floristCoordinates.longitude,
                    },
                })
                : Promise.resolve(),
        ]);

        try {
            const orderOffer = await this.prisma.orderOffer.create({
                data: {
                    orderId: dto.orderId,
                    floristId: dto.floristId,
                    price: dto.price,
                    expiresAt: dto.expiresAt,
                    distanceKm,
                },
            });

            this.eventEmitter.emit(
                'order-offer.created',
                new OrderOfferCreatedEvent(orderOffer.id),
            );

            return ApiResponse.success(
                this.mapper.toCreatedResponse(orderOffer),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(
                            ERROR_MESSAGES.ORDER_OFFER_ALREADY_EXISTS,
                        );

                    case 'P2003':
                        Exceptions.badRequest(
                            ERROR_MESSAGES.INVALID_ORDER_OFFER_REFERENCE,
                        );
                }
            }

            throw error;
        }
    }




    async update(
        id: number,
        dto: AdminUpdateOrderOfferDto,
    ): Promise<void> {
        await this.expireOpenOffers(id);
        const orderOffer = await this.prisma.orderOffer.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                order: {
                    select: {
                        total: true,
                    },
                },
            },
        });

        if (!orderOffer)
            Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND,);

        if (orderOffer.status !== OrderOfferStatus.PENDING && orderOffer.status !== OrderOfferStatus.VIEWED)
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);

        const orderTotal = Number(orderOffer.order.total);

        if (dto.price > orderTotal)
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_PRICE_EXCEEDS_ORDER);

        try {
            await this.prisma.orderOffer.update({
                where: { id },
                data: {
                    price: dto.price,
                    ...(dto.expiresAt !== undefined && {
                        expiresAt: dto.expiresAt,
                    }),
                },
            });

        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2025') {
                    Exceptions.notFound(
                        ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND,
                    );
                }
            }

            throw error;
        }
    }

    async accept(id: number): Promise<void> {
        const now = new Date();
        await this.expireOpenOffers(id, now);

        await this.prisma.$transaction(async (tx) => {
            const offer = await tx.orderOffer.findUnique({
                where: { id },
                select: {
                    id: true,
                    orderId: true,
                    floristId: true,
                    price: true,
                    status: true,
                    expiresAt: true,
                    order: {
                        select: {
                            status: true,
                        },
                    },
                },
            });

            if (!offer)
                Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);

            if (offer.status !== OrderOfferStatus.PENDING && offer.status !== OrderOfferStatus.VIEWED)
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);

            if (offer.expiresAt <= now)
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);

            if (offer.order.status !== OrderStatus.WAITING_FOR_FLORISTS)
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_ALREADY_ASSIGNED);

            // Garantir que esta proposta continua elegível para aceitação.
            const accepted = await tx.orderOffer.updateMany({
                where: {
                    id: offer.id,
                    status: {
                        in: [
                            OrderOfferStatus.PENDING,
                            OrderOfferStatus.VIEWED,
                        ],
                    },
                },
                data: {
                    status: OrderOfferStatus.ACCEPTED,
                    acceptedAt: now,
                },
            });

            if (accepted.count !== 1)
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);

            // Cancelar todas as restantes propostas ainda em aberto.
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
                    status: OrderOfferStatus.CANCELLED,
                    cancelledAt: now,
                    cancellationReason: OrderOfferCancellationReason.ANOTHER_OFFER_ACCEPTED
                },
            });

            // Atribuir a encomenda à florista que teve a proposta aceite.
            const updatedOrder = await tx.order.updateMany({
                where: {
                    id: offer.orderId,
                    status: OrderStatus.WAITING_FOR_FLORISTS,
                },
                data: {
                    status: OrderStatus.ASSIGNED,
                    assignedFloristId: offer.floristId,
                    assignedAt: now,
                },
            });

            if (updatedOrder.count !== 1) {
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_ALREADY_ASSIGNED);
            }

            await this.compensationLifecycle.createForAcceptedOffer(tx, offer);
        });
    }

    async decline(
        id: number,
        dto: AdminDeclineOrderOfferDto
    ): Promise<void> {
        await this.expireOpenOffers(id);
        const orderOffer = await this.prisma.orderOffer.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
            },
        });

        if (!orderOffer)
            Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);

        if (orderOffer.status !== OrderOfferStatus.PENDING && orderOffer.status !== OrderOfferStatus.VIEWED)
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);

        try {
            await this.prisma.orderOffer.update({
                where: { id },
                data: {
                    status: OrderOfferStatus.DECLINED,
                    declinedAt: new Date(),
                    declineReason: dto.declineReason,
                    declineReasonDetails: dto.declineReasonDetails,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2025"
            ) {
                Exceptions.notFound(
                    ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND,
                );
            }

            throw error;
        }
    }

    private async expireOpenOffers(
        id?: number,
        now: Date = new Date(),
    ): Promise<void> {
        await this.prisma.orderOffer.updateMany({
            where: {
                ...(id !== undefined && { id }),
                status: {
                    in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED],
                },
                expiresAt: { lte: now },
            },
            data: { status: OrderOfferStatus.EXPIRED },
        });
    }

}
