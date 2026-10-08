import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { StripeService } from './stripe.service';
import { ApiResponse } from '@/common/responses/api-response';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
    ) { }

    async createCheckoutSession(
        orderId: number,
    ) {
        const order =
            await this.prisma.order.findUnique({
                where: {
                    id: orderId,
                },

                include: {
                    payment: true,
                },
            });

        if (!order) {
            throw new NotFoundException(
                'Order not found.',
            );
        }

        if (order.payment?.status === 'PAID') {
            throw new BadRequestException(
                'This order has already been paid.',
            );
        }

        const amount =
            Number(order.total);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new BadRequestException(
                'Invalid order amount.',
            );
        }

        let payment = order.payment;

        if (!payment) {
            payment =
                await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount,
                        currency: 'EUR',
                        status: 'PENDING',
                    },
                });
        }

        if (payment.status !== 'PENDING') {
            throw new BadRequestException(
                `Payment cannot be processed because its status is ${payment.status}.`,
            );
        }

        const frontendUrl =
            this.configService.get<string>('FRONTEND_URL');

        if (!frontendUrl) {
            throw new BadRequestException(
                'FRONTEND_URL is not configured.',
            );
        }

        const session =
            await this.stripeService.createCheckoutSession(
                {
                    mode: 'payment',

                    line_items: [
                        {
                            price_data: {
                                currency: 'eur',

                                product_data: {
                                    name: `Order ${order.orderNumber}`,
                                },

                                unit_amount:
                                    Math.round(
                                        amount * 100,
                                    ),
                            },

                            quantity: 1,
                        },
                    ],

                    success_url:
                        `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

                    cancel_url:
                        `${frontendUrl}/checkout/cancel`,

                    metadata: {
                        orderId:
                            order.id.toString(),

                        paymentId:
                            payment.id.toString(),
                    },
                },
            );

        await this.prisma.payment.update({
            where: {
                id: payment.id,
            },

            data: {
                stripeSessionId:
                    session.id,
            },
        });

        return ApiResponse.success(
            {
                checkoutUrl:
                    session.url,
            },
            'Payment Session Created',
        );

    }


    async createPaymentIntent(orderId: number) {
        const order =
            await this.prisma.order.findUnique({
                where: {
                    id: orderId,
                },
                include: {
                    payment: true,
                },
            });

        if (!order) {
            throw new NotFoundException(
                'Order not found.',
            );
        }

        /*
         * The order has already been paid.
         * No new payment attempt is allowed.
         */
        if (order.payment?.status === 'PAID') {
            throw new BadRequestException(
                'This order has already been paid.',
            );
        }

        const amount = Number(order.total);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new BadRequestException(
                'Invalid order amount.',
            );
        }

        let payment = order.payment;

        /*
         * Create the payment if this is the first
         * payment attempt for the order.
         */
        if (!payment) {
            payment =
                await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount,
                        currency: 'EUR',
                        status: 'PENDING',
                    },
                });
        }

        /*
         * If the previous payment attempt failed
         * or was cancelled, reuse the same Payment
         * record but create a new Stripe PaymentIntent.
         */
        if (
            payment.status === 'FAILED' ||
            payment.status === 'CANCELLED'
        ) {
            payment =
                await this.prisma.payment.update({
                    where: {
                        id: payment.id,
                    },
                    data: {
                        status: 'PENDING',
                        stripePaymentIntentId: null,
                        paidAt: null,
                    },
                });
        }

        /*
         * Only PENDING payments can be processed.
         */
        if (payment.status !== 'PENDING') {
            throw new BadRequestException(
                `Payment cannot be processed because its status is ${payment.status}.`,
            );
        }

        /*
         * Create a new Stripe PaymentIntent.
         *
         * This happens every time a new payment
         * attempt is made.
         */
        const paymentIntent =
            await this.stripeService.createPaymentIntent(
                amount,
                {
                    orderId: order.id.toString(),
                    paymentId: payment.id.toString(),
                },
            );

        /*
         * Store the current Stripe PaymentIntent.
         */
        await this.prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                stripePaymentIntentId:
                    paymentIntent.id,
            },
        });

        return {
            clientSecret:
                paymentIntent.client_secret,
        };
    }




    async handleWebhook(
        payload: Buffer,
        signature: string,
    ) {
        const event =
            this.stripeService.constructWebhookEvent(
                payload,
                signature,
            );

        switch (event.type) {
            case 'checkout.session.completed': {
                const session =
                    event.data.object;

                const paymentId =
                    Number(
                        session.metadata?.paymentId,
                    );

                const orderId =
                    Number(
                        session.metadata?.orderId,
                    );

                if (!paymentId || !orderId) {
                    throw new BadRequestException(
                        'Stripe checkout session is missing order metadata.',
                    );
                }

                const payment =
                    await this.prisma.payment.findUnique({
                        where: {
                            id: paymentId,
                        },
                    });

                if (!payment) {
                    throw new NotFoundException(
                        'Payment not found.',
                    );
                }

                // Stripe can send the same webhook more than once.
                if (payment.status === 'PAID') {
                    return {
                        received: true,
                    };
                }

                await this.prisma.$transaction([
                    this.prisma.payment.update({
                        where: {
                            id: payment.id,
                        },

                        data: {
                            status: 'PAID',

                            stripePaymentIntentId:
                                typeof session.payment_intent === 'string'
                                    ? session.payment_intent
                                    : null,

                            paidAt: new Date(),
                        },
                    }),

                    this.prisma.order.update({
                        where: {
                            id: orderId,
                        },

                        data: {
                            status:
                                'WAITING_FOR_FLORISTS',
                        },
                    }),
                ]);

                break;
            }

            case 'checkout.session.expired': {
                const session =
                    event.data.object;

                const paymentId =
                    Number(
                        session.metadata?.paymentId,
                    );

                if (paymentId) {
                    await this.prisma.payment.updateMany(
                        {
                            where: {
                                id: paymentId,
                                status: 'PENDING',
                            },

                            data: {
                                status: 'CANCELLED',
                            },
                        },
                    );
                }

                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent =
                    event.data.object;

                const paymentId =
                    Number(
                        paymentIntent.metadata?.paymentId,
                    );

                const orderId =
                    Number(
                        paymentIntent.metadata?.orderId,
                    );

                if (!paymentId || !orderId) {
                    throw new BadRequestException(
                        'Stripe PaymentIntent is missing order metadata.',
                    );
                }

                const payment =
                    await this.prisma.payment.findUnique({
                        where: {
                            id: paymentId,
                        },
                    });

                if (!payment) {
                    throw new NotFoundException(
                        'Payment not found.',
                    );
                }

                // Stripe can send the same webhook more than once.
                if (payment.status === 'PAID') {
                    return {
                        received: true,
                    };
                }

                await this.prisma.$transaction([
                    this.prisma.payment.update({
                        where: {
                            id: payment.id,
                        },

                        data: {
                            status: 'PAID',

                            stripePaymentIntentId:
                                paymentIntent.id,

                            paidAt: new Date(),
                        },
                    }),

                    this.prisma.order.update({
                        where: {
                            id: orderId,
                        },

                        data: {
                            status:
                                'WAITING_FOR_FLORISTS',
                        },
                    }),
                ]);

                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent =
                    event.data.object;

                const paymentId =
                    Number(
                        paymentIntent.metadata?.paymentId,
                    );

                if (!paymentId) {
                    throw new BadRequestException(
                        'Stripe PaymentIntent is missing payment metadata.',
                    );
                }

                await this.prisma.payment.updateMany({
                    where: {
                        id: paymentId,
                        status: 'PENDING',
                    },

                    data: {
                        status: 'FAILED',
                    },
                });

                break;
            }

            default:
                break;
        }

        return {
            received: true,
        };
    }
}