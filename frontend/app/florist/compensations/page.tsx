"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Banknote,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
} from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import { floristCompensationsApi } from "@/lib/api/florist-compensations/florist-compensations";
import type {
    FloristCompensation,
    FloristCompensationStatus,
} from "@/types/florist-compensations/florist-compensation";

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<FloristCompensationStatus, string> = {
    PENDING_DELIVERY: "Aguarda entrega",
    DUE: "Aguarda pagamento",
    PAID: "Paga",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<FloristCompensationStatus, string> = {
    PENDING_DELIVERY: "border-blue-100 bg-blue-50 text-blue-700",
    DUE: "border-amber-100 bg-amber-50 text-amber-800",
    PAID: "border-green-100 bg-green-50 text-green-700",
    CANCELLED: "border-gray-200 bg-gray-100 text-gray-600",
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
        dateStyle: "medium",
    }).format(new Date(value));
}

export default function FloristCompensationsPage() {
    const [items, setItems] = useState<FloristCompensation[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (requestedPage = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await floristCompensationsApi.getAll({
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
                    : "Não foi possível carregar os pagamentos.",
            );
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        void load(1);
    }, [load]);

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Pagamentos"
                subtitle="Consulta os valores acordados e as transferências recebidas pelas encomendas concluídas."
            />

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        setSearch(searchInput.trim());
                    }}
                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
                >
                    <label className="relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Pesquisar por encomenda"
                            className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#55624A]"
                        />
                    </label>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#55624A]">
                        <option value="">Todos os estados</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <button className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#46523D]">Pesquisar</button>
                </form>
            </section>

            {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-gray-100 bg-[#FAFBF8] text-[#55624A]">
                            <tr>
                                <th className="px-6 py-4">Encomenda</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Disponível desde</th>
                                <th className="px-6 py-4">Transferência</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400"><Loader2 className="mx-auto animate-spin" /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-500"><Banknote className="mx-auto mb-3 text-[#7A8A6B]" />Ainda não existem pagamentos associados às tuas encomendas.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                        <Link href={`/florist/orders/${item.orderId}`} className="hover:underline">{item.orderNumber}</Link>
                                    </td>
                                    <td className="px-6 py-5 text-lg font-semibold text-[#2F3B2A]">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-5"><span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span></td>
                                    <td className="px-6 py-5 text-gray-500">{formatDate(item.dueAt)}</td>
                                    <td className="px-6 py-5 text-gray-500">
                                        {item.paidAt ? <><p>{formatDate(item.paidAt)}</p><p className="mt-1 text-xs">Ref. {item.paymentReference}</p></> : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                    <span>{total} registos</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => void load(page - 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronLeft size={17} /></button>
                        <span>{page} / {Math.max(pages, 1)}</span>
                        <button disabled={page >= pages} onClick={() => void load(page + 1)} className="rounded-xl border p-2 disabled:opacity-30"><ChevronRight size={17} /></button>
                    </div>
                </div>
            </section>
        </div>
    );
}
