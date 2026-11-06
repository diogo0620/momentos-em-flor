
import { BaseApi } from "../common/base-api";
import { CustomerUserDetail } from "@/types/users/customer/customer-user-detail";
import { CustomerUpdateUser } from "@/types/users/customer/customer-update-user";
import { apiFetch } from "../common/client";
import { CustomerChangePassword } from "@/types/users/customer/customer-user-change-password";





class CustomerUsersApi extends BaseApi<
    CustomerUserDetail,
    null,
    null,
    CustomerUpdateUser
> {
    constructor() {
        super("/customer/me");
    }

    async getMe(): Promise<CustomerUserDetail> {
        return apiFetch(
            `${this.endpoint}`,
        );
    }

    async updateMe(data: CustomerUpdateUser): Promise<void> {
        return apiFetch(
            `${this.endpoint}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            },
        );
    }

    async changePassword(data: CustomerChangePassword): Promise<void> {
        return apiFetch(
            `${this.endpoint}/password`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            },
        );
    }

}



export const customerUsersApi = new CustomerUsersApi();