import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderOfferStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderOfferEmailService } from './order-offer-email.service';

@Injectable()
export class OrderOfferNotificationAutomationService {
  private readonly logger = new Logger(OrderOfferNotificationAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emails: OrderOfferEmailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingNotifications(): Promise<void> {
    const offers = await this.prisma.orderOffer.findMany({
      where: {
        status: { in: [OrderOfferStatus.PENDING, OrderOfferStatus.VIEWED] },
        expiresAt: { gt: new Date() },
        notificationSentAt: null,
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 25,
    });
    for (const offer of offers) {
      try {
        await this.emails.sendCreatedNotification(offer.id);
      } catch (error) {
        this.logger.error(
          `Could not retry notification for order offer ${offer.id}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
