import { AdminOrderOfferDeclineReason } from "./admin-order-offer-detail";

export type AdminDeclineOrderOffer = {
    declineReason: AdminOrderOfferDeclineReason;
    declineReasonDetails: string;
};