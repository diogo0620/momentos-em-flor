import { OrderOfferResponseDto } from '../dto/order-offer-response.dto';

export class OrderOfferMapper {
    toResponse(
        offer: any,
    ): OrderOfferResponseDto {
        return {
            id:
                offer.id,
            floristId:
                offer.floristId,

            distanceKm:
                Number(
                    offer.distanceKm,
                ),

            compensationAmount:
                Number(
                    offer.compensationAmount,
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

            order: {
                id:
                    offer.order.id,

                orderNumber:
                    offer.order.orderNumber,

                occasion:
                    offer.order.occasion,

                deliveryDate:
                    offer.order.deliveryDate,

                deliveryTimeSlot:
                    offer.order.deliveryTimeSlot,

                deliveryAddress: {
                    street:
                        offer.order.deliveryStreet,

                    street2:
                        offer.order.deliveryStreet2,

                    postalCode:
                        offer.order.deliveryPostalCode,

                    city:
                        offer.order.deliveryCity,

                    district:
                        offer.order.deliveryDistrict,

                    countryCode:
                        offer.order.deliveryCountryCode,
                },
            },

            items:
                (
                    offer.orderOfferItems ??
                    []
                ).map(
                    (item: any) => ({
                        id:
                            item.id,

                        productId:
                            item.productId,

                        productName:
                            item.productName,

                        quantity:
                            item.quantity,
                    }),
                ),

            createdAt:
                offer.createdAt,

            updatedAt:
                offer.updatedAt,
        };
    }

    toResponses(
        offers: any[],
    ): OrderOfferResponseDto[] {
        return offers.map(
            (offer) =>
                this.toResponse(
                    offer,
                ),
        );
    }
}