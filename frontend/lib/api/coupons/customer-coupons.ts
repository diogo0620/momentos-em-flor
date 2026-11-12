import { apiFetch } from "@/lib/api/common/client";

export type CouponValidation = { code: string; discount: number; total: number; discountApplication: "PRODUCT_LINES" | "ALL_LINES" | "DELIVERY_FEE" };

export const customerCouponsApi = {
    validate(code: string, subtotal: number, deliveryFee: number): Promise<CouponValidation> {
        return apiFetch(`/customer/coupons/${encodeURIComponent(code)}/validate?subtotal=${subtotal.toFixed(2)}&deliveryFee=${deliveryFee.toFixed(2)}`);
    },
};
