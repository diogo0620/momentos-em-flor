export type FloristCompensationStatus =
    | "PENDING_DELIVERY"
    | "DUE"
    | "PAID"
    | "CANCELLED";

export type FloristCompensation = {
    id: number;
    orderId: number;
    orderNumber: string;
    floristId: number;
    floristName: string;
    amount: number;
    customerTotal?: number;
    platformMargin?: number;
    status: FloristCompensationStatus;
    dueAt: string | null;
    paidAt: string | null;
    paymentReference: string | null;
    paymentNotes: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
};

export type MarkFloristCompensationPaid = {
    paymentReference: string;
    paymentNotes?: string;
};
