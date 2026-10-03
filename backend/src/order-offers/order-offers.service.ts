import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ApiResponse } from '@/common/responses/api-response';

import { OrderOfferMapper } from './mappers/order-offer.mapper';
import {
    DeliveryTimeSlot,
    OrderOfferStatus,
    OrderStatus,
    Prisma,
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


    async create(dto: CreateOrderOfferDto) {
        const order = await this.validateOrder(dto.orderId);

        this.validateOfferPrice(dto.price, Number(order.total),);
        const florist = await this.validateFlorist(dto.floristId);

        await this.validateNoActiveOffer(
            dto.orderId,
            dto.floristId,
        );

        const distanceKm = this.calculateDistance(
            Number(order.deliveryLatitude),
            Number(order.deliveryLongitude),
            Number(florist.address.latitude),
            Number(florist.address.longitude),
        );

        const expiresAt = this.calculateOfferExpiration(
            order.deliveryDate,
            order.deliveryTimeSlot,
        );

        const offer = await this.prisma.orderOffer.create({
            data: {
                orderId: dto.orderId,
                floristId: dto.floristId,
                price: dto.price,
                distanceKm: Number(distanceKm.toFixed(2)),
                status: OrderOfferStatus.PENDING,
                expiresAt,
            },
        });

        return ApiResponse.success(
            this.mapper.toCreatedResponse(offer),
            'Order Offer Created Succesfully'
        );
    }



    async update(
        id: number,
        dto: UpdateOrderOfferDto,
    ) {
        const offer = await this.validateOfferForUpdate(id);

        this.validateOfferPrice(
            dto.price,
            Number(offer.order.total),
        );

        const updatedOffer = await this.prisma.orderOffer.update({
            where: { id },
            data: {
                price: dto.price,
            },
        });

        return ApiResponse.success(
            this.mapper.toUpdatedResponse(updatedOffer),
            'Order Offer Updated Succesfully'
        );
    }



    async findAll(
        user: AuthenticatedUser,
        query: OrderOfferQueryDto,
    ) {

    }

    async findOne(
        user: AuthenticatedUser,
        id: number,
    ) {

        return ApiResponse.success(
            "1"
        );
    }



    async accept(
        user: AuthenticatedUser,
        id: number,
    ) {
        const offer = await this.validateOfferForAccept(user, id);

        const updatedOffer = await this.prisma.$transaction(
            async (tx) => {
                // Aceitar a oferta, desde que ainda esteja disponível.
                await tx.orderOffer.update({
                    where: {
                        id: offer.id
                    },
                    data: {
                        status: OrderOfferStatus.ACCEPTED,
                        acceptedAt: new Date(),
                        updatedAt: new Date()
                    },
                });


                await this.orderStatusService.assignWithTransaction(
                    tx,
                    offer.orderId,
                    offer.floristId,
                    user,
                    'Order assigned through accepted offer.',
                );

                // Cancelar todas as outras ofertas da encomenda.
                await tx.orderOffer.updateMany({
                    where: {
                        orderId: offer.orderId,
                        status: {
                            in: [
                                OrderOfferStatus.VIEWED,
                                OrderOfferStatus.PENDING
                            ]
                        },
                        id: {
                            not: offer.id,
                        },
                    },
                    data: {
                        status: OrderOfferStatus.CANCELLED,
                    },
                });

                // Obter a oferta atualizada.
                return tx.orderOffer.findUniqueOrThrow({
                    where: {
                        id: offer.id,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        );

        return ApiResponse.success(
            this.mapper.toUpdatedResponse(updatedOffer),
            'Order Offer Accepted',
        );
    }




    async decline(
        user: AuthenticatedUser,
        id: number,
        dto: DeclineOrderOfferDto,
    ) {
        const offer = await this.validateOfferForDecline(user, id, dto.reason);


        const updatedOffer = await this.prisma.orderOffer.update({
            where: {
                id: offer.id
            },
            data: {
                status: OrderOfferStatus.DECLINED,
                declinedAt: new Date(),
                declineReason: dto.reason,
            },
        });



        return ApiResponse.success(
            this.mapper.toUpdatedResponse(updatedOffer),
            'Order Offer Declined'
        );
    }



    // =========================================================
    // VALIDATIONS
    // =========================================================
    private async validateOfferForUpdate(id: number) {
        const offer = await this.prisma.orderOffer.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        total: true,
                    },
                },
            },
        });

        if (!offer) {
            Exceptions.notFound('Order offer not found.');
        }

        if (offer.status !== OrderOfferStatus.PENDING) {
            Exceptions.badRequest(
                'Only pending offers can be updated.',
            );
        }

        if (offer.order.status !== OrderStatus.WAITING_FOR_FLORISTS) {
            Exceptions.badRequest(
                'Offers can only be updated for orders waiting for a florist.',
            );
        }

        return offer;
    }


    private async validateOfferForDecline(
        user: AuthenticatedUser,
        id: number,
        reason: string
    ) {

        if (!reason?.trim()) {
            Exceptions.badRequest('Decline reason is required');
        }

        const offer = await this.prisma.orderOffer.findUnique({
            where: { id },
            select: {
                id: true,
                floristId: true,
                status: true,
                expiresAt: true,
            },
        });

        if (!offer) {
            Exceptions.notFound('Order offer not found.');
        }

        if (user.role === UserRole.FLORIST) {
            if (
                user.floristId == null ||
                offer.floristId !== user.floristId
            ) {
                Exceptions.forbidden(
                    'You are not authorized to decline this offer.',
                );
            }
        } else if (user.role !== UserRole.SYSTEM_ADMIN) {
            Exceptions.forbidden(
                'You are not authorized to decline offers.',
            );
        }

        if (offer.status !== OrderOfferStatus.PENDING) {
            Exceptions.badRequest(
                'Only pending offers can be declined.',
            );
        }


        return offer;
    }

    private async validateOfferForAccept(
        user: AuthenticatedUser,
        id: number,
    ) {
        const isFlorist = user.role === UserRole.FLORIST;

        const offer = await this.prisma.orderOffer.findUnique({
            where: { id },
            include: { order: true },
        });

        if (!offer) {
            Exceptions.notFound('Order offer not found');
        }

        if (isFlorist && offer.floristId !== user.floristId) {
            Exceptions.forbidden(
                'You are not authorized to accept this offer',
            );
        }

        if (
            !(
                [
                    OrderOfferStatus.PENDING,
                    OrderOfferStatus.VIEWED,
                ] as OrderOfferStatus[]
            ).includes(offer.status)
        ) {
            Exceptions.badRequest(
                'This offer can no longer be accepted',
            );
        }

        if (offer.order.status !== OrderStatus.WAITING_FOR_FLORISTS) {
            Exceptions.badRequest(
                'This order is no longer available',
            );
        }

        return offer;
    }

    private async validateOrder(orderId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                total: true,
                deliveryDate: true,
                deliveryTimeSlot: true,
                deliveryLatitude: true,
                deliveryLongitude: true,
            },
        });

        if (!order) {
            Exceptions.notFound('Order not found.');
        }

        if (order.status !== OrderStatus.WAITING_FOR_FLORISTS) {
            Exceptions.badRequest(
                'Offers can only be created for orders waiting for a florist.',
            );
        }

        if (
            order.deliveryLatitude == null ||
            order.deliveryLongitude == null
        ) {
            Exceptions.badRequest(
                'The order does not have valid delivery coordinates.',
            );
        }

        return order;
    }

    private validateOfferPrice(
        offerPrice: number,
        orderTotal: number,
    ) {
        if (offerPrice > orderTotal) {
            Exceptions.badRequest(
                'The offer price cannot be greater than the order total.',
            );
        }
    }

    private async validateFlorist(floristId: number) {
        const florist = await this.prisma.florist.findUnique({
            where: { id: floristId },
            include: {
                address: true,
            },
        });

        if (!florist) {
            Exceptions.notFound('Florist not found.');
        }

        if (!florist.active || !florist.acceptingOrders) {
            Exceptions.badRequest(
                'The florist is not currently accepting orders.',
            );
        }

        if (
            florist.address?.latitude == null ||
            florist.address?.longitude == null
        ) {
            Exceptions.badRequest(
                'The florist does not have valid location coordinates.',
            );
        }

        return florist;
    }

    private async validateNoActiveOffer(
        orderId: number,
        floristId: number,
    ) {
        const activeOffer = await this.prisma.orderOffer.findFirst({
            where: {
                orderId,
                floristId,
                status: {
                    in: [
                        OrderOfferStatus.PENDING,
                        OrderOfferStatus.ACCEPTED,
                    ],
                },
            },
            select: {
                id: true,
            },
        });

        if (activeOffer) {
            Exceptions.conflict(
                'An active offer already exists for this order and florist.',
            );
        }
    }

    private calculateOfferExpiration(
        deliveryDate: Date,
        deliveryTimeSlot: DeliveryTimeSlot,
    ): Date {
        const expiresAt = new Date(
            deliveryDate,
        );

        switch (deliveryTimeSlot) {
            case DeliveryTimeSlot.MORNING:
                expiresAt.setHours(
                    13,
                    0,
                    0,
                    0,
                );
                break;

            case DeliveryTimeSlot.AFTERNOON:
                expiresAt.setHours(
                    18,
                    0,
                    0,
                    0,
                );
                break;

            case DeliveryTimeSlot.EVENING:
                expiresAt.setHours(
                    22,
                    0,
                    0,
                    0,
                );
                break;
        }

        return expiresAt;
    }

    private calculateDistance(
        latitude1: number,
        longitude1: number,
        latitude2: number,
        longitude2: number,
    ): number {
        const earthRadiusKm = 6371;

        const latitudeDifference =
            this.toRadians(
                latitude2 - latitude1,
            );

        const longitudeDifference =
            this.toRadians(
                longitude2 - longitude1,
            );

        const a =
            Math.sin(
                latitudeDifference / 2,
            ) ** 2 +
            Math.cos(
                this.toRadians(latitude1),
            ) *
            Math.cos(
                this.toRadians(latitude2),
            ) *
            Math.sin(
                longitudeDifference / 2,
            ) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a),
            );

        return earthRadiusKm * c;
    }

    private toRadians(
        degrees: number,
    ): number {
        return (
            (degrees * Math.PI) / 180
        );
    }
}