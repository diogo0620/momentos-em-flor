"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Search, SlidersHorizontal, TicketPercent, Trash2, X } from "lucide-react";

import DataTable from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/common/PageHeader";
import { adminCouponsApi, type AdminCoupon, type CouponInput } from "@/lib/api/coupons/admin-coupons";

const emptyForm: CouponInput = {
    code: "", name: "", description: null, type: "PERCENTAGE", discountApplication: "PRODUCT_LINES", value: 10,
    minimumOrderAmount: null, maximumDiscountAmount: null, startsAt: null,
    expiresAt: null, maximumRedemptions: null, maximumRedemptionsPerCustomer: 1, active: true,
};

export default function AdminCouponsPage() {
    const [items, setItems] = useState<AdminCoupon[]>([]);
    const [form, setForm] = useState<CouponInput>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            setItems(await adminCouponsApi.list());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar os cupões.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const filteredItems = useMemo(() => items.filter((item) => {
        const term = search.trim().toLocaleLowerCase("pt-PT");
        const matchesSearch = !term || `${item.code} ${item.name}`.toLocaleLowerCase("pt-PT").includes(term);
        const matchesStatus = !status || String(item.active) === status;
        return matchesSearch && matchesStatus;
    }), [items, search, status]);

    function closeForm() {
        setForm(emptyForm);
        setEditingId(null);
        setFormOpen(false);
    }

    function startEdit(item: AdminCoupon) {
        setEditingId(item.id);
        setForm({
            code: item.code,
            name: item.name,
            description: item.description,
            type: item.type,
            discountApplication: item.discountApplication,
            value: Number(item.value),
            minimumOrderAmount: item.minimumOrderAmount === null ? null : Number(item.minimumOrderAmount),
            maximumDiscountAmount: item.maximumDiscountAmount === null ? null : Number(item.maximumDiscountAmount),
            startsAt: item.startsAt?.slice(0, 10) ?? null,
            expiresAt: item.expiresAt?.slice(0, 10) ?? null,
            maximumRedemptions: item.maximumRedemptions,
            maximumRedemptionsPerCustomer: item.maximumRedemptionsPerCustomer,
            active: item.active,
        });
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            if (editingId) await adminCouponsApi.update(editingId, form);
            else await adminCouponsApi.create(form);
            closeForm();
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível guardar o cupão.");
        } finally {
            setIsSaving(false);
        }
    }

    async function removeCoupon(item: AdminCoupon) {
        if ((item._count?.redemptions ?? 0) > 0 || !window.confirm(`Eliminar definitivamente o cupão ${item.code}?`)) return;
        try {
            setIsSaving(true);
            setError(null);
            await adminCouponsApi.delete(item.id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível eliminar o cupão.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader title="Cupões e descontos" subtitle="Gere códigos promocionais, limites de utilização e períodos de validade." />
                <button type="button" onClick={() => { closeForm(); setFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46523C]">
                    <Plus size={18} /> Novo cupão
                </button>
            </div>

            {formOpen && (
                <form onSubmit={submit} className="rounded-3xl border border-[#E2E7DD] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-4 border-b border-[#EEF0EB] pb-5">
                        <div><h2 className="font-semibold text-[#2F3B2A]">{editingId ? "Editar cupão" : "Criar cupão"}</h2><p className="mt-1 text-xs text-gray-400">Preenche as condições comerciais aplicáveis ao código.</p></div>
                        <button type="button" onClick={closeForm} aria-label="Fechar formulário" className="rounded-xl p-2 text-gray-400 hover:bg-[#F3F5EE] hover:text-[#55624A]"><X size={18} /></button>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field label="Código"><input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></Field>
                        <Field label="Nome"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
                        <Field label="Tipo"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as CouponInput["type"] })}><option value="PERCENTAGE">Percentagem</option><option value="FIXED_AMOUNT">Valor fixo</option></select></Field>
                        <Field label={form.type === "PERCENTAGE" ? "Desconto (%)" : "Desconto (€)"}><input required type="number" min="0.01" step="0.01" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></Field>
                        <Field label="Aplicar desconto em"><select value={form.discountApplication} onChange={(event) => setForm({ ...form, discountApplication: event.target.value as CouponInput["discountApplication"] })}><option value="PRODUCT_LINES">Artigos, repartido proporcionalmente</option><option value="ALL_LINES">Artigos e envio, repartido proporcionalmente</option><option value="DELIVERY_FEE">Apenas no envio</option></select></Field>
                        <Field label="Encomenda mínima (€)"><input type="number" min="0" step="0.01" value={form.minimumOrderAmount ?? ""} onChange={(event) => setForm({ ...form, minimumOrderAmount: event.target.value ? Number(event.target.value) : null })} /></Field>
                        <Field label="Desconto máximo (€)"><input type="number" min="0" step="0.01" value={form.maximumDiscountAmount ?? ""} onChange={(event) => setForm({ ...form, maximumDiscountAmount: event.target.value ? Number(event.target.value) : null })} /></Field>
                        <Field label="Início"><input type="date" value={form.startsAt ?? ""} onChange={(event) => setForm({ ...form, startsAt: event.target.value || null })} /></Field>
                        <Field label="Fim"><input type="date" value={form.expiresAt ?? ""} onChange={(event) => setForm({ ...form, expiresAt: event.target.value || null })} /></Field>
                        <Field label="Utilizações totais"><input type="number" min="1" value={form.maximumRedemptions ?? ""} onChange={(event) => setForm({ ...form, maximumRedemptions: event.target.value ? Number(event.target.value) : null })} /></Field>
                        <Field label="Por cliente"><input required type="number" min="1" value={form.maximumRedemptionsPerCustomer} onChange={(event) => setForm({ ...form, maximumRedemptionsPerCustomer: Number(event.target.value) })} /></Field>
                        <Field label="Descrição"><input value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value || null })} /></Field>
                        <label className="flex items-center gap-3 self-end rounded-2xl border border-[#E2E7DD] px-4 py-3 text-sm font-medium text-[#46534B]"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-[#55624A]" /> Cupão ativo</label>
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t border-[#EEF0EB] pt-5"><button type="button" onClick={closeForm} className="rounded-2xl border border-[#E2E7DD] px-5 py-3 text-sm font-semibold text-[#55624A]">Cancelar</button><button disabled={isSaving} className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "A guardar..." : editingId ? "Guardar alterações" : "Criar cupão"}</button></div>
                </form>
            )}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><SlidersHorizontal size={19} /></div><div><h2 className="font-semibold text-[#2F3B2A]">Pesquisa e filtros</h2><p className="text-xs text-gray-400">Encontra cupões por código, nome ou estado.</p></div></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
                    <label className="relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar cupões..." className="w-full rounded-2xl border border-[#E2E7DD] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#71805F]" /></label>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-[#E2E7DD] bg-white px-4 py-3 text-sm outline-none focus:border-[#71805F]"><option value="">Todos os estados</option><option value="true">Ativos</option><option value="false">Inativos</option></select>
                    <button type="button" onClick={() => { setSearch(""); setStatus(""); }} className="px-3 text-sm font-medium text-gray-500 hover:text-[#55624A]">Limpar filtros</button>
                </div>
            </section>

            {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void load()} className="font-semibold underline">Tentar novamente</button></div>}

            <DataTable>
                <table className="w-full min-w-[820px] text-left text-sm">
                    <thead><tr className="border-b border-gray-100 bg-[#FAFBF8] text-[#2F3B2A]"><th className="px-5 py-4 font-semibold">Código</th><th className="px-5 py-4 font-semibold">Nome</th><th className="px-5 py-4 font-semibold">Desconto</th><th className="px-5 py-4 font-semibold">Validade</th><th className="px-5 py-4 font-semibold">Estado</th><th className="px-5 py-4 text-right font-semibold">Ações</th></tr></thead>
                    <tbody>
                        {isLoading ? <LoadingRows /> : filteredItems.length === 0 ? <tr><td colSpan={6} className="px-6 py-20 text-center"><TicketPercent size={30} className="mx-auto text-[#71805F]" /><p className="mt-4 font-semibold text-[#2F3B2A]">Nenhum cupão encontrado</p><p className="mt-1 text-sm text-gray-400">Cria um cupão ou altera os filtros.</p></td></tr> : filteredItems.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF0EB] transition hover:bg-[#FAFBF8]"><td className="px-5 py-4 font-bold text-[#35412F]">{item.code}</td><td className="px-5 py-4"><p className="font-medium text-[#35412F]">{item.name}</p>{item.description && <p className="mt-1 max-w-xs truncate text-xs text-gray-400">{item.description}</p>}</td><td className="px-5 py-4 font-medium">{formatDiscount(item)}</td><td className="px-5 py-4 text-gray-500">{formatValidity(item)}</td><td className="px-5 py-4"><StatusBadge active={item.active} /></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1"><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-[#55624A] hover:bg-[#F3F5EE]"><Pencil size={15} /> Editar</button>{(item._count?.redemptions ?? 0) === 0 && <button type="button" disabled={isSaving} onClick={() => void removeCoupon(item)} aria-label={`Eliminar cupão ${item.code}`} className="rounded-xl p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /></button>}</div></td></tr>
                        ))}
                    </tbody>
                </table>
                {!isLoading && <div className="border-t border-[#EEF0EB] px-6 py-4 text-sm text-gray-500">A mostrar <strong>{filteredItems.length}</strong> de <strong>{items.length}</strong> cupões</div>}
            </DataTable>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-medium text-[#46534B]">{label}<span className="mt-2 block [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-[#DFE4DC] [&>*]:bg-white [&>*]:px-3 [&>*]:py-2.5 [&>*]:outline-none focus-within:[&>*]:border-[#71805F]">{children}</span></label>; }
function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{active ? "Ativo" : "Inativo"}</span>; }
function formatDiscount(item: AdminCoupon) { return item.type === "PERCENTAGE" ? `${Number(item.value).toLocaleString("pt-PT")}%` : Number(item.value).toLocaleString("pt-PT", { style: "currency", currency: "EUR" }); }
function formatValidity(item: AdminCoupon) { if (!item.startsAt && !item.expiresAt) return "Sem limite"; const date = (value: string | null) => value ? new Date(value).toLocaleDateString("pt-PT") : "—"; return `${date(item.startsAt)} — ${date(item.expiresAt)}`; }
function LoadingRows() { return <>{[1, 2, 3].map((row) => <tr key={row} className="border-b border-[#EEF0EB]"><td colSpan={6} className="px-5 py-4"><div className="h-8 animate-pulse rounded-xl bg-[#F3F5EE]" /></td></tr>)}</>; }
