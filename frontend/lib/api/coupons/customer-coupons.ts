import { apiFetch } from "@/lib/api/common/client";

export type CouponValidation = { code: string; discount: number; total: number };

export const customerCouponsApi = {
    validate(code: string, amount: number): Promise<CouponValidation> {
        return apiFetch(`/customer/coupons/${encodeURIComponent(code)}/validate?amount=${amount.toFixed(2)}`);
    },
};
