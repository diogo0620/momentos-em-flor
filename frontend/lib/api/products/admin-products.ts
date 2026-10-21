
import { BaseApi } from "../common/base-api";

import { AdminProductDetail } from "@/types/products/admin/admin-product-detail";
import { AdminCreateProduct } from "@/types/products/admin/admin-create-product";
import { AdminUpdateProduct } from "@/types/products/admin/admin-update-product";
import { AdminProductList } from "@/types/products/admin/admin-product-list";
import { apiFetch, apiUpload } from "../common/client";




class AdminProductsApi extends BaseApi<
    AdminProductDetail,
    AdminProductList,
    AdminCreateProduct,
    AdminUpdateProduct
> {
    constructor() {
        super("/admin/products");
    }

    async deleteImage(
        productId: number,
        imageId: number,
    ) {
        return apiFetch<void>(
            `${this.endpoint}/${productId}/images/${imageId}`,
            { method: "DELETE" },
        );
    }

    async uploadVariantImage(
        productId: number,
        variantId: number,
        file: File,
    ) {
        return apiUpload<unknown>(
            `${this.endpoint}/${productId}/variants/${variantId}/image`,
            file,
        );
    }

    async uploadImage(
        productId: number,
        file: File,
        options?: {
            isPrimary?: boolean;
            sortOrder?: number;
        },
    ) {
        return apiUpload<unknown>(
            `${this.endpoint}/${productId}/images`,
            file,
            options,
        );
    }

    async getImages(productId: number) {
        return apiFetch<unknown>(
            `${this.endpoint}/${productId}/images`,
        );
    }

}



export const adminProductsApi = new AdminProductsApi();