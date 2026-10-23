
import { BaseApi } from "../common/base-api";
import { AdminOrderOfferDetail } from "@/types/order-offers/admin/admin-order-offer-detail";
import { AdminOrderOfferList } from "@/types/order-offers/admin/admin-order-offer-list";
import { AdminCreateOrderOffer } from "@/types/order-offers/admin/admin-create-order-offer";
import { AdminUpdateOrderOffer } from "@/types/order-offers/admin/admin-update-order-offer";




class AdminOrderOffersApi extends BaseApi<
    AdminOrderOfferDetail,
    AdminOrderOfferList,
    AdminCreateOrderOffer,
    AdminUpdateOrderOffer
> {
    constructor() {
        super("/admin/order-offers");
    }

}

export const adminOrderOffersApi = new AdminOrderOffersApi();