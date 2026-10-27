"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    ArrowUpDown,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Package,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import SearchInput from "@/components/admin/common/SearchInput";
import DataTable from "@/components/admin/DataTable";
import type { PaginationParams } from "@/lib/api/common/base-api";
import { floristOrdersApi } from "@/lib/api/orders/florist-orders";
import type { FloristOrderList } from "@/types/orders/florist/florist-order-list";
import type {
    FloristDeliveryTimeSlot,
    FloristOrderStatus,
} from "@/types/orders/florist/florist-order-status";

const PAGE_SIZE = 10;
type SortOrder = "asc" | "desc";
type QueryParams = PaginationParams & { status?: FloristOrderStatus };

const STATUS_OPTIONS: { value: FloristOrderStatus; label: string }[] = [
    { value: "ASSIGNED", label: "Atribuída" },
    { value: "IN_PRODUCTION", label: "Em preparação" },
    { value: "READY_FOR_DELIVERY", label: "Pronta para entrega" },
    { value: "DELIVERED", label: "Entregue" },
    { value: "CANCELLED", label: "Cancelada" },
];

const STATUS_LABELS: Record<FloristOrderStatus, string> = {
    CREATED: "Criada",
    PENDING_PAYMENT: "Pendente de pagamento",
    WAITING_FOR_FLORISTS: "À espera de floristas",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<FloristOrderStatus, string> = {
    CREATED: "border-gray-200 bg-gray-100 text-gray-600",
    PENDING_PAYMENT: "border-amber-100 bg-amber-50 text-amber-700",
    WAITING_FOR_FLORISTS: "border-yellow-100 bg-yellow-50 text-yellow-700",
    ASSIGNED: "border-blue-100 bg-blue-50 text-blue-700",
    IN_PRODUCTION: "border-indigo-100 bg-indigo-50 text-indigo-700",
    READY_FOR_DELIVERY: "border-violet-100 bg-violet-50 text-violet-700",
    DELIVERED: "border-green-100 bg-green-50 text-green-700",
    CANCELLED: "border-red-100 bg-red-50 text-red-700",
};

const TIME_SLOT_LABELS: Record<FloristDeliveryTimeSlot, string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Final do dia",
};

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(value));
}

function formatDate(value: string, withTime = false) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
}

export default function FloristOrdersPage() {
    const [orders, setOrders] = useState<FloristOrderList[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sort, setSort] = useState("createdAt");
    const [order, setOrder] = useState<SortOrder>("desc");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = useCallback(async (requestedPage = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            const params: QueryParams = {
                page: requestedPage,
                pageSize: PAGE_SIZE,
                search: search || undefined,
                sort,
                order,
            };
            if (statusFilter) params.status = statusFilter as FloristOrderStatus;

            const response = await floristOrdersApi.getAll(params);
            setOrders(response.items);
            setPage(response.page);
            setPages(response.pages);
            setTotal(response.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as encomendas.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, sort, order]);

    useEffect(() => {
        void loadOrders(1);
    }, [loadOrders]);

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch(searchInput.trim());
    }

    function resetFilters() {
        setSearchInput("");
        setSearch("");
        setStatusFilter("");
    }

    function handleSort(field: string) {
        if (sort === field) {
            setOrder((current) => current === "asc" ? "desc" : "asc");
        } else {
            setSort(field);
            setOrder(field === "createdAt" ? "desc" : "asc");
        }
    }

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="As minhas encomendas"
                subtitle="Acompanha as encomendas atribuídas à tua florista e consulta os detalhes de entrega."
            />

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <SlidersHorizontal size={19} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[#2F3B2A]">Pesquisa e filtros</h2>
                        <p className="text-xs text-gray-400">Pesquisa pelo número da encomenda ou localidade e filtra pelo estado.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="mt-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Número da encomenda ou localidade..."
                            />
                        </div>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46523C]">
                            <Search size={17} /> Pesquisar
                        </button>
                    </div>

                    <label className="block sm:max-w-md">
                        <span className="mb-2 block text-xs font-semibold text-gray-500">Estado da encomenda</span>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10"
                        >
                            <option value="">Todos os estados</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </label>

                    <div className="flex justify-end">
                        <button type="button" onClick={resetFilters} className="text-sm font-medium text-gray-500 transition hover:text-[#55624A]">
                            Limpar filtros
                        </button>
                    </div>
                </form>
            </section>

            {error && (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
                    <p>{error}</p>
                    <button type="button" onClick={() => void loadOrders(page)} className="font-semibold underline">Tentar novamente</button>
                </div>
            )}

            <DataTable>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                <th className="px-5 py-4"><SortButton label="Encomenda" field="orderNumber" currentSort={sort} order={order} onSort={handleSort} /></th>
                                <th className="px-5 py-4"><SortButton label="Entrega" field="deliveryDate" currentSort={sort} order={order} onSort={handleSort} /></th>
                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">Localidade</th>
                                <th className="px-5 py-4"><SortButton label="Valor" field="price" currentSort={sort} order={order} onSort={handleSort} /></th>
                                <th className="px-5 py-4"><SortButton label="Estado" field="status" currentSort={sort} order={order} onSort={handleSort} /></th>
                                <th className="px-5 py-4"><SortButton label="Criada em" field="createdAt" currentSort={sort} order={order} onSort={handleSort} /></th>
                                <th className="px-5 py-4 text-right font-semibold text-[#2F3B2A]">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <LoadingRows /> : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <Package size={30} className="mx-auto text-[#55624A]" />
                                        <p className="mt-4 font-semibold text-[#2F3B2A]">Nenhuma encomenda encontrada</p>
                                        <p className="mt-1 text-sm text-gray-400">Quando aceitares uma proposta, a encomenda aparecerá aqui.</p>
                                    </td>
                                </tr>
                            ) : orders.map((item) => (
                                <tr key={item.id} className="group border-b border-gray-50 transition hover:bg-[#FAFBF8]">
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]"><Package size={20} /></div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#2F3B2A]">{item.orderNumber}</p>
                                                <p className="mt-1 text-xs text-gray-400">ID interno: {item.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-[#2F3B2A]"><CalendarDays size={15} className="shrink-0 text-[#77836B]" />{formatDate(item.deliveryDate)}</div>
                                        <p className="mt-1 pl-[23px] text-xs text-gray-400">{TIME_SLOT_LABELS[item.deliveryTimeSlot] ?? item.deliveryTimeSlot}</p>
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-[#2F3B2A]"><MapPin size={15} className="shrink-0 text-[#77836B]" />{item.deliveryCity || "—"}</div>
                                        <p className="mt-1 pl-[23px] text-xs text-gray-400">{item.deliveryDistrict || "—"}</p>
                                    </td>
                                    <td className="px-5 py-5 font-semibold text-[#2F3B2A]">{formatPrice(item.price)}</td>
                                    <td className="px-5 py-5">
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status] ?? item.status}</span>
                                    </td>
                                    <td className="px-5 py-5 text-sm text-gray-500">{formatDate(item.createdAt.toString(), true)}</td>
                                    <td className="px-5 py-5">
                                        <div className="flex justify-end">
                                            <Link href={`/florist/orders/${item.id}`} title={`Consultar encomenda ${item.orderNumber}`} aria-label={`Consultar encomenda ${item.orderNumber}`} className="flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EE]">
                                                Ver <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && pages > 0 && (
                    <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-500">A mostrar <span className="font-semibold text-gray-700">{orders.length}</span> de <span className="font-semibold text-gray-700">{total}</span> encomendas</p>
                            <p className="mt-1 text-xs text-gray-400">Página {page} de {pages}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" disabled={page <= 1} onClick={() => void loadOrders(page - 1)} aria-label="Página anterior" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} /></button>
                            <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#55624A] px-3 text-sm font-semibold text-white">{page}</span>
                            <span className="text-sm text-gray-400">/ {pages}</span>
                            <button type="button" disabled={page >= pages} onClick={() => void loadOrders(page + 1)} aria-label="Página seguinte" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </DataTable>
        </div>
    );
}

function SortButton({
    label,
    field,
    currentSort,
    order,
    onSort,
}: {
    label: string;
    field: string;
    currentSort: string;
    order: SortOrder;
    onSort: (field: string) => void;
}) {
    const active = currentSort === field;
    return (
        <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-2 font-semibold text-[#2F3B2A] transition hover:text-[#55624A]">
            {label}
            {active ? order === "asc" ? <ArrowUp size={15} className="text-[#55624A]" /> : <ArrowDown size={15} className="text-[#55624A]" /> : <ArrowUpDown size={15} className="text-gray-400" />}
        </button>
    );
}

function LoadingRows() {
    return <>{Array.from({ length: 5 }).map((_, row) => <tr key={row} className="border-b border-gray-50">{Array.from({ length: 7 }).map((_, cell) => <td key={cell} className="px-5 py-5"><div className="h-5 animate-pulse rounded-lg bg-gray-100" /></td>)}</tr>)}</>;
}
