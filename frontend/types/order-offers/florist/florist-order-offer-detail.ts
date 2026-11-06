import type {
    FloristOrderOfferCancellationReason,
    FloristOrderOfferDeclineReason,
    FloristOrderOfferStatus,
} from "./florist-order-offer-status";

export type FloristOrderOfferItem = {
    id: number;
    name: string;
    description: string | null;
    variantName: string | null;
    quantity: number;
};

export type FloristOrderOfferDetailOrder = {

    deliveryDate: string;
    deliveryTimeSlot: string;
    deliveryDistrict: string;
    deliveryCity: string;
    
    items: FloristOrderOfferItem[];
};

export type FloristOrderOfferDetail = {
    id: number;
    order: FloristOrderOfferDetailOrder;

    status: FloristOrderOfferStatus;
    price: number;
    distanceKm: number;

    acceptedAt: string | null;
    declinedAt: string | null;
    cancelledAt: string | null;
    expiresAt: string;

    declineReason: FloristOrderOfferDeclineReason | null;
    declineReasonDetails: string | null;

    cancellationReason: FloristOrderOfferCancellationReason | null;
    cancellationReasonDetails: string | null;

    createdAt: string;
    updatedAt: string;
};