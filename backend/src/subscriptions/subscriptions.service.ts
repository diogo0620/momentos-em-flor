import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FloristSubscriptionStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { StripeService } from '@/payments/stripe.service';
import { UpsertSubscriptionPlanDto } from './dtos/upsert-subscription-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService, private readonly config: ConfigService) {}

  plans() { return this.prisma.floristSubscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }); }
  adminPlans() { return this.prisma.floristSubscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { subscriptions: true } } } }); }
  createPlan(dto: UpsertSubscriptionPlanDto) { return this.prisma.floristSubscriptionPlan.create({ data: this.planData(dto) }); }
  updatePlan(id: number, dto: UpsertSubscriptionPlanDto) { return this.prisma.floristSubscriptionPlan.update({ where: { id }, data: this.planData(dto) }); }

  async current(floristId: number) {
    return this.prisma.floristSubscription.findFirst({ where: { floristId }, include: { plan: true }, orderBy: { createdAt: 'desc' } });
  }

  async selectPlan(floristId: number, userEmail: string, planId: number) {
    const plan = await this.prisma.floristSubscriptionPlan.findFirst({ where: { id: planId, active: true } });
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    const current = await this.current(floristId);
    if (plan.free) {
      if (current?.stripeSubscriptionId && ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(current.status)) {
        await this.stripe.cancelSubscription(current.stripeSubscriptionId);
      }
      await this.prisma.$transaction(async (tx) => {
        await tx.floristSubscription.updateMany({ where: { floristId, endedAt: null }, data: { status: FloristSubscriptionStatus.CANCELLED, endedAt: new Date() } });
        await tx.floristSubscription.create({ data: { floristId, planId: plan.id, status: FloristSubscriptionStatus.FREE } });
      });
      return { free: true };
    }
    if (!plan.stripePriceId) throw new BadRequestException('Este plano ainda não está configurado para pagamento.');
    if (current?.stripeSubscriptionId && ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(current.status)) {
      throw new BadRequestException('Utilize o portal de faturação para gerir a subscrição atual.');
    }
    const frontend = this.config.getOrThrow<string>('FRONTEND_URL');
    const session = await this.stripe.createCheckoutSession({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${frontend}/florist/subscription?success=1`,
      cancel_url: `${frontend}/florist/subscription?cancelled=1`,
      metadata: { floristId: String(floristId), planId: String(plan.id) },
      subscription_data: { metadata: { floristId: String(floristId), planId: String(plan.id) } },
    });
    return { free: false, checkoutUrl: session.url, currentPlan: current?.plan.code };
  }

  async billingPortal(floristId: number) {
    const current = await this.current(floristId);
    if (!current?.stripeCustomerId) throw new BadRequestException('Esta subscrição não tem faturação Stripe associada.');
    const frontend = this.config.getOrThrow<string>('FRONTEND_URL');
    const session = await this.stripe.createBillingPortalSession(current.stripeCustomerId, `${frontend}/florist/subscription`);
    return { url: session.url };
  }

  private planData(dto: UpsertSubscriptionPlanDto) {
    const free = dto.free ?? dto.monthlyPrice === 0;
    if (!free && !dto.stripePriceId?.trim()) throw new BadRequestException('Os planos pagos precisam do ID de preço Stripe.');
    return { code: dto.code.trim().toUpperCase(), name: dto.name.trim(), description: dto.description?.trim() || null, monthlyPrice: dto.monthlyPrice, currency: (dto.currency ?? 'EUR').toUpperCase(), stripePriceId: free ? null : dto.stripePriceId!.trim(), free, active: dto.active ?? true, sortOrder: dto.sortOrder ?? 0 };
  }
}
