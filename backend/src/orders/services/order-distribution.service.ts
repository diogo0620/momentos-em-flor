import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ORDER_MESSAGES } from '../constants/order.messages';

@Injectable()
export class OrderDistributionService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async findEligibleFlorists(
        latitude: number,
        longitude: number,
    ) {
        const florists =
            await this.prisma.florist.findMany({
                where: {
                    active: true,
                    acceptingOrders: true,
                    deletedAt: null,
                    address: {
                        deletedAt: null,
                    },
                },
                include: {
                    address: true,
                },
            });

        return florists
            .map((florist) => {
                const distanceKm =
                    this.calculateDistance(
                        latitude,
                        longitude,
                        Number(florist.address.latitude),
                        Number(florist.address.longitude),
                    );

                return {
                    florist,
                    distanceKm,
                };
            })
            .filter(
                ({ florist, distanceKm }) =>
                    distanceKm <=
                    Number(florist.deliveryRadiusKm),
            )
            .sort(
                (a, b) =>
                    a.distanceKm -
                    b.distanceKm,
            );
    }

    async findEligibleFloristsForOrder(
        orderId: number,
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    deliveryLatitude: true,
                    deliveryLongitude: true,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        return this.findEligibleFlorists(
            Number(order.deliveryLatitude),
            Number(order.deliveryLongitude),
        );
    }

    private async resolveCompensation(
        productId: number,
        floristId: number,
    ) {
        const specificRule =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    productId,
                    floristId,
                    active: true,
                    deletedAt: null,
                },
            });

        if (specificRule) {
            return Number(
                specificRule.compensationAmount,
            );
        }

        const globalRule =
            await this.prisma.floristCompensationRule.findFirst({
                where: {
                    productId,
                    floristId: null,
                    active: true,
                    deletedAt: null,
                },
            });

        if (globalRule) {
            return Number(
                globalRule.compensationAmount,
            );
        }

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id: productId,
                    active: true,
                    deletedAt: null,
                },
                select: {
                    basePrice: true,
                },
            });

        if (!product) {
            Exceptions.notFound(
                ORDER_MESSAGES.PRODUCT_NOT_FOUND,
            );
        }

        return Number(product.basePrice);
    }

    async createOffer(
        orderId: number,
        floristId: number,
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },
                include: {
                    items: true,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        const florist =
            await this.prisma.florist.findFirst({
                where: {
                    id: floristId,
                    active: true,
                    acceptingOrders: true,
                    deletedAt: null,
                },
            });

        if (!florist) {
            Exceptions.notFound(
                ORDER_MESSAGES.FLORIST_NOT_FOUND,
            );
        }

        const existingOffer =
            await this.prisma.orderOffer.findUnique({
                where: {
                    orderId_floristId: {
                        orderId,
                        floristId,
                    },
                },
            });

        if (existingOffer) {
            Exceptions.conflict(
                ORDER_MESSAGES.OFFER_ALREADY_EXISTS,
            );
        }

        const offerItems =
            await Promise.all(
                order.items.map(
                    async (orderItem) => {
                        const unitCompensation =
                            await this.resolveCompensation(
                                orderItem.productId,
                                floristId,
                            );

                        const totalCompensation =
                            unitCompensation *
                            orderItem.quantity;

                        return {
                            orderItemId: orderItem.id,
                            productId:
                                orderItem.productId,
                            productName:
                                orderItem.productName,
                            quantity:
                                orderItem.quantity,
                            unitCompensation,
                            totalCompensation,
                        };
                    },
                ),
            );

        const compensationAmount =
            offerItems.reduce(
                (total, item) =>
                    total +
                    item.totalCompensation,
                0,
            );

        const expiresAt =
            new Date(
                Date.now() +
                30 * 60 * 1000,
            );

        const offer =
            await this.prisma.orderOffer.create({
                data: {
                    orderId,
                    floristId,
                    compensationAmount,
                    expiresAt,

                    orderOfferItems: {
                        create: offerItems,
                    },
                },
                include: {
                    orderOfferItems: true,
                },
            });

        return offer;
    }

    async distributeOrder(
        orderId: number,
    ) {
        const eligibleFlorists =
            await this.findEligibleFloristsForOrder(
                orderId,
            );

        const offers: Awaited<
            ReturnType<typeof this.createOffer>
        >[] = [];

        for (const {
            florist,
        } of eligibleFlorists) {
            const offer =
                await this.createOffer(
                    orderId,
                    florist.id,
                );

            offers.push(offer);
        }

        return offers;
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