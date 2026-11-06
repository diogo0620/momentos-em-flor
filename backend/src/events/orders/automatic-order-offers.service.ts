import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderOfferStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { GeocodingService } from '@/geocoding/geocoding.service';
import { OrderOfferCreatedEvent } from '@/events/order-offers/order-offer-created.event';

@Injectable()
export class AutomaticOrderOffersService {
  private readonly logger = new Logger(AutomaticOrderOffersService.name);
  private readonly offerDurationMs = 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async dispatch(orderId: number): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        expectedFloristTotal: true,
        deliveryLatitude: true,
        deliveryLongitude: true,
        offers: { select: { floristId: true } },
      },
    });
    if (
      !order ||
      order.status !== OrderStatus.WAITING_FOR_FLORISTS ||
      order.deliveryLatitude === null ||
      order.deliveryLongitude === null
    ) {
      return 0;
    }

    const excludedFloristIds = order.offers.map((offer) => offer.floristId);
    const florists = await this.prisma.florist.findMany({
      where: {
        active: true,
        acceptingOrders: true,
        addressLatitude: { not: null },
        addressLongitude: { not: null },
        ...(excludedFloristIds.length > 0 && { id: { notIn: excludedFloristIds } }),
      },
      select: {
        id: true,
        addressLatitude: true,
        addressLongitude: true,
        deliveryRadiusKm: true,
      },
    });

    const delivery = {
      latitude: Number(order.deliveryLatitude),
      longitude: Number(order.deliveryLongitude),
    };
    const eligible = florists
      .map((florist) => ({
        floristId: florist.id,
        distanceKm: this.geocoding.distanceKm(
          {
            latitude: Number(florist.addressLatitude),
            longitude: Number(florist.addressLongitude),
          },
          delivery,
        ),
        radiusKm: Number(florist.deliveryRadiusKm),
      }))
      .filter((florist) => florist.distanceKm <= florist.radiusKm)
      .sort((left, right) => left.distanceKm - right.distanceKm);

    if (eligible.length === 0) return 0;

    const expiresAt = new Date(Date.now() + this.offerDurationMs);
    const created = await this.prisma.orderOffer.createManyAndReturn({
      data: eligible.map((florist) => ({
        automationKey: `order:${order.id}:florist:${florist.floristId}`,
        orderId: order.id,
        floristId: florist.floristId,
        price: order.expectedFloristTotal,
        distanceKm: florist.distanceKm,
        expiresAt,
        status: OrderOfferStatus.PENDING,
      })),
      skipDuplicates: true,
      select: { id: true },
    });

    for (const offer of created) {
      this.eventEmitter.emit(
        'order-offer.created',
        new OrderOfferCreatedEvent(offer.id),
      );
    }
    this.logger.log(`Created ${created.length} automatic offers for order ${order.id}.`);
    return created.length;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async recoverWaitingOrders(): Promise<void> {
    const orders = await this.prisma.order.findMany({
      where: { status: OrderStatus.WAITING_FOR_FLORISTS },
      select: { id: true },
      orderBy: { paidAt: 'asc' },
      take: 25,
    });
    for (const order of orders) {
      try {
        await this.dispatch(order.id);
      } catch (error) {
        this.logger.error(
          `Could not dispatch automatic offers for order ${order.id}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
