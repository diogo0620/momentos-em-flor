export type OrderStatus =
    | "CREATED"
    | "WAITING_FOR_FLORISTS"
    | "ASSIGNED"
    | "IN_PRODUCTION"
    | "READY_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export type OrderStatusHistory = {
    id: number;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedByUserId: number | null;
    changedByUser: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: "SYSTEM_ADMIN" | "FLORIST" | "CUSTOMER";
    } | null;
    reason: string | null;
    createdAt: string;
};

export type OrderItem = {
    id: number;

    productId: number | null;

    name: string;

    description: string | null;

    variantId: number | null;

    variantType: string | null;

    variantName: string | null;

    quantity: number;

    unitPrice: number;

    netAmount: number;

    taxRate: number;

    taxAmount: number;

    grossAmount: number;

    taxCodeId: number | null;
};

export type OrderOffer = {
    id: number;

    florist: {
        id: number;
        name: string;
    };

    price: number;
    status: string;

    viewedAt: string | null;
    acceptedAt: string | null;
    declinedAt: string | null;
    expiresAt: string;
    declineReason: string | null;

    items: {
        id: number;
        orderItemId: number;
        productId: number;
        productName: string;
        quantity: number;
        unitCompensation: number;
        totalCompensation: number;
    }[];

    createdAt: string;
    updatedAt: string;
};

export type Order = {
    id: number;
    orderNumber: string;

    customerId: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;

    recipientFirstName: string;
    recipientLastName: string | null;
    recipientPhone: string | null;

    occasion: string | null;

    deliveryDate: string;
    deliveryTimeSlot: string;
    deliveryInstructions: string | null;

    deliveryStreet: string;
    deliveryStreet2: string | null;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    deliveryLatitude: number;
    deliveryLongitude: number;

    cardMessage: string | null;

    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;

    status: OrderStatus;

    items: OrderItem[];
    offers: OrderOffer[];
    statusHistory: OrderStatusHistory[];

    createdAt: string;
    updatedAt: string;
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};

export type CreateOrderItem = {
    productId: number;
    quantity: number;
    variantId?: number;
    components?: {
        componentId: number;
        quantity: number;
    }[];
};

export type CreateOrder = {
    items: CreateOrderItem[];

    // Customer / Guest checkout
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;

    // Recipient
    recipientFirstName: string;
    recipientLastName?: string;
    recipientPhone?: string;

    occasion?:
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

    // Delivery
    deliveryDate: string;

    deliveryTimeSlot:
        | "MORNING"
        | "AFTERNOON"
        | "EVENING";

    deliveryInstructions?: string;

    // Delivery address
    deliveryStreet: string;
    deliveryStreet2?: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    // Card
    cardMessage?: string;
};