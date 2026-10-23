

/**
 * Representa uma linha da encomenda devolvida pela API de cliente.
 * Corresponde a CustomerOrderItemResponseDto no backend.
 */
export type CustomerOrderItemDetail = {
    id: number;
    productId?: number | null;
    productName: string;
    description: string | null;
    image: string | null;
    quantity: number;
    unitPrice: number;
    netAmount: number;
    taxRate: number;
    taxAmount: number;
    grossAmount: number;
    taxCodeId?: number | null;
}

/**
 * Representa os detalhes de uma encomenda devolvida pela API de cliente.
 * Corresponde a CustomerOrderResponseDto no backend.
 */
export type CustomerOrderDetail = {
    id: number;
    orderNumber: string;
    customerTaxNumber?: string | null;

    recipientFirstName: string;
    recipientLastName?: string | null;
    recipientPhone?: string | null;
    occasion?: Occasion | null;

    deliveryDate: string;
    deliveryTimeSlot: DeliveryTimeSlot;
    deliveryInstructions?: string | null;

    deliveryStreet: string;
    deliveryStreetNumber: string;
    deliveryStreet2?: string | null;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    cardMessage?: string | null;

    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    discount: number;
    total: number;

    status: CustomerOrderStatus;
    items: CustomerOrderItemDetail[];

    createdAt: string;
    cancelledAt?: string | null;
    cancellationReason?: string | null;
}

export type CustomerOrderStatus =  
    "CREATED" |
  "PENDING_PAYMENT" |
  "WAITING_FOR_FLORISTS" |
  "ASSIGNED" |
  "IN_PRODUCTION" |
  "READY_FOR_DELIVERY" |
  "DELIVERED" |
  "CANCELLED" 

export type Occasion =
    | "BIRTHDAY"
    | "ANNIVERSARY"
    | "LOVE"
    | "WEDDING"
    | "FUNERAL"
    | "NEW_BABY"
    | "MOTHERS_DAY"
    | "FATHERS_DAY"
    | "CHRISTMAS"
    | "OTHER";

export type DeliveryTimeSlot =
    | "MORNING"
    | "AFTERNOON"
    | "EVENING";
