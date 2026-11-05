import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { OrderOfferCreatedEvent } from './order-offer-created.event';
import { OrderOfferEmailService } from './order-offer-email.service';

@Injectable()
export class OrderOfferCreatedListener {
  private readonly logger = new Logger(OrderOfferCreatedListener.name);

  constructor(
    private readonly orderOfferEmailService: OrderOfferEmailService,
  ) {}

  @OnEvent('order-offer.created')
  async handleOrderOfferCreated(
    event: OrderOfferCreatedEvent,
  ): Promise<void> {
    try {
      await this.orderOfferEmailService.sendCreatedNotification(
        event.orderOfferId,
      );
    } catch (error) {
      this.logger.error(
        `Could not notify florist administrators about offer ${event.orderOfferId}.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}