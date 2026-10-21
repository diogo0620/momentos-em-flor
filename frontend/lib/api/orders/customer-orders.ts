

import { BaseApi } from "../common/base-api";
import { CustomerOrderList } from "@/types/orders/customer/customer-order-list";
import { CustomerOrderDetail } from "../customer-account";





class CustomerOrdersApi extends BaseApi<
    CustomerOrderDetail,
    CustomerOrderList,
    null,
    null
> {
    constructor() {
        super("/customer/orders");
    }

}



export const customerOrdersApi = new CustomerOrdersApi();