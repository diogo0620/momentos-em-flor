
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { OrderOffer, Prisma } from '@prisma/client';

import { AdminOrderOfferListResponseDto } from '../dtos/admin-order-offer-list-response.dto';
import { AdminOrderOfferResponseDto } from '../dtos/admin-order-offer-response.dto';

type OrderOfferWithRelations = Prisma.OrderOfferGetPayload<{
    include: {
        order: {
            select: {
                id: true;
                orderNumber: true;
            };
        };
        florist: {
            select: {
                id: true;
                name: true;
            };
        };
    };
}>;

@Injectable()
export class AdminOrderOffersMapper extends BaseMapper<
    OrderOffer,
    AdminOrderOfferResponseDto,
    AdminOrderOfferListResponseDto
> {
    toDetailResponse(
        offer: OrderOfferWithRelations,
    ): AdminOrderOfferResponseDto {
        return {
            id: offer.id,
            order: {
                id: offer.order.id,
                orderNumber: offer.order.orderNumber,
            },
            florist: {
                id: offer.florist.id,
                name: offer.florist.name,
            },
            price: Number(offer.price),
            status: offer.status,
            distanceKm: offer.distanceKm?.toNumber() ?? null,
            viewedAt: offer.viewedAt ?? null,
            acceptedAt: offer.acceptedAt ?? null,
            declinedAt: offer.declinedAt ?? null,
            expiresAt: offer.expiresAt ?? null,
            declineReason: offer.declineReason ?? null,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
        };
    }

    protected toListItemResponse(
        offer: OrderOfferWithRelations,
    ): AdminOrderOfferListResponseDto {
        return {
            id: offer.id,
            order: {
                id: offer.order.id,
                orderNumber: offer.order.orderNumber,
            },
            florist: {
                id: offer.florist.id,
                name: offer.florist.name,
            },
            price: offer.price.toNumber(),
            status: offer.status,
            expiresAt: offer.expiresAt
        };
    }
}
