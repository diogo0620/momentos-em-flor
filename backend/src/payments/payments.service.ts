import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { MoloniDocumentStatus, OrderStatus, PaymentRefundStatus, PaymentStatus } from '@prisma/client';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { MoloniFiscalLifecycleService } from '@/moloni/fiscal/moloni-fiscal-lifecycle.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderPaidEvent } from '@/events/orders/order-paid.event';
import type Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
        private readonly moloniFiscalLifecycle: MoloniFiscalLifecycleService,
        private readonly eventEmitter: EventEmitter2,
    ) { }


    async createPaymentIntent(
        user: AuthenticatedUser,
        orderNumber: string,
    ) {
        const order =
            await this.prisma.order.findUnique({
                where: {
                    orderNumber,
                    customerId: user.id,
                },
                include: {
                    payment: true,
                },
            });

        if (!order)
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);

        if (order.status !== OrderStatus.PENDING_PAYMENT)
            Exceptions.badRequest(ERROR_MESSAGES.PAYMENT_IS_NOT_PENDING);

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
            payment = await this.prisma.payment.upsert({
                where: { orderId: order.id },
                create: {
                    orderId: order.id,
                    amount,
                    currency: 'EUR',
                    status: PaymentStatus.PENDING
                },
                update: {},
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

        if (payment.stripePaymentIntentId) {
            const existingIntent =
                await this.stripeService.retrievePaymentIntent(
                    payment.stripePaymentIntentId,
                );

            if (existingIntent.status === 'canceled') {
                await this.prisma.payment.updateMany({
                    where: {
                        id: payment.id,
                        status: PaymentStatus.PENDING,
                        stripePaymentIntentId: existingIntent.id,
                    },
                    data: {
                        status: PaymentStatus.CANCELLED,
                    },
                });

                return this.createPaymentIntent(user, orderNumber);
            }

            if (existingIntent.status === 'succeeded') {
                await this.completeSucceededPayment(existingIntent);

                return {
                    status: 'PAID' as const,
                    clientSecret: null,
                };
            }

            if (
                existingIntent.status === 'processing' ||
                existingIntent.status === 'requires_capture'
            ) {
                return {
                    status: 'PROCESSING' as const,
                    clientSecret: null,
                };
            }

            if (
                existingIntent.client_secret &&
                [
                    'requires_payment_method',
                    'requires_confirmation',
                    'requires_action',
                ].includes(existingIntent.status)
            ) {
                return {
                    status: 'REQUIRES_PAYMENT' as const,
                    clientSecret: existingIntent.client_secret,
                };
            }
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
                `payment-${payment.id}-${payment.updatedAt.getTime()}`,
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
            status: 'REQUIRES_PAYMENT' as const,
            clientSecret:
                paymentIntent.client_secret,
        };
    }

    async refundOrder(
        user: AuthenticatedUser,
        orderId: number,
        reason: string,
    ) {
        const payment = await this.prisma.payment.findUnique({
            where: { orderId },
            include: {
                refund: true,
                order: { select: { status: true } },
            },
        });

        if (!payment || !payment.stripePaymentIntentId) {
            throw new NotFoundException('Pagamento Stripe não encontrado.');
        }

        if (payment.status === PaymentStatus.REFUNDED) {
            return { status: PaymentRefundStatus.SUCCEEDED };
        }

        if (payment.status !== PaymentStatus.PAID) {
            throw new BadRequestException('Apenas pagamentos concluídos podem ser reembolsados.');
        }

        if (
            payment.order.status === OrderStatus.DELIVERED ||
            payment.order.status === OrderStatus.CANCELLED
        ) {
            throw new BadRequestException(
                'Esta encomenda já não pode ser reembolsada através deste fluxo administrativo.',
            );
        }

        if (payment.refund?.status === PaymentRefundStatus.PENDING) {
            throw new ConflictException('Este reembolso já está a ser processado.');
        }

        const refundRecord = payment.refund
            ? await this.prisma.paymentRefund.update({
                where: { id: payment.refund.id },
                data: {
                    status: PaymentRefundStatus.PENDING,
                    reason: reason.trim(),
                    requestedByUserId: user.id,
                    requestedAt: new Date(),
                    failureReason: null,
                    completedAt: null,
                },
            })
            : await this.prisma.paymentRefund.create({
                data: {
                    paymentId: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    reason: reason.trim(),
                    requestedByUserId: user.id,
                },
            });

        try {
            const stripeRefund = await this.stripeService.createFullRefund(
                payment.stripePaymentIntentId,
                {
                    paymentId: String(payment.id),
                    orderId: String(orderId),
                    refundRecordId: String(refundRecord.id),
                },
                `payment-refund-${payment.id}`,
            );

            const status = this.mapStripeRefundStatus(stripeRefund.status);

            await this.prisma.$transaction(async (tx) => {
                await tx.paymentRefund.update({
                    where: { id: refundRecord.id },
                    data: {
                        stripeRefundId: stripeRefund.id,
                        status,
                        completedAt:
                            status === PaymentRefundStatus.SUCCEEDED
                                ? new Date()
                                : null,
                    },
                });

                if (status === PaymentRefundStatus.SUCCEEDED) {
                    await tx.payment.updateMany({
                        where: { id: payment.id, status: PaymentStatus.PAID },
                        data: { status: PaymentStatus.REFUNDED },
                    });
                    await tx.moloniFiscalDocument.updateMany({
                        where: {
                            orderId: payment.orderId,
                            invoiceStatus: MoloniDocumentStatus.ISSUED,
                            creditNoteId: null,
                        },
                        data: {
                            creditNoteRequiredAt: new Date(),
                            creditNoteStatus: MoloniDocumentStatus.QUEUED,
                        },
                    });
                }
            });

            if (
                status === PaymentRefundStatus.FAILED ||
                status === PaymentRefundStatus.CANCELLED
            ) {
                throw new BadRequestException(
                    'A Stripe não conseguiu concluir o reembolso.',
                );
            }

            return { status };
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Não foi possível processar o reembolso Stripe.';

            await this.prisma.paymentRefund.update({
                where: { id: refundRecord.id },
                data: {
                    status: PaymentRefundStatus.FAILED,
                    failureReason: message.slice(0, 1000),
                },
            });

            throw error;
        }
    }

    private async completeSucceededPayment(
        paymentIntent: Stripe.PaymentIntent,
    ): Promise<void> {
        const paymentId = Number(paymentIntent.metadata?.paymentId);
        const orderId = Number(paymentIntent.metadata?.orderId);

        if (!paymentId || !orderId) {
            throw new BadRequestException(
                'Stripe PaymentIntent is missing order metadata.',
            );
        }

        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found.');
        }

        if (
            payment.orderId !== orderId ||
            payment.stripePaymentIntentId !== paymentIntent.id ||
            paymentIntent.amount !== Math.round(Number(payment.amount) * 100) ||
            paymentIntent.currency.toLowerCase() !== payment.currency.toLowerCase()
        ) {
            throw new BadRequestException(
                'Stripe PaymentIntent does not match the pending payment.',
            );
        }

        // Stripe pode entregar o mesmo evento mais do que uma vez e o cliente
        // também pode regressar à página antes de o webhook ser processado.
        if (payment.status === PaymentStatus.PAID) {
            await this.prisma.moloniFiscalDocument.upsert({
                where: { orderId },
                create: { orderId },
                update: {},
            });

            this.eventEmitter.emit('order.paid', new OrderPaidEvent(orderId));
            return;
        }

        const paidAt = new Date();
        const completed = await this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.updateMany({
                where: {
                    id: payment.id,
                    status: {
                        in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
                    },
                    stripePaymentIntentId: paymentIntent.id,
                },
                data: {
                    status: PaymentStatus.PAID,
                    paidAt,
                },
            });

            if (updatedPayment.count !== 1) return false;

            const updatedOrder = await tx.order.updateMany({
                where: {
                    id: orderId,
                    status: OrderStatus.PENDING_PAYMENT,
                },
                data: {
                    status: OrderStatus.WAITING_FOR_FLORISTS,
                    paidAt,
                },
            });

            if (updatedOrder.count !== 1) {
                throw new BadRequestException(
                    'Order is not awaiting payment.',
                );
            }

            await this.moloniFiscalLifecycle.queuePaidOrder(tx, orderId);
            return true;
        });

        if (completed) {
            this.eventEmitter.emit('order.paid', new OrderPaidEvent(orderId));
        }
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
                await this.completeSucceededPayment(event.data.object);

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
                        stripePaymentIntentId: paymentIntent.id,
                    },

                    data: {
                        status: 'FAILED',
                    },
                });

                break;
            }

            case 'refund.created':
            case 'refund.updated':
            case 'refund.failed': {
                const stripeRefund = event.data.object;
                const paymentId = Number(stripeRefund.metadata?.paymentId);
                const orderId = Number(stripeRefund.metadata?.orderId);

                const refundPaymentIntentId = typeof stripeRefund.payment_intent === 'string'
                    ? stripeRefund.payment_intent
                    : stripeRefund.payment_intent?.id;

                if (!refundPaymentIntentId) break;

                const paymentByMetadata = paymentId
                    ? await this.prisma.payment.findUnique({
                        where: { id: paymentId },
                        include: { refund: true },
                    })
                    : null;
                const payment = paymentByMetadata ??
                    await this.prisma.payment.findUnique({
                        where: { stripePaymentIntentId: refundPaymentIntentId },
                        include: { refund: true },
                    });

                if (!payment) break;

                if (
                    (orderId && payment.orderId !== orderId) ||
                    payment.stripePaymentIntentId !== refundPaymentIntentId
                ) {
                    throw new BadRequestException(
                        'Stripe refund does not match the stored payment.',
                    );
                }

                const isInternalRefund = Boolean(paymentId && orderId);
                const isFullExternalRefund =
                    stripeRefund.amount === Math.round(Number(payment.amount) * 100);
                const isUnsupportedPartialRefund =
                    !isInternalRefund && !isFullExternalRefund;
                const status = isUnsupportedPartialRefund
                    ? PaymentRefundStatus.FAILED
                    : this.mapStripeRefundStatus(stripeRefund.status);
                const failureReason = 'failure_reason' in stripeRefund
                    ? stripeRefund.failure_reason
                    : null;

                const refundRecord = payment.refund ??
                    await this.prisma.paymentRefund.create({
                        data: {
                            paymentId: payment.id,
                            stripeRefundId: stripeRefund.id,
                            status: PaymentRefundStatus.PENDING,
                            amount: payment.amount,
                            currency: payment.currency,
                            reason: 'Reembolso iniciado externamente na Stripe.',
                            requestedByUserId: 0,
                        },
                    });

                await this.prisma.$transaction(async (tx) => {
                    await tx.paymentRefund.update({
                        where: { id: refundRecord.id },
                        data: {
                            stripeRefundId: stripeRefund.id,
                            status,
                            failureReason: isUnsupportedPartialRefund
                                ? 'Foi detetado um reembolso parcial externo. Conclui o valor restante através da aplicação.'
                                : failureReason || null,
                            completedAt:
                                status === PaymentRefundStatus.SUCCEEDED
                                    ? new Date()
                                    : null,
                        },
                    });

                    if (status === PaymentRefundStatus.SUCCEEDED) {
                        await tx.payment.updateMany({
                            where: { id: payment.id, status: PaymentStatus.PAID },
                            data: { status: PaymentStatus.REFUNDED },
                        });
                        await tx.moloniFiscalDocument.updateMany({
                            where: {
                                orderId: payment.orderId,
                                invoiceStatus: MoloniDocumentStatus.ISSUED,
                                creditNoteId: null,
                            },
                            data: {
                                creditNoteRequiredAt: new Date(),
                                creditNoteStatus: MoloniDocumentStatus.QUEUED,
                            },
                        });
                    }
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
                        stripePaymentIntentId: paymentIntent.id,
                    },
                    data: {
                        status: 'CANCELLED',
                    },
                });

                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.mode !== 'subscription') break;
                const floristId = Number(session.metadata?.floristId);
                const planId = Number(session.metadata?.planId);
                const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
                const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
                if (!floristId || !planId || !subscriptionId) break;
                await this.prisma.$transaction(async (tx) => {
                    await tx.floristSubscription.updateMany({ where: { floristId, endedAt: null }, data: { status: 'CANCELLED', endedAt: new Date() } });
                    await tx.floristSubscription.upsert({
                        where: { stripeSubscriptionId: subscriptionId },
                        create: { floristId, planId, status: 'ACTIVE', stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId },
                        update: { planId, status: 'ACTIVE', stripeCustomerId: customerId, endedAt: null },
                    });
                });
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const status = subscription.status === 'active' ? 'ACTIVE'
                    : subscription.status === 'trialing' ? 'TRIALING'
                    : subscription.status === 'past_due' || subscription.status === 'unpaid' ? 'PAST_DUE'
                    : subscription.status === 'canceled' ? 'CANCELLED'
                    : 'INCOMPLETE';
                const item = subscription.items.data[0];
                await this.prisma.floristSubscription.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status,
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        currentPeriodStart: item?.current_period_start ? new Date(item.current_period_start * 1000) : null,
                        currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
                        endedAt: status === 'CANCELLED' ? new Date() : null,
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

    private mapStripeRefundStatus(status: string | null): PaymentRefundStatus {
        switch (status) {
            case 'succeeded':
                return PaymentRefundStatus.SUCCEEDED;
            case 'failed':
                return PaymentRefundStatus.FAILED;
            case 'canceled':
                return PaymentRefundStatus.CANCELLED;
            default:
                return PaymentRefundStatus.PENDING;
        }
    }
}
