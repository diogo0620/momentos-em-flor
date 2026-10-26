
import { BaseApi } from "../common/base-api";

import { AdminProductDetail } from "@/types/products/admin/admin-product-detail";
import { AdminCreateProduct } from "@/types/products/admin/admin-create-product";
import { AdminUpdateProduct } from "@/types/products/admin/admin-update-product";
import { AdminProductList } from "@/types/products/admin/admin-product-list";
import { apiFetch } from "../common/client";




class AdminProductsApi extends BaseApi<
    AdminProductDetail,
    AdminProductList,
    AdminCreateProduct,
    AdminUpdateProduct
> {
    constructor() {
        super("/admin/products");
    }

    
}



export const adminProductsApi = new AdminProductsApi();