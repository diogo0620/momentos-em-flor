import type { CustomerOrderStatus } from "@/lib/orders/customer-order-status";

export type CustomerOrderList = {
  id: number;
  orderNumber: string;
  total : number;
  status: CustomerOrderStatus;
  createdAt: Date;
}

export type { CustomerOrderStatus };
