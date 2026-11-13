import { apiFetch } from "@/lib/api/common/client";

export type CouponDiscountApplication = "PRODUCT_LINES" | "ALL_LINES" | "DELIVERY_FEE";
export type AdminCoupon = { id: number; code: string; name: string; description: string | null; type: "PERCENTAGE" | "FIXED_AMOUNT"; discountApplication: CouponDiscountApplication; value: number | string; minimumOrderAmount: number | string | null; maximumDiscountAmount: number | string | null; startsAt: string | null; expiresAt: string | null; maximumRedemptions: number | null; maximumRedemptionsPerCustomer: number; active: boolean; _count?: { redemptions: number } };
export type CouponInput = Omit<AdminCoupon, "id" | "_count">;

export const adminCouponsApi = {
    list: (): Promise<AdminCoupon[]> => apiFetch("/admin/coupons"),
    get: (id: number): Promise<AdminCoupon> => apiFetch(`/admin/coupons/${id}`),
    create: (data: CouponInput): Promise<AdminCoupon> => apiFetch("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: CouponInput): Promise<AdminCoupon> => apiFetch(`/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number): Promise<void> => apiFetch(`/admin/coupons/${id}`, { method: "DELETE" }),
};
