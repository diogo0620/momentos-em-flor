"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    History,
    Loader2,
    MapPin,
    MessageSquare,
    Package,
    Phone,
    User,
    XCircle,
} from "lucide-react";

import {
    deliverOrder,
    getOrder,
    readyForDelivery,
    startProduction,
} from "@/lib/api/orders";

import type {
    Order,
    OrderStatus,
} from "@/types/order";

/* -------------------------------------------------------------------------- */
/* STATUS                                                                     */
/* -------------------------------------------------------------------------- */

const statusLabels: Record<OrderStatus, string> = {
    CREATED: "Criada",
    WAITING_FOR_FLORISTS: "À espera de florista",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
};

const statusStyles: Record<
    OrderStatus,
    {
        badge: string;
        dot: string;
        panel: string;
        icon: string;
        title: string;
        description: string;
    }
> = {
    CREATED: {
        badge:
            "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        panel:
            "border-blue-100 bg-blue-50",
        icon:
            "bg-blue-100 text-blue-700",
        title: "Encomenda criada",
        description:
            "A encomenda foi criada e está a aguardar processamento.",
    },

    WAITING_FOR_FLORISTS: {
        badge:
            "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        panel:
            "border-amber-100 bg-amber-50",
        icon:
            "bg-amber-100 text-amber-700",
        title: "À espera de florista",
        description:
            "A encomenda está a aguardar que uma florista aceite a proposta.",
    },

    ASSIGNED: {
        badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        panel:
            "border-emerald-100 bg-emerald-50",
        icon:
            "bg-emerald-100 text-emerald-700",
        title: "Encomenda atribuída",
        description:
            "Esta encomenda foi atribuída à sua florista e pode começar a ser preparada.",
    },

    IN_PRODUCTION: {
        badge:
            "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-500",
        panel:
            "border-orange-100 bg-orange-50",
        icon:
            "bg-orange-100 text-orange-700",
        title: "Encomenda em preparação",
        description:
            "A encomenda está a ser preparada. Quando estiver pronta, poderá avançar para a entrega.",
    },

    READY_FOR_DELIVERY: {
        badge:
            "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-500",
        panel:
            "border-purple-100 bg-purple-50",
        icon:
            "bg-purple-100 text-purple-700",
        title: "Pronta para entrega",
        description:
            "A encomenda está pronta para ser entregue.",
    },

    DELIVERED: {
        badge:
            "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-500",
        panel:
            "border-green-100 bg-green-50",
        icon:
            "bg-green-100 text-green-700",
        title: "Encomenda entregue",
        description:
            "Esta encomenda foi marcada como entregue. Não existem mais ações pendentes.",
    },

    CANCELLED: {
        badge:
            "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
        panel:
            "border-red-100 bg-red-50",
        icon:
            "bg-red-100 text-red-700",
        title: "Encomenda cancelada",
        description:
            "Esta encomenda foi cancelada e já não pode ser processada.",
    },
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    ).format(new Date(value));
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(new Date(value));
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR",
        },
    ).format(Number(value));
}

function formatTimeSlot(value: string) {
    const labels: Record<string, string> = {
        MORNING: "Manhã",
        AFTERNOON: "Tarde",
        EVENING: "Noite",
    };

    return labels[value] ?? value;
}

function formatOccasion(
    value: string | null,
) {
    if (!value) {
        return null;
    }

    const labels: Record<string, string> = {
        BIRTHDAY: "Aniversário",
        ANNIVERSARY: "Aniversário",
        LOVE: "Amor",
        WEDDING: "Casamento",
        FUNERAL: "Funeral",
        NEW_BABY: "Nascimento",
        MOTHERS_DAY: "Dia da Mãe",
        FATHERS_DAY: "Dia do Pai",
        CHRISTMAS: "Natal",
        OTHER: "Outra ocasião",
    };

    return labels[value] ?? value;
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function FloristOrderDetailPage() {
    const params = useParams();

    const id = params.id;

    const orderId = Number(id);

    const [order, setOrder] =
        useState<Order | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        isChangingStatus,
        setIsChangingStatus,
    ] = useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [toast, setToast] =
        useState<{
            type: "success" | "error";
            message: string;
        } | null>(null);

    /* ---------------------------------------------------------------------- */
    /* TOAST                                                                  */
    /* ---------------------------------------------------------------------- */

    function showToast(
        type: "success" | "error",
        message: string,
    ) {
        setToast({
            type,
            message,
        });
    }

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeout = setTimeout(() => {
            setToast(null);
        }, 4000);

        return () => {
            clearTimeout(timeout);
        };
    }, [toast]);

    /* ---------------------------------------------------------------------- */
    /* LOAD ORDER                                                             */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (
            !id ||
            Number.isNaN(orderId)
        ) {
            setError(
                "A encomenda solicitada não é válida.",
            );

            setIsLoading(false);

            return;
        }

        async function loadOrder() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getOrder(orderId);

                setOrder(response.data);
            } catch (err) {
                console.error(
                    "Erro ao obter order:",
                    err,
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar a encomenda.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadOrder();
    }, [id, orderId]);

    /* ---------------------------------------------------------------------- */
    /* CHANGE STATUS                                                          */
    /* ---------------------------------------------------------------------- */

    async function handleStatusChange(
        action:
            | "start-production"
            | "ready-for-delivery"
            | "deliver",
    ) {
        if (!order || isChangingStatus) {
            return;
        }

        try {
            setIsChangingStatus(true);

            let response: {
                success: boolean;
                data: Order;
            };

            switch (action) {
                case "start-production":
                    response =
                        await startProduction(
                            order.id,
                        );
                    break;

                case "ready-for-delivery":
                    response =
                        await readyForDelivery(
                            order.id,
                        );
                    break;

                case "deliver":
                    response =
                        await deliverOrder(
                            order.id,
                        );
                    break;
            }

            console.log(
                "Status alterado:",
                response,
            );

            /*
             * A API já devolve a order atualizada.
             * Não fazemos um novo GET.
             */
            setOrder(response.data);

            const messages = {
                "start-production":
                    "A encomenda foi colocada em preparação.",

                "ready-for-delivery":
                    "A encomenda foi marcada como pronta para entrega.",

                deliver:
                    "A encomenda foi marcada como entregue.",
            };

            showToast(
                "success",
                messages[action],
            );
        } catch (err) {
            console.error(
                "Erro ao alterar estado:",
                err,
            );

            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Não foi possível alterar o estado da encomenda.",
            );
        } finally {
            setIsChangingStatus(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                */
    /* ---------------------------------------------------------------------- */

    if (isLoading) {
        return (
            <div className="mx-auto max-w-6xl">

                <Link
                    href="/florist/orders"
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

                <div className="mt-8 space-y-5">

                    <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />

                    <div className="h-32 animate-pulse rounded-3xl bg-gray-100" />

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                        <div className="h-[700px] animate-pulse rounded-3xl bg-gray-100" />

                        <div className="h-[500px] animate-pulse rounded-3xl bg-gray-100" />

                    </div>

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* ERROR                                                                  */
    /* ---------------------------------------------------------------------- */

    if (error || !order) {
        return (
            <div className="mx-auto max-w-6xl">

                <Link
                    href="/florist/orders"
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

                <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">

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

                    <h1 className="mt-5 text-2xl font-bold text-[#2F3B2A]">
                        Encomenda não encontrada
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {error ??
                            "Não foi possível carregar a encomenda."}
                    </p>

                </div>

            </div>
        );
    }

    const status = order.status;

    const statusStyle =
        statusStyles[status];

    const occasion =
        formatOccasion(order.occasion);

    const recipientName = [
        order.recipientFirstName,
        order.recipientLastName,
    ]
        .filter(Boolean)
        .join(" ");

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="mx-auto max-w-6xl">

            {/* ================================================================= */}
            {/* TOAST                                                             */}
            {/* ================================================================= */}

            {toast && (
                <div
                    className="
                        fixed
                        right-6
                        top-6
                        z-[9999]
                        w-[calc(100%-3rem)]
                        max-w-sm
                    "
                >
                    <div
                        className={`
                            flex
                            items-start
                            gap-4
                            rounded-2xl
                            border
                            bg-white
                            p-4
                            shadow-2xl
                            ${
                                toast.type ===
                                "success"
                                    ? "border-green-200"
                                    : "border-red-200"
                            }
                        `}
                    >

                        <div
                            className={`
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                ${
                                    toast.type ===
                                    "success"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                }
                            `}
                        >
                            {toast.type ===
                            "success" ? (
                                <CheckCircle2
                                    size={21}
                                />
                            ) : (
                                <XCircle
                                    size={21}
                                />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="font-semibold text-[#2F3B2A]">
                                {toast.type ===
                                "success"
                                    ? "Ação concluída"
                                    : "Erro"}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                {
                                    toast.message
                                }
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setToast(
                                    null,
                                )
                            }
                            className="
                                shrink-0
                                rounded-full
                                p-1
                                text-gray-400
                                transition
                                hover:bg-gray-100
                                hover:text-gray-600
                            "
                            aria-label="Fechar"
                        >
                            <XCircle
                                size={18}
                            />
                        </button>

                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* HEADER                                                            */}
            {/* ================================================================= */}

            <div className="mb-6">

                <Link
                    href="/florist/orders"
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

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="text-sm font-medium uppercase tracking-wider text-[#55624A]">
                            Detalhe da encomenda
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                            #{order.orderNumber}
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Criada em{" "}
                            {formatDateTime(
                                order.createdAt,
                            )}
                        </p>

                    </div>

                    <span
                        className={`
                            inline-flex
                            items-center
                            gap-2
                            self-start
                            rounded-full
                            border
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            ${statusStyle.badge}
                        `}
                    >

                        <span
                            className={`
                                h-2
                                w-2
                                rounded-full
                                ${statusStyle.dot}
                            `}
                        />

                        {
                            statusLabels[
                                status
                            ]
                        }

                    </span>

                </div>

            </div>

            {/* ================================================================= */}
            {/* STATUS / ACTION                                                   */}
            {/* ================================================================= */}

            <section
                className={`
                    mb-6
                    rounded-3xl
                    border
                    p-6
                    ${statusStyle.panel}
                `}
            >

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-start gap-4">

                        <div
                            className={`
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                ${statusStyle.icon}
                            `}
                        >

                            {status ===
                            "DELIVERED" ? (
                                <CheckCircle2
                                    size={24}
                                />
                            ) : status ===
                              "CANCELLED" ? (
                                <XCircle
                                    size={24}
                                />
                            ) : status ===
                              "ASSIGNED" ? (
                                <Package
                                    size={24}
                                />
                            ) : status ===
                              "READY_FOR_DELIVERY" ? (
                                <Check
                                    size={24}
                                />
                            ) : (
                                <Clock
                                    size={24}
                                />
                            )}

                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                {
                                    statusStyle.title
                                }
                            </h2>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                                {
                                    statusStyle.description
                                }
                            </p>

                        </div>

                    </div>

                    {/* ACTIONS */}

                    {status ===
                        "ASSIGNED" && (
                        <button
                            type="button"
                            disabled={
                                isChangingStatus
                            }
                            onClick={() =>
                                handleStatusChange(
                                    "start-production",
                                )
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                py-3.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#46523C]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {isChangingStatus ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Package
                                    size={18}
                                />
                            )}

                            Começar preparação

                        </button>
                    )}

                    {status ===
                        "IN_PRODUCTION" && (
                        <button
                            type="button"
                            disabled={
                                isChangingStatus
                            }
                            onClick={() =>
                                handleStatusChange(
                                    "ready-for-delivery",
                                )
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                py-3.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#46523C]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {isChangingStatus ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Check
                                    size={18}
                                />
                            )}

                            Marcar como pronta

                        </button>
                    )}

                    {status ===
                        "READY_FOR_DELIVERY" && (
                        <button
                            type="button"
                            disabled={
                                isChangingStatus
                            }
                            onClick={() =>
                                handleStatusChange(
                                    "deliver",
                                )
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                py-3.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#46523C]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {isChangingStatus ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <CheckCircle2
                                    size={18}
                                />
                            )}

                            Marcar como entregue

                        </button>
                    )}

                    {status ===
                        "DELIVERED" && (
                        <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-green-700">

                            <CheckCircle2
                                size={18}
                            />

                            Processo concluído

                        </div>
                    )}

                    {status ===
                        "CANCELLED" && (
                        <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-red-700">

                            <XCircle
                                size={18}
                            />

                            Sem ações disponíveis

                        </div>
                    )}

                </div>

            </section>

            {/* ================================================================= */}
            {/* DELIVERY HIGHLIGHT                                                */}
            {/* ================================================================= */}

            <div className="mb-6 rounded-3xl bg-[#55624A] p-6 text-white shadow-sm">

                <div className="grid gap-6 md:grid-cols-3">

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                            <CalendarDays
                                size={21}
                            />
                        </div>

                        <div>

                            <p className="text-sm text-white/70">
                                Data de entrega
                            </p>

                            <p className="mt-1 font-semibold">
                                {formatDate(
                                    order.deliveryDate,
                                )}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                            <Clock size={21} />
                        </div>

                        <div>

                            <p className="text-sm text-white/70">
                                Período
                            </p>

                            <p className="mt-1 font-semibold">
                                {formatTimeSlot(
                                    order.deliveryTimeSlot,
                                )}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                            <MapPin
                                size={21}
                            />
                        </div>

                        <div>

                            <p className="text-sm text-white/70">
                                Local
                            </p>

                            <p className="mt-1 font-semibold">
                                {
                                    order.deliveryCity
                                }
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* ================================================================= */}
            {/* CONTENT                                                           */}
            {/* ================================================================= */}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                <div className="space-y-6">

                    {/* PRODUCTS */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                <Package size={20} />
                            </div>

                            <div>

                                <h2 className="font-semibold text-[#2F3B2A]">
                                    Produtos
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Artigos a preparar
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 divide-y divide-gray-100">

                            {order.items.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            py-4
                                            first:pt-0
                                            last:pb-0
                                        "
                                    >

                                        <div className="min-w-0">

                                            <p className="font-medium text-[#2F3B2A]">
                                                {
                                                    item.productName
                                                }
                                            </p>

                                            {item.productDescription && (
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                    {
                                                        item.productDescription
                                                    }
                                                </p>
                                            )}

                                        </div>

                                        <div className="shrink-0 text-right">

                                            <p className="text-sm font-medium text-gray-700">
                                                ×{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatCurrency(
                                                    item.lineTotal,
                                                )}
                                            </p>

                                        </div>

                                    </div>
                                ),
                            )}

                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-5">

                            <div className="flex items-center justify-between">

                                <span className="font-medium text-gray-500">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-[#55624A]">
                                    {formatCurrency(
                                        order.total,
                                    )}
                                </span>

                            </div>

                        </div>

                    </section>

                    {/* RECIPIENT */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                <User size={20} />
                            </div>

                            <div>

                                <h2 className="font-semibold text-[#2F3B2A]">
                                    Destinatário
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Pessoa que irá receber as flores
                                </p>

                            </div>

                        </div>

                        <div className="mt-6">

                            <p className="text-lg font-semibold text-[#2F3B2A]">
                                {
                                    recipientName
                                }
                            </p>

                            {order.recipientPhone && (
                                <a
                                    href={`tel:${order.recipientPhone}`}
                                    className="
                                        mt-3
                                        inline-flex
                                        items-center
                                        gap-2
                                        text-sm
                                        text-[#55624A]
                                        transition
                                        hover:underline
                                    "
                                >
                                    <Phone
                                        size={16}
                                    />

                                    {
                                        order.recipientPhone
                                    }
                                </a>
                            )}

                        </div>

                    </section>

                    {/* ADDRESS */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                <MapPin
                                    size={20}
                                />
                            </div>

                            <div>

                                <h2 className="font-semibold text-[#2F3B2A]">
                                    Morada de entrega
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Local onde a encomenda deve ser entregue
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 rounded-2xl bg-[#FAFBF8] p-5">

                            <p className="font-medium text-[#2F3B2A]">
                                {
                                    order.deliveryStreet
                                }
                            </p>

                            {order.deliveryStreet2 && (
                                <p className="mt-1 text-gray-600">
                                    {
                                        order.deliveryStreet2
                                    }
                                </p>
                            )}

                            <p className="mt-3 text-gray-600">
                                {
                                    order.deliveryPostalCode
                                }{" "}
                                {
                                    order.deliveryCity
                                }
                            </p>

                            <p className="text-gray-500">
                                {
                                    order.deliveryDistrict
                                }
                            </p>

                        </div>

                    </section>

                    {/* ADDITIONAL INFORMATION */}

                    {(order.deliveryInstructions ||
                        order.cardMessage ||
                        occasion) && (
                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                    <MessageSquare
                                        size={20}
                                    />
                                </div>

                                <div>

                                    <h2 className="font-semibold text-[#2F3B2A]">
                                        Informações adicionais
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Informações importantes para preparar e entregar a encomenda
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 space-y-5">

                                {occasion && (
                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Ocasião
                                        </p>

                                        <p className="mt-1 text-gray-700">
                                            {
                                                occasion
                                            }
                                        </p>

                                    </div>
                                )}

                                {order.deliveryInstructions && (
                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Instruções de entrega
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-gray-700">
                                            {
                                                order.deliveryInstructions
                                            }
                                        </p>

                                    </div>
                                )}

                                {order.cardMessage && (
                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Mensagem do cartão
                                        </p>

                                        <div className="mt-2 rounded-2xl bg-[#FAFBF8] p-4">

                                            <p className="whitespace-pre-wrap text-gray-700">
                                                {
                                                    order.cardMessage
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </section>
                    )}

                </div>

                {/* ================================================================= */}
                {/* SIDEBAR                                                          */}
                {/* ================================================================= */}

                <aside className="space-y-6">

                    {/* SUMMARY */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-semibold text-[#2F3B2A]">
                            Resumo
                        </h2>

                        <div className="mt-5 space-y-4">

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-sm text-gray-500">
                                    Subtotal
                                </span>

                                <span className="text-sm font-medium text-gray-700">
                                    {formatCurrency(
                                        order.subtotal,
                                    )}
                                </span>

                            </div>

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-sm text-gray-500">
                                    Entrega
                                </span>

                                <span className="text-sm font-medium text-gray-700">
                                    {formatCurrency(
                                        order.deliveryFee,
                                    )}
                                </span>

                            </div>

                            {Number(
                                order.discount,
                            ) > 0 && (
                                <div className="flex items-center justify-between gap-4">

                                    <span className="text-sm text-gray-500">
                                        Desconto
                                    </span>

                                    <span className="text-sm font-medium text-green-600">
                                        -
                                        {formatCurrency(
                                            order.discount,
                                        )}
                                    </span>

                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-4">

                                <div className="flex items-center justify-between gap-4">

                                    <span className="font-semibold text-[#2F3B2A]">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-[#55624A]">
                                        {formatCurrency(
                                            order.total,
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* HISTORY */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                                <History
                                    size={20}
                                />
                            </div>

                            <div>

                                <h2 className="font-semibold text-[#2F3B2A]">
                                    Histórico
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Evolução da encomenda
                                </p>

                            </div>

                        </div>

                        <div className="mt-6">

                            {order.statusHistory?.length ? (
                                <div className="relative space-y-6">

                                    <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200" />

                                    {[
                                        ...order.statusHistory,
                                    ]
                                        .sort(
                                            (
                                                a,
                                                b,
                                            ) =>
                                                new Date(
                                                    b.createdAt,
                                                ).getTime() -
                                                new Date(
                                                    a.createdAt,
                                                ).getTime(),
                                        )
                                        .map(
                                            (
                                                history,
                                            ) => {
                                                const historyStyle =
                                                    statusStyles[
                                                        history.toStatus
                                                    ];

                                                return (
                                                    <div
                                                        key={
                                                            history.id
                                                        }
                                                        className="relative flex gap-4"
                                                    >

                                                        <div
                                                            className={`
                                                                relative
                                                                z-10
                                                                mt-1
                                                                h-4
                                                                w-4
                                                                shrink-0
                                                                rounded-full
                                                                border-4
                                                                border-white
                                                                ${historyStyle.dot}
                                                            `}
                                                        />

                                                        <div className="min-w-0">

                                                            <p className="font-medium text-[#2F3B2A]">
                                                                {
                                                                    statusLabels[
                                                                        history.toStatus
                                                                    ]
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {formatDateTime(
                                                                    history.createdAt,
                                                                )}
                                                            </p>

                                                            {history.reason && (
                                                                <p className="mt-2 text-sm text-gray-500">
                                                                    {
                                                                        history.reason
                                                                    }
                                                                </p>
                                                            )}

                                                            {history.changedByUser && (
                                                                <p className="mt-2 text-xs text-gray-400">
                                                                    Alterado por{" "}
                                                                    {
                                                                        history
                                                                            .changedByUser
                                                                            .firstName
                                                                    }{" "}
                                                                    {
                                                                        history
                                                                            .changedByUser
                                                                            .lastName
                                                                    }
                                                                </p>
                                                            )}

                                                        </div>

                                                    </div>
                                                );
                                            },
                                        )}

                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    Ainda não existe histórico disponível.
                                </p>
                            )}

                        </div>

                    </section>

                </aside>

            </div>

        </div>
    );
}