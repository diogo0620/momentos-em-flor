import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { AdminOrderListResponseDto } from '../dtos/admin-order-list-response.dto';
import { AdminOrderResponseDto } from '../dtos/admin-order-response.dto';
import { off } from 'process';

type AdminOrderWithRelations = Prisma.OrderGetPayload<{
    include: {
        assignedFlorist: {
            select: {
                id: true;
                name: true;
            };
        };
        items: {
            include: {
                components: true;
                taxCode: true;
                product: {
                    select: {
                        id: true;
                        name: true;
                    };
                };
            };
        };
        offers: {
            include: {
                florist: {
                    select: {
                        id: true;
                        name: true;
                    };
                };
            };
        };
        taxTotals: {
            include: {
                taxCode: true;
            };
        };
    };
}>;

@Injectable()
export class AdminOrdersMapper extends BaseMapper<
    Order,
    AdminOrderResponseDto,
    AdminOrderListResponseDto
> {
    toDetailResponse(order: AdminOrderWithRelations): AdminOrderResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,

            customerId: order.customerId,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            customerTaxNumber: order.customerTaxNumber,

            assignedFlorist: order.assignedFlorist
                ? {
                    id: order.assignedFlorist.id,
                    name: order.assignedFlorist.name,
                }
                : null,

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
            notes: order.notes,

            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discount: Number(order.discount),
            total: Number(order.total),

            assignedAt: order.assignedAt,
            cancelledAt: order.cancelledAt,
            cancellationReason: order.cancellationReason,
            cancellationReasonDetails: order.cancellationReasonDetails,

            paidAt: order.paidAt,
            inProductionAt: order.inProductionAt,
            readyForDeliveryAt: order.readyForDeliveryAt,
            deliveredAt: order.deliveredAt,

            items: order.items.map((item) => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                type: item.type,
                name: item.name,
                description: item.description,
                variantId: item.variantId,
                variantType: item.variantType,
                variantName: item.variantName,
                quantity: item.quantity,
                customerPrice: Number(item.customerPrice),
                floristPrice: Number(item.floristPrice),
                netAmount: Number(item.netAmount),
                taxAmount: Number(item.taxAmount),
                grossAmount: Number(item.grossAmount),
                taxCodeId: item.taxCodeId,
                taxRate:
                    item.taxRate === null ? null : Number(item.taxRate),
                taxCode: item.taxCode
                    ? {
                        id: item.taxCode.id,
                        name: item.taxCode.name,
                    }
                    : null,
                product: item.product
                    ? {
                        id: item.product.id,
                        name: item.product.name,
                    }
                    : null,
                components: item.components.map((component) => ({
                    id: component.id,
                    orderItemId: component.orderItemId,
                    componentId: component.componentId,
                    componentName: component.componentName,
                    quantity: component.quantity,
                    additionalUnits: component.additionalUnits,
                    customerPricePerAdditionalUnit: Number(
                        component.customerPricePerAdditionalUnit,
                    ),
                    customerTotalPrice: Number(component.customerTotalPrice),
                })),
            })),

            offers: order.offers.map((offer) => ({
                id: offer.id,
                orderId: offer.orderId,
                floristId: offer.floristId,
                price: Number(offer.price),
                status: offer.status,
                distanceKm: Number(offer.distanceKm),
                viewedAt: offer.viewedAt,
                acceptedAt: offer.acceptedAt,
                declinedAt: offer.declinedAt,
                expiresAt: offer.expiresAt,
                declineReason: offer.declineReason,
                createdAt: offer.createdAt,
                updatedAt: offer.updatedAt,
                florist: {
                    id: offer.florist.id,
                    name: offer.florist.name
                },
            })),

            taxTotals: order.taxTotals.map((taxTotal) => ({
                id: taxTotal.id,
                orderId: taxTotal.orderId,
                taxCodeId: taxTotal.taxCodeId,
                netAmount: Number(taxTotal.netAmount),
                taxAmount: Number(taxTotal.taxAmount),
                grossAmount: Number(taxTotal.grossAmount),
                createdAt: taxTotal.createdAt,
                updatedAt: taxTotal.updatedAt,
                taxCode: {
                    id: taxTotal.taxCode.id,
                    name: taxTotal.taxCode.name,
                },
            })),

            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }

    protected toListItemResponse(order: Order): AdminOrderListResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerEmail: order.customerEmail,
            deliveryCity: order.deliveryCity,
            deliveryDistrict: order.deliveryDistrict,
            total: Number(order.total),
            status: order.status,
            createdAt: order.createdAt,
        };
    }
}
