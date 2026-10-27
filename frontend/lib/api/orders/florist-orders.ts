import { BaseApi } from "../common/base-api";

import type {
    FloristOrderDetail,
} from "@/types/orders/florist/florist-order-detail";

import type {
    FloristOrderList,
} from "@/types/orders/florist/florist-order-list";

class FloristOrdersApi extends BaseApi<
    FloristOrderDetail,
    FloristOrderList,
    never,
    never
> {
    constructor() {
        super("/florist/orders");
    }
}

export const floristOrdersApi = new FloristOrdersApi();