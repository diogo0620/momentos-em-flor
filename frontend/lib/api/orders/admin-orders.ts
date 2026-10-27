

import { AdminOrderList } from "@/types/orders/admin/admin-order-list";
import { BaseApi } from "../common/base-api";
import { AdminOrderDetail } from "@/types/orders/admin/admin-order-detail";
import { apiFetch } from "../common/client";
import { AdminCancelOrder } from "@/types/orders/admin/admin-cancel-order";

class AdminOrdersApi extends BaseApi<
    AdminOrderDetail,
    AdminOrderList,
    null,
    null
> {
    constructor() {
        super("/admin/orders");
    }

    startProduction(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/start-production`,
            { method: "POST" },
        );
    }

    setReadyForDelivery(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/ready-for-delivery`,
            { method: "POST" },
        );
    }

    deliver(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/deliver`,
            { method: "POST" },
        );
    }

    cancel(
        id: number,
        data: AdminCancelOrder,
    ): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}/cancel`,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );
    }

}



export const adminOrdersApi = new AdminOrdersApi();