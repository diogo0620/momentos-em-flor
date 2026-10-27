export type FloristOrderStatus =
    | "CREATED"
    | "PENDING_PAYMENT"
    | "WAITING_FOR_FLORISTS"
    | "ASSIGNED"
    | "IN_PRODUCTION"
    | "READY_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export type FloristDeliveryTimeSlot =
    | "MORNING"
    | "AFTERNOON"
    | "EVENING";

export type FloristOrderItemType =
    | "PRODUCT"
    | "DELIVERY_FEE";

export type FloristProductVariantType = "SIZE";