import type {
    CreateOrder,
    Order
} from "@/types/order";

import { BaseApi } from "./common/base-api";
import { apiFetch } from "./common/client";

class OrdersApi extends BaseApi<
    Order,
    CreateOrder
> {
    constructor() {
        super("/orders");
    }

    async startProduction(
        id: number,
    ) {
        return apiFetch<{
            success: boolean;
            data: Order;
        }>(
            `${this.endpoint}/${id}/start-production`,
            {
                method: "POST",
            },
        );
    }

    async readyForDelivery(
        id: number,
    ) {
        return apiFetch<{
            success: boolean;
            data: Order;
        }>(
            `${this.endpoint}/${id}/ready-for-delivery`,
            {
                method: "POST",
            },
        );
    }

    async deliverOrder(
        id: number,
    ) {
        return apiFetch<{
            success: boolean;
            data: Order;
        }>(
            `${this.endpoint}/${id}/deliver`,
            {
                method: "POST",
            },
        );
    }
}

export const ordersApi =
    new OrdersApi();