import { AdminDeliveryTimeSlot, AdminOccasion, AdminOrderCancellationReason, AdminOrderItemType, AdminOrderOfferStatus, AdminOrderStatus, AdminProductVariantType } from "./admin-order-status";


export type AdminOrderFlorist = {
    id: number;
    name: string;
};

export type AdminOrderTaxCode = {
    id: number;
    name: string;
};

export type AdminOrderProduct = {
    id: number;
    name: string;
};

export type AdminOrderItemComponent = {
    id: number;
    orderItemId: number;
    componentId: number;
    componentName: string;
    quantity: number;
    additionalUnits: number;
    customerPricePerAdditionalUnit: number;
    customerTotalPrice: number;
};

export type AdminOrderItem = {
    id: number;
    orderId: number;
    productId: number | null;
    type: AdminOrderItemType;
    name: string;
    description: string | null;
    variantId: number | null;
    variantType: AdminProductVariantType | null;
    variantName: string | null;
    quantity: number;
    customerPrice: number;
    floristPrice: number;
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
    taxCodeId: number | null;
    taxRate: number | null;
    taxCode: AdminOrderTaxCode | null;
    product: AdminOrderProduct | null;
    components: AdminOrderItemComponent[];
};

export type AdminOrderOffer = {
    id: number;
    orderId: number;
    floristId: number;
    price: number;
    status: AdminOrderOfferStatus;
    distanceKm: number;
    viewedAt: string | null;
    acceptedAt: string | null;
    declinedAt: string | null;
    expiresAt: string;
    declineReason: string | null;
    createdAt: string;
    updatedAt: string;
    florist: AdminOrderFlorist;
};

export type AdminOrderTaxTotal = {
    id: number;
    orderId: number;
    taxCodeId: number;
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
    createdAt: string;
    updatedAt: string;
    taxCode: AdminOrderTaxCode;
};

export type AdminOrder = {
    id: number;
    orderNumber: string;
    status: AdminOrderStatus;

    customerId: number | null;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;
    customerTaxNumber: string | null;

    assignedFlorist: AdminOrderFlorist | null;

    recipientFirstName: string;
    recipientLastName: string | null;
    recipientPhone: string | null;
    occasion: AdminOccasion | null;

    deliveryDate: string;
    deliveryTimeSlot: AdminDeliveryTimeSlot;
    deliveryInstructions: string | null;
    deliveryStreet: string;
    deliveryStreetNumber: string;
    deliveryStreet2: string | null;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    cardMessage: string | null;
    notes: string | null;

    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    discount: number;
    total: number;

    assignedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: AdminOrderCancellationReason | null;

    items: AdminOrderItem[];
    offers: AdminOrderOffer[];
    taxTotals: AdminOrderTaxTotal[];

    createdAt: string;
    updatedAt: string;
};

export type AdminOrderDetail = AdminOrder;
