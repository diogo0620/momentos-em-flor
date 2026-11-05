import { Prisma } from '@prisma/client';

export const floristCompensationInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      total: true,
    },
  },
  florist: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.FloristCompensationInclude;

export type FloristCompensationWithRelations =
  Prisma.FloristCompensationGetPayload<{
    include: typeof floristCompensationInclude;
  }>;

export function toFloristCompensationResponse(
  compensation: FloristCompensationWithRelations,
) {
  return {
    id: compensation.id,
    orderId: compensation.order.id,
    orderNumber: compensation.order.orderNumber,
    floristId: compensation.florist.id,
    floristName: compensation.florist.name,
    amount: Number(compensation.amount),
    status: compensation.status,
    dueAt: compensation.dueAt,
    paidAt: compensation.paidAt,
    paymentReference: compensation.paymentReference,
    paymentNotes: compensation.paymentNotes,
    cancelledAt: compensation.cancelledAt,
    cancellationReason: compensation.cancellationReason,
    createdAt: compensation.createdAt,
    updatedAt: compensation.updatedAt,
  };
}

export function toAdminFloristCompensationResponse(
  compensation: FloristCompensationWithRelations,
) {
  const customerTotal = Number(compensation.order.total);
  const floristAmount = Number(compensation.amount);

  return {
    ...toFloristCompensationResponse(compensation),
    customerTotal,
    platformMargin: Number((customerTotal - floristAmount).toFixed(2)),
  };
}

export function getCompensationSort(sort: string): string {
  const allowed = new Set([
    'id',
    'amount',
    'status',
    'dueAt',
    'paidAt',
    'createdAt',
  ]);

  return allowed.has(sort) ? sort : 'createdAt';
}
