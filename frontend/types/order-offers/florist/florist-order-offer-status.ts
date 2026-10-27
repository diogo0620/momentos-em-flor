export type FloristOrderOfferStatus =
    | "PENDING"
    | "VIEWED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CANCELLED";

export type FloristOrderOfferDeclineReason =
    | "PRICE_TOO_LOW"
    | "DELIVERY_AREA_NOT_COVERED"
    | "DELIVERY_DATE_UNAVAILABLE"
    | "PRODUCT_UNAVAILABLE"
    | "PRODUCT_SPECIFICATION_UNAVAILABLE"
    | "OTHER";

export type FloristOrderOfferCancellationReason =
    | "ANOTHER_OFFER_ACCEPTED"
    | "ORDER_CANCELLED";