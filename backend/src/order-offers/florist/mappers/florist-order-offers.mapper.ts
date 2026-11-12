import { Injectable } from '@nestjs/common';
import { OrderItemType, Prisma } from '@prisma/client';
import { FloristOrderOfferListResponseDto } from '../dtos/florist-order-offer-list-response.dto';
import { FloristOrderOfferResponseDto } from '../dtos/florist-order-offer-response.dto';
import { formatOrderItemConfiguration } from '@/orders/order-item-configuration';

type OfferWithOrder = Prisma.OrderOfferGetPayload<{ include: { order: { include: { items: { include: { components: true } } } } } }>;

@Injectable()
export class FloristOrderOffersMapper {
    toListResponse(offer: OfferWithOrder): FloristOrderOfferListResponseDto {
        return {
            id: offer.id,
            order: {
                deliveryDate: offer.order.deliveryDate,
                deliveryTimeSlot: offer.order.deliveryTimeSlot,
                deliveryDistrict: offer.order.deliveryDistrict,
                deliveryCity: offer.order.deliveryCity
            },
            status: offer.status,
            price: Number(offer.price),
            distanceKm: Number(offer.distanceKm),
            createdAt: offer.createdAt,
            expiresAt: offer.expiresAt
        };
    }

    toDetailResponse(offer: OfferWithOrder): FloristOrderOfferResponseDto {
        return {
            id: offer.id,

            order: {


                deliveryDate: offer.order.deliveryDate,
                deliveryTimeSlot: offer.order.deliveryTimeSlot,
                deliveryDistrict: offer.order.deliveryDistrict,
                deliveryCity: offer.order.deliveryCity,

                ...(offer.status === 'ACCEPTED' && {
                    recipientFirstName: offer.order.recipientFirstName,
                    recipientLastName: offer.order.recipientLastName,
                    recipientPhone: offer.order.recipientPhone,
                    deliveryStreet: offer.order.deliveryStreet,
                    deliveryStreetNumber: offer.order.deliveryStreetNumber,
                    deliveryStreet2: offer.order.deliveryStreet2,
                    deliveryPostalCode: offer.order.deliveryPostalCode,
                    deliveryInstructions: offer.order.deliveryInstructions,
                    cardMessage: offer.order.cardMessage,
                }),

                items: offer.order.items
                  .filter((item) => item.type !== OrderItemType.DELIVERY_FEE)
                  .map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: formatOrderItemConfiguration(item),
                    variantName: item.variantName,
                    quantity: item.quantity,
                  })),
            },

            status: offer.status,
            price: Number(offer.price),
            distanceKm: Number(offer.distanceKm),

            acceptedAt: offer.acceptedAt,
            declinedAt: offer.declinedAt,
            cancelledAt: offer.cancelledAt,
            expiresAt: offer.expiresAt,

            declineReason: offer.declineReason,
            declineReasonDetails: offer.declineReasonDetails,

            cancellationReason:
                offer.cancellationReason,

            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
        };
    }
}
