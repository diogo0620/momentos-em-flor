import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { UpsertCouponDto } from './dtos/upsert-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({ orderBy: [{ active: 'desc' }, { createdAt: 'desc' }] });
  }

  async create(dto: UpsertCouponDto) {
    return this.prisma.coupon.create({ data: this.toData(dto) });
  }

  async update(id: number, dto: UpsertCouponDto) {
    return this.prisma.coupon.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: number) {
    await this.prisma.coupon.update({ where: { id }, data: { active: false } });
  }

  async validate(code: string, customerId: number, orderAmount: number) {
    const normalizedCode = code.trim().toUpperCase();
    const now = new Date();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
      include: { _count: { select: { redemptions: true } } },
    });

    if (!coupon || !coupon.active) throw new NotFoundException('Cupão inválido.');
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('Este cupão ainda não está disponível.');
    if (coupon.expiresAt && coupon.expiresAt <= now) throw new BadRequestException('Este cupão já expirou.');
    if (coupon.minimumOrderAmount && orderAmount < Number(coupon.minimumOrderAmount)) {
      throw new BadRequestException(`Este cupão requer um valor mínimo de ${Number(coupon.minimumOrderAmount).toFixed(2)} EUR.`);
    }
    if (coupon.maximumRedemptions && coupon._count.redemptions >= coupon.maximumRedemptions) {
      throw new BadRequestException('Este cupão atingiu o limite de utilizações.');
    }
    const customerUses = await this.prisma.couponRedemption.count({ where: { couponId: coupon.id, customerId } });
    if (customerUses >= coupon.maximumRedemptionsPerCustomer) {
      throw new BadRequestException('Já utilizou este cupão o número máximo de vezes permitido.');
    }

    const rawDiscount = coupon.type === DiscountType.PERCENTAGE
      ? orderAmount * Number(coupon.value) / 100
      : Number(coupon.value);
    const cappedDiscount = coupon.maximumDiscountAmount
      ? Math.min(rawDiscount, Number(coupon.maximumDiscountAmount))
      : rawDiscount;
    const discount = Number(Math.min(cappedDiscount, orderAmount).toFixed(2));

    return { coupon, code: normalizedCode, discount, total: Number((orderAmount - discount).toFixed(2)) };
  }

  private toData(dto: UpsertCouponDto): Prisma.CouponUncheckedCreateInput {
    return {
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      type: dto.type,
      value: dto.value,
      minimumOrderAmount: dto.minimumOrderAmount ?? null,
      maximumDiscountAmount: dto.maximumDiscountAmount ?? null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      maximumRedemptions: dto.maximumRedemptions ?? null,
      maximumRedemptionsPerCustomer: dto.maximumRedemptionsPerCustomer ?? 1,
      active: dto.active ?? true,
    };
  }
}
