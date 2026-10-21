export type AdminOrderStatus =
    | 'CREATED'
    | 'PENDING_PAYMENT'
    | 'WAITING_FOR_FLORISTS'
    | 'ASSIGNED'
    | 'IN_PRODUCTION'
    | 'READY_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';

export type AdminDeliveryTimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export type AdminOccasion =
    | 'BIRTHDAY'
    | 'ANNIVERSARY'
    | 'LOVE'
    | 'WEDDING'
    | 'FUNERAL'
    | 'NEW_BABY'
    | 'MOTHERS_DAY'
    | 'FATHERS_DAY'
    | 'CHRISTMAS'
    | 'OTHER';

export type AdminOrderCancellationReason =
    | 'NO_FLORIST_AVAILABLE'
    | 'CUSTOMER_REQUEST'
    | 'ADMIN_REQUEST'
    | 'PAYMENT_FAILED'
    | 'OTHER';

export type AdminOrderItemType = 'PRODUCT' | 'DELIVERY_FEE';

export type AdminOrderOfferStatus =
    | 'PENDING'
    | 'VIEWED'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'EXPIRED'
    | 'CANCELLED';

export type AdminPaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';

export type AdminProductVariantType = 'SIZE';
