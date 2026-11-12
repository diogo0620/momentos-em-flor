"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Banknote,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    X,
} from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import { adminFloristCompensationsApi } from "@/lib/api/florist-compensations/admin-florist-compensations";
import { adminFloristsApi } from "@/lib/api/florists/admin-florists";
import type { AdminFloristList } from "@/types/florists/admin/admin-florist-list";
import type {
    FloristCompensation,
    FloristCompensationStatus,
} from "@/types/florist-compensations/florist-compensation";

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<FloristCompensationStatus, string> = {
    PENDING_DELIVERY: "Aguarda entrega",
    DUE: "A pagar",
    PAID: "Paga",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<FloristCompensationStatus, string> = {
    PENDING_DELIVERY: "bg-blue-50 text-blue-700",
    DUE: "bg-amber-50 text-amber-800",
    PAID: "bg-green-50 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-600",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function AdminCompensationsPage() {
    const [items, setItems] = useState<FloristCompensation[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPayments, setSelectedPayments] = useState<FloristCompensation[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [floristSearch, setFloristSearch] = useState("");
    const [floristId, setFloristId] = useState<number | undefined>();
    const [floristResults, setFloristResults] = useState<AdminFloristList[]>([]);
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async (requestedPage = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminFloristCompensationsApi.getAll({
                page: requestedPage,
                pageSize: PAGE_SIZE,
                search: search || undefined,
                status: status || undefined,
                floristId,
                sort: "createdAt",
                order: "desc",
            });
            setItems(response.items);
            setCheckedIds([]);
            setPage(response.page);
            setPages(response.pages);
            setTotal(response.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar os pagamentos.",
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, floristId]);

    useEffect(() => {
        void load(1);
    }, [load]);

    useEffect(() => {
        const term = floristSearch.trim();
        if (floristId || term.length < 3) {
            return;
        }
        const timer = window.setTimeout(() => {
            void adminFloristsApi.getAll({ page: 1, pageSize: 8, search: term, sort: "name", order: "asc" })
                .then((response) => setFloristResults(response.items))
                .catch(() => setFloristResults([]));
        }, 250);
        return () => window.clearTimeout(timer);
    }, [floristSearch, floristId]);

    function openPayment(compensation: FloristCompensation) {
        setSelectedPayments([compensation]);
        setPaymentReference("");
        setPaymentNotes("");
        setError(null);
    }

    async function submitPayment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (selectedPayments.length === 0 || !paymentReference.trim()) return;

        try {
            setSaving(true);
            setError(null);
            const payload = { paymentReference: paymentReference.trim(), paymentNotes: paymentNotes.trim() || undefined };
            if (selectedPayments.length === 1) {
                await adminFloristCompensationsApi.markPaid(selectedPayments[0].id, payload);
            } else {
                await adminFloristCompensationsApi.markManyPaid(selectedPayments.map((item) => item.id), payload);
            }
            setSelectedPayments([]);
            setCheckedIds([]);
            await load(page);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível registar a transferência.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Pagamentos às floristas"
                subtitle="Controla os valores acordados e regista uma ou várias transferências numa só operação."
            />

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <form
                    className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)_220px_auto]"
                    onSubmit={(event) => {
                        event.preventDefault();
                        setSearch(searchInput.trim());
                    }}
                >
                    <label className="relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Encomenda, florista ou referência"
                            className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#55624A]"
                        />
                    </label>
                    <div className="relative">
                        <label className="relative block">
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input value={floristSearch} onChange={(event) => { setFloristSearch(event.target.value); setFloristId(undefined); setFloristResults([]); }} placeholder="Filtrar florista (3 caracteres)" className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-10 text-sm outline-none focus:border-[#55624A]" />
                            {(floristSearch || floristId) && <button type="button" onClick={() => { setFloristSearch(""); setFloristId(undefined); }} className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100"><X size={16} /></button>}
                        </label>
                        {floristResults.length > 0 && <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">{floristResults.map((florist) => <button key={florist.id} type="button" onClick={() => { setFloristId(florist.id); setFloristSearch(florist.name); setFloristResults([]); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F3F5EE]">{florist.name}</button>)}</div>}
                    </div>
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#55624A]"
                    >
                        <option value="">Todos os estados</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <button className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#46523D]">
                        Pesquisar
                    </button>
                </form>
            </section>

            {checkedIds.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#D6DEC8] bg-[#F3F5EE] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-[#374132]">{checkedIds.length} pagamentos selecionados · {formatCurrency(items.filter((item) => checkedIds.includes(item.id)).reduce((sum, item) => sum + item.amount, 0))}</p>
                    <button type="button" onClick={() => { const selected = items.filter((item) => checkedIds.includes(item.id)); setSelectedPayments(selected); setPaymentReference(""); setPaymentNotes(""); }} className="rounded-xl bg-[#55624A] px-5 py-2.5 text-sm font-semibold text-white">Registar num só pagamento</button>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-100 bg-[#FAFBF8] text-[#55624A]">
                            <tr>
                                <th className="w-12 px-4 py-4"><input type="checkbox" aria-label="Selecionar pagamentos desta página" checked={items.filter((item) => item.status === "DUE").length > 0 && items.filter((item) => item.status === "DUE").every((item) => checkedIds.includes(item.id))} onChange={(event) => { const due = items.filter((item) => item.status === "DUE"); if (!event.target.checked) { setCheckedIds((current) => current.filter((id) => !due.some((item) => item.id === id))); return; } const florist = due.find((item) => checkedIds.length === 0 || checkedIds.some((id) => items.find((current) => current.id === id)?.floristId === item.floristId))?.floristId; setCheckedIds((current) => [...new Set([...current, ...due.filter((item) => item.floristId === florist).map((item) => item.id)])]); }} /></th>
                                <th className="px-6 py-4">Encomenda</th>
                                <th className="px-6 py-4">Florista</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Cobrado</th>
                                <th className="px-6 py-4">Margem</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Pagamento</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={9} className="px-6 py-16 text-center text-gray-400"><Loader2 className="mx-auto animate-spin" /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-16 text-center text-gray-500"><Banknote className="mx-auto mb-3 text-[#7A8A6B]" />Ainda não existem pagamentos.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-5"><input type="checkbox" disabled={item.status !== "DUE" || (checkedIds.length > 0 && !checkedIds.includes(item.id) && items.some((current) => checkedIds.includes(current.id) && current.floristId !== item.floristId))} checked={checkedIds.includes(item.id)} onChange={(event) => setCheckedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} aria-label={`Selecionar pagamento ${item.orderNumber}`} /></td>
                                    <td className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                        <Link href={`/admin/orders/${item.orderId}/edit`} className="hover:underline">
                                            {item.orderNumber}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-5 text-gray-700">{item.floristName}</td>
                                    <td className="px-6 py-5 font-semibold text-[#2F3B2A]">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-5 text-gray-600">{formatCurrency(item.customerTotal ?? 0)}</td>
                                    <td className="px-6 py-5 font-semibold text-[#55624A]">{formatCurrency(item.platformMargin ?? 0)}</td>
                                    <td className="px-6 py-5"><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span></td>
                                    <td className="px-6 py-5 text-gray-500">
                                        {item.paidAt ? (
                                            <><p>{formatDate(item.paidAt)}</p><p className="mt-1 text-xs">{item.paymentReference}</p></>
                                        ) : item.dueAt ? `Desde ${formatDate(item.dueAt)}` : "—"}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {item.status === "DUE" && (
                                            <button onClick={() => openPayment(item)} className="inline-flex items-center gap-2 rounded-xl bg-[#55624A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#46523D]">
                                                <CheckCircle2 size={15} /> Registar pagamento
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                    <span>{total} pagamentos</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => void load(page - 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronLeft size={17} /></button>
                        <span>{page} / {Math.max(pages, 1)}</span>
                        <button disabled={page >= pages} onClick={() => void load(page + 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronRight size={17} /></button>
                    </div>
                </div>
            </section>

            {selectedPayments.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <form onSubmit={submitPayment} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-[#2F3B2A]">Registar transferência</h2>
                                <p className="mt-1 text-sm text-gray-500">{selectedPayments[0].floristName} · {selectedPayments.length} {selectedPayments.length === 1 ? "pagamento" : "pagamentos"} · {formatCurrency(selectedPayments.reduce((sum, item) => sum + item.amount, 0))}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedPayments([])} disabled={saving} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
                        </div>
                        <label className="mt-6 block text-sm font-medium text-gray-700">
                            Referência da transferência *
                            <input autoFocus required maxLength={120} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#55624A]" />
                        </label>
                        <label className="mt-4 block text-sm font-medium text-gray-700">
                            Notas
                            <textarea rows={4} maxLength={1000} value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#55624A]" />
                        </label>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setSelectedPayments([])} disabled={saving} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600">Cancelar</button>
                            <button disabled={saving || !paymentReference.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                Confirmar pagamento
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
