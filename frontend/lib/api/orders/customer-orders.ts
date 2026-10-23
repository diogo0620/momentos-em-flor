

import { BaseApi } from "../common/base-api";
import { CustomerOrderList } from "@/types/orders/customer/customer-order-list";
import { CustomerCreateOrder } from "@/types/orders/customer/customer-create-order";
import { CustomerOrderDetail } from "@/types/orders/customer/customer-order-detail";
import { apiFetch } from "../common/client";





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

}



export const customerOrdersApi = new CustomerOrdersApi();