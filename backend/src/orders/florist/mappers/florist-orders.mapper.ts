import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { BaseMapper } from '@/common/mappers/base.mapper';
import { FloristOrderResponseDto } from '../dtos/florist-order-response.dto';
import { FloristOrderListResponseDto } from '../dtos/florist-order-list.response.dto';

type FloristOrderWithRelations = Prisma.OrderGetPayload<{
    include: {
        items: {
            include: {
                components: true;
            };
        };
        offers: {
            select: {
                price: true;
            };
        };
    };
}>;

@Injectable()
export class FloristOrdersMapper extends BaseMapper<Order, FloristOrderResponseDto, FloristOrderListResponseDto> {
    toDetailResponse(order: FloristOrderWithRelations): FloristOrderResponseDto {
        return {
            id: order.id, orderNumber: order.orderNumber, status: order.status,
            deliveryDate: order.deliveryDate, deliveryTimeSlot: order.deliveryTimeSlot,
            recipientFirstName: order.recipientFirstName, recipientLastName: order.recipientLastName, recipientPhone: order.recipientPhone,
            deliveryStreet: order.deliveryStreet, deliveryStreetNumber: order.deliveryStreetNumber, deliveryStreet2: order.deliveryStreet2,
            deliveryPostalCode: order.deliveryPostalCode, deliveryCity: order.deliveryCity, deliveryDistrict: order.deliveryDistrict,
            deliveryInstructions: order.deliveryInstructions, cardMessage: order.cardMessage,
            items: order.items.map((item) => ({ id: item.id, type: item.type, name: item.name, description: item.description, variantType: item.variantType, variantName: item.variantName, quantity: item.quantity, components: item.components.map((component) => ({ id: component.id, componentName: component.componentName, quantity: component.quantity })) })),
            paidAt: order.paidAt, assignedAt: order.assignedAt, inProductionAt: order.inProductionAt, readyForDeliveryAt: order.readyForDeliveryAt, deliveredAt: order.deliveredAt, cancelledAt: order.cancelledAt, createdAt: order.createdAt,
            price: Number(order.offers[0].price),
        };
    }
    protected toListItemResponse(order: FloristOrderWithRelations): FloristOrderListResponseDto {
        return { id: order.id, orderNumber: order.orderNumber, status: order.status, deliveryDate: order.deliveryDate, deliveryTimeSlot: order.deliveryTimeSlot, deliveryCity: order.deliveryCity, deliveryDistrict: order.deliveryDistrict, createdAt: order.createdAt, price: Number(order.offers[0].price),};
    }
}
