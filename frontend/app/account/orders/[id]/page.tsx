"use client";

import Link from "next/link";

import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Euro,
    Flower2,
    MapPin,
    MessageSquare,
    Package,
    Truck,
    XCircle,
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

type DeliveryTimeSlot =
    | "MORNING"
    | "AFTERNOON"
    | "EVENING";

type Occasion =
    | "BIRTHDAY"
    | "ANNIVERSARY"
    | "LOVE"
    | "WEDDING"
    | "FUNERAL"
    | "NEW_BABY"
    | "MOTHERS_DAY"
    | "FATHERS_DAY"
    | "CHRISTMAS"
    | "OTHER";

type OrderItem = {
    id: number;
    productId: number;
    productName: string;
    productDescription: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

type StatusHistory = {
    id: number;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedByUserId: number | null;
    changedByUser?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    } | null;
    reason: string | null;
    createdAt: string;
};

type Order = {
    id: number;
    orderNumber: string;

    customerId: number | null;

    customerFirstName: string;
    customerLastName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;

    recipientFirstName: string;
    recipientLastName: string | null;
    recipientPhone: string | null;

    occasion: Occasion | null;

    deliveryDate: string;
    deliveryTimeSlot: DeliveryTimeSlot;
    deliveryInstructions: string | null;

    deliveryStreet: string;
    deliveryStreet2: string | null;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryCountryCode: string;

    deliveryLatitude: number;
    deliveryLongitude: number;

    cardMessage: string | null;

    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;

    status: OrderStatus;

    items: OrderItem[];

    offers: unknown[];

    statusHistory: StatusHistory[];

    createdAt: string;
    updatedAt: string;

    cancelledAt: string | null;
    cancellationReason: string | null;
};

type OrderResponse = {
    success: boolean;
    data: Order;
};

/* ========================================================================== */
/* STATUS                                                                     */
/* ========================================================================== */

const statusConfig: Record<
    OrderStatus,
    {
        label: string;
        description: string;
    }
> = {
    CREATED: {
        label: "Encomenda criada",
        description:
            "A sua encomenda foi recebida.",
    },

    WAITING_FOR_FLORISTS: {
        label: "A procurar florista",
        description:
            "Estamos a encontrar uma florista para preparar a sua encomenda.",
    },

    ASSIGNED: {
        label: "Florista atribuída",
        description:
            "A sua encomenda foi atribuída a uma florista.",
    },

    IN_PRODUCTION: {
        label: "Em preparação",
        description:
            "A sua encomenda está a ser preparada.",
    },

    READY_FOR_DELIVERY: {
        label: "Pronta para entrega",
        description:
            "A sua encomenda está pronta para ser entregue.",
    },

    DELIVERED: {
        label: "Entregue",
        description:
            "A sua encomenda foi entregue.",
    },

    CANCELLED: {
        label: "Cancelada",
        description:
            "Esta encomenda foi cancelada.",
    },
};

const progressStatuses: OrderStatus[] = [
    "CREATED",
    "WAITING_FOR_FLORISTS",
    "ASSIGNED",
    "IN_PRODUCTION",
    "READY_FOR_DELIVERY",
    "DELIVERED",
];

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
            month: "long",
            year: "numeric",
        },
    ).format(
        new Date(value),
    );
}

function formatDateTime(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(value),
    );
}

function getTimeSlotLabel(
    value: DeliveryTimeSlot,
) {
    switch (value) {
        case "MORNING":
            return "Manhã";

        case "AFTERNOON":
            return "Tarde";

        case "EVENING":
            return "Final do dia";

        default:
            return value;
    }
}

function getOccasionLabel(
    value: Occasion | null,
) {
    if (!value) {
        return null;
    }

    const labels: Record<
        Occasion,
        string
    > = {
        BIRTHDAY: "Aniversário",
        ANNIVERSARY: "Aniversário de namoro/casamento",
        LOVE: "Amor",
        WEDDING: "Casamento",
        FUNERAL: "Funeral",
        NEW_BABY: "Nascimento",
        MOTHERS_DAY: "Dia da Mãe",
        FATHERS_DAY: "Dia do Pai",
        CHRISTMAS: "Natal",
        OTHER: "Outra ocasião",
    };

    return labels[value];
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function CustomerOrderDetailPage({
    params,
}: Props) {
    const [order, setOrder] =
        useState<Order | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadOrder() {
            try {
                const { id } =
                    await params;

                const orderId =
                    Number(id);

                if (
                    Number.isNaN(
                        orderId,
                    )
                ) {
                    throw new Error(
                        "A encomenda indicada não é válida.",
                    );
                }

                const response =
                    await apiFetch<OrderResponse>(
                        `/orders/${orderId}`,
                    );

                if (mounted) {
                    setOrder(
                        response.data,
                    );
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Não foi possível carregar a encomenda.",
                    );
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        loadOrder();

        return () => {
            mounted = false;
        };
    }, [params]);

    /* ====================================================================== */
    /* LOADING                                                                */
    /* ====================================================================== */

    if (isLoading) {
        return (
            <div className="space-y-6">

                <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-100" />

                <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />

                <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />

            </div>
        );
    }

    /* ====================================================================== */
    /* ERROR                                                                  */
    /* ====================================================================== */

    if (error || !order) {
        return (
            <div className="space-y-6">

                <Link
                    href="/account/orders"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft
                        size={16}
                    />
                    Voltar às encomendas
                </Link>

                <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <Package
                            size={27}
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-[#2F3B2A]">
                        Encomenda não encontrada
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {error ??
                            "Não foi possível encontrar esta encomenda."}
                    </p>

                    <Link
                        href="/account/orders"
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
                            font-semibold
                            text-white
                        "
                    >
                        Voltar às encomendas
                    </Link>

                </div>

            </div>
        );
    }

    const currentStatus =
        statusConfig[
            order.status
        ];

    const currentIndex =
        progressStatuses.indexOf(
            order.status,
        );

    const isCancelled =
        order.status ===
        "CANCELLED";

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* BACK                                                               */}
            {/* ================================================================== */}

            <Link
                href="/account/orders"
                className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-gray-500
                    transition
                    hover:text-[#55624A]
                "
            >
                <ArrowLeft size={16} />
                Voltar às encomendas
            </Link>

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                <Package
                                    size={23}
                                />
                            </div>

                            <div>

                                <p className="text-sm text-gray-400">
                                    Encomenda
                                </p>

                                <h1 className="text-2xl font-bold text-[#2F3B2A]">
                                    #
                                    {
                                        order.orderNumber
                                    }
                                </h1>

                            </div>

                        </div>

                        <p className="mt-5 text-sm text-gray-500">
                            Realizada em{" "}
                            <span className="font-medium text-gray-700">
                                {formatDateTime(
                                    order.createdAt,
                                )}
                            </span>
                        </p>

                    </div>

                    <StatusPill
                        status={
                            order.status
                        }
                    />

                </div>

                {/* ============================================================== */}
                {/* STATUS                                                         */}
                {/* ============================================================== */}

                {isCancelled ? (
                    <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">

                        <div className="flex gap-3">

                            <XCircle
                                size={21}
                                className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div>

                                <p className="font-semibold text-red-700">
                                    Encomenda cancelada
                                </p>

                                {order.cancellationReason && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {
                                            order.cancellationReason
                                        }
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>
                ) : (
                    <OrderProgress
                        currentIndex={
                            currentIndex
                        }
                    />
                )}

            </div>

            {/* ================================================================== */}
            {/* DELIVERY                                                           */}
            {/* ================================================================== */}

            <div className="grid gap-6 lg:grid-cols-2">

                <InfoCard
                    icon={CalendarDays}
                    title="Entrega"
                >

                    <div className="grid gap-5 sm:grid-cols-2">

                        <InfoItem
                            label="Data"
                            value={formatDate(
                                order.deliveryDate,
                            )}
                        />

                        <InfoItem
                            label="Período"
                            value={getTimeSlotLabel(
                                order.deliveryTimeSlot,
                            )}
                        />

                        <InfoItem
                            label="Destinatário"
                            value={[
                                order.recipientFirstName,
                                order.recipientLastName,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(
                                    " ",
                                )}
                        />

                        {order.recipientPhone && (
                            <InfoItem
                                label="Telefone"
                                value={
                                    order.recipientPhone
                                }
                            />
                        )}

                    </div>

                    {getOccasionLabel(
                        order.occasion,
                    ) && (
                        <div className="mt-5 rounded-2xl bg-[#F5F7F2] p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Ocasião
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#55624A]">
                                {getOccasionLabel(
                                    order.occasion,
                                )}
                            </p>

                        </div>
                    )}

                </InfoCard>

                {/* ADDRESS */}

                <InfoCard
                    icon={MapPin}
                    title="Morada de entrega"
                >

                    <div className="rounded-2xl bg-[#FAFBF8] p-5">

                        <p className="font-medium text-[#2F3B2A]">
                            {
                                order.deliveryStreet
                            }
                        </p>

                        {order.deliveryStreet2 && (
                            <p className="mt-1 text-sm text-gray-600">
                                {
                                    order.deliveryStreet2
                                }
                            </p>
                        )}

                        <p className="mt-3 text-sm text-gray-600">
                            {
                                order.deliveryPostalCode
                            }{" "}
                            {
                                order.deliveryCity
                            }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {
                                order.deliveryDistrict
                            }
                        </p>

                    </div>

                    {order.deliveryInstructions && (
                        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">

                            <Truck
                                size={18}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                    Instruções de entrega
                                </p>

                                <p className="mt-1 text-sm text-amber-800">
                                    {
                                        order.deliveryInstructions
                                    }
                                </p>

                            </div>

                        </div>
                    )}

                </InfoCard>

            </div>

            {/* ================================================================== */}
            {/* PRODUCTS                                                           */}
            {/* ================================================================== */}

            <InfoCard
                icon={Flower2}
                title="Os seus produtos"
            >

                <div className="divide-y divide-gray-100">

                    {order.items.map(
                        (item) => (
                            <div
                                key={
                                    item.id
                                }
                                className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
                            >

                                <div className="flex min-w-0 items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                        <Flower2
                                            size={21}
                                        />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="font-semibold text-[#2F3B2A]">
                                            {
                                                item.productName
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.quantity}{" "}
                                            unidade
                                            {item.quantity !==
                                            1
                                                ? "s"
                                                : ""}{" "}
                                            ×{" "}
                                            {formatCurrency(
                                                Number(
                                                    item.unitPrice,
                                                ),
                                            )}
                                        </p>

                                    </div>

                                </div>

                                <p className="shrink-0 font-semibold text-[#2F3B2A]">
                                    {formatCurrency(
                                        Number(
                                            item.lineTotal,
                                        ),
                                    )}
                                </p>

                            </div>
                        ),
                    )}

                </div>

            </InfoCard>

            {/* ================================================================== */}
            {/* CARD MESSAGE                                                       */}
            {/* ================================================================== */}

            {order.cardMessage && (
                <InfoCard
                    icon={
                        MessageSquare
                    }
                    title="Mensagem do cartão"
                >

                    <div className="rounded-2xl bg-[#F5F7F2] p-6">

                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                            “
                            {
                                order.cardMessage
                            }
                            ”
                        </p>

                    </div>

                </InfoCard>
            )}

            {/* ================================================================== */}
            {/* TOTAL                                                              */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-[#2F3B2A] p-6 text-white shadow-sm sm:p-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Euro size={21} />
                    </div>

                    <div>

                        <h2 className="text-lg font-bold">
                            Resumo da encomenda
                        </h2>

                        <p className="text-sm text-white/60">
                            Detalhes do pagamento
                        </p>

                    </div>

                </div>

                <div className="mt-6 space-y-3">

                    <SummaryLine
                        label="Subtotal"
                        value={formatCurrency(
                            Number(
                                order.subtotal,
                            ),
                        )}
                    />

                    <SummaryLine
                        label="Entrega"
                        value={formatCurrency(
                            Number(
                                order.deliveryFee,
                            ),
                        )}
                    />

                    {Number(
                        order.discount,
                    ) > 0 && (
                        <SummaryLine
                            label="Desconto"
                            value={`-${formatCurrency(
                                Number(
                                    order.discount,
                                ),
                            )}`}
                        />
                    )}

                    <div className="my-4 border-t border-white/10" />

                    <div className="flex items-center justify-between">

                        <span className="text-base font-semibold">
                            Total
                        </span>

                        <span className="text-2xl font-bold">
                            {formatCurrency(
                                Number(
                                    order.total,
                                ),
                            )}
                        </span>

                    </div>

                </div>

            </div>

            {/* ================================================================== */}
            {/* HISTORY                                                            */}
            {/* ================================================================== */}

            {order.statusHistory
                ?.length > 0 && (
                <InfoCard
                    icon={Clock3}
                    title="Histórico da encomenda"
                >

                    <div className="space-y-0">

                        {order.statusHistory.map(
                            (
                                history,
                                index,
                            ) => (
                                <HistoryItem
                                    key={
                                        history.id
                                    }
                                    history={
                                        history
                                    }
                                    isLast={
                                        index ===
                                        order
                                            .statusHistory
                                            .length -
                                            1
                                    }
                                />
                            ),
                        )}

                    </div>

                </InfoCard>
            )}

        </div>
    );
}

/* ========================================================================== */
/* STATUS PILL                                                                */
/* ========================================================================== */

function StatusPill({
    status,
}: {
    status: OrderStatus;
}) {
    const isCancelled =
        status === "CANCELLED";

    const isDelivered =
        status === "DELIVERED";

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-semibold
                ${
                    isCancelled
                        ? "border-red-100 bg-red-50 text-red-700"
                        : isDelivered
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-[#D6DEC8] bg-[#F5F7F2] text-[#55624A]"
                }
            `}
        >

            <span
                className={`
                    h-2
                    w-2
                    rounded-full
                    ${
                        isCancelled
                            ? "bg-red-500"
                            : isDelivered
                              ? "bg-green-500"
                              : "bg-[#55624A]"
                    }
                `}
            />

            {
                statusConfig[
                    status
                ].label
            }

        </span>
    );
}

/* ========================================================================== */
/* ORDER PROGRESS                                                             */
/* ========================================================================== */

function OrderProgress({
    currentIndex,
}: {
    currentIndex: number;
}) {
    return (
        <div className="mt-10">

            <div className="relative">

                <div className="absolute left-0 right-0 top-4 hidden h-0.5 bg-gray-100 sm:block" />

                <div
                    className="
                        absolute
                        left-0
                        top-4
                        hidden
                        h-0.5
                        bg-[#55624A]
                        transition-all
                        sm:block
                    "
                    style={{
                        width:
                            currentIndex <= 0
                                ? "0%"
                                : `${Math.min(
                                      100,
                                      (currentIndex /
                                          (progressStatuses.length -
                                              1)) *
                                          100,
                                  )}%`,
                    }}
                />

                <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-6">

                    {progressStatuses.map(
                        (
                            status,
                            index,
                        ) => {
                            const completed =
                                index <=
                                currentIndex;

                            return (
                                <div
                                    key={
                                        status
                                    }
                                    className="flex flex-col items-center text-center"
                                >

                                    <div
                                        className={`
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-full
                                            border-2
                                            ${
                                                completed
                                                    ? "border-[#55624A] bg-[#55624A] text-white"
                                                    : "border-gray-200 bg-white text-gray-300"
                                            }
                                        `}
                                    >
                                        {completed ? (
                                            <Check
                                                size={
                                                    15
                                                }
                                            />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-gray-200" />
                                        )}
                                    </div>

                                    <p
                                        className={`
                                            mt-3
                                            text-xs
                                            font-medium
                                            ${
                                                completed
                                                    ? "text-[#55624A]"
                                                    : "text-gray-400"
                                            }
                                        `}
                                    >
                                        {
                                            statusConfig[
                                                status
                                            ].label
                                        }
                                    </p>

                                </div>
                            );
                        },
                    )}

                </div>

            </div>

            <div className="mt-7 rounded-2xl bg-[#F5F7F2] p-4 text-center">

                <p className="text-sm font-semibold text-[#55624A]">
                    {
                        statusConfig[
                            progressStatuses[
                                currentIndex
                            ] ??
                                "CREATED"
                        ].label
                    }
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    {
                        statusConfig[
                            progressStatuses[
                                currentIndex
                            ] ??
                                "CREATED"
                        ].description
                    }
                </p>

            </div>

        </div>
    );
}

/* ========================================================================== */
/* INFO CARD                                                                  */
/* ========================================================================== */

function InfoCard({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <Icon size={21} />
                </div>

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    {title}
                </h2>

            </div>

            <div className="mt-6">
                {children}
            </div>

        </div>
    );
}

/* ========================================================================== */
/* INFO ITEM                                                                  */
/* ========================================================================== */

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                {value}
            </p>

        </div>
    );
}

/* ========================================================================== */
/* SUMMARY LINE                                                               */
/* ========================================================================== */

function SummaryLine({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between text-sm">

            <span className="text-white/60">
                {label}
            </span>

            <span className="font-medium">
                {value}
            </span>

        </div>
    );
}

/* ========================================================================== */
/* HISTORY ITEM                                                               */
/* ========================================================================== */

function HistoryItem({
    history,
    isLast,
}: {
    history: StatusHistory;
    isLast: boolean;
}) {
    const status =
        statusConfig[
            history.toStatus
        ];

    return (
        <div className="flex gap-4">

            <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">

                    <CheckCircle2
                        size={17}
                    />

                </div>

                {!isLast && (
                    <div className="mt-2 h-full w-px bg-gray-100" />
                )}

            </div>

            <div
                className={`
                    min-w-0
                    flex-1
                    ${
                        isLast
                            ? "pb-0"
                            : "pb-7"
                    }
                `}
            >

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <p className="font-semibold text-[#2F3B2A]">
                        {
                            status.label
                        }
                    </p>

                    <span className="text-xs text-gray-400">
                        {formatDateTime(
                            history.createdAt,
                        )}
                    </span>

                </div>

                {history.reason && (
                    <p className="mt-2 text-sm text-gray-500">
                        {
                            history.reason
                        }
                    </p>
                )}

            </div>

        </div>
    );
}