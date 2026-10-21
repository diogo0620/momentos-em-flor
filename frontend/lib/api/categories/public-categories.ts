
import { BaseApi } from "../common/base-api";
import { PublicCategoryDetail } from "@/types/categories/public/public-category-detail";
import { PublicCategoryList } from "@/types/categories/public/public-category-list";




class PublicCategoriesApi extends BaseApi<
    PublicCategoryDetail,
    PublicCategoryList,
    null,
    null
> {
    constructor() {
        super("/categories");
    }

}



export const publicCategoriesApi = new PublicCategoriesApi();