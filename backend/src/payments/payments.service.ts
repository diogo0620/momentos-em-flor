import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';

import { ApiResponse } from '@/common/responses/api-response';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
    ) { }


    async createPaymentIntent(orderNumber: string) {
        const order =
            await this.prisma.order.findUnique({
                where: {
                    orderNumber
                },
                include: {
                    payment: true,
                },
            });

        if (!order)
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);

        /*
         * The order has already been paid.
         * No new payment attempt is allowed.
         */
        if (order.payment?.status === PaymentStatus.PAID)
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_ALREADY_PAID)

        const amount = Number(order.total);
        let payment = order.payment;

        /*
         * Create the payment if this is the first
         * payment attempt for the order.
         */
        if (!payment) {
            payment = await this.prisma.payment.create({
                data: {
                    orderId: order.id,
                    amount,
                    currency: 'EUR',
                    status: PaymentStatus.PENDING
                },
            });
        }

        /*
         * If the previous payment attempt failed
         * or was cancelled, reuse the same Payment
         * record but create a new Stripe PaymentIntent.
         */
        if (payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) {
            payment =
                await this.prisma.payment.update({
                    where: {
                        id: payment.id,
                    },
                    data: {
                        status: PaymentStatus.PENDING,
                        stripePaymentIntentId: null,
                        paidAt: null,
                    },
                });
        }

        /*
         * Only PENDING payments can be processed.
         */
        if (payment.status !== PaymentStatus.PENDING) {
            Exceptions.badRequest(ERROR_MESSAGES.PAYMENT_IS_NOT_PENDING)
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

                const paidAt = new Date();

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

                            paidAt
                        },
                    }),

                    this.prisma.order.update({
                        where: {
                            id: orderId,
                        },

                        data: {
                            status: OrderStatus.WAITING_FOR_FLORISTS,
                            paidAt,
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

            case 'payment_intent.canceled': {
                const paymentIntent = event.data.object;

                const paymentId = Number(
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
                        status: 'CANCELLED',
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