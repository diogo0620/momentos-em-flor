import type {
    FloristOrderOfferStatus,
} from "./florist-order-offer-status";

export type FloristOrderOfferListOrder = {
    deliveryDate: string;
    deliveryTimeSlot: string;
    deliveryDistrict: string;
    deliveryCity: string;
};

export type FloristOrderOfferList = {
    id: number;
    order: FloristOrderOfferListOrder;
    status: FloristOrderOfferStatus;
    price: number;
    distanceKm: number;
    expiresAt: Date;
    createdAt: Date;
};