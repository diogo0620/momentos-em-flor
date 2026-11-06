

import { BaseApi } from "../common/base-api";
import { CustomerOrderList } from "@/types/orders/customer/customer-order-list";
import { CustomerCreateOrder } from "@/types/orders/customer/customer-create-order";
import { CustomerCreateOrderReview, CustomerOrderDetail, CustomerOrderReview } from "@/types/orders/customer/customer-order-detail";
import { apiFetch, apiFetchBlob } from "../common/client";





class CustomerOrdersApi extends BaseApi<
    CustomerOrderDetail,
    CustomerOrderList,
    CustomerCreateOrder,
    null
> {
    constructor() {
        super("/customer/orders");
    }

    async getByOrderNumber(
            orderNumber: string,
        ): Promise<CustomerOrderDetail> {
            return apiFetch(
                `${this.endpoint}/${orderNumber}`,
            );
        }

    async cancelPendingPayment(orderNumber: string): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${encodeURIComponent(orderNumber)}/cancel`,
            { method: "POST" },
        );
    }

    async createReview(
        orderNumber: string,
        data: CustomerCreateOrderReview,
    ): Promise<CustomerOrderReview> {
        return apiFetch<CustomerOrderReview>(
            `${this.endpoint}/${encodeURIComponent(orderNumber)}/review`,
            { method: "POST", body: JSON.stringify(data) },
        );
    }

    getInvoicePdf(orderNumber: string): Promise<Blob> {
        return apiFetchBlob(
            `${this.endpoint}/${encodeURIComponent(orderNumber)}/invoice-pdf`,
        );
    }

}



export const customerOrdersApi = new CustomerOrdersApi();
