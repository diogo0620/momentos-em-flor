import { BaseApi } from "../common/base-api";
import { apiFetch } from "../common/client";

import type {
    FloristOrderOfferDetail,
} from "@/types/order-offers/florist/florist-order-offer-detail";

import type {
    FloristOrderOfferList,
} from "@/types/order-offers/florist/florist-order-offer-list";

import type {
    FloristDeclineOrderOffer,
} from "@/types/order-offers/florist/florist-decline-order-offer";

class FloristOrderOffersApi extends BaseApi<
    FloristOrderOfferDetail,
    FloristOrderOfferList,
    never,
    never
> {
    constructor() {
        super("/florist/order-offers");
    }

    async accept(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/accept`,
            {
                method: "POST",
            },
        );
    }

    async decline(
        id: number,
        dto: FloristDeclineOrderOffer,
    ): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/decline`,
            {
                method: "POST",
                body: JSON.stringify(dto),
            },
        );
    }
}

export const floristOrderOffersApi =
    new FloristOrderOffersApi();