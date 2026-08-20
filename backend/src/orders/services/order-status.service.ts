import { Injectable } from '@nestjs/common';

import {
    OrderCancellationReason,
    OrderStatus,
    Prisma,
    UserRole,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';

import { ORDER_MESSAGES } from '../constants/order.messages';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

@Injectable()
export class OrderStatusService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async assign(
        orderId: number,
        floristId: number,
        user: AuthenticatedUser,
        reason?: string,
    ) {
        return this.prisma.$transaction(
            async (tx) => {
                return this.assignWithTransaction(
                    tx,
                    orderId,
                    floristId,
                    user,
                    reason,
                );
            },
        );
    }

    async assignWithTransaction(
        tx: Prisma.TransactionClient,
        orderId: number,
        floristId: number,
        user: AuthenticatedUser,
        reason?: string,
    ) {
        /*
         * Only SYSTEM_ADMIN and FLORIST can
         * perform an assignment.
         */
        if (
            user.role !== UserRole.SYSTEM_ADMIN &&
            user.role !== UserRole.FLORIST
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .STATUS_CHANGE_NOT_ALLOWED,
            );
        }

        /*
         * A florist can only assign an order
         * to itself.
         *
         * This is important because this method
         * is also used when a florist accepts
         * an offer.
         */
        if (
            user.role === UserRole.FLORIST &&
            user.floristId !== floristId
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .STATUS_CHANGE_NOT_ALLOWED,
            );
        }

        /*
         * Get the order.
         */
        const order =
            await tx.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    status: true,
                    assignedFloristId: true,
                    assignedAt: true,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        /*
         * An order can only be assigned while
         * waiting for florists.
         */
        if (
            order.status !==
            OrderStatus.WAITING_FOR_FLORISTS
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .INVALID_STATUS_TRANSITION,
            );
        }

        /*
         * Prevent assigning an order that has
         * already been assigned.
         */
        if (
            order.assignedFloristId !== null
        ) {
            Exceptions.conflict(
                ORDER_MESSAGES
                    .ORDER_ALREADY_ASSIGNED,
            );
        }

        /*
         * Make sure the florist exists and
         * is active.
         */
        const florist =
            await tx.florist.findFirst({
                where: {
                    id: floristId,
                    active: true,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    name: true,
                },
            });

        if (!florist) {
            Exceptions.notFound(
                ORDER_MESSAGES
                    .FLORIST_NOT_FOUND,
            );
        }

        const assignedAt =
            new Date();

        /*
         * Assign the order.
         */
        const updatedOrder =
            await tx.order.update({
                where: {
                    id: order.id,
                },

                data: {
                    assignedFloristId:
                        florist.id,

                    assignedAt,

                    status:
                        OrderStatus.ASSIGNED,
                },
            });

        /*
         * Record the assignment in the
         * order status history.
         */
        await tx.orderStatusHistory.create({
            data: {
                orderId:
                    order.id,

                fromStatus:
                    order.status,

                toStatus:
                    OrderStatus.ASSIGNED,

                changedByUserId:
                    user.id,

                reason:
                    reason ??
                    `Order assigned to florist ${florist.name}.`,
            },
        });

        return updatedOrder;
    }

    /**
     * Changes an order status through the
     * normal operational workflow.
     */
    async changeStatus(
        orderId: number,
        newStatus: OrderStatus,
        user: AuthenticatedUser,
        reason?: string,
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    status: true,
                    assignedFloristId: true,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        /*
         * Validate the state transition.
         */
        this.validateTransition(
            order.status,
            newStatus,
        );

        /*
         * Validate whether the current user
         * is allowed to perform the transition.
         */
        this.validatePermission(
            order,
            newStatus,
            user,
        );

        /*
         * Update the order and create its
         * history entry atomically.
         */
        return this.prisma.$transaction(
            async (tx) => {
                const updated =
                    await tx.order.update({
                        where: {
                            id: order.id,
                        },

                        data: {
                            status:
                                newStatus,
                        },
                    });

                await tx.orderStatusHistory.create({
                    data: {
                        orderId:
                            order.id,

                        fromStatus:
                            order.status,

                        toStatus:
                            newStatus,

                        changedByUserId:
                            user.id,

                        reason:
                            reason ?? null,
                    },
                });

                return updated;
            },
        );
    }

    /**
     * Manually cancel an order.
     *
     * Only SYSTEM_ADMIN can perform
     * a manual cancellation.
     */
    async cancel(
        orderId: number,
        user: AuthenticatedUser,
        reason: OrderCancellationReason,
    ) {
        /*
         * Manual cancellation is an
         * administrative operation.
         */
        if (
            user.role !==
            UserRole.SYSTEM_ADMIN
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .STATUS_CHANGE_NOT_ALLOWED,
            );
        }

        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    status: true,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        /*
         * Cannot cancel an order that is
         * already cancelled.
         */
        if (
            order.status ===
            OrderStatus.CANCELLED
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .STATUS_ALREADY_SET,
            );
        }

        /*
         * Delivered orders cannot be
         * cancelled through this operation.
         */
        if (
            order.status ===
            OrderStatus.DELIVERED
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .CANNOT_CANCEL_ORDER,
            );
        }

        return this.cancelOrder(
            order.id,
            order.status,
            user.id,
            reason,
        );
    }

    /**
     * Automatically cancel an order.
     *
     * Used by system processes such as
     * the order offer expiration job.
     *
     * There is no user associated with
     * this operation.
     */
    async cancelAutomatically(
        orderId: number,
        reason: OrderCancellationReason,
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                },

                select: {
                    id: true,
                    status: true,
                },
            });

        /*
         * Order no longer exists.
         */
        if (!order) {
            return null;
        }

        /*
         * Already cancelled.
         */
        if (
            order.status ===
            OrderStatus.CANCELLED
        ) {
            return null;
        }

        return this.cancelOrder(
            order.id,
            order.status,
            null,
            reason,
        );
    }

    /**
     * Common cancellation operation.
     *
     * Every cancellation must go through
     * this method so the following are
     * always updated together:
     *
     * - status
     * - cancelledAt
     * - cancellationReason
     * - OrderStatusHistory
     */
    private async cancelOrder(
        orderId: number,
        fromStatus: OrderStatus,
        changedByUserId: number | null,
        reason: OrderCancellationReason,
    ) {
        const cancelledAt =
            new Date();

        return this.prisma.$transaction(
            async (tx) => {
                const updated =
                    await tx.order.update({
                        where: {
                            id: orderId,
                        },

                        data: {
                            status:
                                OrderStatus.CANCELLED,

                            cancelledAt,

                            cancellationReason:
                                reason,
                        },
                    });

                await tx.orderStatusHistory.create({
                    data: {
                        orderId:

                            orderId,

                        fromStatus:

                            fromStatus,

                        toStatus:
                            OrderStatus.CANCELLED,

                        changedByUserId:

                            changedByUserId,

                        reason:
                            reason,
                    },
                });

                return updated;
            },
        );
    }

    /**
     * Validates whether a status transition
     * is allowed by the order state machine.
     */
    private validateTransition(
        currentStatus: OrderStatus,
        newStatus: OrderStatus,
    ) {
        /*
         * Same status is never a valid
         * transition.
         */
        if (
            currentStatus ===
            newStatus
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .STATUS_ALREADY_SET,
            );
        }

        const allowedTransitions:
            Record<
                OrderStatus,
                OrderStatus[]
            > = {
            /*
             * This transition is handled
             * by OrderCreatedListener.
             */
            [OrderStatus.CREATED]: [
                OrderStatus.WAITING_FOR_FLORISTS,
            ],

            /*
             * This transition is handled
             * by OrderOfferAccepted.
             */
            [OrderStatus.WAITING_FOR_FLORISTS]: [
                OrderStatus.ASSIGNED,
            ],

            /*
             * Admin may also skip directly
             * to READY_FOR_DELIVERY or
             * DELIVERED.
             */
            [OrderStatus.ASSIGNED]: [
                OrderStatus.IN_PRODUCTION,
                OrderStatus.READY_FOR_DELIVERY,
                OrderStatus.DELIVERED,
            ],

            /*
             * Admin may skip directly
             * to DELIVERED.
             */
            [OrderStatus.IN_PRODUCTION]: [
                OrderStatus.READY_FOR_DELIVERY,
                OrderStatus.DELIVERED,
            ],

            /*
             * Normal final transition.
             */
            [OrderStatus.READY_FOR_DELIVERY]: [
                OrderStatus.DELIVERED,
            ],

            /*
             * Terminal state.
             */
            [OrderStatus.DELIVERED]: [],

            /*
             * Terminal state.
             */
            [OrderStatus.CANCELLED]: [],
        };

        const allowed =
            allowedTransitions[
            currentStatus
            ];

        if (
            !allowed.includes(
                newStatus,
            )
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .INVALID_STATUS_TRANSITION,
            );
        }
    }

    /**
     * Validates whether the current user
     * is allowed to perform a given
     * operational transition.
     */
    private validatePermission(
        order: {
            assignedFloristId: number | null;
        },
        newStatus: OrderStatus,
        user: AuthenticatedUser,
    ) {
        /*
         * SYSTEM_ADMIN can perform any
         * valid operational transition.
         */
        if (
            user.role ===
            UserRole.SYSTEM_ADMIN
        ) {
            return;
        }

        /*
         * Only florists can perform
         * the normal florist workflow.
         */
        if (
            user.role !==
            UserRole.FLORIST
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .STATUS_CHANGE_NOT_ALLOWED,
            );
        }

        /*
         * Florist must be associated
         * with a florist account.
         */
        if (!user.floristId) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .FLORIST_REQUIRED,
            );
        }

        /*
         * Florist can only change orders
         * assigned to their own florist.
         */
        if (
            order.assignedFloristId !==
            user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .ORDER_NOT_ASSIGNED_TO_FLORIST,
            );
        }

        /*
         * Florists can follow the complete
         * normal production workflow.
         */
        const allowedFloristStatuses:
            OrderStatus[] = [
                OrderStatus.IN_PRODUCTION,
                OrderStatus.READY_FOR_DELIVERY,
                OrderStatus.DELIVERED,
            ];

        if (
            !allowedFloristStatuses.includes(
                newStatus,
            )
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES
                    .STATUS_CHANGE_NOT_ALLOWED,
            );
        }
    }
}