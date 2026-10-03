import type {
    CreateOrderOffer,
    OrderOffer,
    UpdateOrderOffer,
} from "@/types/order-offer";
import { BaseApi } from "./common/base-api";
import { apiFetch } from "./common/client";
import { UpdatedResponse } from "./common/updated-response";



class OrderOffersApi extends BaseApi<
    OrderOffer,
    CreateOrderOffer,
    UpdateOrderOffer
> {
    constructor() {
        super("/order-offers");
    }

    async decline(id: number, reason: string): Promise<UpdatedResponse> {
        return apiFetch<UpdatedResponse>(`${this.endpoint}/${id}/decline`, {
            method: "POST",
            body: JSON.stringify({ reason }),
        });
    }

    async accept(id: number): Promise<UpdatedResponse> {
        return apiFetch<UpdatedResponse>(`${this.endpoint}/${id}/accept`, {
            method: "POST"
        });
    }
}



export const orderOffersApi = new OrderOffersApi();