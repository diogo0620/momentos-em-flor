
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Flower2,
    Handshake,
    LoaderCircle,
    Pencil,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import SearchInput from "@/components/admin/common/SearchInput";
import DataTable from "@/components/admin/DataTable";

import { adminOrderOffersApi } from "@/lib/api/order-offers/admin-order-offers";
import { adminOrdersApi } from "@/lib/api/orders/admin-orders";
import { adminFloristsApi } from "@/lib/api/florists/admin-florists";

import type { PaginationParams } from "@/lib/api/common/base-api";
import type {
    AdminOrderOfferList,
    OrderOfferStatus,
} from "@/types/order-offers/admin/admin-order-offer-list";
import type { AdminOrderList } from "@/types/orders/admin/admin-order-list";
import type { AdminFloristList } from "@/types/florists/admin/admin-florist-list";

const PAGE_SIZE = 10;
const SUGGESTION_MIN_LENGTH = 3;
const DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;

type OfferFilters = PaginationParams & {
    status?: OrderOfferStatus;
};

type OrderSuggestion = Pick<AdminOrderList, "id" | "orderNumber">;
type FloristSuggestion = Pick<AdminFloristList, "id" | "name">;

type SelectedOrder = OrderSuggestion;
type SelectedFlorist = FloristSuggestion;

const STATUS_OPTIONS: {
    value: OrderOfferStatus;
    label: string;
}[] = [
    { value: "PENDING", label: "Pendente" },
    { value: "VIEWED", label: "Visualizada" },
    { value: "ACCEPTED", label: "Aceite" },
    { value: "DECLINED", label: "Recusada" },
    { value: "EXPIRED", label: "Expirada" },
    { value: "CANCELLED", label: "Cancelada" },
];

const STATUS_STYLES: Record<OrderOfferStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    VIEWED: "bg-blue-50 text-blue-700",
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    DECLINED: "bg-red-50 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<OrderOfferStatus, string> = {
    PENDING: "Pendente",
    VIEWED: "Visualizada",
    ACCEPTED: "Aceite",
    DECLINED: "Recusada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
};

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-PT")
        .trim();
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function formatDate(value?: string | Date | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function AdminOrderOffersPage() {
    const [offers, setOffers] = useState<AdminOrderOfferList[]>([]);

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);

    const [orderInput, setOrderInput] = useState("");
    const [orderSuggestions, setOrderSuggestions] =
        useState<OrderSuggestion[]>([]);
    const [selectedOrder, setSelectedOrder] =
        useState<SelectedOrder | null>(null);
    const [showOrderSuggestions, setShowOrderSuggestions] =
        useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const [floristInput, setFloristInput] = useState("");
    const [floristSuggestions, setFloristSuggestions] =
        useState<FloristSuggestion[]>([]);
    const [selectedFlorist, setSelectedFlorist] =
        useState<SelectedFlorist | null>(null);
    const [showFloristSuggestions, setShowFloristSuggestions] =
        useState(false);
    const [loadingFlorists, setLoadingFlorists] = useState(false);

    const [statusFilter, setStatusFilter] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const orderSearchSequence = useRef(0);
    const floristSearchSequence = useRef(0);

    const loadOffers = useCallback(
        async (requestedPage = 1) => {
            try {
                setIsLoading(true);
                setError(null);

                /*
                 * A API atual permite um único parâmetro "search".
                 * Quando existe uma encomenda selecionada, pesquisamos
                 * pelo número da encomenda; caso contrário, pela florista.
                 */
                const search = selectedOrder
                    ? selectedOrder.orderNumber
                    : selectedFlorist?.name;

                const params: OfferFilters = {
                    page: requestedPage,
                    pageSize: PAGE_SIZE,
                    sort: "id",
                    order: "desc",
                    search: search || undefined,
                    status: statusFilter
                        ? (statusFilter as OrderOfferStatus)
                        : undefined,
                };

                const response = await adminOrderOffersApi.getAll(params);

                let filteredOffers = response.items;

                /*
                 * Filtro adicional no cliente para combinar encomenda
                 * e florista quando ambos estão selecionados.
                 *
                 * Para garantir a filtragem completa em conjuntos grandes,
                 * a API deverá suportar os dois filtros por ID no backend.
                 */
                if (selectedOrder) {
                    filteredOffers = filteredOffers.filter(
                        (offer) => offer.order.id === selectedOrder.id,
                    );
                }

                if (selectedFlorist) {
                    filteredOffers = filteredOffers.filter(
                        (offer) => offer.florist.id === selectedFlorist.id,
                    );
                }

                setOffers(filteredOffers);
                setPage(response.page);
                setPages(response.pages);
                setTotal(
                    selectedOrder || selectedFlorist
                        ? filteredOffers.length
                        : response.total,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as propostas.",
                );
                setOffers([]);
                setPages(0);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        },
        [selectedOrder, selectedFlorist, statusFilter],
    );

    useEffect(() => {
        void loadOffers(1);
    }, [loadOffers]);

    // Pesquisa de encomendas

    useEffect(() => {
        const query = orderInput.trim();
        const sequence = ++orderSearchSequence.current;

        if (selectedOrder || query.length < SUGGESTION_MIN_LENGTH) {
            setOrderSuggestions([]);
            setLoadingOrders(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoadingOrders(true);

                const response = await adminOrdersApi.getAll({
                    page: 1,
                    pageSize: 50,
                    search: query,
                    sort: "orderNumber",
                    order: "desc",
                });

                if (sequence !== orderSearchSequence.current) return;

                const normalizedQuery = normalizeText(query);

                setOrderSuggestions(
                    response.items
                        .filter((order) =>
                            normalizeText(order.orderNumber).includes(
                                normalizedQuery,
                            ),
                        )
                        .slice(0, SUGGESTION_LIMIT)
                        .map((order) => ({
                            id: order.id,
                            orderNumber: order.orderNumber,
                        })),
                );

                setShowOrderSuggestions(true);
            } catch {
                if (sequence === orderSearchSequence.current) {
                    setOrderSuggestions([]);
                }
            } finally {
                if (sequence === orderSearchSequence.current) {
                    setLoadingOrders(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [orderInput, selectedOrder]);

    // Pesquisa de floristas

    useEffect(() => {
        const query = floristInput.trim();
        const sequence = ++floristSearchSequence.current;

        if (selectedFlorist || query.length < SUGGESTION_MIN_LENGTH) {
            setFloristSuggestions([]);
            setLoadingFlorists(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoadingFlorists(true);

                const response = await adminFloristsApi.getAll({
                    page: 1,
                    pageSize: 50,
                    search: query,
                    sort: "name",
                    order: "asc",
                });

                if (sequence !== floristSearchSequence.current) return;

                const normalizedQuery = normalizeText(query);

                setFloristSuggestions(
                    response.items
                        .filter((florist) =>
                            normalizeText(florist.name).includes(
                                normalizedQuery,
                            ),
                        )
                        .slice(0, SUGGESTION_LIMIT)
                        .map((florist) => ({
                            id: florist.id,
                            name: florist.name,
                        })),
                );

                setShowFloristSuggestions(true);
            } catch {
                if (sequence === floristSearchSequence.current) {
                    setFloristSuggestions([]);
                }
            } finally {
                if (sequence === floristSearchSequence.current) {
                    setLoadingFlorists(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [floristInput, selectedFlorist]);

    function selectOrder(order: OrderSuggestion) {
        setSelectedOrder(order);
        setOrderInput(order.orderNumber);
        setOrderSuggestions([]);
        setShowOrderSuggestions(false);
        setPage(1);
    }

    function clearOrder() {
        setSelectedOrder(null);
        setOrderInput("");
        setOrderSuggestions([]);
        setShowOrderSuggestions(false);
        setPage(1);
    }

    function selectFlorist(florist: FloristSuggestion) {
        setSelectedFlorist(florist);
        setFloristInput(florist.name);
        setFloristSuggestions([]);
        setShowFloristSuggestions(false);
        setPage(1);
    }

    function clearFlorist() {
        setSelectedFlorist(null);
        setFloristInput("");
        setFloristSuggestions([]);
        setShowFloristSuggestions(false);
        setPage(1);
    }

    function resetFilters() {
        clearOrder();
        clearFlorist();
        setStatusFilter("");
        setPage(1);
    }

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Propostas a floristas"
                subtitle="Consulta e gere as propostas de preparação e entrega das encomendas."
            />

            {/* PESQUISA E FILTROS */}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <SlidersHorizontal size={19} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-[#2F3B2A]">
                            Pesquisa e filtros
                        </h2>
                        <p className="text-xs text-gray-400">
                            Pesquisa por encomenda, florista e estado da proposta.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {/* PESQUISA DE ENCOMENDA */}

                    <div className="relative">
                        <label className="mb-2 block text-xs font-semibold text-gray-500">
                            Encomenda
                        </label>

                        <div className="relative">
                            <SearchInput
                                value={orderInput}
                                onChange={(value) => {
                                    setOrderInput(value);
                                    setSelectedOrder(null);
                                    setShowOrderSuggestions(true);
                                    setPage(1);
                                }}
                                placeholder="Pesquisar número da encomenda..."
                            />

                            {loadingOrders && (
                                <LoaderCircle
                                    size={17}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                                />
                            )}

                            {selectedOrder && (
                                <button
                                    type="button"
                                    onClick={clearOrder}
                                    aria-label="Limpar encomenda"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {showOrderSuggestions &&
                            !selectedOrder &&
                            orderInput.trim().length >= SUGGESTION_MIN_LENGTH && (
                                <SuggestionList
                                    loading={loadingOrders}
                                    empty={!loadingOrders && orderSuggestions.length === 0}
                                    emptyMessage="Nenhuma encomenda encontrada."
                                >
                                    {orderSuggestions.map((order) => (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() => selectOrder(order)}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F5F7F2]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                                <Search size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#2F3B2A]">
                                                    {order.orderNumber}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    ID {order.id}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </SuggestionList>
                            )}
                    </div>

                    {/* PESQUISA DE FLORISTA */}

                    <div className="relative">
                        <label className="mb-2 block text-xs font-semibold text-gray-500">
                            Florista
                        </label>

                        <div className="relative">
                            <SearchInput
                                value={floristInput}
                                onChange={(value) => {
                                    setFloristInput(value);
                                    setSelectedFlorist(null);
                                    setShowFloristSuggestions(true);
                                    setPage(1);
                                }}
                                placeholder="Pesquisar nome da florista..."
                            />

                            {loadingFlorists && (
                                <LoaderCircle
                                    size={17}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                                />
                            )}

                            {selectedFlorist && (
                                <button
                                    type="button"
                                    onClick={clearFlorist}
                                    aria-label="Limpar florista"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {showFloristSuggestions &&
                            !selectedFlorist &&
                            floristInput.trim().length >= SUGGESTION_MIN_LENGTH && (
                                <SuggestionList
                                    loading={loadingFlorists}
                                    empty={!loadingFlorists && floristSuggestions.length === 0}
                                    emptyMessage="Nenhuma florista encontrada."
                                >
                                    {floristSuggestions.map((florist) => (
                                        <button
                                            key={florist.id}
                                            type="button"
                                            onClick={() => selectFlorist(florist)}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F5F7F2]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                                <Flower2 size={17} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#2F3B2A]">
                                                    {florist.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    ID {florist.id}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </SuggestionList>
                            )}
                    </div>
                </div>

                {/* ESTADO E LIMPAR */}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="block flex-1">
                        <span className="mb-2 block text-xs font-semibold text-gray-500">
                            Estado da proposta
                        </span>

                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                setPage(1);
                            }}
                            className="
                                w-full rounded-xl border border-gray-200 bg-white
                                px-3 py-3 text-sm text-gray-700 outline-none transition
                                focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10
                            "
                        >
                            <option value="">Todos os estados</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#F5F7F2] hover:text-[#55624A]"
                    >
                        <X size={16} />
                        Limpar filtros
                    </button>
                </div>
            </section>

            {/* ERRO */}

            {error && (
                <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => void loadOffers(page)}
                        className="font-semibold underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* TABELA */}

            <DataTable>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Encomenda
                                </th>
                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Florista
                                </th>
                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Preço
                                </th>
                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Estado
                                </th>
                                <th className="px-5 py-4 text-right font-semibold text-[#2F3B2A]">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <LoadingRows />
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Handshake
                                            size={30}
                                            className="mx-auto text-[#55624A]"
                                        />
                                        <p className="mt-4 font-semibold text-[#2F3B2A]">
                                            Nenhuma proposta encontrada
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Experimenta alterar a pesquisa ou os filtros.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer) => (
                                    <tr
                                        key={offer.id}
                                        className="group border-b border-gray-50 transition hover:bg-[#FAFBF8]"
                                    >
                                        <td className="px-5 py-5">
                                            <Link
                                                href={`/admin/orders/${offer.order.id}`}
                                                className="font-semibold text-[#55624A] hover:underline"
                                            >
                                                {offer.order.orderNumber}
                                            </Link>
                                            <p className="mt-1 text-xs text-gray-400">
                                                ID {offer.order.id}
                                            </p>
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                                    <Flower2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#2F3B2A]">
                                                        {offer.florist.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        ID {offer.florist.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5 font-semibold text-[#2F3B2A]">
                                            {formatPrice(offer.price)}
                                        </td>

                                        <td className="px-5 py-5">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    STATUS_STYLES[offer.status]
                                                }`}
                                            >
                                                {STATUS_LABELS[offer.status]}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="flex items-center justify-end">
                                                <Link
                                                    href={`/admin/order-offers/${offer.id}/edit`}
                                                    title="Editar proposta"
                                                    aria-label={`Editar proposta ${offer.id}`}
                                                    className="
                                                        flex h-9 w-9 items-center justify-center
                                                        rounded-xl text-gray-400 transition
                                                        hover:bg-[#F3F5EE] hover:text-[#55624A]
                                                    "
                                                >
                                                    <Pencil size={17} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINAÇÃO */}

                {!isLoading && pages > 0 && (
                    <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            A mostrar{" "}
                            <span className="font-semibold text-gray-700">
                                {offers.length}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-gray-700">
                                {total}
                            </span>{" "}
                            propostas
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => void loadOffers(page - 1)}
                                aria-label="Página anterior"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#55624A] px-3 text-sm font-semibold text-white">
                                {page}
                            </span>

                            <span className="text-sm text-gray-400">
                                / {pages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= pages}
                                onClick={() => void loadOffers(page + 1)}
                                aria-label="Página seguinte"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </DataTable>
        </div>
    );
}

/* ========================================================================== */
/* SUGESTÕES                                                                  */
/* ========================================================================== */

function SuggestionList({
    loading,
    empty,
    emptyMessage,
    children,
}: {
    loading: boolean;
    empty: boolean;
    emptyMessage: string;
    children: React.ReactNode;
}) {
    return (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 shadow-lg">
            {loading ? (
                <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-400">
                    <LoaderCircle size={16} className="animate-spin" />
                    A pesquisar...
                </div>
            ) : empty ? (
                <p className="px-4 py-4 text-sm text-gray-400">
                    {emptyMessage}
                </p>
            ) : (
                children
            )}
        </div>
    );
}

/* ========================================================================== */
/* LINHAS DE CARREGAMENTO                                                     */
/* ========================================================================== */

function LoadingRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-5">
                            <div className="h-5 animate-pulse rounded-lg bg-gray-100" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
