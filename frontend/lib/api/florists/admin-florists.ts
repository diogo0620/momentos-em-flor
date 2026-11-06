
import { AdminFloristDetail } from "@/types/florists/admin/admin-florist-detail";
import { BaseApi } from "../common/base-api";
import { AdminFloristList } from "@/types/florists/admin/admin-florist-list";
import { AdminCreateFlorist } from "@/types/florists/admin/admin-create-florist";
import { AdminUpdateFlorist } from "@/types/florists/admin/admin-update-florist";




class AdminFloristsApi extends BaseApi<
    AdminFloristDetail,
    AdminFloristList,
    AdminCreateFlorist,
    AdminUpdateFlorist
> {
    constructor() {
        super("/admin/florists");
    }

}



export const adminFloristsApi = new AdminFloristsApi();