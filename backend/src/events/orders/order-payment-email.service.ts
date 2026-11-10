import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliveryTimeSlot, OrderItemType, PaymentStatus } from '@prisma/client';

import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

@Injectable()
export class OrderPaymentEmailService {
  private readonly logger = new Logger(OrderPaymentEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async send(orderId: number): Promise<void> {
    const retryBefore = new Date(Date.now() - 15 * 60 * 1000);
    const locked = await this.prisma.payment.updateMany({
      where: {
        orderId,
        status: PaymentStatus.PAID,
        confirmationEmailSentAt: null,
        OR: [
          { confirmationEmailLastAttemptAt: null },
          { confirmationEmailLastAttemptAt: { lt: retryBefore } },
        ],
      },
      data: {
        confirmationEmailAttempts: { increment: 1 },
        confirmationEmailLastAttemptAt: new Date(),
        confirmationEmailLastError: null,
      },
    });

    if (locked.count !== 1) return;

    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          orderNumber: true,
          customerFirstName: true,
          customerEmail: true,
          deliveryDate: true,
          deliveryTimeSlot: true,
          total: true,
          items: {
            select: {
              type: true,
              name: true,
              description: true,
              quantity: true,
              imagePath: true,
            },
          },
        },
      });

      if (!order) {
        await this.markFailure(orderId, 'Encomenda não encontrada.');
        return;
      }

      const frontendUrl = this.configService
        .getOrThrow<string>('FRONTEND_URL')
        .replace(/\/+$/, '');
      const timeSlotLabels: Record<DeliveryTimeSlot, string> = {
        MORNING: 'Manhã',
        AFTERNOON: 'Tarde',
        EVENING: 'Final do dia',
      };

      await this.emailService.sendEmail({
        to: order.customerEmail,
        templateId: this.configService.getOrThrow<string>(
          'RESEND_TEMPLATE_ORDER_PAYMENT_CONFIRMATION',
        ),
        variables: {
          CUSTOMER_NAME: this.escapeHtml(order.customerFirstName),
          ORDER_NUMBER: this.escapeHtml(order.orderNumber),
          DELIVERY_DATE: new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Lisbon',
          }).format(order.deliveryDate),
          DELIVERY_TIME_SLOT: timeSlotLabels[order.deliveryTimeSlot],
          TOTAL: new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
          }).format(Number(order.total)),
          ITEMS_HTML: this.buildItemsHtml(order.items, frontendUrl),
          ORDER_URL: `${frontendUrl}/account/orders/${encodeURIComponent(order.orderNumber)}`,
        },
      });

      await this.prisma.payment.updateMany({
        where: { orderId, confirmationEmailSentAt: null },
        data: {
          confirmationEmailSentAt: new Date(),
          confirmationEmailLastError: null,
        },
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Erro desconhecido ao enviar a confirmação de pagamento.';
      this.logger.error(
        `Não foi possível enviar a confirmação da encomenda ${orderId}: ${message}`,
      );
      await this.markFailure(orderId, message);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async recoverPendingConfirmations(): Promise<void> {
    const pending = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PAID,
        confirmationEmailSentAt: null,
      },
      select: { orderId: true },
      orderBy: { updatedAt: 'asc' },
      take: 25,
    });

    for (const payment of pending) {
      await this.send(payment.orderId);
    }
  }

  private buildItemsHtml(
    items: Array<{
      type: OrderItemType;
      name: string;
      description: string | null;
      quantity: number;
      imagePath: string | null;
    }>,
    frontendUrl: string,
  ): string {
    return items.map((item) => {
      const imageUrl = item.type === OrderItemType.DELIVERY_FEE
        ? `${frontendUrl}/images/delivery-fee.svg`
        : item.imagePath
          ? this.storageService.getPublicUrl(item.imagePath)
          : null;
      const image = imageUrl
        ? `<img src="${this.escapeHtml(imageUrl)}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:12px;" />`
        : '';

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid #D6DEC8;">
          <tr>
            ${image ? `<td width="88" valign="top">${image}</td>` : ''}
            <td valign="top">
              <p style="margin:0;font-size:14px;line-height:1.5;"><strong>${this.escapeHtml(item.name)}</strong><span> — ${item.quantity} un.</span></p>
              ${item.description ? `<p style="margin:4px 0 0;color:#66705F;font-size:13px;line-height:1.5;">${this.escapeHtml(item.description)}</p>` : ''}
            </td>
          </tr>
        </table>
      `;
    }).join('');
  }

  private async markFailure(orderId: number, message: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { orderId, confirmationEmailSentAt: null },
      data: { confirmationEmailLastError: message.slice(0, 1000) },
    });
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character]!);
  }
}
