import type {
    FloristOrderOfferDeclineReason,
} from "./florist-order-offer-status";

export type FloristDeclineOrderOffer = {
    declineReason: FloristOrderOfferDeclineReason;
    declineReasonDetails: string;
};