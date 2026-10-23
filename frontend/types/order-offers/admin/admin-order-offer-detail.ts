export type AdminOrderOfferDetail = {
    id: number;
    order: OrderOfferOrder;
    florist: OrderOfferFlorist;
    price: number;
    status: OrderOfferStatus;
    distanceKm?: number;
    viewedAt?: Date;
    acceptedAt? : Date;
    declinedAt? : Date;
    expiresAt: Date;
    declineReason? : string;
    createdAt: Date;
    updatedAt: Date;
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


