

import { AdminOrderList } from "@/types/orders/admin/admin-order-list";
import { BaseApi } from "../common/base-api";
import { AdminOrderDetail } from "@/types/orders/admin/admin-order-detail";





class AdminOrdersApi extends BaseApi<
    AdminOrderDetail,
    AdminOrderList,
    null,
    null
> {
    constructor() {
        super("/admin/orders");
    }

}



export const adminOrdersApi = new AdminOrdersApi();