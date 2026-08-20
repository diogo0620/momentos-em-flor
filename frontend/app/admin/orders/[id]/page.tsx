"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Check,
    Clock,
    Pencil,
    Plus,
    X,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";

import { getOrder } from "@/lib/api/orders";

import {
    acceptOrderOffer,
    declineOrderOffer,
} from "@/lib/api/order-offers";

import type {
    Order,
    OrderStatusHistory,
} from "@/types/order";

import type { OrderOffer } from "@/types/order-offer";

import OrderOfferForm from "@/components/admin/orders/OrderOfferForm";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(value));
}

function formatDate(value: string) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatDateTime(value: string) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatTimeSlot(value: string) {
    const labels: Record<string, string> = {
        MORNING: "Manhã",
        AFTERNOON: "Tarde",
        EVENING: "Noite",
    };

    return labels[value] ?? value;
}

function formatOccasion(value: string | null) {
    if (!value) {
        return "—";
    }

    const labels: Record<string, string> = {
        BIRTHDAY: "Aniversário",
        ANNIVERSARY: "Aniversário",
        LOVE: "Amor",
        WEDDING: "Casamento",
        FUNERAL: "Funeral",
        NEW_BABY: "Nascimento de bebé",
        MOTHERS_DAY: "Dia da Mãe",
        FATHERS_DAY: "Dia do Pai",
        CHRISTMAS: "Natal",
        OTHER: "Outra ocasião",
    };

    return labels[value] ?? value;
}

/* -------------------------------------------------------------------------- */
/* ORDER STATUS                                                               */
/* -------------------------------------------------------------------------- */

function getOrderStatusLabel(status: string) {
    const labels: Record<string, string> = {
        CREATED: "Criada",
        WAITING_FOR_FLORISTS:
            "À espera de floristas",
        ASSIGNED: "Atribuída",
        IN_PRODUCTION: "Em preparação",
        READY_FOR_DELIVERY:
            "Pronta para entrega",
        DELIVERED: "Entregue",
        CANCELLED: "Cancelada",
    };

    return labels[status] ?? status;
}

function getOrderStatusClass(status: string) {
    switch (status) {
        case "CREATED":
            return "bg-blue-50 text-blue-700";

        case "WAITING_FOR_FLORISTS":
            return "bg-yellow-50 text-yellow-700";

        case "ASSIGNED":
            return "bg-green-50 text-green-700";

        case "IN_PRODUCTION":
            return "bg-[#D6DEC8] text-[#55624A]";

        case "READY_FOR_DELIVERY":
            return "bg-purple-50 text-purple-700";

        case "DELIVERED":
            return "bg-green-50 text-green-700";

        case "CANCELLED":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-600";
    }
}

/* -------------------------------------------------------------------------- */
/* OFFER STATUS                                                               */
/* -------------------------------------------------------------------------- */

function getOfferStatusLabel(status: string) {
    const labels: Record<string, string> = {
        PENDING: "Pendente",
        VIEWED: "Visualizada",
        ACCEPTED: "Aceite",
        DECLINED: "Recusada",
        EXPIRED: "Expirada",
    };

    return labels[status] ?? status;
}

function getOfferStatusClasses(status: string) {
    switch (status) {
        case "PENDING":
            return {
                badge: "bg-yellow-50 text-yellow-700",
                border: "border-yellow-200",
                background: "bg-yellow-50/30",
                dot: "bg-yellow-500",
            };

        case "VIEWED":
            return {
                badge: "bg-blue-50 text-blue-700",
                border: "border-blue-200",
                background: "bg-blue-50/30",
                dot: "bg-blue-500",
            };

        case "ACCEPTED":
            return {
                badge: "bg-green-50 text-green-700",
                border: "border-green-200",
                background: "bg-green-50/30",
                dot: "bg-green-500",
            };

        case "DECLINED":
            return {
                badge: "bg-red-50 text-red-700",
                border: "border-red-200",
                background: "bg-red-50/30",
                dot: "bg-red-500",
            };

        case "EXPIRED":
            return {
                badge: "bg-gray-100 text-gray-500",
                border: "border-gray-200",
                background: "bg-gray-50",
                dot: "bg-gray-400",
            };

        default:
            return {
                badge: "bg-gray-100 text-gray-600",
                border: "border-gray-200",
                background: "bg-gray-50",
                dot: "bg-gray-400",
            };
    }
}

function canManageOffer(
    offer: OrderOffer,
) {
    return (
        offer.status === "PENDING" ||
        offer.status === "VIEWED"
    );
}

/* -------------------------------------------------------------------------- */
/* HISTORY                                                                    */
/* -------------------------------------------------------------------------- */

function getHistoryUserName(
    history: OrderStatusHistory,
) {
    if (!history.changedByUser) {
        return "Sistema";
    }

    return `${history.changedByUser.firstName} ${history.changedByUser.lastName}`;
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminOrderDetailPage({
    params,
}: Props) {
    const { isLoading: authLoading } =
        useAuth();

    const [orderId, setOrderId] =
        useState<number | null>(null);

    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [offerFormOpen, setOfferFormOpen] =
        useState(false);

    const [editingOffer, setEditingOffer] =
        useState<OrderOffer | null>(null);

    const [processingOfferId, setProcessingOfferId] =
        useState<number | null>(null);

    const [decliningOfferId, setDecliningOfferId] =
        useState<number | null>(null);

    const [declineReason, setDeclineReason] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* RESOLVE PARAMS                                                         */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        async function resolveParams() {
            try {
                const resolvedParams =
                    await params;

                const parsedId = Number(
                    resolvedParams.id,
                );

                if (
                    !Number.isInteger(parsedId) ||
                    parsedId <= 0
                ) {
                    setError(
                        "O ID da encomenda é inválido.",
                    );

                    setLoading(false);

                    return;
                }

                setOrderId(parsedId);
            } catch {
                setError(
                    "Não foi possível obter o ID da encomenda.",
                );

                setLoading(false);
            }
        }

        resolveParams();
    }, [params]);

    /* ---------------------------------------------------------------------- */
    /* LOAD ORDER                                                             */
    /* ---------------------------------------------------------------------- */

    async function loadOrder(
        id: number,
    ) {
        try {
            setLoading(true);
            setError(null);

            const response =
                await getOrder(id);

            setOrder(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a encomenda.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (authLoading || !orderId) {
            return;
        }

        loadOrder(orderId);
    }, [authLoading, orderId]);

    /* ---------------------------------------------------------------------- */
    /* ACCEPT OFFER                                                           */
    /* ---------------------------------------------------------------------- */

    async function handleAcceptOffer(
        offer: OrderOffer,
    ) {
        if (!canManageOffer(offer)) {
            return;
        }

        try {
            setProcessingOfferId(
                offer.id,
            );

            setError(null);

            await acceptOrderOffer(
                offer.id,
            );

            if (orderId) {
                await loadOrder(orderId);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível aceitar a proposta.",
            );
        } finally {
            setProcessingOfferId(null);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* DECLINE OFFER                                                          */
    /* ---------------------------------------------------------------------- */

    async function handleDeclineOffer(
        offer: OrderOffer,
    ) {
        if (!canManageOffer(offer)) {
            return;
        }

        const reason =
            declineReason.trim();

        if (!reason) {
            setError(
                "Indique o motivo da recusa.",
            );

            return;
        }

        try {
            setProcessingOfferId(
                offer.id,
            );

            setError(null);

            await declineOrderOffer(
                offer.id,
                reason,
            );

            setDecliningOfferId(null);
            setDeclineReason("");

            if (orderId) {
                await loadOrder(orderId);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível recusar a proposta.",
            );
        } finally {
            setProcessingOfferId(null);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                */
    /* ---------------------------------------------------------------------- */

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#55624A]" />

                    <p className="mt-4 text-sm text-gray-500">
                        A carregar encomenda...
                    </p>

                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* ERROR                                                                  */
    /* ---------------------------------------------------------------------- */

    if (error || !order) {
        return (
            <div className="pb-12">

                <Link
                    href="/admin/orders"
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

                    <h1 className="text-2xl font-bold text-[#2F3B2A]">
                        Não foi possível carregar a encomenda
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {error ??
                            "A encomenda não foi encontrada."}
                    </p>

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* BUSINESS RULES                                                         */
    /* ---------------------------------------------------------------------- */

    const isOrderAssigned =
        order.offers.some(
            (offer) =>
                offer.status === "ACCEPTED",
        );

    const canCreateOffer =
        !isOrderAssigned &&
        order.status !== "CANCELLED" &&
        order.status !== "DELIVERED";

    /* ---------------------------------------------------------------------- */
    /* PAGE                                                                   */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="pb-12">

            {/* ---------------------------------------------------------------- */}
            {/* HEADER                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div>

                <Link
                    href="/admin/orders"
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

                <div className="mt-5">

                    <div className="flex flex-wrap items-center gap-3">

                        <h1 className="text-3xl font-bold text-[#2F3B2A]">
                            {order.orderNumber}
                        </h1>

                        <span
                            className={`
                                rounded-full
                                px-4
                                py-2
                                text-sm
                                font-medium
                                ${getOrderStatusClass(
                                    order.status,
                                )}
                            `}
                        >
                            {getOrderStatusLabel(
                                order.status,
                            )}
                        </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        Criada em{" "}
                        {formatDateTime(
                            order.createdAt,
                        )}
                    </p>

                </div>

            </div>

            {/* ---------------------------------------------------------------- */}
            {/* ERROR ACTION                                                     */}
            {/* ---------------------------------------------------------------- */}

            {error && (
                <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* CLIENTE / DESTINATÁRIO                                          */}
            {/* ---------------------------------------------------------------- */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

                <section className="rounded-3xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                        Cliente
                    </h2>

                    <div className="mt-5 space-y-4">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Nome
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                                {order.customerFirstName}{" "}
                                {order.customerLastName}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Email
                            </p>

                            <p className="mt-1 text-gray-700">
                                {order.customerEmail ??
                                    "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Telefone
                            </p>

                            <p className="mt-1 text-gray-700">
                                {order.customerPhone ??
                                    "—"}
                            </p>
                        </div>

                    </div>

                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                        Destinatário
                    </h2>

                    <div className="mt-5 space-y-4">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Nome
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                                {
                                    order.recipientFirstName
                                }{" "}
                                {order.recipientLastName ??
                                    ""}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Telefone
                            </p>

                            <p className="mt-1 text-gray-700">
                                {order.recipientPhone ??
                                    "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Ocasião
                            </p>

                            <p className="mt-1 text-gray-700">
                                {formatOccasion(
                                    order.occasion,
                                )}
                            </p>
                        </div>

                    </div>

                </section>

            </div>

            {/* ---------------------------------------------------------------- */}
            {/* ENTREGA                                                          */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

                <h2 className="text-lg font-bold text-[#2F3B2A]">
                    Entrega
                </h2>

                <div className="mt-5 grid gap-6 md:grid-cols-3">

                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            Data de entrega
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                            {formatDate(
                                order.deliveryDate,
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            Período
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                            {formatTimeSlot(
                                order.deliveryTimeSlot,
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            País
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                            {
                                order.deliveryCountryCode
                            }
                        </p>
                    </div>

                </div>

                <div className="mt-6">

                    <p className="text-xs uppercase tracking-wide text-gray-400">
                        Morada de entrega
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                        {order.deliveryStreet}

                        {order.deliveryStreet2 &&
                            `, ${order.deliveryStreet2}`}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {order.deliveryPostalCode}{" "}
                        {order.deliveryCity}

                        {order.deliveryDistrict &&
                            ` · ${order.deliveryDistrict}`}
                    </p>

                </div>

                {order.deliveryInstructions && (
                    <div className="mt-6 rounded-2xl bg-[#F8F9F5] p-4">

                        <p className="text-sm font-semibold text-[#2F3B2A]">
                            Instruções de entrega
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {
                                order.deliveryInstructions
                            }
                        </p>

                    </div>
                )}

                {order.cardMessage && (
                    <div className="mt-4 rounded-2xl bg-[#F8F9F5] p-4">

                        <p className="text-sm font-semibold text-[#2F3B2A]">
                            Mensagem do cartão
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {order.cardMessage}
                        </p>

                    </div>
                )}

            </section>

            {/* ---------------------------------------------------------------- */}
            {/* PRODUTOS                                                         */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

                <div>
                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                        Produtos
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {order.items.length}{" "}
                        {order.items.length === 1
                            ? "produto"
                            : "produtos"}
                    </p>
                </div>

                <div className="mt-6 space-y-3">

                    {order.items.map(
                        (item) => (
                            <div
                                key={item.id}
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    rounded-2xl
                                    bg-[#F8F9F5]
                                    p-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <div>

                                    <p className="font-semibold text-gray-700">
                                        {
                                            item.productName
                                        }
                                    </p>

                                    {item.productDescription && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {
                                                item.productDescription
                                            }
                                        </p>
                                    )}

                                    <p className="mt-2 text-sm text-gray-400">
                                        {
                                            item.quantity
                                        }{" "}
                                        ×{" "}
                                        {formatCurrency(
                                            item.unitPrice,
                                        )}
                                    </p>

                                </div>

                                <p className="text-lg font-bold text-[#55624A]">
                                    {formatCurrency(
                                        item.lineTotal,
                                    )}
                                </p>

                            </div>
                        ),
                    )}

                </div>

                <div className="mt-8 flex justify-end">

                    <div className="w-full max-w-sm space-y-3">

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Subtotal
                            </span>

                            <span className="text-gray-700">
                                {formatCurrency(
                                    order.subtotal,
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Taxa de entrega
                            </span>

                            <span className="text-gray-700">
                                {formatCurrency(
                                    order.deliveryFee,
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Desconto
                            </span>

                            <span className="text-gray-700">
                                {formatCurrency(
                                    order.discount,
                                )}
                            </span>
                        </div>

                        <div className="border-t border-gray-200 pt-4">

                            <div className="flex items-center justify-between">

                                <span className="font-semibold text-[#2F3B2A]">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-[#55624A]">
                                    {formatCurrency(
                                        order.total,
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* ---------------------------------------------------------------- */}
            {/* PROPOSTAS                                                        */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Propostas
                            </h2>

                            <span className="rounded-full bg-[#F3F5EE] px-3 py-1 text-xs font-semibold text-[#55624A]">
                                {order.offers.length}
                            </span>

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Propostas enviadas às floristas para esta encomenda.
                        </p>

                    </div>

                    {canCreateOffer && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingOffer(null);
                                setOfferFormOpen(true);
                            }}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-[#55624A]
                                px-5
                                py-3
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:opacity-90
                            "
                        >
                            <Plus size={17} />
                            Nova proposta
                        </button>
                    )}

                </div>

                {isOrderAssigned && (
                    <div className="mt-5 rounded-2xl bg-green-50 p-4">

                        <p className="text-sm font-semibold text-green-700">
                            Encomenda atribuída
                        </p>

                        <p className="mt-1 text-sm text-green-600">
                            Esta encomenda já foi aceite por uma florista.
                            Não podem ser criadas novas propostas.
                        </p>

                    </div>
                )}

                {!isOrderAssigned &&
                    !canCreateOffer && (
                        <div className="mt-5 rounded-2xl bg-gray-50 p-4">

                            <p className="text-sm font-semibold text-gray-700">
                                Novas propostas indisponíveis
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                A encomenda já não se encontra num estado que permita criar propostas.
                            </p>

                        </div>
                    )}

                {/* FORM */}

                {offerFormOpen && (
                    <div className="mt-6 rounded-2xl border border-[#D6DEC8] bg-[#F8F9F5] p-6">

                        <div className="mb-6 flex items-center justify-between">

                            <h3 className="font-semibold text-[#2F3B2A]">
                                {editingOffer
                                    ? "Editar proposta"
                                    : "Nova proposta"}
                            </h3>

                            <button
                                type="button"
                                onClick={() => {
                                    setOfferFormOpen(
                                        false,
                                    );

                                    setEditingOffer(
                                        null,
                                    );
                                }}
                                className="
                                    rounded-full
                                    p-2
                                    text-gray-400
                                    transition
                                    hover:bg-white
                                    hover:text-gray-600
                                "
                            >
                                <X size={18} />
                            </button>

                        </div>

                        <OrderOfferForm
                            orderId={order.id}
                            offer={editingOffer}
                            onCancel={() => {
                                setOfferFormOpen(
                                    false,
                                );

                                setEditingOffer(
                                    null,
                                );
                            }}
                            onSuccess={() => {
                                setOfferFormOpen(
                                    false,
                                );

                                setEditingOffer(
                                    null,
                                );

                                loadOrder(order.id);
                            }}
                        />

                    </div>
                )}

                {/* OFFERS */}

                {order.offers.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-10 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]">
                            <Plus size={20} />
                        </div>

                        <p className="mt-4 font-medium text-gray-600">
                            Ainda não existem propostas
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            Cria uma proposta para enviar a encomenda a uma florista.
                        </p>

                    </div>
                ) : (
                    <div className="mt-6 space-y-4">

                        {order.offers.map(
                            (offer) => {
                                const styles =
                                    getOfferStatusClasses(
                                        offer.status,
                                    );

                                const manageable =
                                    canManageOffer(
                                        offer,
                                    );

                                const isProcessing =
                                    processingOfferId ===
                                    offer.id;

                                const isDeclining =
                                    decliningOfferId ===
                                    offer.id;

                                return (
                                    <div
                                        key={offer.id}
                                        className={`
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            ${styles.border}
                                            ${styles.background}
                                        `}
                                    >

                                        {/* OFFER HEADER */}

                                        <div className="p-5">

                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                                <div className="flex items-start gap-4">

                                                    <div
                                                        className={`
                                                            mt-1
                                                            h-3
                                                            w-3
                                                            shrink-0
                                                            rounded-full
                                                            ${styles.dot}
                                                        `}
                                                    />

                                                    <div>

                                                        <div className="flex flex-wrap items-center gap-3">

                                                            <h3 className="text-base font-bold text-[#2F3B2A]">
                                                                {offer.florist?.name ??
                                                                    `Florista #${offer.floristId}`}
                                                            </h3>

                                                            <span
                                                                className={`
                                                                    rounded-full
                                                                    px-3
                                                                    py-1
                                                                    text-xs
                                                                    font-semibold
                                                                    ${styles.badge}
                                                                `}
                                                            >
                                                                {getOfferStatusLabel(
                                                                    offer.status,
                                                                )}
                                                            </span>

                                                        </div>

                                                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">

                                                            <span>
                                                                Criada{" "}
                                                                {formatDateTime(
                                                                    offer.createdAt,
                                                                )}
                                                            </span>

                                                            <span>
                                                                Expira{" "}
                                                                {formatDateTime(
                                                                    offer.expiresAt,
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* AMOUNT */}

                                                <div className="flex items-center justify-between gap-6 lg:justify-end">

                                                    <div className="text-left lg:text-right">

                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                            Compensação
                                                        </p>

                                                        <p className="mt-1 text-2xl font-bold text-[#55624A]">
                                                            {formatCurrency(
                                                                offer.compensationAmount,
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                        {/* DECLINE REASON */}

                                        {offer.declineReason && (
                                            <div className="border-t border-red-100 bg-red-50 px-5 py-4">

                                                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                                                    Motivo da recusa
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-red-700">
                                                    {
                                                        offer.declineReason
                                                    }
                                                </p>

                                            </div>
                                        )}

                                        {/* ACTIONS */}

                                        {manageable &&
                                            !isDeclining && (
                                                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-black/5 px-5 py-4">

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() => {
                                                            setEditingOffer(
                                                                offer,
                                                            );

                                                            setOfferFormOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-gray-200
                                                            bg-white
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            text-gray-600
                                                            transition
                                                            hover:bg-gray-50
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />
                                                        Editar valor
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() => {
                                                            setDecliningOfferId(
                                                                offer.id,
                                                            );

                                                            setDeclineReason(
                                                                "",
                                                            );

                                                            setError(
                                                                null,
                                                            );
                                                        }}
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-red-200
                                                            bg-white
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            text-red-600
                                                            transition
                                                            hover:bg-red-50
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <X
                                                            size={
                                                                16
                                                            }
                                                        />
                                                        Recusar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            handleAcceptOffer(
                                                                offer,
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-xl
                                                            bg-[#55624A]
                                                            px-5
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            text-white
                                                            transition
                                                            hover:opacity-90
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <Check
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        {isProcessing
                                                            ? "A processar..."
                                                            : "Aceitar"}
                                                    </button>

                                                </div>
                                            )}

                                        {/* DECLINE FORM */}

                                        {manageable &&
                                            isDeclining && (
                                                <div className="border-t border-red-100 bg-red-50/60 p-5">

                                                    <p className="text-sm font-semibold text-[#2F3B2A]">
                                                        Recusar proposta
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Indique o motivo da recusa desta proposta.
                                                    </p>

                                                    <textarea
                                                        value={
                                                            declineReason
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            setDeclineReason(
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        rows={
                                                            3
                                                        }
                                                        maxLength={
                                                            500
                                                        }
                                                        placeholder="Ex.: O valor proposto não é adequado para esta encomenda."
                                                        className="
                                                            mt-4
                                                            w-full
                                                            resize-none
                                                            rounded-xl
                                                            border
                                                            border-red-200
                                                            bg-white
                                                            p-3
                                                            text-sm
                                                            outline-none
                                                            transition
                                                            focus:border-red-400
                                                            focus:ring-4
                                                            focus:ring-red-100
                                                        "
                                                        autoFocus
                                                    />

                                                    <div className="mt-4 flex justify-end gap-3">

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            onClick={() => {
                                                                setDecliningOfferId(
                                                                    null,
                                                                );

                                                                setDeclineReason(
                                                                    "",
                                                                );
                                                            }}
                                                            className="
                                                                rounded-xl
                                                                px-4
                                                                py-2.5
                                                                text-sm
                                                                font-medium
                                                                text-gray-600
                                                                transition
                                                                hover:bg-white
                                                            "
                                                        >
                                                            Cancelar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isProcessing ||
                                                                !declineReason.trim()
                                                            }
                                                            onClick={() =>
                                                                handleDeclineOffer(
                                                                    offer,
                                                                )
                                                            }
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-2
                                                                rounded-xl
                                                                bg-red-600
                                                                px-5
                                                                py-2.5
                                                                text-sm
                                                                font-medium
                                                                text-white
                                                                transition
                                                                hover:opacity-90
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            <X
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            {isProcessing
                                                                ? "A recusar..."
                                                                : "Confirmar recusa"}
                                                        </button>

                                                    </div>

                                                </div>
                                            )}

                                        {/* LOCKED MESSAGE */}

                                        {!manageable && (
                                            <div className="border-t border-black/5 px-5 py-3">

                                                <p className="text-xs text-gray-400">

                                                    {offer.status ===
                                                    "ACCEPTED"
                                                        ? "Esta proposta foi aceite e já não pode ser alterada."
                                                        : offer.status ===
                                                            "DECLINED"
                                                          ? "Esta proposta foi recusada e já não pode ser alterada."
                                                          : offer.status ===
                                                              "EXPIRED"
                                                            ? "Esta proposta expirou e já não pode ser alterada."
                                                            : "Esta proposta já não pode ser alterada."}

                                                </p>

                                            </div>
                                        )}

                                    </div>
                                );
                            },
                        )}

                    </div>
                )}

            </section>

            {/* ---------------------------------------------------------------- */}
            {/* HISTÓRICO                                                        */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

                <div>

                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                        Histórico da encomenda
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Registo das alterações de estado desta encomenda.
                    </p>

                </div>

                {order.statusHistory.length ===
                0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">

                        <p className="font-medium text-gray-600">
                            Ainda não existe histórico.
                        </p>

                    </div>
                ) : (
                    <div className="relative mt-8">

                        <div className="
                            absolute
                            bottom-0
                            left-[11px]
                            top-0
                            w-px
                            bg-gray-200
                        " />

                        <div className="space-y-8">

                            {order.statusHistory.map(
                                (history) => (
                                    <div
                                        key={history.id}
                                        className="relative flex gap-5"
                                    >

                                        <div className="
                                            relative
                                            z-10
                                            mt-1
                                            h-[23px]
                                            w-[23px]
                                            shrink-0
                                            rounded-full
                                            border-4
                                            border-white
                                            bg-[#55624A]
                                            shadow-sm
                                        " />

                                        <div className="min-w-0 flex-1">

                                            <p className="text-sm font-semibold text-[#2F3B2A]">
                                                {formatDateTime(
                                                    history.createdAt,
                                                )}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">

                                                {history.fromStatus && (
                                                    <>
                                                        <span className="
                                                            rounded-full
                                                            bg-gray-100
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-gray-600
                                                        ">
                                                            {getOrderStatusLabel(
                                                                history.fromStatus,
                                                            )}
                                                        </span>

                                                        <span className="text-gray-400">
                                                            →
                                                        </span>
                                                    </>
                                                )}

                                                <span className="
                                                    rounded-full
                                                    bg-[#D6DEC8]
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    text-[#55624A]
                                                ">
                                                    {getOrderStatusLabel(
                                                        history.toStatus,
                                                    )}
                                                </span>

                                            </div>

                                            <p className="mt-3 text-sm text-gray-500">

                                                Alterado por{" "}

                                                <span className="font-medium text-gray-700">
                                                    {getHistoryUserName(
                                                        history,
                                                    )}
                                                </span>

                                            </p>

                                            {history.changedByUser && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {history
                                                        .changedByUser
                                                        .role ===
                                                    "SYSTEM_ADMIN"
                                                        ? "Administrador"
                                                        : history
                                                              .changedByUser
                                                              .role ===
                                                          "FLORIST"
                                                        ? "Florista"
                                                        : "Cliente"}
                                                </p>
                                            )}

                                            {history.reason && (
                                                <div className="mt-3 rounded-xl bg-[#F8F9F5] p-3">

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                        Motivo
                                                    </p>

                                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                                        {
                                                            history.reason
                                                        }
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                ),
                            )}

                        </div>

                    </div>
                )}

            </section>

        </div>
    );
}