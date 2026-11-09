"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, LoaderCircle } from "lucide-react";
import { floristSubscriptionsApi, type FloristSubscription, type SubscriptionPlan } from "@/lib/api/subscriptions/florist-subscriptions";

export default function FloristSubscriptionPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [current, setCurrent] = useState<FloristSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { floristSubscriptionsApi.get().then((data) => { setPlans(data.plans); setCurrent(data.current); }).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar os planos.")).finally(() => setLoading(false)); }, []);

    async function select(plan: SubscriptionPlan) {
        try {
            setSelecting(plan.id); setError(null);
            const result = await floristSubscriptionsApi.select(plan.id);
            if (result.checkoutUrl) { window.location.assign(result.checkoutUrl); return; }
            const data = await floristSubscriptionsApi.get(); setCurrent(data.current);
        } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível alterar o plano."); }
        finally { setSelecting(null); }
    }

    async function openPortal() {
        try { setError(null); const result = await floristSubscriptionsApi.portal(); window.location.assign(result.url); }
        catch (err) { setError(err instanceof Error ? err.message : "Não foi possível abrir o portal de faturação."); }
    }

    return <div className="space-y-6">
        <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#78867b]">Conta da florista</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#203128]">Subscrição</h1><p className="mt-2 text-sm text-[#6d776f]">Escolha o plano que mantém a sua florista ativa na plataforma.</p></header>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {current?.stripeCustomerId && <button type="button" onClick={() => void openPortal()} className="w-fit rounded-xl border border-[#dfe4dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#304139]">Gerir faturação e método de pagamento</button>}
        {loading ? <LoaderCircle className="animate-spin" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => {
            const active = current?.plan.id === plan.id && ["FREE", "ACTIVE", "TRIALING"].includes(current.status);
            return <article key={plan.id} className={`rounded-2xl border bg-white p-6 ${active ? "border-[#52705d] ring-2 ring-[#dfe8df]" : "border-[#e1e5df]"}`}>
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-[#203128]">{plan.name}</h2><p className="mt-1 text-sm text-[#6d776f]">{plan.description}</p></div>{active && <span className="rounded-full bg-[#e8eee8] px-3 py-1 text-xs font-semibold text-[#304b39]">Plano atual</span>}</div>
                <p className="mt-6 text-3xl font-semibold text-[#203128]">{Number(plan.monthlyPrice).toLocaleString("pt-PT", { style: "currency", currency: plan.currency })}<span className="text-sm font-normal text-[#7b857d]">/mês</span></p>
                <div className="mt-5 flex items-center gap-2 text-sm text-[#566259]"><Check size={16} /> Acesso à plataforma e propostas</div>
                <button type="button" disabled={active || selecting !== null} onClick={() => void select(plan)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#26392f] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{selecting === plan.id ? <LoaderCircle size={17} className="animate-spin" /> : <CreditCard size={17} />}{active ? "Plano ativo" : plan.free ? "Escolher plano gratuito" : "Subscrever"}</button>
            </article>;
        })}</div>}
    </div>;
}
