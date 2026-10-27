import { Injectable } from '@nestjs/common';
import { OrderOfferStatus, OrderStatus, Prisma, OrderOfferCancellationReason } from '@prisma/client';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { PrismaService } from '@/prisma/prisma.service';
import { FloristDeclineOrderOfferDto } from './dtos/florist-decline-order-offer.dto';
import { FloristOrderOfferQueryDto } from './dtos/florist-order-offer-query.dto';
import { FloristOrderOffersMapper } from './mappers/florist-order-offers.mapper';

@Injectable()
export class FloristOrderOffersService {
    constructor(private readonly prisma: PrismaService, private readonly mapper: FloristOrderOffersMapper) { }

    async findAll(user: AuthenticatedUser, query: FloristOrderOfferQueryDto) {
        const floristId = this.getFloristId(user);
        const where: Prisma.OrderOfferWhereInput = { floristId, ...(query.status !== undefined && { status: query.status }) };
        const [offers, total] = await Promise.all([
            this.prisma.orderOffer.findMany({ where, orderBy: { [query.sort]: query.order }, ...getPagination(query.page, query.pageSize), include: { order: { include: { items: true } } } }),
            this.prisma.orderOffer.count({ where }),
        ]);
        return ApiResponse.paginated(offers.map((offer) => this.mapper.toListResponse(offer)), getPaginationResponse(query.page, query.pageSize, total));
    }

    async findOne(user: AuthenticatedUser, id: number) {
        const floristId = this.getFloristId(user);
        await this.prisma.orderOffer.updateMany({ where: { id, floristId, status: OrderOfferStatus.PENDING }, data: { status: OrderOfferStatus.VIEWED, viewedAt: new Date() } });
        const offer = await this.prisma.orderOffer.findFirst({
            where: {
                id,
                floristId,
            },
            include: {
                order: {
                    include: {
                        items: true,
                    },
                },
            },
        });
        if (!offer) Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);
        return ApiResponse.success(this.mapper.toDetailResponse(offer));
    }

    async accept(user: AuthenticatedUser, id: number): Promise<void> {
        const floristId = this.getFloristId(user);
        const now = new Date();
        await this.prisma.$transaction(async (tx) => {
            const offer = await tx.orderOffer.findFirst({ where: { id, floristId }, include: { order: { select: { status: true } } } });
            if (!offer) Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);
            if ((offer.status !== OrderOfferStatus.PENDING && offer.status !== OrderOfferStatus.VIEWED) || offer.expiresAt <= now) Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);
            const accepted = await tx.orderOffer.updateMany({ where: { id, floristId, status: { in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED] } }, data: { status: OrderOfferStatus.ACCEPTED, acceptedAt: now } });
            if (accepted.count !== 1) Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);
            const orderUpdated = await tx.order.updateMany({ where: { id: offer.orderId, status: OrderStatus.WAITING_FOR_FLORISTS }, data: { status: OrderStatus.ASSIGNED, assignedFloristId: floristId, assignedAt: now } });
            if (orderUpdated.count !== 1) Exceptions.badRequest(ERROR_MESSAGES.ORDER_ALREADY_ASSIGNED);
            await tx.orderOffer.updateMany({ where: { orderId: offer.orderId, id: { not: id }, status: { in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED] } }, data: { status: OrderOfferStatus.CANCELLED, cancelledAt: now, cancellationReason: OrderOfferCancellationReason.ANOTHER_OFFER_ACCEPTED } });
        });
    }

    async decline(user: AuthenticatedUser, id: number, dto: FloristDeclineOrderOfferDto): Promise<void> {
        const floristId = this.getFloristId(user);
        const declined = await this.prisma.orderOffer.updateMany({ where: { id, floristId, status: { in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED] } }, data: { status: OrderOfferStatus.DECLINED, declinedAt: new Date(), declineReason: dto.declineReason, declineReasonDetails: dto.declineReasonDetails } });
        if (declined.count === 1) return;
        const offer = await this.prisma.orderOffer.findFirst({ where: { id, floristId }, select: { id: true } });
        if (!offer) Exceptions.notFound(ERROR_MESSAGES.ORDER_OFFER_NOT_FOUND);
        Exceptions.badRequest(ERROR_MESSAGES.ORDER_OFFER_CANNOT_BE_UPDATED);
    }

    private getFloristId(user: AuthenticatedUser): number {
        if (!user.floristId) Exceptions.forbidden();
        return user.floristId;
    }
}
