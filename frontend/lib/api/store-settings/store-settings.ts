
import { BaseApi } from "../common/base-api";
import { DeliveryAvailability, DeliveryAvailabilityInput, StoreSettings } from "@/types/store-settings/store-settings";
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

    async getPublic(): Promise<StoreSettings> {
        return apiFetch<StoreSettings>("/store-settings");
    }

    async checkDeliveryAvailability(
        data: DeliveryAvailabilityInput,
    ): Promise<DeliveryAvailability> {
        return apiFetch<DeliveryAvailability>("/store-settings/delivery-availability", {
            method: "POST",
            body: JSON.stringify(data),
            skipRefresh: true,
        });
    }




}



export const storeSettingsApi = new StoreSettingsApi();
