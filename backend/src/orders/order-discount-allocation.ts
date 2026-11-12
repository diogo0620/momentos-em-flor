import { CouponDiscountApplication, OrderItemType } from '@prisma/client';

type DiscountableOrderItem = {
  id: number;
  type: OrderItemType;
  grossAmount: unknown;
};

export function allocateOrderDiscount(
  items: DiscountableOrderItem[],
  discount: number,
  application: CouponDiscountApplication,
): Map<number, number> {
  const eligibleItems = items
    .filter((item) => {
      if (application === CouponDiscountApplication.ALL_LINES) return true;
      if (application === CouponDiscountApplication.DELIVERY_FEE) {
        return item.type === OrderItemType.DELIVERY_FEE;
      }
      return item.type !== OrderItemType.DELIVERY_FEE;
    })
    .filter((item) => Number(item.grossAmount) > 0);
  const grossCents = new Map(
    eligibleItems.map((item) => [item.id, Math.round(Number(item.grossAmount) * 100)]),
  );
  const eligibleTotalCents = [...grossCents.values()].reduce((sum, value) => sum + value, 0);
  const result = new Map<number, number>();
  if (discount <= 0 || eligibleTotalCents <= 0) return result;

  const discountCents = Math.min(Math.round(discount * 100), eligibleTotalCents);
  let remainingCents = discountCents;
  eligibleItems.forEach((item, index) => {
    const itemGrossCents = grossCents.get(item.id)!;
    const allocatedCents = index === eligibleItems.length - 1
      ? remainingCents
      : Math.floor(discountCents * itemGrossCents / eligibleTotalCents);
    const normalizedCents = Math.min(itemGrossCents, remainingCents, allocatedCents);
    if (normalizedCents > 0) result.set(item.id, normalizedCents / 100);
    remainingCents -= normalizedCents;
  });
  return result;
}
