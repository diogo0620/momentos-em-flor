import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryTimeSlot, OrderItemType, OrderStatus, ProductVariantType } from '@prisma/client';

import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';
import { formatOrderItemConfiguration } from './order-item-configuration';

@Injectable()
export class OrderStatusEmailService {
  private readonly logger = new Logger(OrderStatusEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async send(orderId: number, status: OrderStatus): Promise<void> {
    if (
      status !== OrderStatus.READY_FOR_DELIVERY &&
      status !== OrderStatus.DELIVERED
    ) return;

    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          orderNumber: true,
          customerFirstName: true,
          customerEmail: true,
          deliveryDate: true,
          deliveryTimeSlot: true,
          items: {
            select: {
              type: true,
              name: true,
              variantType: true,
              variantName: true,
              quantity: true,
              imagePath: true,
              components: { select: { componentName: true, quantity: true } },
            },
          },
        },
      });

      if (!order) return;

      const frontendUrl = this.configService
        .getOrThrow<string>('FRONTEND_URL')
        .replace(/\/+$/, '');
      const orderUrl = `${frontendUrl}/account/orders/${encodeURIComponent(order.orderNumber)}`;
      const timeSlotLabels: Record<DeliveryTimeSlot, string> = {
        MORNING: 'Manhã',
        AFTERNOON: 'Tarde',
        EVENING: 'Final do dia',
      };

      await this.emailService.sendEmail({
        to: order.customerEmail,
        templateId: this.configService.getOrThrow<string>(
          status === OrderStatus.DELIVERED
            ? 'RESEND_TEMPLATE_ORDER_DELIVERY_CONFIRMATION'
            : 'RESEND_TEMPLATE_ORDER_OUT_FOR_DELIVERY',
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
          ITEMS_HTML: this.buildItemsHtml(order.items),
          ORDER_URL: orderUrl,
          REVIEW_URL: `${orderUrl}#avaliacao`,
        },
      });
    } catch (error) {
      this.logger.error(
        `Não foi possível enviar o email do estado ${status} para a encomenda ${orderId}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }
  }

  private buildItemsHtml(items: Array<{
    type: OrderItemType;
    name: string;
    variantType: ProductVariantType | null;
    variantName: string | null;
    quantity: number;
    imagePath: string | null;
    components: Array<{ componentName: string; quantity: number }>;
  }>): string {
    return items.filter((item) => item.type !== OrderItemType.DELIVERY_FEE).map((item) => {
      const image = item.imagePath
        ? `<img src="${this.escapeHtml(this.storageService.getPublicUrl(item.imagePath))}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:12px;" />`
        : '';

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid #D6DEC8;">
          <tr>
            ${image ? `<td width="88" valign="top">${image}</td>` : ''}
            <td valign="top">
              <p style="margin:0;font-size:14px;line-height:1.5;"><strong>${this.escapeHtml(item.name)}</strong><span> — ${item.quantity} un.</span></p>
              ${this.configurationHtml(item)}
            </td>
          </tr>
        </table>
      `;
    }).join('');
  }

  private configurationHtml(item: Parameters<typeof formatOrderItemConfiguration>[0]): string {
    const configuration = formatOrderItemConfiguration(item);
    return configuration
      ? `<p style="margin:4px 0 0;color:#66705F;font-size:13px;line-height:1.5;">${this.escapeHtml(configuration)}</p>`
      : '';
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
