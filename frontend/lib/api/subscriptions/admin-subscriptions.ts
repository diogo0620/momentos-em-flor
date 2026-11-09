import { apiFetch } from "@/lib/api/common/client";
import type { SubscriptionPlan } from "./florist-subscriptions";

export type AdminSubscriptionPlan = SubscriptionPlan & { active: boolean; stripePriceId: string | null; sortOrder: number; _count: { subscriptions: number } };
export type PlanInput = { code: string; name: string; description?: string; monthlyPrice: number; currency: string; stripePriceId?: string; free: boolean; active: boolean; sortOrder: number };
export const adminSubscriptionsApi = {
    list: (): Promise<AdminSubscriptionPlan[]> => apiFetch("/admin/subscription-plans"),
    create: (data: PlanInput): Promise<AdminSubscriptionPlan> => apiFetch("/admin/subscription-plans", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: PlanInput): Promise<AdminSubscriptionPlan> => apiFetch(`/admin/subscription-plans/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};
