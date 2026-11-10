"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Pencil, Plus, Search, SlidersHorizontal, X } from "lucide-react";

import DataTable from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/common/PageHeader";
import { adminSubscriptionsApi, type AdminSubscriptionPlan, type PlanInput } from "@/lib/api/subscriptions/admin-subscriptions";

const initialForm: PlanInput = { code: "", name: "", description: "", monthlyPrice: 0, currency: "EUR", stripePriceId: "", free: true, active: true, sortOrder: 0 };

export default function AdminSubscriptionPlansPage() {
    const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
    const [form, setForm] = useState<PlanInput>(initialForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try { setIsLoading(true); setError(null); setPlans(await adminSubscriptionsApi.list()); }
        catch (err) { setError(err instanceof Error ? err.message : "Não foi possível carregar os planos."); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const filteredPlans = useMemo(() => plans.filter((plan) => {
        const term = search.trim().toLocaleLowerCase("pt-PT");
        return (!term || `${plan.code} ${plan.name}`.toLocaleLowerCase("pt-PT").includes(term)) && (!status || String(plan.active) === status);
    }), [plans, search, status]);

    function closeForm() { setForm(initialForm); setEditingId(null); setFormOpen(false); }
    function startEdit(plan: AdminSubscriptionPlan) {
        setEditingId(plan.id);
        setForm({ code: plan.code, name: plan.name, description: plan.description ?? "", monthlyPrice: Number(plan.monthlyPrice), currency: plan.currency, stripePriceId: plan.stripePriceId ?? "", free: plan.free, active: plan.active, sortOrder: plan.sortOrder });
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            setIsSaving(true); setError(null);
            if (editingId) await adminSubscriptionsApi.update(editingId, form); else await adminSubscriptionsApi.create(form);
            closeForm(); await load();
        } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível guardar o plano."); }
        finally { setIsSaving(false); }
    }

    return <div className="space-y-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <PageHeader title="Planos de subscrição" subtitle="Configura os planos disponíveis para as floristas e acompanha a respetiva utilização." />
            <button type="button" onClick={() => { closeForm(); setFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#46523C]"><Plus size={18} /> Novo plano</button>
        </div>

        {formOpen && <form onSubmit={submit} className="rounded-3xl border border-[#E2E7DD] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#EEF0EB] pb-5"><div><h2 className="font-semibold text-[#2F3B2A]">{editingId ? "Editar plano" : "Criar plano"}</h2><p className="mt-1 text-xs text-gray-400">Define o preço, disponibilidade e integração Stripe.</p></div><button type="button" onClick={closeForm} aria-label="Fechar formulário" className="rounded-xl p-2 text-gray-400 hover:bg-[#F3F5EE]"><X size={18} /></button></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input label="Código" value={form.code} onChange={(value) => setForm({ ...form, code: value.toUpperCase() })} />
                <Input label="Nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                <Input label="Preço mensal (€)" type="number" min="0" step="0.01" value={String(form.monthlyPrice)} onChange={(value) => { const price = Number(value); setForm({ ...form, monthlyPrice: price, free: price === 0 }); }} />
                <Input label="Stripe Price ID" required={!form.free} value={form.stripePriceId ?? ""} onChange={(value) => setForm({ ...form, stripePriceId: value })} />
                <Input label="Ordem" type="number" min="0" value={String(form.sortOrder)} onChange={(value) => setForm({ ...form, sortOrder: Number(value) })} />
                <Input label="Descrição" value={form.description ?? ""} onChange={(value) => setForm({ ...form, description: value })} />
                <label className="flex items-center gap-3 rounded-2xl border border-[#E2E7DD] px-4 py-3 text-sm font-medium text-[#46534B]"><input type="checkbox" checked={form.free} onChange={(event) => setForm({ ...form, free: event.target.checked, monthlyPrice: event.target.checked ? 0 : form.monthlyPrice })} className="h-4 w-4 accent-[#55624A]" /> Plano gratuito</label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#E2E7DD] px-4 py-3 text-sm font-medium text-[#46534B]"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-[#55624A]" /> Plano ativo</label>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#EEF0EB] pt-5"><button type="button" onClick={closeForm} className="rounded-2xl border border-[#E2E7DD] px-5 py-3 text-sm font-semibold text-[#55624A]">Cancelar</button><button disabled={isSaving} className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "A guardar..." : editingId ? "Guardar alterações" : "Criar plano"}</button></div>
        </form>}

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><SlidersHorizontal size={19} /></div><div><h2 className="font-semibold text-[#2F3B2A]">Pesquisa e filtros</h2><p className="text-xs text-gray-400">Encontra planos por código, nome ou estado.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]"><label className="relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar planos..." className="w-full rounded-2xl border border-[#E2E7DD] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#71805F]" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-[#E2E7DD] bg-white px-4 py-3 text-sm outline-none focus:border-[#71805F]"><option value="">Todos os estados</option><option value="true">Ativos</option><option value="false">Inativos</option></select><button type="button" onClick={() => { setSearch(""); setStatus(""); }} className="px-3 text-sm font-medium text-gray-500 hover:text-[#55624A]">Limpar filtros</button></div>
        </section>

        {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void load()} className="font-semibold underline">Tentar novamente</button></div>}

        <DataTable><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-gray-100 bg-[#FAFBF8] text-[#2F3B2A]"><th className="px-5 py-4 font-semibold">Plano</th><th className="px-5 py-4 font-semibold">Preço mensal</th><th className="px-5 py-4 font-semibold">Tipo</th><th className="px-5 py-4 font-semibold">Subscrições</th><th className="px-5 py-4 font-semibold">Estado</th><th className="px-5 py-4 text-right font-semibold">Ações</th></tr></thead><tbody>
            {isLoading ? <LoadingRows /> : filteredPlans.length === 0 ? <tr><td colSpan={6} className="px-6 py-20 text-center"><CreditCard size={30} className="mx-auto text-[#71805F]" /><p className="mt-4 font-semibold text-[#2F3B2A]">Nenhum plano encontrado</p><p className="mt-1 text-sm text-gray-400">Cria um plano ou altera os filtros.</p></td></tr> : filteredPlans.map((plan) => <tr key={plan.id} className="border-b border-[#EEF0EB] transition hover:bg-[#FAFBF8]"><td className="px-5 py-4"><p className="font-semibold text-[#35412F]">{plan.name}</p><p className="mt-1 text-xs font-medium text-gray-400">{plan.code}</p></td><td className="px-5 py-4 font-semibold text-[#35412F]">{formatPrice(plan)}</td><td className="px-5 py-4"><span className="rounded-full bg-[#F3F5EE] px-2.5 py-1 text-xs font-semibold text-[#55624A]">{plan.free ? "Gratuito" : "Pago"}</span></td><td className="px-5 py-4 text-gray-600">{plan._count.subscriptions}</td><td className="px-5 py-4"><StatusBadge active={plan.active} /></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => startEdit(plan)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-[#55624A] hover:bg-[#F3F5EE]"><Pencil size={15} /> Editar</button></td></tr>)}
        </tbody></table>{!isLoading && <div className="border-t border-[#EEF0EB] px-6 py-4 text-sm text-gray-500">A mostrar <strong>{filteredPlans.length}</strong> de <strong>{plans.length}</strong> planos</div>}</DataTable>
    </div>;
}

function Input({ label, value, onChange, type = "text", required = true, min, step }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; min?: string; step?: string }) { return <label className="text-sm font-medium text-[#46534B]">{label}<input required={required} type={type} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DFE4DC] px-3 py-2.5 outline-none focus:border-[#71805F]" /></label>; }
function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{active ? "Ativo" : "Inativo"}</span>; }
function formatPrice(plan: AdminSubscriptionPlan) { return Number(plan.monthlyPrice).toLocaleString("pt-PT", { style: "currency", currency: plan.currency }); }
function LoadingRows() { return <>{[1, 2, 3].map((row) => <tr key={row} className="border-b border-[#EEF0EB]"><td colSpan={6} className="px-5 py-4"><div className="h-8 animate-pulse rounded-xl bg-[#F3F5EE]" /></td></tr>)}</>; }
