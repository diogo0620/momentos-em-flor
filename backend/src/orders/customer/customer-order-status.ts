import { OrderStatus, Prisma } from '@prisma/client';

export enum CustomerOrderStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    RECEIVED = 'RECEIVED',
    IN_PREPARATION = 'IN_PREPARATION',
    READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export function toCustomerOrderStatus(
    status: OrderStatus,
): CustomerOrderStatus {
    switch (status) {
        case OrderStatus.PENDING_PAYMENT:
            return CustomerOrderStatus.PENDING_PAYMENT;
        case OrderStatus.CREATED:
        case OrderStatus.WAITING_FOR_FLORISTS:
        case OrderStatus.ASSIGNED:
            return CustomerOrderStatus.RECEIVED;
        case OrderStatus.IN_PRODUCTION:
            return CustomerOrderStatus.IN_PREPARATION;
        case OrderStatus.READY_FOR_DELIVERY:
            return CustomerOrderStatus.READY_FOR_DELIVERY;
        case OrderStatus.DELIVERED:
            return CustomerOrderStatus.DELIVERED;
        case OrderStatus.CANCELLED:
            return CustomerOrderStatus.CANCELLED;
    }
}

export function toInternalOrderStatusFilter(
    status?: CustomerOrderStatus,
): Prisma.OrderWhereInput['status'] {
    if (!status) return undefined;

    switch (status) {
        case CustomerOrderStatus.RECEIVED:
            return {
                in: [
                    OrderStatus.CREATED,
                    OrderStatus.WAITING_FOR_FLORISTS,
                    OrderStatus.ASSIGNED,
                ],
            };
        case CustomerOrderStatus.IN_PREPARATION:
            return { equals: OrderStatus.IN_PRODUCTION };
        default:
            return { equals: status as OrderStatus };
    }
}
