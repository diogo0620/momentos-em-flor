"use client";

import Link from "next/link";

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Euro,
    Flower2,
    Package,
    RefreshCw,
    ShoppingCart,
    Truck,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import MetricCard from "@/components/admin/common/MetricCard";
import PageHeader from "@/components/admin/common/PageHeader";
import SectionCard from "@/components/admin/common/SectionCard";

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

type Order = {
    id: number;
    orderNumber: string;

    customerFirstName: string;
    customerLastName?: string | null;

    total: number;

    status: OrderStatus;

    deliveryDate: string;

    deliveryTimeSlot:
        | "MORNING"
        | "AFTERNOON"
        | "EVENING";

    createdAt: string;

    florist?: {
        id: number;
        name: string;
    } | null;

    floristId?: number | null;
};

type OrdersResponse = {
    success: boolean;
    data: Order[];

    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        pages: number;
    };
};

type Florist = {
    id: number;
    name: string;
    active: boolean;
    acceptingOrders: boolean;
};

type FloristsResponse = {
    success: boolean;
    data: Florist[];

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

function formatDate(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(
        new Date(value),
    );
}

function getCustomerName(
    order: Order,
) {
    return [
        order.customerFirstName,
        order.customerLastName,
    ]
        .filter(Boolean)
        .join(" ");
}

function getTimeSlotLabel(
    slot: Order["deliveryTimeSlot"],
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

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function AdminPage() {
    const [orders, setOrders] =
        useState<Order[]>([]);

    const [florists, setFlorists] =
        useState<Florist[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    async function loadDashboard() {
        try {
            setIsLoading(true);
            setError(null);

            const [
                ordersResponse,
                floristsResponse,
            ] = await Promise.all([
                apiFetch<OrdersResponse>(
                    "/orders",
                ),

                apiFetch<FloristsResponse>(
                    "/florists?page=1&pageSize=100",
                ),
            ]);

            setOrders(
                ordersResponse.data ?? [],
            );

            setFlorists(
                floristsResponse.data ?? [],
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a dashboard.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    /* ====================================================================== */
    /* METRICS                                                                */
    /* ====================================================================== */

    const metrics = useMemo(() => {
        const pending =
            orders.filter(
                (order) =>
                    order.status ===
                        "CREATED" ||
                    order.status ===
                        "WAITING_FOR_FLORISTS",
            ).length;

        const inProgress =
            orders.filter(
                (order) =>
                    order.status ===
                        "ASSIGNED" ||
                    order.status ===
                        "IN_PRODUCTION" ||
                    order.status ===
                        "READY_FOR_DELIVERY",
            ).length;

        const delivered =
            orders.filter(
                (order) =>
                    order.status ===
                    "DELIVERED",
            ).length;

        const revenue =
            orders
                .filter(
                    (order) =>
                        order.status !==
                        "CANCELLED",
                )
                .reduce(
                    (
                        sum,
                        order,
                    ) =>
                        sum +
                        Number(
                            order.total,
                        ),
                    0,
                );

        return {
            pending,
            inProgress,
            delivered,
            revenue,
        };
    }, [orders]);

    const activeFlorists =
        florists.filter(
            (florist) =>
                florist.active,
        ).length;

    const acceptingFlorists =
        florists.filter(
            (florist) =>
                florist.active &&
                florist.acceptingOrders,
        ).length;

    const recentOrders =
        useMemo(
            () =>
                [...orders]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt,
                            ).getTime() -
                            new Date(
                                a.createdAt,
                            ).getTime(),
                    )
                    .slice(0, 5),
            [orders],
        );

    /* ====================================================================== */
    /* LOADING                                                                */
    /* ====================================================================== */

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">

                <PageHeader
                    title="Dashboard"
                    subtitle="Resumo da atividade da plataforma."
                />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                    {Array.from({
                        length: 4,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-3xl bg-gray-100"
                        />
                    ))}

                </div>

                <div className="h-[500px] animate-pulse rounded-3xl bg-gray-100" />

            </div>
        );
    }

    /* ====================================================================== */
    /* ERROR                                                                  */
    /* ====================================================================== */

    if (error) {
        return (
            <div className="space-y-8 pb-10">

                <PageHeader
                    title="Dashboard"
                    subtitle="Resumo da atividade da plataforma."
                />

                <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">

                    <Package
                        size={38}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="mt-4 text-xl font-bold text-red-700">
                        Não foi possível carregar a dashboard
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            loadDashboard
                        }
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
                        "
                    >
                        <RefreshCw size={16} />
                        Tentar novamente
                    </button>

                </div>

            </div>
        );
    }

    /* ====================================================================== */
    /* PAGE                                                                   */
    /* ====================================================================== */

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <PageHeader
                    title="Dashboard"
                    subtitle="Resumo da atividade da plataforma."
                />

                <button
                    type="button"
                    onClick={
                        loadDashboard
                    }
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-600
                        shadow-sm
                        transition
                        hover:bg-gray-50
                    "
                >
                    <RefreshCw size={16} />
                    Atualizar
                </button>

            </div>

            {/* ================================================================== */}
            {/* METRICS                                                            */}
            {/* ================================================================== */}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Encomendas"
                    value={
                        orders.length
                    }
                    subtitle="Total registado"
                    icon={ShoppingCart}
                />

                <MetricCard
                    title="Por atribuir"
                    value={
                        metrics.pending
                    }
                    subtitle="A aguardar florista"
                    icon={Clock3}
                    color="#D97706"
                />

                <MetricCard
                    title="Em andamento"
                    value={
                        metrics.inProgress
                    }
                    subtitle="A decorrer"
                    icon={Truck}
                    color="#6366F1"
                />

                <MetricCard
                    title="Receita"
                    value={formatCurrency(
                        metrics.revenue,
                    )}
                    subtitle="Não canceladas"
                    icon={Euro}
                />

            </div>

            {/* ================================================================== */}
            {/* RECENT ORDERS                                                      */}
            {/* ================================================================== */}

            <SectionCard>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-2xl font-bold text-[#2F3B2A]">
                            Encomendas recentes
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Acompanhe rapidamente as últimas encomendas.
                        </p>

                    </div>

                    <Link
                        href="/admin/orders"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-[#55624A]
                            transition
                            hover:gap-3
                        "
                    >
                        Ver todas
                        <ArrowRight
                            size={17}
                        />
                    </Link>

                </div>

                <div className="mt-7 space-y-4">

                    {recentOrders.length ===
                    0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">

                            <ShoppingCart
                                size={34}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 font-medium text-gray-600">
                                Ainda não existem encomendas.
                            </p>

                        </div>
                    ) : (
                        recentOrders.map(
                            (order) => {
                                const status =
                                    statusConfig[
                                        order.status
                                    ];

                                return (
                                    <Link
                                        key={
                                            order.id
                                        }
                                        href={`/admin/orders/${order.id}`}
                                        className="
                                            group
                                            block
                                            rounded-3xl
                                            border
                                            border-gray-100
                                            bg-white
                                            p-6
                                            transition
                                            hover:border-[#D6DEC8]
                                            hover:bg-[#FAFBF8]
                                            hover:shadow-sm
                                        "
                                    >

                                        <div className="grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-center">

                                            {/* ORDER */}

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <span className="text-lg font-bold text-[#2F3B2A]">
                                                        #
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </span>

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

                                                <p className="mt-2 text-sm font-medium text-gray-700">
                                                    {
                                                        getCustomerName(
                                                            order,
                                                        )
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Criada em{" "}
                                                    {
                                                        formatDate(
                                                            order.createdAt,
                                                        )
                                                    }
                                                </p>

                                            </div>

                                            {/* DELIVERY */}

                                            <div className="flex items-center gap-3 rounded-2xl bg-[#F5F7F2] px-5 py-3 lg:min-w-[230px]">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#55624A]">
                                                    <CalendarDays
                                                        size={19}
                                                    />
                                                </div>

                                                <div>

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Entrega
                                                    </p>

                                                    <p className="mt-0.5 text-sm font-semibold text-[#2F3B2A]">
                                                        {
                                                            formatDate(
                                                                order.deliveryDate,
                                                            )
                                                        }
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {
                                                            getTimeSlotLabel(
                                                                order.deliveryTimeSlot,
                                                            )
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            {/* TOTAL */}

                                            <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-4 lg:border-0 lg:pt-0">

                                                <div>

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Total
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold text-[#2F3B2A]">
                                                        {formatCurrency(
                                                            Number(
                                                                order.total,
                                                            ),
                                                        )}
                                                    </p>

                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F2] text-[#55624A] transition group-hover:bg-[#D6DEC8]">

                                                    <ArrowRight
                                                        size={18}
                                                        className="transition group-hover:translate-x-0.5"
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    </Link>
                                );
                            },
                        )
                    )}

                </div>

            </SectionCard>

            {/* ================================================================== */}
            {/* OPERATIONAL OVERVIEW                                               */}
            {/* ================================================================== */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* ORDERS */}

                <SectionCard>

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <ShoppingCart
                                size={22}
                            />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Operação
                            </h2>

                            <p className="text-sm text-gray-500">
                                Estado das encomendas
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <OperationalItem
                            label="Por atribuir"
                            value={
                                metrics.pending
                            }
                            icon={Clock3}
                            className="bg-amber-50 text-amber-700"
                        />

                        <OperationalItem
                            label="Em andamento"
                            value={
                                metrics.inProgress
                            }
                            icon={Truck}
                            className="bg-indigo-50 text-indigo-700"
                        />

                        <OperationalItem
                            label="Entregues"
                            value={
                                metrics.delivered
                            }
                            icon={
                                CheckCircle2
                            }
                            className="bg-green-50 text-green-700"
                        />

                        <Link
                            href="/admin/orders"
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-gray-100
                                p-4
                                transition
                                hover:border-[#D6DEC8]
                                hover:bg-[#FAFBF8]
                            "
                        >

                            <span className="text-sm font-medium text-gray-600">
                                Ver encomendas
                            </span>

                            <ArrowRight
                                size={17}
                                className="text-[#55624A]"
                            />

                        </Link>

                    </div>

                </SectionCard>

                {/* FLORISTS */}

                <SectionCard>

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Flower2
                                size={22}
                            />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Rede de floristas
                            </h2>

                            <p className="text-sm text-gray-500">
                                Estado da rede parceira
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 space-y-3">

                        <FloristMetric
                            label="Total de floristas"
                            value={
                                florists.length
                            }
                        />

                        <FloristMetric
                            label="Floristas ativas"
                            value={
                                activeFlorists
                            }
                        />

                        <FloristMetric
                            label="A aceitar encomendas"
                            value={
                                acceptingFlorists
                            }
                            highlight
                        />

                    </div>

                    <Link
                        href="/admin/florists"
                        className="
                            mt-5
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            bg-[#F5F7F2]
                            p-4
                            text-sm
                            font-medium
                            text-[#55624A]
                            transition
                            hover:bg-[#E9EDE3]
                        "
                    >
                        Gerir floristas

                        <ArrowRight
                            size={17}
                        />
                    </Link>

                </SectionCard>

            </div>

            {/* ================================================================== */}
            {/* QUICK ACTIONS                                                      */}
            {/* ================================================================== */}

            <SectionCard>

                <div>

                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Acesso rápido
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Aceda rapidamente às principais áreas.
                    </p>

                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                    <QuickAction
                        href="/admin/orders"
                        icon={
                            ShoppingCart
                        }
                        title="Encomendas"
                        description="Consultar e gerir encomendas."
                    />

                    <QuickAction
                        href="/admin/florists"
                        icon={Flower2}
                        title="Floristas"
                        description="Gerir a rede de floristas."
                    />

                    <QuickAction
                        href="/admin/users"
                        icon={Package}
                        title="Utilizadores"
                        description="Gerir clientes e administradores."
                    />

                </div>

            </SectionCard>

        </div>
    );
}

/* ========================================================================== */
/* OPERATIONAL ITEM                                                           */
/* ========================================================================== */

type OperationalItemProps = {
    label: string;
    value: number;
    icon: React.ElementType;
    className: string;
};

function OperationalItem({
    label,
    value,
    icon: Icon,
    className,
}: OperationalItemProps) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">

            <div className="flex items-center gap-3">

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${className}
                    `}
                >
                    <Icon size={18} />
                </div>

                <span className="text-sm font-medium text-gray-600">
                    {label}
                </span>

            </div>

            <span className="text-lg font-bold text-[#2F3B2A]">
                {value}
            </span>

        </div>
    );
}

/* ========================================================================== */
/* FLORIST METRIC                                                             */
/* ========================================================================== */

type FloristMetricProps = {
    label: string;
    value: number;
    highlight?: boolean;
};

function FloristMetric({
    label,
    value,
    highlight = false,
}: FloristMetricProps) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">

            <span className="text-sm font-medium text-gray-600">
                {label}
            </span>

            <span
                className={`
                    text-lg
                    font-bold
                    ${
                        highlight
                            ? "text-green-600"
                            : "text-[#2F3B2A]"
                    }
                `}
            >
                {value}
            </span>

        </div>
    );
}

/* ========================================================================== */
/* QUICK ACTION                                                               */
/* ========================================================================== */

type QuickActionProps = {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
};

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
}: QuickActionProps) {
    return (
        <Link
            href={href}
            className="
                group
                rounded-2xl
                border
                border-gray-100
                bg-[#FAFBF8]
                p-5
                transition
                hover:border-[#D6DEC8]
                hover:bg-[#F5F7F2]
            "
        >

            <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#55624A] shadow-sm">
                    <Icon size={21} />
                </div>

                <ArrowRight
                    size={18}
                    className="
                        text-gray-300
                        transition
                        group-hover:translate-x-1
                        group-hover:text-[#55624A]
                    "
                />

            </div>

            <h3 className="mt-5 font-semibold text-[#2F3B2A]">
                {title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
                {description}
            </p>

        </Link>
    );
}