import { BaseApi } from "../common/base-api";
import { apiFetch } from "../common/client";
import type {
    FloristCompensation,
    MarkFloristCompensationPaid,
} from "@/types/florist-compensations/florist-compensation";

class AdminFloristCompensationsApi extends BaseApi<
    FloristCompensation,
    FloristCompensation,
    never,
    never
> {
    constructor() {
        super("/admin/florist-compensations");
    }

    async markPaid(
        id: number,
        data: MarkFloristCompensationPaid,
    ): Promise<void> {
        return apiFetch<void>(`${this.endpoint}/${id}/mark-paid`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}

export const adminFloristCompensationsApi =
    new AdminFloristCompensationsApi();
