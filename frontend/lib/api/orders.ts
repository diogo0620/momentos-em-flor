import { apiFetch } from "@/lib/api/client";

import type {
    Order,
    Pagination,
} from "@/types/order";

/* -------------------------------------------------------------------------- */
/* CREATE ORDER                                                               */
/* -------------------------------------------------------------------------- */

export type CreateOrderItemData = {
    productId: number;
    quantity: number;
};

export type CreateOrderData = {
    items: CreateOrderItemData[];

    // Customer / Guest checkout
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;

    // Recipient
    recipientFirstName: string;
    recipientLastName?: string;
    recipientPhone?: string;

    occasion?:
        | "BIRTHDAY"
        | "ANNIVERSARY"
        | "LOVE"
        | "WEDDING"
        | "FUNERAL"
        | "NEW_BABY"
        | "MOTHERS_DAY"
        | "FATHERS_DAY"
        | "CHRISTMAS"
        | "OTHER";

    // Delivery
    deliveryDate: string;

    deliveryTimeSlot:
        | "MORNING"
        | "AFTERNOON"
        | "EVENING";

    deliveryInstructions?: string;

    // Delivery address
    deliveryStreet: string;
    deliveryStreet2?: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    // Card
    cardMessage?: string;
};

export async function createOrder(
    data: CreateOrderData,
) {
    return apiFetch<{
        success: boolean;
        data: Order;
    }>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/* -------------------------------------------------------------------------- */
/* GET ORDERS                                                                 */
/* -------------------------------------------------------------------------- */

export type OrderListResponse = {
    success: boolean;
    data: Order[];
    pagination: Pagination;
};

export type GetOrdersParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export async function getOrders(
    params: GetOrdersParams = {},
) {
    const searchParams =
        new URLSearchParams();

    if (params.page !== undefined) {
        searchParams.set(
            "page",
            String(params.page),
        );
    }

    if (params.pageSize !== undefined) {
        searchParams.set(
            "pageSize",
            String(params.pageSize),
        );
    }

    if (params.search) {
        searchParams.set(
            "search",
            params.search,
        );
    }

    if (params.sort) {
        searchParams.set(
            "sort",
            params.sort,
        );
    }

    if (params.order) {
        searchParams.set(
            "order",
            params.order,
        );
    }

    const query =
        searchParams.toString();

    return apiFetch<OrderListResponse>(
        `/orders${query ? `?${query}` : ""}`,
    );
}

/* -------------------------------------------------------------------------- */
/* GET ORDER                                                                  */
/* -------------------------------------------------------------------------- */

export async function getOrder(id: number) {
    console.log("GET ORDER - id:", id);

    const result = await apiFetch<{
        success: boolean;
        data: Order;
    }>(`/orders/${id}`);

    console.log("GET ORDER - result:", result);

    return result;
}

/* -------------------------------------------------------------------------- */
/* UPDATE ORDER                                                               */
/* -------------------------------------------------------------------------- */

export async function updateOrder(
    id: number,
    data: Partial<{
        status: Order["status"];
    }>,
) {
    return apiFetch<{
        success: boolean;
        data: Order;
    }>(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/* -------------------------------------------------------------------------- */
/* DELETE ORDER                                                               */
/* -------------------------------------------------------------------------- */

export async function deleteOrder(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: unknown;
    }>(`/orders/${id}`, {
        method: "DELETE",
    });
}

export async function startProduction(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Order;
    }>(`/orders/${id}/start-production`, {
        method: "POST",
    });
}

export async function readyForDelivery(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Order;
    }>(`/orders/${id}/ready-for-delivery`, {
        method: "POST",
    });
}

export async function deliverOrder(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Order;
    }>(`/orders/${id}/deliver`, {
        method: "POST",
    });
}