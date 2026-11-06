import { BaseApi } from "../common/base-api";

import type {
    FloristOrderDetail,
} from "@/types/orders/florist/florist-order-detail";

import type {
    FloristOrderList,
} from "@/types/orders/florist/florist-order-list";
import { apiFetch } from "../common/client";

class FloristOrdersApi extends BaseApi<
    FloristOrderDetail,
    FloristOrderList,
    never,
    never
> {
    constructor() {
        super("/florist/orders");
    }

    async startProduction(id: number): Promise<void> {
        return apiFetch<void>(`${this.endpoint}/${id}/start-production`, {
            method: "POST",
        });
    }

    async setReadyForDelivery(id: number): Promise<void> {
        return apiFetch<void>(`${this.endpoint}/${id}/ready-for-delivery`, {
            method: "POST",
        });
    }

    async deliver(id: number): Promise<void> {
        return apiFetch<void>(`${this.endpoint}/${id}/deliver`, {
            method: "POST",
        });
    }
}

export const floristOrdersApi = new FloristOrdersApi();
