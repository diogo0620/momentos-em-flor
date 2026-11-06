import { Injectable } from '@nestjs/common';
import {
  FloristCompensationStatus,
  OrderOfferStatus,
  Prisma,
} from '@prisma/client';

type AcceptedOfferSnapshot = {
  id: number;
  orderId: number;
  floristId: number;
  price: Prisma.Decimal;
};

@Injectable()
export class FloristCompensationLifecycleService {
  async createForAcceptedOffer(
    tx: Prisma.TransactionClient,
    offer: AcceptedOfferSnapshot,
  ): Promise<void> {
    await tx.floristCompensation.upsert({
      where: { orderId: offer.orderId },
      create: {
        orderId: offer.orderId,
        orderOfferId: offer.id,
        floristId: offer.floristId,
        amount: offer.price,
        status: FloristCompensationStatus.PENDING_DELIVERY,
      },
      update: {},
    });
  }

  async markDue(
    tx: Prisma.TransactionClient,
    orderId: number,
    dueAt: Date,
  ): Promise<void> {
    const updated = await tx.floristCompensation.updateMany({
      where: {
        orderId,
        status: FloristCompensationStatus.PENDING_DELIVERY,
      },
      data: {
        status: FloristCompensationStatus.DUE,
        dueAt,
      },
    });

    if (updated.count === 1) return;

    const existing = await tx.floristCompensation.findUnique({
      where: { orderId },
      select: { id: true },
    });

    if (existing) return;

    const acceptedOffer = await tx.orderOffer.findFirst({
      where: {
        orderId,
        status: OrderOfferStatus.ACCEPTED,
      },
      select: {
        id: true,
        orderId: true,
        floristId: true,
        price: true,
      },
    });

    if (!acceptedOffer) return;

    await tx.floristCompensation.create({
      data: {
        orderId,
        orderOfferId: acceptedOffer.id,
        floristId: acceptedOffer.floristId,
        amount: acceptedOffer.price,
        status: FloristCompensationStatus.DUE,
        dueAt,
      },
    });
  }

  async cancel(
    tx: Prisma.TransactionClient,
    orderId: number,
    reason: string,
    cancelledAt: Date,
  ): Promise<void> {
    await tx.floristCompensation.updateMany({
      where: {
        orderId,
        status: {
          in: [
            FloristCompensationStatus.PENDING_DELIVERY,
            FloristCompensationStatus.DUE,
          ],
        },
      },
      data: {
        status: FloristCompensationStatus.CANCELLED,
        cancelledAt,
        cancellationReason: reason,
      },
    });
  }
}
