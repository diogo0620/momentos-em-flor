import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdminMoloniFiscalDocumentsService } from '@/moloni/fiscal/admin-moloni-fiscal-documents.service';
import { AutomaticOrderOffersService } from './automatic-order-offers.service';
import { OrderPaidEvent } from './order-paid.event';
import { OrderPaymentEmailService } from './order-payment-email.service';

@Injectable()
export class OrderPaidAutomationListener {
  private readonly logger = new Logger(OrderPaidAutomationListener.name);

  constructor(
    private readonly offers: AutomaticOrderOffersService,
    private readonly fiscalDocuments: AdminMoloniFiscalDocumentsService,
    private readonly paymentEmail: OrderPaymentEmailService,
  ) {}

  @OnEvent('order.paid')
  async handle(event: OrderPaidEvent): Promise<void> {
    const results = await Promise.allSettled([
      this.offers.dispatch(event.orderId),
      this.fiscalDocuments.issueForOrder(event.orderId),
      this.paymentEmail.send(event.orderId),
    ]);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `${['Offer dispatch', 'Automatic invoicing', 'Payment confirmation email'][index]} failed for order ${event.orderId}.`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
      }
    });
  }
}
