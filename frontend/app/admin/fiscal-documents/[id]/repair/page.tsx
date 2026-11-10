"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { apiFetch } from "@/lib/api/common/client";
import { adminMoloniFiscalDocumentsApi } from "@/lib/api/moloni/admin-moloni-fiscal-documents";

type Mapping = { localId: number; name: string; moloniId: string | null; rate?: number };
type Context = { fiscalDocumentId: number; orderNumber: string; lastError: string | null; customer: Mapping | null; products: Mapping[]; taxes: Mapping[] };

function MappingRow({ type, item, onSaved }: { type: "customer" | "product" | "tax"; item: Mapping; onSaved: () => Promise<void> }) {
    const [value, setValue] = useState(item.moloniId ?? "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    useEffect(() => setValue(item.moloniId ?? ""), [item.moloniId]);
    async function submit(event: FormEvent) {
        event.preventDefault(); setSaving(true); setMessage("");
        try {
            await apiFetch("/admin/moloni/mappings", { method: "PUT", body: JSON.stringify({ type, localId: item.localId, moloniId: Number(value) }) });
            setMessage("Associação validada e guardada.");
            await onSaved();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível guardar."); }
        finally { setSaving(false); }
    }
    return <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-[#E5E9DD] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
        <div><p className="text-sm font-semibold text-[#2F3B2A]">{item.name}</p><p className="mt-1 text-xs text-[#7A8474]">ID local {item.localId}{item.rate !== undefined ? ` · IVA ${item.rate}%` : ""}</p></div>
        <label className="text-xs font-medium text-[#657456]">ID Moloni<input required min="1" step="1" type="number" value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-xl border border-[#D8DED1] px-3 py-2.5 text-sm" /></label>
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#55624A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} />{saving ? "A validar…" : "Guardar"}</button>
        {message && <p role="status" className="text-xs text-[#657456] sm:col-span-3">{message}</p>}
    </form>;
}

export default function RepairFiscalDocumentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = Number(params.id);
    const [context, setContext] = useState<Context | null>(null);
    const [error, setError] = useState("");
    const [issuing, setIssuing] = useState(false);
    const load = useCallback(async () => { try { setContext(await adminMoloniFiscalDocumentsApi.getRepairContext<Context>(id)); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível carregar o contexto da fatura."); } }, [id]);
    useEffect(() => { void load(); }, [load]);
    async function retry() {
        setIssuing(true); setError("");
        try { await adminMoloniFiscalDocumentsApi.issue(id); router.push("/admin/fiscal-documents"); router.refresh(); }
        catch (err) { setError(err instanceof Error ? err.message : "A emissão voltou a falhar."); await load(); }
        finally { setIssuing(false); }
    }
    if (!context) return <div className="rounded-3xl bg-white p-8">{error || "A carregar contexto da fatura…"}</div>;
    return <div className="mx-auto max-w-4xl space-y-7 pb-10">
        <Link href="/admin/fiscal-documents" className="inline-flex items-center gap-2 text-sm text-[#657456]"><ArrowLeft size={16} />Voltar à faturação</Link>
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7A876F]">Correção contextual</p><h1 className="mt-2 text-3xl font-semibold">Fatura da encomenda {context.orderNumber}</h1><p className="mt-3 text-sm leading-6 text-[#687363]">Confirma apenas as associações que causaram a falha. Os IDs são validados diretamente na empresa Moloni configurada.</p></div>
        {context.lastError && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"><strong>Último erro:</strong> {context.lastError}</div>}
        {context.customer && <section><h2 className="mb-3 text-lg font-semibold">Cliente</h2><MappingRow type="customer" item={context.customer} onSaved={load} /></section>}
        <section><h2 className="mb-3 text-lg font-semibold">Produtos desta fatura</h2><div className="space-y-3">{context.products.map((item) => <MappingRow key={item.localId} type="product" item={item} onSaved={load} />)}{context.products.length === 0 && <p className="text-sm text-[#7A8474]">Sem produtos de catálogo associados.</p>}</div></section>
        <section><h2 className="mb-3 text-lg font-semibold">Códigos de IVA desta fatura</h2><div className="space-y-3">{context.taxes.map((item) => <MappingRow key={item.localId} type="tax" item={item} onSaved={load} />)}</div></section>
        <div className="sticky bottom-4 rounded-2xl border border-[#D8DED1] bg-white/95 p-4 shadow-xl backdrop-blur"><button type="button" onClick={() => void retry()} disabled={issuing} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#394633] px-5 py-3 font-semibold text-white disabled:opacity-50"><RefreshCw size={17} className={issuing ? "animate-spin" : ""} />{issuing ? "A tentar emitir…" : "Guardar correções e repetir emissão"}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>
    </div>;
}
