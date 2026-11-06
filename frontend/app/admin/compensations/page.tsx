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
    const [selected, setSelected] = useState<FloristCompensation | null>(null);
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
                sort: "createdAt",
                order: "desc",
            });
            setItems(response.items);
            setPage(response.page);
            setPages(response.pages);
            setTotal(response.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as compensações.",
            );
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        void load(1);
    }, [load]);

    function openPayment(compensation: FloristCompensation) {
        setSelected(compensation);
        setPaymentReference("");
        setPaymentNotes("");
        setError(null);
    }

    async function submitPayment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selected || !paymentReference.trim()) return;

        try {
            setSaving(true);
            setError(null);
            await adminFloristCompensationsApi.markPaid(selected.id, {
                paymentReference: paymentReference.trim(),
                paymentNotes: paymentNotes.trim() || undefined,
            });
            setSelected(null);
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
                title="Compensações às floristas"
                subtitle="Controla os valores acordados e regista as transferências bancárias efetuadas."
            />

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <form
                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
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
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400"><Loader2 className="mx-auto animate-spin" /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-500"><Banknote className="mx-auto mb-3 text-[#7A8A6B]" />Ainda não existem compensações.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
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
                    <span>{total} compensações</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => void load(page - 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronLeft size={17} /></button>
                        <span>{page} / {Math.max(pages, 1)}</span>
                        <button disabled={page >= pages} onClick={() => void load(page + 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronRight size={17} /></button>
                    </div>
                </div>
            </section>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <form onSubmit={submitPayment} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-[#2F3B2A]">Registar transferência</h2>
                                <p className="mt-1 text-sm text-gray-500">{selected.floristName} · {formatCurrency(selected.amount)}</p>
                            </div>
                            <button type="button" onClick={() => setSelected(null)} disabled={saving} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
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
                            <button type="button" onClick={() => setSelected(null)} disabled={saving} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600">Cancelar</button>
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
