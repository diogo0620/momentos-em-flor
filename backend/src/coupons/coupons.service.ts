import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponDiscountApplication, DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { UpsertCouponDto } from './dtos/upsert-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({ include: { _count: { select: { redemptions: true } } }, orderBy: [{ active: 'desc' }, { createdAt: 'desc' }] });
  }

  async create(dto: UpsertCouponDto) {
    return this.prisma.coupon.create({ data: this.toData(dto) });
  }

  async update(id: number, dto: UpsertCouponDto) {
    return this.prisma.coupon.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id }, include: { _count: { select: { redemptions: true } } } });
    if (!coupon) throw new NotFoundException('Cupão não encontrado.');
    if (coupon._count.redemptions > 0) throw new BadRequestException('Não é possível eliminar um cupão que já foi utilizado. Pode desativá-lo na edição.');
    await this.prisma.coupon.delete({ where: { id } });
  }

  async validate(code: string, customerId: number, subtotal: number, deliveryFee: number) {
    const normalizedCode = code.trim().toUpperCase();
    const now = new Date();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
      include: { _count: { select: { redemptions: true } } },
    });

    if (!coupon || !coupon.active) throw new NotFoundException('Cupão inválido.');
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('Este cupão ainda não está disponível.');
    if (coupon.expiresAt && coupon.expiresAt <= now) throw new BadRequestException('Este cupão já expirou.');
    const orderAmount = Number((subtotal + deliveryFee).toFixed(2));
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

    const eligibleAmount = coupon.discountApplication === CouponDiscountApplication.PRODUCT_LINES
      ? subtotal
      : coupon.discountApplication === CouponDiscountApplication.DELIVERY_FEE
        ? deliveryFee
        : orderAmount;
    const rawDiscount = coupon.type === DiscountType.PERCENTAGE
      ? eligibleAmount * Number(coupon.value) / 100
      : Number(coupon.value);
    const cappedDiscount = coupon.maximumDiscountAmount
      ? Math.min(rawDiscount, Number(coupon.maximumDiscountAmount))
      : rawDiscount;
    const discount = Number(Math.min(cappedDiscount, eligibleAmount).toFixed(2));

    return { coupon, code: normalizedCode, discount, total: Number((orderAmount - discount).toFixed(2)) };
  }

  private toData(dto: UpsertCouponDto): Prisma.CouponUncheckedCreateInput {
    return {
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      type: dto.type,
      discountApplication:
        dto.discountApplication ?? CouponDiscountApplication.PRODUCT_LINES,
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
