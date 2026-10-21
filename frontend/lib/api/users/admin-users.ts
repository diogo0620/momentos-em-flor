
import { AdminUserList } from "@/types/users/admin/admin-user-list";
import { BaseApi } from "../common/base-api";
import { AdminUserDetail } from "@/types/users/admin/admin-user-detail";
import { AdminCreateUser } from "@/types/users/admin/admin-create-user";
import { AdminUpdateUser } from "@/types/users/admin/admin-update-user";





class AdminUsersApi extends BaseApi<
    AdminUserDetail,
    AdminUserList,
    AdminCreateUser,
    AdminUpdateUser
> {
    constructor() {
        super("/admin/users");
    }

}



export const adminUsersApi = new AdminUsersApi();