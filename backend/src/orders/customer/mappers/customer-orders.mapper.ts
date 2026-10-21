
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Order, Prisma } from '@prisma/client';
import { CustomerOrderListResponseDto } from '../dtos/customer-order-list-response.dto';
import { CustomerOrderResponseDto } from '../dtos/customer-order-response.dto';

type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        items: {
            include: {
                components: true;
            };
        };
    };
}>;



@Injectable()
export class CustomerOrdersMapper extends BaseMapper<
    Order,
    CustomerOrderResponseDto,
    CustomerOrderListResponseDto
> {


    toDetailResponse(
        order: OrderWithItems,
    ): CustomerOrderResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerTaxNumber: order.customerTaxNumber,
            recipientFirstName: order.recipientFirstName,
            recipientLastName: order.recipientLastName,
            recipientPhone: order.recipientPhone,
            occasion: order.occasion,
            deliveryDate: order.deliveryDate,
            deliveryTimeSlot: order.deliveryTimeSlot,
            deliveryInstructions: order.deliveryInstructions,
            deliveryStreet: order.deliveryStreet,
            deliveryStreetNumber: order.deliveryStreetNumber,
            deliveryStreet2: order.deliveryStreet2,
            deliveryPostalCode: order.deliveryPostalCode,
            deliveryCity: order.deliveryCity,
            deliveryDistrict: order.deliveryDistrict,
            deliveryCountryCode: order.deliveryCountryCode,
            cardMessage: order.cardMessage,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discount: Number(order.discount),
            total: Number(order.total),
            status: order.status,
            items: order.items.map((item) => ({
                id: item.id,
                type: item.type,
                productId: item.productId,
                productName: item.name,
                description: item.description,

                quantity: item.quantity,

                unitPrice: Number(item.customerPrice),

                netAmount: Number(item.netAmount),
                taxRate: Number(item.taxRate),
                taxAmount: Number(item.taxAmount),
                grossAmount: Number(item.grossAmount),

                taxCodeId: item.taxCodeId
            })),
            createdAt: order.createdAt,
            cancelledAt: order.cancelledAt,
            cancellationReason: order.cancellationReason
        }
    }





    protected toListItemResponse(
        order: Order,
    ): CustomerOrderListResponseDto {

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            status: order.status,
            createdAt: order.createdAt
        };
    }
}