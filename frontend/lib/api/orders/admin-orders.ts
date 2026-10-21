

import { AdminOrderList } from "@/types/orders/admin/admin-order-list";
import { BaseApi } from "../common/base-api";





class AdminOrdersApi extends BaseApi<
    null,
    AdminOrderList,
    null,
    null
> {
    constructor() {
        super("/admin/orders");
    }

}



export const adminOrdersApi = new AdminOrdersApi();