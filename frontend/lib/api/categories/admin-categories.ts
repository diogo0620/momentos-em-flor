
import { AdminCategoryList } from "@/types/categories/admin/admin-category-list";
import { BaseApi } from "../common/base-api";
import { AdminCreateCategory } from "@/types/categories/admin/admin-create-category";
import { AdminUpdateCategory } from "@/types/categories/admin/admin-update-category";
import { AdminCategoryDetail } from "@/types/categories/admin/admin-category-detail";





class AdminCategoriesApi extends BaseApi<
    AdminCategoryDetail,
    AdminCategoryList,
    AdminCreateCategory,
    AdminUpdateCategory
> {
    constructor() {
        super("/admin/categories");
    }

}



export const adminCategoriesApi = new AdminCategoriesApi();