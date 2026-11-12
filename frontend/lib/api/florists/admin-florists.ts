
import { AdminFloristDetail } from "@/types/florists/admin/admin-florist-detail";
import { BaseApi } from "../common/base-api";
import { AdminFloristList } from "@/types/florists/admin/admin-florist-list";
import { AdminCreateFlorist } from "@/types/florists/admin/admin-create-florist";
import { AdminUpdateFlorist } from "@/types/florists/admin/admin-update-florist";
import { apiFetch } from "../common/client";




class AdminFloristsApi extends BaseApi<
    AdminFloristDetail,
    AdminFloristList,
    AdminCreateFlorist,
    AdminUpdateFlorist
> {
    constructor() {
        super("/admin/florists");
    }

    async assignSubscription(floristId: number, planId: number): Promise<void> {
        await apiFetch(`${this.endpoint}/${floristId}/subscription`, {
            method: "POST",
            body: JSON.stringify({ planId }),
        });
    }

}



export const adminFloristsApi = new AdminFloristsApi();
