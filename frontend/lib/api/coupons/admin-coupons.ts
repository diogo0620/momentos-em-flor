import { apiFetch } from "@/lib/api/common/client";

export type AdminCoupon = { id: number; code: string; name: string; description: string | null; type: "PERCENTAGE" | "FIXED_AMOUNT"; value: number | string; minimumOrderAmount: number | string | null; maximumDiscountAmount: number | string | null; startsAt: string | null; expiresAt: string | null; maximumRedemptions: number | null; maximumRedemptionsPerCustomer: number; active: boolean };
export type CouponInput = Omit<AdminCoupon, "id">;

export const adminCouponsApi = {
    list: (): Promise<AdminCoupon[]> => apiFetch("/admin/coupons"),
    create: (data: CouponInput): Promise<AdminCoupon> => apiFetch("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: CouponInput): Promise<AdminCoupon> => apiFetch(`/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deactivate: (id: number): Promise<void> => apiFetch(`/admin/coupons/${id}`, { method: "DELETE" }),
};
