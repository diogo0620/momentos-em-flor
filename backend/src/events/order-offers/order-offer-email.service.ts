import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryTimeSlot, UserRole } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';

@Injectable()
export class OrderOfferEmailService {
  private readonly logger = new Logger(OrderOfferEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendCreatedNotification(orderOfferId: number): Promise<void> {
    const templateId = this.configService.getOrThrow<string>(
      'RESEND_ORDER_OFFER_CREATED_TEMPLATE_ID',
    );

    const portalOffersUrl = this.configService.getOrThrow<string>(
      'FLORIST_ORDER_OFFERS_URL',
    ).replace(/\/+$/, '');

    const locked = await this.prisma.orderOffer.updateMany({
      where: {
        id: orderOfferId,
        notificationSentAt: null,
        OR: [
          { notificationLastAttemptAt: null },
          { notificationLastAttemptAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
        ],
      },
      data: {
        notificationAttempts: { increment: 1 },
        notificationLastAttemptAt: new Date(),
        notificationLastError: null,
      },
    });
    if (locked.count !== 1) return;

    const offer = await this.prisma.orderOffer.findUnique({
      where: { id: orderOfferId },
      include: {
        florist: {
          select: {
            name: true,
            users: {
              where: {
                role: UserRole.FLORIST,
                active: true,
              },
              select: {
                email: true,
                firstName: true,
              },
            },
          },
        },
        order: {
          select: {
            deliveryDate: true,
            deliveryTimeSlot: true,
            items: {
              select: {
                name: true,
                description: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      this.logger.warn(
        `Order offer ${orderOfferId} not found; notification skipped.`,
      );
      return;
    }

    if (offer.florist.users.length === 0) {
      this.logger.warn(
        `No active florist administrators found for offer ${orderOfferId}.`,
      );
      await this.markFailure(orderOfferId, 'A florista não tem administradores ativos.');
      return;
    }

    const deliveryDate = new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Lisbon',
    }).format(offer.order.deliveryDate);

    const expiresAt = new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Lisbon',
    }).format(offer.expiresAt);

    const timeSlotLabels: Record<DeliveryTimeSlot, string> = {
      MORNING: 'Manhã',
      AFTERNOON: 'Tarde',
      EVENING: 'Final do dia',
    };

    const itemsHtml = offer.order.items
      .map((item) => {
        const description = item.description
          ? `<p style="margin:4px 0 0;color:#66705F;font-size:13px;line-height:1.5;">${this.escapeHtml(item.description)}</p>`
          : '';

        return `
          <div style="padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid #D6DEC8;">
            <p style="margin:0;font-size:14px;line-height:1.5;">
              <strong>${this.escapeHtml(item.name)}</strong>
              <span> — ${item.quantity} un.</span>
            </p>
            ${description}
          </div>
        `;
      })
      .join('');

    const proposalUrl = `${portalOffersUrl}/${offer.id}`;

    const variables: Record<string, string> = {
      FLORIST_ADMIN_NAME: '',
      DELIVERY_DATE: deliveryDate,
      DELIVERY_TIME_SLOT:
        timeSlotLabels[offer.order.deliveryTimeSlot],
      EXPIRES_AT: expiresAt,
      ITEMS_HTML: itemsHtml,
      OFFER_PRICE: new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
      }).format(Number(offer.price)),
      ACCEPT_URL: proposalUrl,
      DECLINE_URL: proposalUrl,
    };

    const results = await Promise.allSettled(
      offer.florist.users.map((admin) =>
        this.emailService.sendEmail({
          to: admin.email,
          templateId,
          variables: {
            ...variables,
            FLORIST_ADMIN_NAME: this.escapeHtml(admin.firstName),
          },
        }),
      ),
    );

    const failures = results.filter(
      (result) => result.status === 'rejected',
    );

    if (failures.length > 0) {
      this.logger.error(
        `Failed to send ${failures.length} of ${results.length} notifications for order offer ${orderOfferId}.`,
      );
      await this.markFailure(
        orderOfferId,
        `Falharam ${failures.length} de ${results.length} emails.`,
      );
    } else {
      await this.prisma.orderOffer.update({
        where: { id: orderOfferId },
        data: {
          notificationSentAt: new Date(),
          notificationLastError: null,
        },
      });
    }

    this.logger.log(
      `Order offer ${orderOfferId}: ${results.length - failures.length}/${results.length} notification emails sent.`,
    );
  }

  private async markFailure(orderOfferId: number, message: string): Promise<void> {
    await this.prisma.orderOffer.updateMany({
      where: { id: orderOfferId, notificationSentAt: null },
      data: { notificationLastError: message.slice(0, 1000) },
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
