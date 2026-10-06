import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { StripeService } from './stripe.service';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
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
                        'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',

                    cancel_url:
                        'http://localhost:3000/checkout/cancel',

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

        return {
            checkoutUrl:
                session.url,
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

            default:
                break;
        }

        return {
            received: true,
        };
    }
}