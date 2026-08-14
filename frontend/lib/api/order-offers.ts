import { apiFetch } from "@/lib/api/client";

import type {
    ApiResponse,
    OrderOffer,
} from "@/types/order-offer";

export type CreateOrderOfferData = {
    orderId: number;
    floristId: number;
    compensationAmount: number;
};

export type UpdateOrderOfferData = {
    floristId?: number;
    compensationAmount?: number;
};

export async function getOrderOffers() {
    const response =
        await apiFetch<ApiResponse<OrderOffer[]>>(
            "/order-offers",
        );

    return response.data;
}

export async function getOrderOffer(
    id: number,
) {
    return apiFetch<ApiResponse<OrderOffer>>(
        `/order-offers/${id}`,
    );
}

export async function createOrderOffer(
    data: CreateOrderOfferData,
) {
    return apiFetch<ApiResponse<OrderOffer>>(
        "/order-offers",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

export async function updateOrderOffer(
    id: number,
    data: UpdateOrderOfferData,
) {
    return apiFetch<ApiResponse<OrderOffer>>(
        `/order-offers/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        },
    );
}

export async function acceptOrderOffer(
    id: number,
) {
    return apiFetch(
        `/order-offers/${id}/accept`,
        {
            method: "POST",
        },
    );
}

export async function declineOrderOffer(
    id: number,
    declineReason?: string,
) {
    return apiFetch(
        `/order-offers/${id}/decline`,
        {
            method: "POST",
            body: JSON.stringify({
                declineReason,
            }),
        },
    );
}