import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FloristOrderOfferListResponseDto } from '../dtos/florist-order-offer-list-response.dto';
import { FloristOrderOfferResponseDto } from '../dtos/florist-order-offer-response.dto';

type OfferWithOrder = Prisma.OrderOfferGetPayload<{ include: { order: { include: { items: true } } } }>;

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

                items: offer.order.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
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
