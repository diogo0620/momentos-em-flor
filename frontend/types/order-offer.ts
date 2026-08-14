

export type OrderOfferStatus =
    | "PENDING"
    | "VIEWED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED";

export interface OrderOfferItem {
    id: number;
    orderItemId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitCompensation: number;
    totalCompensation: number;
}

export interface OrderOffer {
    id: number;
    orderId: number;
    floristId: number;
    orderNumber: string;
    compensationAmount: number;
    status: OrderOfferStatus;
    viewedAt: string | null;
    acceptedAt: string | null;
    declinedAt: string | null;
    expiresAt: string;
    declineReason: string | null;
    items: OrderOfferItem[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}