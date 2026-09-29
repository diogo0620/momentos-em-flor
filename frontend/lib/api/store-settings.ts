import { apiFetch } from "@/lib/api/client";

export type StoreSettings = {
    id: number;
    deliveryFee: number;
    createdAt: string;
    updatedAt: string;
};

export async function getStoreSettings() {
    return apiFetch<{
        success: boolean;
        data: StoreSettings;
    }>("/store-settings");
}

export async function updateStoreSettings(
    deliveryFee: number,
) {
    return apiFetch<{
        success: boolean;
        data: StoreSettings;
    }>("/store-settings", {
        method: "PUT",
        body: JSON.stringify({
            deliveryFee,
        }),
    });
}