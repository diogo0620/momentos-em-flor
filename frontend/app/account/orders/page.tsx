"use client";

import Link from "next/link";
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    Package,
    Receipt,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";

import { apiFetch } from "@/lib/api/client";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type OrderStatus =
    | "CREATED"
    | "WAITING_FOR_FLORISTS"
    | "ASSIGNED"
    | "IN_PRODUCTION"
    | "READY_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

type CustomerOrder = {
    id: number;
    orderNumber: string;

    deliveryDate: string;

    deliveryTimeSlot:
        | "MORNING"
        | "AFTERNOON"
        | "EVENING";

    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;

    status: OrderStatus;

    createdAt: string;
    updatedAt: string;

    cancelledAt?: string | null;
};

type OrdersResponse = {
    success: boolean;
    data: CustomerOrder[];
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        pages: number;
    };
};

/* ========================================================================== */
/* STATUS                                                                     */
/* ========================================================================== */

const statusConfig: Record<
    OrderStatus,
    {
        label: string;
        className: string;
        dotClassName: string;
    }
> = {
    CREATED: {
        label: "Criada",
        className:
            "bg-blue-50 text-blue-700",
        dotClassName:
            "bg-blue-500",
    },

    WAITING_FOR_FLORISTS: {
        label: "À procura de florista",
        className:
            "bg-amber-50 text-amber-700",
        dotClassName:
            "bg-amber-500",
    },

    ASSIGNED: {
        label: "Florista atribuída",
        className:
            "bg-purple-50 text-purple-700",
        dotClassName:
            "bg-purple-500",
    },

    IN_PRODUCTION: {
        label: "Em preparação",
        className:
            "bg-orange-50 text-orange-700",
        dotClassName:
            "bg-orange-500",
    },

    READY_FOR_DELIVERY: {
        label: "Pronta para entrega",
        className:
            "bg-indigo-50 text-indigo-700",
        dotClassName:
            "bg-indigo-500",
    },

    DELIVERED: {
        label: "Entregue",
        className:
            "bg-green-50 text-green-700",
        dotClassName:
            "bg-green-500",
    },

    CANCELLED: {
        label: "Cancelada",
        className:
            "bg-red-50 text-red-700",
        dotClassName:
            "bg-red-500",
    },
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatDate(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        },
    ).format(
        new Date(value),
    );
}

function formatTimeSlot(
    slot: CustomerOrder["deliveryTimeSlot"],
) {
    switch (slot) {
        case "MORNING":
            return "Manhã";

        case "AFTERNOON":
            return "Tarde";

        case "EVENING":
            return "Final do dia";

        default:
            return slot;
    }
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
    ).format(value);
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function AccountOrdersPage() {
    const [orders, setOrders] =
        useState<CustomerOrder[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadOrders() {
            try {
                setIsLoading(true);
                setError(false);

                /*
                 * O backend deve identificar o customer
                 * através do utilizador autenticado.
                 *
                 * Não enviamos customerId no frontend.
                 */
                const response =
                    await apiFetch<OrdersResponse>(
                        "/orders",
                    );

                if (!cancelled) {
                    setOrders(
                        response.data ?? [],
                    );
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                    setOrders([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadOrders();

        return () => {
            cancelled = true;
        };
    }, []);

    /* ====================================================================== */
    /* LOADING                                                                */
    /* ====================================================================== */

    if (isLoading) {
        return (
            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-center gap-4">

                    <div className="h-14 w-14 animate-pulse rounded-2xl bg-gray-100" />

                    <div className="space-y-2">

                        <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-100" />

                        <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-100" />

                    </div>

                </div>

                <div className="mt-8 space-y-4">

                    {Array.from({
                        length: 3,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-2xl bg-gray-100"
                        />
                    ))}

                </div>

            </div>
        );
    }

    /* ====================================================================== */
    /* ERROR                                                                  */
    /* ====================================================================== */

    if (error) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

                <div
                    className="
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-red-50
                        text-red-500
                    "
                >
                    <Package size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-[#2F3B2A]">
                    Não foi possível carregar as encomendas
                </h2>

                <p className="mx-auto mt-2 max-w-md text-gray-500">
                    Ocorreu um erro ao consultar o
                    histórico das suas encomendas.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        window.location.reload()
                    }
                    className="
                        mt-6
                        rounded-2xl
                        bg-[#55624A]
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-[#46523C]
                    "
                >
                    Tentar novamente
                </button>

            </div>
        );
    }

    /* ====================================================================== */
    /* EMPTY                                                                  */
    /* ====================================================================== */

    if (orders.length === 0) {
        return (
            <div className="rounded-3xl bg-white p-10 shadow-sm">

                <div className="flex flex-col items-center text-center">

                    <div
                        className="
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

                    <h2 className="mt-5 text-2xl font-bold text-[#2F3B2A]">
                        As minhas encomendas
                    </h2>

                    <p className="mt-2 max-w-md text-gray-500">
                        Ainda não realizou nenhuma encomenda.
                        Quando fizer a sua primeira compra,
                        poderá acompanhá-la aqui.
                    </p>

                    <Link
                        href="/"
                        className="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-2xl
                            bg-[#55624A]
                            px-5
                            py-3
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-[#46523C]
                        "
                    >
                        Ver produtos
                        <ChevronRight size={17} />
                    </Link>

                </div>

            </div>
        );
    }

    /* ====================================================================== */
    /* LIST                                                                    */
    /* ====================================================================== */

    return (
        <div>

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="mb-6">

                <div className="flex items-center gap-4">

                    <div
                        className="
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#F5F7F2]
                            text-[#55624A]
                        "
                    >
                        <Package size={27} />
                    </div>

                    <div>

                        <h1 className="text-2xl font-bold text-[#2F3B2A]">
                            As minhas encomendas
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Consulte o estado e os detalhes
                            das suas encomendas.
                        </p>

                    </div>

                </div>

            </div>

            {/* ================================================================== */}
            {/* ORDERS                                                             */}
            {/* ================================================================== */}

            <div className="space-y-4">

                {orders.map(
                    (order) => {
                        const status =
                            statusConfig[
                                order.status
                            ];

                        return (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.id}`}
                                className="
                                    group
                                    block
                                    rounded-3xl
                                    border
                                    border-gray-100
                                    bg-white
                                    p-5
                                    shadow-sm
                                    transition
                                    hover:-translate-y-0.5
                                    hover:border-[#D6DEC8]
                                    hover:shadow-md
                                    sm:p-6
                                "
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                    {/* LEFT */}

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-3">

                                            <h2 className="font-bold text-[#2F3B2A]">
                                                Encomenda #
                                                {
                                                    order.orderNumber
                                                }
                                            </h2>

                                            <span
                                                className={`
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-full
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-semibold
                                                    ${status.className}
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        h-1.5
                                                        w-1.5
                                                        rounded-full
                                                        ${status.dotClassName}
                                                    `}
                                                />

                                                {
                                                    status.label
                                                }
                                            </span>

                                        </div>

                                        {/* DELIVERY */}

                                        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-5">

                                            <div className="flex items-center gap-2">

                                                <CalendarDays
                                                    size={16}
                                                    className="text-[#55624A]"
                                                />

                                                <span>
                                                    Entrega em{" "}
                                                    <strong className="font-medium text-gray-700">
                                                        {formatDate(
                                                            order.deliveryDate,
                                                        )}
                                                    </strong>
                                                </span>

                                            </div>

                                            <div className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                                            <div className="flex items-center gap-2">

                                                <Clock3
                                                    size={16}
                                                    className="text-[#55624A]"
                                                />

                                                <span>
                                                    {
                                                        formatTimeSlot(
                                                            order.deliveryTimeSlot,
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* RIGHT */}

                                    <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-4 lg:border-0 lg:pt-0">

                                        <div>

                                            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">

                                                <Receipt
                                                    size={14}
                                                />

                                                Total

                                            </div>

                                            <p className="mt-1 text-lg font-bold text-[#2F3B2A]">
                                                {formatCurrency(
                                                    order.total,
                                                )}
                                            </p>

                                        </div>

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-[#F5F7F2]
                                                text-[#55624A]
                                                transition
                                                group-hover:bg-[#D6DEC8]
                                            "
                                        >
                                            <ChevronRight
                                                size={19}
                                            />
                                        </div>

                                    </div>

                                </div>

                                {/* CREATED DATE */}

                                <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
                                    Encomenda realizada em{" "}
                                    {formatDate(
                                        order.createdAt,
                                    )}
                                </div>

                            </Link>
                        );
                    },
                )}

            </div>

        </div>
    );
}