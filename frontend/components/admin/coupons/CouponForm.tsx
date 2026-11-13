"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { adminCouponsApi, type AdminCoupon, type CouponInput } from "@/lib/api/coupons/admin-coupons";

export const emptyCoupon: CouponInput = { code: "", name: "", description: null, type: "PERCENTAGE", discountApplication: "PRODUCT_LINES", value: 10, minimumOrderAmount: null, maximumDiscountAmount: null, startsAt: null, expiresAt: null, maximumRedemptions: null, maximumRedemptionsPerCustomer: 1, active: true };

function toInput(item?: AdminCoupon): CouponInput {
  if (!item) return emptyCoupon;
  return { code: item.code, name: item.name, description: item.description, type: item.type, discountApplication: item.discountApplication, value: Number(item.value), minimumOrderAmount: item.minimumOrderAmount === null ? null : Number(item.minimumOrderAmount), maximumDiscountAmount: item.maximumDiscountAmount === null ? null : Number(item.maximumDiscountAmount), startsAt: item.startsAt?.slice(0, 10) ?? null, expiresAt: item.expiresAt?.slice(0, 10) ?? null, maximumRedemptions: item.maximumRedemptions, maximumRedemptionsPerCustomer: item.maximumRedemptionsPerCustomer, active: item.active };
}

export default function CouponForm({ coupon }: { coupon?: AdminCoupon }) {
  const router = useRouter();
  const [form, setForm] = useState<CouponInput>(() => toInput(coupon));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try { const saved = coupon ? await adminCouponsApi.update(coupon.id, form) : await adminCouponsApi.create(form); router.push(`/admin/coupons/${saved.id}`); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível guardar o cupão."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="rounded-2xl border border-[#E1E5DF] bg-white p-5 shadow-sm sm:p-7">
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Field label="Código"><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
      <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Tipo"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponInput["type"] })}><option value="PERCENTAGE">Percentagem</option><option value="FIXED_AMOUNT">Valor fixo</option></select></Field>
      <Field label={form.type === "PERCENTAGE" ? "Desconto (%)" : "Desconto (€)"}><input required type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
      <Field label="Aplicar desconto em"><select value={form.discountApplication} onChange={(e) => setForm({ ...form, discountApplication: e.target.value as CouponInput["discountApplication"] })}><option value="PRODUCT_LINES">Artigos, proporcionalmente</option><option value="ALL_LINES">Artigos e envio</option><option value="DELIVERY_FEE">Apenas no envio</option></select></Field>
      <Field label="Encomenda mínima (€)"><input type="number" min="0" step="0.01" value={form.minimumOrderAmount ?? ""} onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value ? Number(e.target.value) : null })} /></Field>
      <Field label="Desconto máximo (€)"><input type="number" min="0" step="0.01" value={form.maximumDiscountAmount ?? ""} onChange={(e) => setForm({ ...form, maximumDiscountAmount: e.target.value ? Number(e.target.value) : null })} /></Field>
      <Field label="Início"><input type="date" value={form.startsAt ?? ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value || null })} /></Field>
      <Field label="Fim"><input type="date" value={form.expiresAt ?? ""} onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })} /></Field>
      <Field label="Utilizações totais"><input type="number" min="1" value={form.maximumRedemptions ?? ""} onChange={(e) => setForm({ ...form, maximumRedemptions: e.target.value ? Number(e.target.value) : null })} /></Field>
      <Field label="Utilizações por cliente"><input required type="number" min="1" value={form.maximumRedemptionsPerCustomer} onChange={(e) => setForm({ ...form, maximumRedemptionsPerCustomer: Number(e.target.value) })} /></Field>
      <Field label="Descrição"><input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value || null })} /></Field>
    </div>
    <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#E2E7DD] px-4 py-3 text-sm font-medium text-[#46534B]"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[#55624A]" /> Cupão ativo</label>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-6 flex justify-end border-t border-[#EEF0EB] pt-5"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "A guardar…" : "Guardar cupão"}</button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-medium text-[#46534B]">{label}<span className="mt-2 block [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-[#DFE4DC] [&>*]:bg-white [&>*]:px-3 [&>*]:py-2.5 [&>*]:outline-none focus-within:[&>*]:border-[#71805F]">{children}</span></label>; }
