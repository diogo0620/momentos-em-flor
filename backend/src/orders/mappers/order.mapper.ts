import { OrderCreateResponseDto } from '../dto/order-create-response.dto';
import { OrderListResponseDto } from '../dto/order-list-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';

export class OrderMapper {

    // =========================================================
    // DETAIL
    // =========================================================

    toResponse(
        order: any,
    ): OrderResponseDto {
        return {
            id:
                order.id,

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
                Number(
                    order.subtotal,
                ),

            taxAmount:
                Number(
                    order.taxAmount,
                ),

            deliveryFee:
                Number(
                    order.deliveryFee,
                ),

            discount:
                Number(
                    order.discount,
                ),

            total:
                Number(
                    order.total,
                ),

            status:
                order.status,

            // =================================================
            // ITEMS
            // =================================================

            items:
                (order.items ?? []).map(
                    (item: any) => ({
                        id:
                            item.id,

                        productId:
                            item.productId,

                        productName:
                            item.name ??
                            item.productName,

                        productDescription:
                            item.description,

                        quantity:
                            item.quantity,

                        /*
                         * unitPrice is the price paid
                         * by the customer INCLUDING VAT.
                         */
                        unitPrice:
                            Number(
                                item.customerPrice,
                            ),

                        /*
                         * Snapshot of the VAT rate
                         * at the time of purchase.
                         */
                        taxRate:
                            Number(
                                item.taxRate,
                            ),

                        /*
                         * Amount BEFORE VAT.
                         */
                        netAmount:
                            Number(
                                item.netAmount,
                            ),

                        /*
                         * VAT amount.
                         */
                        taxAmount:
                            Number(
                                item.taxAmount,
                            ),

                        /*
                         * Total line amount INCLUDING VAT.
                         */
                        grossAmount:
                            Number(
                                item.grossAmount,
                            ),

                        taxCodeId:
                            item.taxCodeId,
                    }),
                ),

            // =================================================
            // OFFERS
            // =================================================

            offers:
                (order.offers ?? []).map(
                    (offer: any) => ({
                        id:
                            offer.id,

                        floristId:
                            offer.floristId,

                        florist:
                            offer.florist
                                ? {
                                    id:
                                        offer.florist.id,

                                    name:
                                        offer.florist.name,
                                }
                                : null,

                        /*
                         * Actual amount offered to
                         * the florist.
                         */
                        compensationAmount:
                            Number(
                                offer.compensationAmount ??
                                offer.price,
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

                        createdAt:
                            offer.createdAt,

                        updatedAt:
                            offer.updatedAt,
                    }),
                ),

            // =================================================
            // STATUS HISTORY
            // =================================================

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


    // =========================================================
    // MULTIPLE DETAILS
    // =========================================================

    toResponses(
        orders: any[],
    ): OrderResponseDto[] {
        return orders.map(
            (order) =>
                this.toResponse(
                    order,
                ),
        );
    }


    // =========================================================
    // LIST
    // =========================================================

    toListResponse(
        order: any,
    ): OrderListResponseDto {
        return {
            id:
                order.id,

            orderNumber:
                order.orderNumber,

            customerId:
                order.customerId,

            customerFirstName:
                order.customerFirstName,

            customerEmail:
                order.customerEmail,

            customerPhone:
                order.customerPhone,

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

            total:
                Number(
                    order.total,
                ),

            status:
                order.status,

            createdAt:
                order.createdAt,

            deliveryDate:
                order.deliveryDate,
        };
    }


    // =========================================================
    // MULTIPLE LIST
    // =========================================================

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


    // =========================================================
    // CREATE
    // =========================================================

    toCreateResponse(
        order: any,
    ): OrderCreateResponseDto {
        return {
            id:
                order.id,

            orderNumber:
                order.orderNumber,

            status:
                order.status,

            createdAt:
                order.createdAt,
        };
    }
}