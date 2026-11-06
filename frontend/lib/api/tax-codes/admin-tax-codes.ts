
import { AdminTaxCodeDetail } from "@/types/tax-codes/admin/admin-tax-code-detail";
import { BaseApi } from "../common/base-api";
import { AdminTaxCodeList } from "@/types/tax-codes/admin/admin-tax-code-list";
import { AdminCreateTaxCode } from "@/types/tax-codes/admin/admin-create-tax-code";
import { AdminUpdateTaxCode } from "@/types/tax-codes/admin/admin-update-tax-code";




class AdminTaxCodesApi extends BaseApi<
    AdminTaxCodeDetail,
    AdminTaxCodeList,
    AdminCreateTaxCode,
    AdminUpdateTaxCode
> {
    constructor() {
        super("/admin/tax-codes");
    }

}



export const adminTaxCodesApi = new AdminTaxCodesApi();