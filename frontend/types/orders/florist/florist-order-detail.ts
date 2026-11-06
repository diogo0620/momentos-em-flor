import type {
    FloristDeliveryTimeSlot,
    FloristOrderItemType,
    FloristOrderStatus,
    FloristProductVariantType,
} from "./florist-order-status";

export type FloristOrderItemComponent = {
    id: number;
    componentName: string;
    quantity: number;
};

export type FloristOrderItem = {
    id: number;
    type: FloristOrderItemType;
    name: string;
    description: string | null;
    variantType: FloristProductVariantType | null;
    variantName: string | null;
    quantity: number;
    components: FloristOrderItemComponent[];
};

export type FloristOrderDetail = {
    id: number;
    orderNumber: string;
    status: FloristOrderStatus;
    price: number;

    deliveryDate: string;
    deliveryTimeSlot: FloristDeliveryTimeSlot;

    recipientFirstName: string;
    recipientLastName: string | null;
    recipientPhone: string | null;

    deliveryStreet: string;
    deliveryStreetNumber: string;
    deliveryStreet2: string | null;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;

    deliveryInstructions: string | null;
    cardMessage: string | null;

    items: FloristOrderItem[];

    paidAt: string | null;
    assignedAt: string | null;
    inProductionAt: string | null;
    readyForDeliveryAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;

    createdAt: string;
    updatedAt: string;
};