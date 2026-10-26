
import { PublicProductDetail } from "@/types/products/public/public-product-detail";
import { BaseApi } from "../common/base-api";
import { PublicProductList } from "@/types/products/public/public-product-list";
import { StoreSettings } from "@/types/store-settings/store-settings";
import { apiFetch } from "../common/client";




class StoreSettingsApi extends BaseApi<
    StoreSettings,
    StoreSettings,
    StoreSettings,
    StoreSettings
> {
    constructor() {
        super("/admin/store-settings");
    }

    async updateCurrent(
        data: StoreSettings,
    ): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            },
        );
    }

    async getCurrent(
    ): Promise<StoreSettings> {
        return apiFetch(
            `${this.endpoint}`,
        );
    }




}



export const storeSettingsApi = new StoreSettingsApi();