import { OrderCreateResponseDto } from '../dto/order-create-response.dto';
import { OrderListResponseDto } from '../dto/order-list-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';

export class OrderMapper {
    toResponse(
        order: any,
    ): OrderResponseDto {
        return {
            id: order.id,

            orderNumber:
                order.orderNumber,

            customerId:
                order.customerId,

            customerFirstName:
                order.customerFirstName,

            customerLastName:
                order.customerLastName,

            customerEmail:
                order.customerEmail,

            customerPhone:
                order.customerPhone,

            recipientFirstName:
                order.recipientFirstName,

            recipientLastName:
                order.recipientLastName,

            recipientPhone:
                order.recipientPhone,

            occasion:
                order.occasion,

            deliveryDate:
                order.deliveryDate,

            deliveryTimeSlot:
                order.deliveryTimeSlot,

            deliveryInstructions:
                order.deliveryInstructions,

            deliveryStreet:
                order.deliveryStreet,

            deliveryStreet2:
                order.deliveryStreet2,

            deliveryPostalCode:
                order.deliveryPostalCode,

            deliveryCity:
                order.deliveryCity,

            deliveryDistrict:
                order.deliveryDistrict,

            deliveryCountryCode:
                order.deliveryCountryCode,

            deliveryLatitude:
                Number(
                    order.deliveryLatitude,
                ),

            deliveryLongitude:
                Number(
                    order.deliveryLongitude,
                ),

            cardMessage:
                order.cardMessage,

            subtotal:
                Number(order.subtotal),

            deliveryFee:
                Number(order.deliveryFee),

            discount:
                Number(order.discount),

            total:
                Number(order.total),

            status:
                order.status,

            items:
                (order.items ?? []).map(
                    (item: any) => ({
                        id:
                            item.id,

                        productId:
                            item.productId,

                        productName:
                            item.productName,

                        productDescription:
                            item.productDescription,

                        quantity:
                            item.quantity,

                        unitPrice:
                            Number(
                                item.unitPrice,
                            ),

                        lineTotal:
                            Number(
                                item.lineTotal,
                            ),
                    }),
                ),

            offers:
                (order.offers ?? []).map(
                    (offer: any) => ({
                        id:
                            offer.id,

                        floristId:
                            offer.floristId,

                        florist: {
                            id:
                                offer.florist.id,

                            name:
                                offer.florist.name,
                        },

                        compensationAmount:
                            Number(
                                offer.compensationAmount,
                            ),

                        distanceKm:
                            Number(
                                offer.distanceKm,
                            ),

                        status:
                            offer.status,

                        viewedAt:
                            offer.viewedAt,

                        acceptedAt:
                            offer.acceptedAt,

                        declinedAt:
                            offer.declinedAt,

                        expiresAt:
                            offer.expiresAt,

                        declineReason:
                            offer.declineReason,

                        items:
                            (
                                offer.orderOfferItems ??
                                []
                            ).map(
                                (item: any) => ({
                                    id:
                                        item.id,

                                    orderItemId:
                                        item.orderItemId,

                                    productId:
                                        item.productId,

                                    productName:
                                        item.productName,

                                    quantity:
                                        item.quantity,

                                    unitCompensation:
                                        Number(
                                            item.unitCompensation,
                                        ),

                                    totalCompensation:
                                        Number(
                                            item.totalCompensation,
                                        ),
                                }),
                            ),

                        createdAt:
                            offer.createdAt,

                        updatedAt:
                            offer.updatedAt,
                    }),
                ),

            statusHistory:
                (
                    order.statusHistory ??
                    []
                ).map(
                    (history: any) => ({
                        id:
                            history.id,

                        fromStatus:
                            history.fromStatus,

                        toStatus:
                            history.toStatus,

                        changedByUserId:
                            history.changedByUserId,

                        changedByUser:
                            history.changedByUser
                                ? {
                                    id:
                                        history
                                            .changedByUser
                                            .id,

                                    firstName:
                                        history
                                            .changedByUser
                                            .firstName,

                                    lastName:
                                        history
                                            .changedByUser
                                            .lastName,

                                    email:
                                        history
                                            .changedByUser
                                            .email,

                                    role:
                                        history
                                            .changedByUser
                                            .role,
                                }
                                : null,

                        reason:
                            history.reason,

                        createdAt:
                            history.createdAt,
                    }),
                ),

            createdAt:
                order.createdAt,

            updatedAt:
                order.updatedAt,

            cancelledAt:
                order.cancelledAt,

            cancellationReason:
                order.cancellationReason,
        };
    }

    toResponses(
        orders: any[],
    ): OrderResponseDto[] {
        return orders.map(
            (order) =>
                this.toResponse(order),
        );
    }

    toListResponse(
        order: any,
    ): OrderListResponseDto {
        return {
            id: order.id,

            orderNumber:
                order.orderNumber,

            customerId:
                order.customerId,

            customerFirstName:
                order.customerFirstName,

            customerLastName:
                order.customerLastName,

            customerEmail:
                order.customerEmail,

            customerPhone:
                order.customerPhone,

            recipientFirstName:
                order.recipientFirstName,

            recipientLastName:
                order.recipientLastName,

            recipientPhone:
                order.recipientPhone,

            occasion:
                order.occasion,

            deliveryDate:
                order.deliveryDate,

            deliveryTimeSlot:
                order.deliveryTimeSlot,

            deliveryInstructions:
                order.deliveryInstructions,

            deliveryStreet:
                order.deliveryStreet,

            deliveryStreet2:
                order.deliveryStreet2,

            deliveryPostalCode:
                order.deliveryPostalCode,

            deliveryCity:
                order.deliveryCity,

            deliveryDistrict:
                order.deliveryDistrict,

            deliveryCountryCode:
                order.deliveryCountryCode,

            deliveryLatitude:
                Number(
                    order.deliveryLatitude,
                ),

            deliveryLongitude:
                Number(
                    order.deliveryLongitude,
                ),

            cardMessage:
                order.cardMessage,

            subtotal:
                Number(order.subtotal),

            deliveryFee:
                Number(order.deliveryFee),

            discount:
                Number(order.discount),

            total:
                Number(order.total),

            status:
                order.status,

            createdAt:
                order.createdAt,

            updatedAt:
                order.updatedAt,

            cancelledAt:
                order.cancelledAt,

            cancellationReason:
                order.cancellationReason,
        };
    }

    toListResponses(
        orders: any[],
    ): OrderListResponseDto[] {
        return orders.map(
            (order) =>
                this.toListResponse(
                    order,
                ),
        );
    }

    toCreateResponse(
        order: any,
    ): OrderCreateResponseDto {
        return {
            id: order.id,

            orderNumber:
                order.orderNumber,

            status:
                order.status,

            createdAt:
                order.createdAt,
        };
    }
}