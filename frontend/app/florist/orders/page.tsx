"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Package,
    CalendarDays,
    MapPin,
    Clock,
} from "lucide-react";

import { getOrders } from "@/lib/api/orders";

import type {
    Order,
    OrderStatus,
} from "@/types/order";

type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};

/* -------------------------------------------------------------------------- */
/* STATUS                                                                     */
/* -------------------------------------------------------------------------- */

const statusLabels: Record<OrderStatus, string> = {
    CREATED: "Criada",
    WAITING_FOR_FLORISTS:
        "À espera de florista",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY:
        "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
};

const statusClasses: Record<OrderStatus, string> = {
    CREATED:
        "bg-blue-50 text-blue-700",

    WAITING_FOR_FLORISTS:
        "bg-yellow-50 text-yellow-700",

    ASSIGNED:
        "bg-emerald-50 text-emerald-700",

    IN_PRODUCTION:
        "bg-orange-50 text-orange-700",

    READY_FOR_DELIVERY:
        "bg-purple-50 text-purple-700",

    DELIVERED:
        "bg-green-50 text-green-700",

    CANCELLED:
        "bg-red-50 text-red-700",
};

const statusDotClasses: Record<OrderStatus, string> = {
    CREATED:
        "bg-blue-500",

    WAITING_FOR_FLORISTS:
        "bg-yellow-500",

    ASSIGNED:
        "bg-emerald-500",

    IN_PRODUCTION:
        "bg-orange-500",

    READY_FOR_DELIVERY:
        "bg-purple-500",

    DELIVERED:
        "bg-green-500",

    CANCELLED:
        "bg-red-500",
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    ).format(new Date(value));
}

function formatCurrency(
    value: number,
) {
    return new Intl.NumberFormat(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR",
        },
    ).format(Number(value));
}

function formatTimeSlot(
    value: string,
) {
    const labels: Record<string, string> = {
        MORNING: "Manhã",
        AFTERNOON: "Tarde",
        EVENING: "Noite",
    };

    return labels[value] ?? value;
}

function getRecipientName(
    order: Order,
) {
    return [
        order.recipientFirstName,
        order.recipientLastName,
    ]
        .filter(Boolean)
        .join(" ");
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function FloristOrdersPage() {
    const [orders, setOrders] =
        useState<Order[]>([]);

    const [pagination, setPagination] =
        useState<Pagination>({
            page: 1,
            pageSize: 10,
            total: 0,
            pages: 0,
        });

    const [searchInput, setSearchInput] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState<string>("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------------- */
    /* LOAD ORDERS                                                            */
    /* ---------------------------------------------------------------------- */

    const loadOrders = useCallback(
        async (page = 1) => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getOrders({
                        page,
                        pageSize: 10,
                        search,
                        sort: "createdAt",
                        order: "desc",
                    });

                let data =
                    response.data;

                /*
                 * Temporariamente filtramos o estado
                 * no frontend.
                 *
                 * Idealmente o backend deverá receber
                 * o status como query parameter para
                 * que a paginação seja correta.
                 */
                if (status) {
                    data = data.filter(
                        (order) =>
                            order.status ===
                            status,
                    );
                }

                setOrders(data);

                setPagination(
                    response.pagination,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as encomendas.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [search, status],
    );

    useEffect(() => {
        loadOrders(1);
    }, [loadOrders]);

    /* ---------------------------------------------------------------------- */
    /* SEARCH                                                                  */
    /* ---------------------------------------------------------------------- */

    function handleSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim(),
        );
    }

    /* ---------------------------------------------------------------------- */
    /* FILTERS                                                                 */
    /* ---------------------------------------------------------------------- */

    function clearFilters() {
        setSearchInput("");
        setSearch("");
        setStatus("");
    }

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                  */
    /* ---------------------------------------------------------------------- */

    if (isLoading) {
        return (
            <div>

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-[#2F3B2A]">
                        Encomendas
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Consulte e acompanhe as encomendas atribuídas à sua florista.
                    </p>

                </div>

                <div className="space-y-4">

                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-28
                                    animate-pulse
                                    rounded-3xl
                                    bg-gray-100
                                "
                            />
                        ),
                    )}

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* ERROR                                                                    */
    /* ---------------------------------------------------------------------- */

    if (error) {
        return (
            <div>

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-[#2F3B2A]">
                        Encomendas
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Consulte e acompanhe as encomendas atribuídas à sua florista.
                    </p>

                </div>

                <div className="rounded-3xl bg-red-50 p-8 text-center text-red-600">
                    {error}
                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* PAGE                                                                     */
    /* ---------------------------------------------------------------------- */

    return (
        <div>

            {/* ---------------------------------------------------------------- */}
            {/* HEADER                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="mb-8">

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                    <div>

                        <p className="text-sm font-medium uppercase tracking-wider text-[#55624A]">
                            Portal da Florista
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                            Encomendas
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Consulte e acompanhe as encomendas atribuídas à sua florista.
                        </p>

                    </div>

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            self-start
                            rounded-full
                            bg-[#F5F7F2]
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-[#55624A]
                        "
                    >
                        <Package size={16} />

                        {pagination.total}{" "}
                        {pagination.total === 1
                            ? "encomenda"
                            : "encomendas"}
                    </div>

                </div>

            </div>

            {/* ---------------------------------------------------------------- */}
            {/* FILTERS                                                          */}
            {/* ---------------------------------------------------------------- */}

            <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 lg:flex-row">

                    <form
                        onSubmit={
                            handleSearch
                        }
                        className="flex flex-1 gap-3"
                    >

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                value={
                                    searchInput
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearchInput(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Pesquisar por encomenda..."
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-white
                                    py-3
                                    pl-11
                                    pr-4
                                    outline-none
                                    transition
                                    focus:border-[#55624A]
                                    focus:ring-4
                                    focus:ring-[#55624A]/10
                                "
                            />

                        </div>

                        <button
                            type="submit"
                            className="
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                font-medium
                                text-white
                                transition
                                hover:opacity-90
                            "
                        >
                            Pesquisar
                        </button>

                    </form>

                    <select
                        value={status}
                        onChange={(
                            event,
                        ) =>
                            setStatus(
                                event.target
                                    .value,
                            )
                        }
                        className="
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            px-5
                            py-3
                            text-sm
                            outline-none
                            focus:border-[#55624A]
                        "
                    >
                        <option value="">
                            Todos os estados
                        </option>

                        {Object.entries(
                            statusLabels,
                        ).map(
                            ([
                                value,
                                label,
                            ]) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {label}
                                </option>
                            ),
                        )}
                    </select>

                    {(search ||
                        status) && (
                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            className="
                                rounded-2xl
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-gray-500
                                transition
                                hover:bg-gray-100
                            "
                        >
                            Limpar
                        </button>
                    )}

                </div>

            </div>

            {/* ---------------------------------------------------------------- */}
            {/* EMPTY                                                            */}
            {/* ---------------------------------------------------------------- */}

            {orders.length === 0 ? (
                <div className="rounded-3xl bg-white p-14 text-center shadow-sm">

                    <div
                        className="
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F5F7F2]
                            text-[#55624A]
                        "
                    >
                        <Package size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-[#2F3B2A]">
                        Nenhuma encomenda encontrada
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Não existem encomendas que correspondam aos filtros selecionados.
                    </p>

                </div>
            ) : (
                <>

                    {/* ======================================================== */}
                    {/* DESKTOP                                                   */}
                    {/* ======================================================== */}

                    <div className="hidden overflow-hidden rounded-3xl bg-white shadow-sm lg:block">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-gray-100 text-left">

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Encomenda
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Destinatário
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Entrega
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Local
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Valor
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Estado
                                    </th>

                                    <th className="px-6 py-4" />

                                </tr>

                            </thead>

                            <tbody>

                                {orders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order.id
                                            }
                                            className="
                                                border-b
                                                border-gray-50
                                                last:border-0
                                                transition
                                                hover:bg-[#FAFBF8]
                                            "
                                        >

                                            {/* ORDER */}

                                            <td className="px-6 py-5">

                                                <div>

                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        #
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Criada em{" "}
                                                        {formatDate(
                                                            order.createdAt,
                                                        )}
                                                    </p>

                                                </div>

                                            </td>

                                            {/* RECIPIENT */}

                                            <td className="px-6 py-5">

                                                <p className="font-medium text-gray-700">
                                                    {getRecipientName(
                                                        order,
                                                    )}
                                                </p>

                                            </td>

                                            {/* DELIVERY */}

                                            <td className="px-6 py-5">

                                                <div className="space-y-2">

                                                    <div className="flex items-center gap-2">

                                                        <CalendarDays
                                                            size={
                                                                16
                                                            }
                                                            className="text-gray-400"
                                                        />

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {formatDate(
                                                                order.deliveryDate,
                                                            )}
                                                        </span>

                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <Clock
                                                            size={
                                                                15
                                                            }
                                                            className="text-gray-400"
                                                        />

                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeSlot(
                                                                order.deliveryTimeSlot,
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* LOCATION */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-2">

                                                    <MapPin
                                                        size={
                                                            16
                                                        }
                                                        className="text-gray-400"
                                                    />

                                                    <span className="text-sm text-gray-600">
                                                        {
                                                            order.deliveryCity
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            {/* VALUE */}

                                            <td className="px-6 py-5">

                                                <span className="font-semibold text-[#2F3B2A]">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </span>

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-5">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-full
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-medium
                                                        ${
                                                            statusClasses[
                                                                order.status
                                                            ]
                                                        }
                                                    `}
                                                >

                                                    <span
                                                        className={`
                                                            h-1.5
                                                            w-1.5
                                                            rounded-full
                                                            ${
                                                                statusDotClasses[
                                                                    order.status
                                                                ]
                                                            }
                                                        `}
                                                    />

                                                    {
                                                        statusLabels[
                                                            order.status
                                                        ]
                                                    }

                                                </span>

                                            </td>

                                            {/* DETAIL */}

                                            <td className="px-6 py-5">

                                                <Link
                                                    href={`/florist/orders/${order.id}`}
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-[#F5F7F2]
                                                        text-[#55624A]
                                                        transition
                                                        hover:bg-[#D6DEC8]
                                                    "
                                                    title="Ver encomenda"
                                                >
                                                    <Eye
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </Link>

                                            </td>

                                        </tr>
                                    ),
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* ======================================================== */}
                    {/* MOBILE                                                    */}
                    {/* ======================================================== */}

                    <div className="space-y-4 lg:hidden">

                        {orders.map(
                            (order) => (
                                <Link
                                    key={
                                        order.id
                                    }
                                    href={`/florist/orders/${order.id}`}
                                    className="
                                        block
                                        rounded-3xl
                                        bg-white
                                        p-5
                                        shadow-sm
                                        transition
                                        hover:shadow-md
                                    "
                                >

                                    {/* TOP */}

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <p className="font-semibold text-[#2F3B2A]">
                                                #
                                                {
                                                    order.orderNumber
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {getRecipientName(
                                                    order,
                                                )}
                                            </p>

                                        </div>

                                        <span
                                            className={`
                                                inline-flex
                                                shrink-0
                                                items-center
                                                gap-2
                                                rounded-full
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-medium
                                                ${
                                                    statusClasses[
                                                        order.status
                                                    ]
                                                }
                                            `}
                                        >

                                            <span
                                                className={`
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    ${
                                                        statusDotClasses[
                                                            order.status
                                                        ]
                                                    }
                                                `}
                                            />

                                            {
                                                statusLabels[
                                                    order.status
                                                ]
                                            }

                                        </span>

                                    </div>

                                    {/* DELIVERY */}

                                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <CalendarDays
                                                    size={
                                                        15
                                                    }
                                                    className="text-gray-400"
                                                />

                                                <p className="text-xs text-gray-400">
                                                    Entrega
                                                </p>

                                            </div>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {formatDate(
                                                    order.deliveryDate,
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {formatTimeSlot(
                                                    order.deliveryTimeSlot,
                                                )}
                                            </p>

                                        </div>

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <MapPin
                                                    size={
                                                        15
                                                    }
                                                    className="text-gray-400"
                                                />

                                                <p className="text-xs text-gray-400">
                                                    Local
                                                </p>

                                            </div>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {
                                                    order.deliveryCity
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    {/* BOTTOM */}

                                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                Valor da encomenda
                                            </p>

                                            <p className="mt-1 font-semibold text-[#55624A]">
                                                {formatCurrency(
                                                    order.total,
                                                )}
                                            </p>

                                        </div>

                                        <div className="flex items-center gap-1 text-sm font-medium text-[#55624A]">

                                            Ver detalhes

                                            <Eye
                                                size={
                                                    16
                                                }
                                            />

                                        </div>

                                    </div>

                                </Link>
                            ),
                        )}

                    </div>

                    {/* ======================================================== */}
                    {/* PAGINATION                                                */}
                    {/* ======================================================== */}

                    {pagination.pages >
                        1 && (
                        <div className="mt-8 flex items-center justify-center gap-4">

                            <button
                                type="button"
                                disabled={
                                    pagination.page <=
                                    1
                                }
                                onClick={() =>
                                    loadOrders(
                                        pagination.page -
                                            1,
                                    )
                                }
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-gray-200
                                    transition
                                    hover:bg-[#F5F7F2]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronLeft
                                    size={
                                        20
                                    }
                                />
                            </button>

                            <span className="text-sm text-gray-500">

                                Página{" "}

                                <strong className="text-[#2F3B2A]">
                                    {
                                        pagination.page
                                    }
                                </strong>

                                {" "}de{" "}

                                <strong className="text-[#2F3B2A]">
                                    {
                                        pagination.pages
                                    }
                                </strong>

                            </span>

                            <button
                                type="button"
                                disabled={
                                    pagination.page >=
                                    pagination.pages
                                }
                                onClick={() =>
                                    loadOrders(
                                        pagination.page +
                                            1,
                                    )
                                }
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-gray-200
                                    transition
                                    hover:bg-[#F5F7F2]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronRight
                                    size={
                                        20
                                    }
                                />
                            </button>

                        </div>
                    )}

                </>

            )}

        </div>
    );
}