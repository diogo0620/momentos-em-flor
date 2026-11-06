export type AdminOrderOfferDetail = {
    id: number;

    order: AdminOrderOfferOrder;
    florist: AdminOrderOfferFlorist;

    price: number;
    status: AdminOrderOfferStatus;
    distanceKm: number | null;

    viewedAt: string | null;
    acceptedAt: string | null;

    declinedAt: string | null;
    declineReason: AdminOrderOfferDeclineReason | null;
    declineReasonDetails: string | null;

    cancelledAt: string | null;
    cancellationReason: AdminOrderOfferCancellationReason | null;
    cancellationReasonDetails: string | null;

    expiresAt: string;
    createdAt: string;
    updatedAt: string;
};

export type AdminOrderOfferOrder = {
    id: number;
    orderNumber: string;
};

export type AdminOrderOfferFlorist = {
    id: number;
    name: string;
};

export type AdminOrderOfferStatus = "PENDING"
  | "VIEWED"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"


  export type AdminOrderOfferDeclineReason =
    | "PRICE_TOO_LOW"
    | "DELIVERY_AREA_NOT_COVERED"
    | "DELIVERY_DATE_UNAVAILABLE"
    | "PRODUCT_UNAVAILABLE"
    | "PRODUCT_SPECIFICATION_UNAVAILABLE"
    | "OTHER";

    export type AdminOrderOfferCancellationReason =
    | "ANOTHER_OFFER_ACCEPTED"
    | "ORDER_CANCELLED"


