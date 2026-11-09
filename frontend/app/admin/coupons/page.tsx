"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, TicketPercent } from "lucide-react";
import { adminCouponsApi, type AdminCoupon, type CouponInput } from "@/lib/api/coupons/admin-coupons";

const empty: CouponInput = { code: "", name: "", description: null, type: "PERCENTAGE", value: 10, minimumOrderAmount: null, maximumDiscountAmount: null, startsAt: null, expiresAt: null, maximumRedemptions: null, maximumRedemptionsPerCustomer: 1, active: true };

export default function AdminCouponsPage() {
    const [items, setItems] = useState<AdminCoupon[]>([]);
    const [form, setForm] = useState<CouponInput>(empty);
    const [editing, setEditing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const load = () => adminCouponsApi.list().then(setItems).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar os cupões."));
    useEffect(() => { void load(); }, []);

    async function submit(event: FormEvent) {
        event.preventDefault(); setError(null);
        try { editing ? await adminCouponsApi.update(editing, form) : await adminCouponsApi.create(form); setEditing(null); setForm(empty); await load(); }
        catch (err) { setError(err instanceof Error ? err.message : "Não foi possível guardar o cupão."); }
    }
    function edit(item: AdminCoupon) { setEditing(item.id); setForm({ ...item, startsAt: item.startsAt?.slice(0, 10) ?? null, expiresAt: item.expiresAt?.slice(0, 10) ?? null }); }

    return <div className="space-y-6">
        <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#78867b]">Promoções</p><h1 className="mt-2 text-3xl font-semibold text-[#203128]">Cupões e descontos</h1><p className="mt-2 text-sm text-[#6d776f]">Crie códigos com validade, limites e valor mínimo de encomenda.</p></header>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[#e1e5df] bg-white p-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Código"><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
            <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Tipo"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponInput["type"] })}><option value="PERCENTAGE">Percentagem</option><option value="FIXED_AMOUNT">Valor fixo</option></select></Field>
            <Field label={form.type === "PERCENTAGE" ? "Desconto (%)" : "Desconto (€)"}><input required type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
            <Field label="Encomenda mínima (€)"><input type="number" min="0" step="0.01" value={form.minimumOrderAmount ?? ""} onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Desconto máximo (€)"><input type="number" min="0" step="0.01" value={form.maximumDiscountAmount ?? ""} onChange={(e) => setForm({ ...form, maximumDiscountAmount: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Início"><input type="date" value={form.startsAt ?? ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value || null })} /></Field>
            <Field label="Fim"><input type="date" value={form.expiresAt ?? ""} onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })} /></Field>
            <Field label="Utilizações totais"><input type="number" min="1" value={form.maximumRedemptions ?? ""} onChange={(e) => setForm({ ...form, maximumRedemptions: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Por cliente"><input type="number" min="1" value={form.maximumRedemptionsPerCustomer} onChange={(e) => setForm({ ...form, maximumRedemptionsPerCustomer: Number(e.target.value) })} /></Field>
            <label className="flex items-center gap-2 self-end py-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Cupão ativo</label>
            <button className="flex items-center justify-center gap-2 self-end rounded-xl bg-[#26392f] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />{editing ? "Guardar alterações" : "Criar cupão"}</button>
        </form>
        <div className="overflow-x-auto rounded-2xl border border-[#e1e5df] bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f5f7f4] text-[#6d776f]"><tr><th className="p-4">Código</th><th>Nome</th><th>Desconto</th><th>Validade</th><th>Estado</th><th></th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-[#e8ebe7]"><td className="p-4 font-bold">{item.code}</td><td>{item.name}</td><td>{item.type === "PERCENTAGE" ? `${item.value}%` : `${item.value} €`}</td><td>{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("pt-PT") : "Sem limite"}</td><td>{item.active ? "Ativo" : "Inativo"}</td><td><button onClick={() => edit(item)} className="font-semibold text-[#42604d]">Editar</button></td></tr>)}</tbody></table>{items.length === 0 && <div className="p-10 text-center text-sm text-[#6d776f]"><TicketPercent className="mx-auto mb-3" />Ainda não existem cupões.</div>}</div>
    </div>;
}

function Field({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) { return <label className="block text-sm font-medium text-[#46534b]">{label}{<span className="mt-2 block [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-[#dfe4dc] [&>*]:px-3 [&>*]:py-2.5 [&>*]:outline-none">{children}</span>}</label>; }
