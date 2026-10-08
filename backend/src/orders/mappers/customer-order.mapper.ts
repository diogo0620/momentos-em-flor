import { Order, OrderStatus } from '@prisma/client';

import { BaseMapper } from '../../common/mappers/base.mapper';

import {
    CustomerOrderDetailResponseDto,
    CustomerOrderItemResponseDto,
} from '../dto/customer/customer-order-detail-response.dto';

import {
    CustomerOrderListResponseDto,
    CustomerOrderStatus,
} from '../dto/customer/customer-order-list-response.dto';

export class CustomerOrderMapper extends BaseMapper<
    any,
    CustomerOrderDetailResponseDto
> {
    toStatus(status: OrderStatus): CustomerOrderStatus {
        switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                return CustomerOrderStatus.PENDING_PAYMENT;

            case OrderStatus.IN_PRODUCTION:
                return CustomerOrderStatus.IN_PREPARATION;

            case OrderStatus.READY_FOR_DELIVERY:
                return CustomerOrderStatus.READY_FOR_DELIVERY;

            case OrderStatus.DELIVERED:
                return CustomerOrderStatus.DELIVERED;

            case OrderStatus.CANCELLED:
                return CustomerOrderStatus.CANCELLED;

            case OrderStatus.CREATED:
            case OrderStatus.WAITING_FOR_FLORISTS:
            case OrderStatus.ASSIGNED:
            default:
                return CustomerOrderStatus.PROCESSING;
        }
    }

    toListResponse(
        order: Order,
    ): CustomerOrderListResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: this.toStatus(order.status),
            total: Number(order.total),
            createdAt: order.createdAt,
            deliveryDate: order.deliveryDate,
        };
    }

    toItemResponse(
        item: any,
    ): CustomerOrderItemResponseDto {
        return {
            id: item.id,
            name: item.name ?? item.productName,
            description: item.description,
            quantity: item.quantity,
            variantType: item.variantType ?? null,
            variantName: item.variantName ?? null,
            customerPrice: Number(item.customerPrice),
            netAmount: Number(item.netAmount),
            taxAmount: Number(item.taxAmount),
            grossAmount: Number(item.grossAmount),
            imageUrl:
                item.product?.images?.[0]?.file?.id
                    ? `${process.env.BACKEND_URL}/api/files/${item.product.images[0].file.id}`
                    : undefined,
        };
    }

    toResponse(
        order: any,
    ): CustomerOrderDetailResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: this.toStatus(order.status),

            createdAt: order.createdAt,
            deliveryDate: order.deliveryDate,
            deliveryTimeSlot: order.deliveryTimeSlot,

            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,

            recipientFirstName: order.recipientFirstName,
            recipientLastName: order.recipientLastName,
            recipientPhone: order.recipientPhone,

            deliveryStreet: order.deliveryStreet,
            deliveryStreet2: order.deliveryStreet2,
            deliveryPostalCode: order.deliveryPostalCode,
            deliveryCity: order.deliveryCity,
            deliveryDistrict: order.deliveryDistrict,
            deliveryCountryCode: order.deliveryCountryCode,

            cardMessage: order.cardMessage,
            deliveryInstructions: order.deliveryInstructions,
            notes: order.notes,

            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discount: Number(order.discount),
            total: Number(order.total),

            items: (order.items ?? []).map(
                (item: any) => this.toItemResponse(item),
            ),
        };
    }
}