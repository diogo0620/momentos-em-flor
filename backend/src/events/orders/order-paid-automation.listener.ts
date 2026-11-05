import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdminMoloniFiscalDocumentsService } from '@/moloni/fiscal/admin-moloni-fiscal-documents.service';
import { AutomaticOrderOffersService } from './automatic-order-offers.service';
import { OrderPaidEvent } from './order-paid.event';

@Injectable()
export class OrderPaidAutomationListener {
  private readonly logger = new Logger(OrderPaidAutomationListener.name);

  constructor(
    private readonly offers: AutomaticOrderOffersService,
    private readonly fiscalDocuments: AdminMoloniFiscalDocumentsService,
  ) {}

  @OnEvent('order.paid')
  async handle(event: OrderPaidEvent): Promise<void> {
    const results = await Promise.allSettled([
      this.offers.dispatch(event.orderId),
      this.fiscalDocuments.issueForOrder(event.orderId),
    ]);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `${index === 0 ? 'Offer dispatch' : 'Automatic invoicing'} failed for order ${event.orderId}.`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
      }
    });
  }
}
