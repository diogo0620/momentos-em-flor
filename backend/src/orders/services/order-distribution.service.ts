import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ORDER_MESSAGES } from '../constants/order.messages';
import { DeliveryTimeSlot } from '@prisma/client';

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

        const product =
            await this.prisma.product.findFirst({
                where: {
                    id: productId,
                    active: true,
                    deletedAt: null,
                },
                select: {
                    baseFloristCompensation: true,
                },
            });

        if (!product) {
            Exceptions.notFound(
                ORDER_MESSAGES.PRODUCT_NOT_FOUND,
            );
        }

        return Number(
            product.baseFloristCompensation,
        );
    }

    async createOffer(
        orderId: number,
        floristId: number,
        manualCompensationAmount?: number,
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
                include: {
                    address: true,
                },
            });

        if (!florist) {
            Exceptions.notFound(
                ORDER_MESSAGES.FLORIST_NOT_FOUND,
            );
        }

        const distanceKm =
            this.calculateDistance(
                Number(order.deliveryLatitude),
                Number(order.deliveryLongitude),
                Number(florist.address.latitude),
                Number(florist.address.longitude),
            );

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

        /*
         * Calculate the normal compensation
         * based on the florist compensation rules.
         */
        const calculatedOfferItems =
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
                            orderItemId:
                                orderItem.id,

                            productId:
                                orderItem.productId,

                            productName:
                                orderItem.productName,

                            quantity:
                                orderItem.quantity,

                            unitCompensation:
                                this.roundMoney(
                                    unitCompensation,
                                ),

                            totalCompensation:
                                this.roundMoney(
                                    totalCompensation,
                                ),
                        };
                    },
                ),
            );

        /*
         * Total compensation calculated from
         * the compensation rules.
         */
        const calculatedCompensationAmount =
            this.roundMoney(
                calculatedOfferItems.reduce(
                    (total, item) =>
                        total +
                        item.totalCompensation,
                    0,
                ),
            );

        let compensationAmount =
            calculatedCompensationAmount;

        let offerItems =
            calculatedOfferItems;

        /*
         * Manual compensation.
         *
         * This is used when an admin creates
         * an ad-hoc offer.
         */
        if (
            manualCompensationAmount !==
            undefined
        ) {
            const manualAmount =
                this.roundMoney(
                    manualCompensationAmount,
                );

            /*
             * Compensation must be positive.
             */
            if (manualAmount <= 0) {
                Exceptions.badRequest(
                    ORDER_MESSAGES.COMPENSATION_MUST_BE_POSITIVE,
                );
            }

            /*
             * Florist compensation can never be
             * greater than the order subtotal.
             *
             * We use subtotal because the delivery
             * fee belongs to the platform and is not
             * part of the florist compensation.
             */
            if (
                manualAmount >
                Number(order.subtotal)
            ) {
                Exceptions.badRequest(
                    ORDER_MESSAGES.COMPENSATION_TOO_HIGH,
                );
            }

            /*
             * We need a positive calculated base
             * in order to distribute the manual
             * compensation proportionally.
             */
            if (
                calculatedCompensationAmount <= 0
            ) {
                Exceptions.badRequest(
                    ORDER_MESSAGES.COMPENSATION_INVALID,
                );
            }

            /*
             * Calculate the proportional factor.
             *
             * Example:
             *
             * Normal compensation = €30
             * Manual compensation = €24
             *
             * Factor = 24 / 30 = 0.8
             */
            const factor =
                manualAmount /
                calculatedCompensationAmount;

            /*
             * Distribute the manual compensation
             * proportionally between the items.
             */
            offerItems =
                calculatedOfferItems.map(
                    (item) => {
                        const totalCompensation =
                            this.roundMoney(
                                item.totalCompensation *
                                factor,
                            );

                        const unitCompensation =
                            this.roundMoney(
                                totalCompensation /
                                item.quantity,
                            );

                        return {
                            ...item,
                            unitCompensation,
                            totalCompensation,
                        };
                    },
                );

            /*
             * Fix rounding differences.
             *
             * Example:
             *
             * Target = €35.00
             * Items = €34.99
             *
             * The difference is added to the
             * last item.
             */
            const distributedTotal =
                this.roundMoney(
                    offerItems.reduce(
                        (total, item) =>
                            total +
                            item.totalCompensation,
                        0,
                    ),
                );

            const roundingDifference =
                this.roundMoney(
                    manualAmount -
                    distributedTotal,
                );

            if (
                roundingDifference !== 0 &&
                offerItems.length > 0
            ) {
                const lastIndex =
                    offerItems.length - 1;

                const lastItem =
                    offerItems[lastIndex];

                const correctedTotal =
                    this.roundMoney(
                        lastItem.totalCompensation +
                        roundingDifference,
                    );

                offerItems[lastIndex] = {
                    ...lastItem,

                    totalCompensation:
                        correctedTotal,

                    unitCompensation:
                        this.roundMoney(
                            correctedTotal /
                            lastItem.quantity,
                        ),
                };
            }

            compensationAmount =
                manualAmount;
        }

        /*
         * Final safety check.
         *
         * Make sure the sum of the items is
         * exactly the same as the offer total.
         */
        const finalItemsTotal =
            this.roundMoney(
                offerItems.reduce(
                    (total, item) =>
                        total +
                        item.totalCompensation,
                    0,
                ),
            );

        if (
            finalItemsTotal !==
            compensationAmount
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES.COMPENSATION_INVALID,
            );
        }

        const expiresAt =
            this.calculateOfferExpiration(
                order.deliveryDate,
                order.deliveryTimeSlot,
            );

        const offer =
            await this.prisma.orderOffer.create({
                data: {
                    orderId,
                    floristId,

                    distanceKm,

                    compensationAmount,

                    expiresAt,

                    orderOfferItems: {
                        create: offerItems,
                    },
                },

                include: {
                    order: true,
                    florist: true,
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

    private roundMoney(
        value: number,
    ): number {
        return Math.round(
            (value + Number.EPSILON) * 100,
        ) / 100;
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