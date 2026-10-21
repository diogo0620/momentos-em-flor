
import { PublicProductDetail } from "@/types/products/public/public-product-detail";
import { BaseApi } from "../common/base-api";
import { PublicProductList } from "@/types/products/public/public-product-list";




class PublicProductsApi extends BaseApi<
    PublicProductDetail,
    PublicProductList,
    null,
    null
> {
    constructor() {
        super("/products");
    }

}



export const publicProductsApi = new PublicProductsApi();