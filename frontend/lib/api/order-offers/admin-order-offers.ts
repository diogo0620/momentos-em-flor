
import { BaseApi } from "../common/base-api";
import { AdminOrderOfferDetail } from "@/types/order-offers/admin/admin-order-offer-detail";
import { AdminOrderOfferList } from "@/types/order-offers/admin/admin-order-offer-list";
import { AdminCreateOrderOffer } from "@/types/order-offers/admin/admin-create-order-offer";
import { AdminUpdateOrderOffer } from "@/types/order-offers/admin/admin-update-order-offer";
import { AdminDeclineOrderOffer } from "@/types/order-offers/admin/admin-decline-order-offer";
import { apiFetch } from "../common/client";




class AdminOrderOffersApi extends BaseApi<
    AdminOrderOfferDetail,
    AdminOrderOfferList,
    AdminCreateOrderOffer,
    AdminUpdateOrderOffer
> {
    constructor() {
        super("/admin/order-offers");
    }

    async decline(id: number, dto: AdminDeclineOrderOffer): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/decline`,
            { method: 'POST', body: JSON.stringify({ declineReason: dto.declineReason }) }
        )
    }

    async accept(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/accept`,
            { method: 'POST' }
        )
    }

}

export const adminOrderOffersApi = new AdminOrderOffersApi();