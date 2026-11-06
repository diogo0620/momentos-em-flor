
import { apiFetch } from "../common/client";

import { AdminMoloniSettings } from "@/types/moloni/admin/admin-moloni-settings";
import { AdminConfigureMoloni } from "@/types/moloni/admin/admin-configure-moloni";

class AdminMoloniApi {
    private readonly endpoint = "/admin/moloni";

    async getSettings(): Promise<AdminMoloniSettings> {
        return apiFetch<AdminMoloniSettings>(
            `${this.endpoint}/settings`,
        );
    }

    async updateSettings(
        data: AdminConfigureMoloni,
    ): Promise<AdminMoloniSettings> {
        return apiFetch<AdminMoloniSettings>(
            `${this.endpoint}/settings`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
        );
    }

    async testConnection(): Promise<AdminMoloniSettings> {
        return apiFetch<AdminMoloniSettings>(
            `${this.endpoint}/test-connection`,
            {
                method: "POST",
            },
        );
    }
}

export const adminMoloniApi = new AdminMoloniApi();
