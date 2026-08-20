export type OrderOfferStatus =
    | "PENDING"
    | "VIEWED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED";

export interface OrderOfferItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
}

export interface OrderOfferAddress {
    street: string;
    street2: string | null;
    postalCode: string;
    city: string;
    district: string;
    countryCode: string;
}

export interface OrderOfferOrder {
    id: number;
    orderNumber: string;
    occasion:
        | "BIRTHDAY"
        | "ANNIVERSARY"
        | "LOVE"
        | "WEDDING"
        | "FUNERAL"
        | "NEW_BABY"
        | "MOTHERS_DAY"
        | "FATHERS_DAY"
        | "CHRISTMAS"
        | "OTHER"
        | null;
    deliveryDate: string;
    deliveryTimeSlot:
        | "MORNING"
        | "AFTERNOON"
        | "EVENING";
    deliveryAddress: OrderOfferAddress;
}

export interface OrderOffer {
    id: number;
    floristId: number;

    distanceKm: number;

    compensationAmount: number;

    status: OrderOfferStatus;

    viewedAt: string | null;
    acceptedAt: string | null;
    declinedAt: string | null;

    expiresAt: string;

    declineReason: string | null;

    order: OrderOfferOrder;

    items: OrderOfferItem[];

    createdAt: string;
    updatedAt: string;
}