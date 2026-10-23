export type AdminOrderOfferList = {
    id: number;
    order: OrderOfferOrder;
    florist: OrderOfferFlorist;
    price: number;
    status: OrderOfferStatus;
}

export type OrderOfferOrder = {
    id: number;
    orderNumber: string;
}

export type OrderOfferFlorist = {
    id: number;
    name: string;
}

export type OrderOfferStatus = "PENDING"
  | "VIEWED"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"