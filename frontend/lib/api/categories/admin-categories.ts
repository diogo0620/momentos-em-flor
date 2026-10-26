
import { AdminCategoryList } from "@/types/categories/admin/admin-category-list";
import { AdminCategoryDetail } from "@/types/categories/admin/admin-category-detail";
import { AdminCreateCategory } from "@/types/categories/admin/admin-create-category";
import { AdminUpdateCategory } from "@/types/categories/admin/admin-update-category";

import { BaseApi } from "../common/base-api";
import { apiFetch, apiUpload } from "../common/client";

export type AdminCategoryImageResponse = {
    categoryId: number;
    image: string;
    url: string;
};

class AdminCategoriesApi extends BaseApi<
    AdminCategoryDetail,
    AdminCategoryList,
    AdminCreateCategory,
    AdminUpdateCategory
> {
    constructor() {
        super("/admin/categories");
    }

    async uploadImage(
        categoryId: number,
        file: File,
    ): Promise<AdminCategoryImageResponse> {
        return apiUpload<AdminCategoryImageResponse>(
            `${this.endpoint}/${categoryId}/image`,
            file,
        );
    }

    async deleteImage(categoryId: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${categoryId}/image`,
            {
                method: "DELETE",
            },
        );
    }
}

export const adminCategoriesApi = new AdminCategoriesApi();
