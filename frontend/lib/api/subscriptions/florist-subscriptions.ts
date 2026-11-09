import { apiFetch } from "@/lib/api/common/client";

export type SubscriptionPlan = { id: number; code: string; name: string; description: string | null; monthlyPrice: number | string; currency: string; free: boolean };
export type FloristSubscription = { id: number; status: string; stripeCustomerId: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; plan: SubscriptionPlan };

export const floristSubscriptionsApi = {
    get(): Promise<{ current: FloristSubscription | null; plans: SubscriptionPlan[] }> { return apiFetch("/florist/subscription"); },
    select(planId: number): Promise<{ free: boolean; checkoutUrl?: string }> { return apiFetch("/florist/subscription/select", { method: "POST", body: JSON.stringify({ planId }) }); },
    portal(): Promise<{ url: string }> { return apiFetch("/florist/subscription/portal", { method: "POST" }); },
};
