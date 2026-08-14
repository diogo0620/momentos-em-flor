"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Pencil,
    Plus,
    X,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";

import { getOrder } from "@/lib/api/orders";

import type { Order } from "@/types/order";
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

function getOrderStatusLabel(
    status: string,
) {
    const labels: Record<string, string> = {
        PENDING: "Pendente",
        PROCESSING: "Em processamento",
        ACCEPTED: "Aceite",
        PREPARING: "Em preparação",
        OUT_FOR_DELIVERY: "Em entrega",
        DELIVERED: "Entregue",
        CANCELLED: "Cancelada",
    };

    return labels[status] ?? status;
}

function getOrderStatusClass(
    status: string,
) {
    switch (status) {
        case "PENDING":
            return "bg-yellow-50 text-yellow-700";

        case "PROCESSING":
            return "bg-blue-50 text-blue-700";

        case "ACCEPTED":
        case "DELIVERED":
            return "bg-green-50 text-green-700";

        case "PREPARING":
        case "OUT_FOR_DELIVERY":
            return "bg-[#D6DEC8] text-[#55624A]";

        case "CANCELLED":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-600";
    }
}

function getOfferStatusLabel(
    status: string,
) {
    const labels: Record<string, string> = {
        PENDING: "Pendente",
        VIEWED: "Visualizada",
        ACCEPTED: "Aceite",
        DECLINED: "Recusada",
        EXPIRED: "Expirada",
    };

    return labels[status] ?? status;
}

function getOfferStatusClass(
    status: string,
) {
    switch (status) {
        case "PENDING":
            return "bg-yellow-50 text-yellow-700";

        case "VIEWED":
            return "bg-blue-50 text-blue-700";

        case "ACCEPTED":
            return "bg-green-50 text-green-700";

        case "DECLINED":
            return "bg-red-50 text-red-700";

        case "EXPIRED":
            return "bg-gray-100 text-gray-500";

        default:
            return "bg-gray-100 text-gray-600";
    }
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

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!orderId) {
            return;
        }

        async function loadOrder() {
            try {
                setLoading(true);
                setError(null);

                console.log(
                    "ADMIN ORDER - GET:",
                    orderId,
                );

                const response =
                    await getOrder(orderId);

                console.log(
                    "ADMIN ORDER - RESPONSE:",
                    response,
                );

                setOrder(response.data);
            } catch (err) {
                console.error(
                    "ADMIN ORDER - ERROR:",
                    err,
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar a encomenda.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [authLoading, orderId]);

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
    /* OFFER / ORDER BUSINESS RULES                                          */
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
            {/* CLIENTE / DESTINATÁRIO                                          */}
            {/* ---------------------------------------------------------------- */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

                {/* CLIENTE */}

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
                                {order.customerEmail}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Telefone
                            </p>

                            <p className="mt-1 text-gray-700">
                                {order.customerPhone}
                            </p>
                        </div>

                    </div>

                </section>

                {/* DESTINATÁRIO */}

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
                                {order.recipientFirstName}{" "}
                                {order.recipientLastName ?? ""}
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
                            {order.deliveryCountryCode}
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
                            {order.deliveryInstructions}
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
                                        {item.productName}
                                    </p>

                                    {item.productDescription && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {
                                                item.productDescription
                                            }
                                        </p>
                                    )}

                                    <p className="mt-2 text-sm text-gray-400">
                                        {item.quantity} ×{" "}
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

                {/* RESUMO */}

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
                        <h2 className="text-lg font-bold text-[#2F3B2A]">
                            Propostas para floristas
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Gere as propostas associadas a esta encomenda.
                        </p>
                    </div>

                    {/* NOVA PROPOSTA */}

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

                {/* ORDER JÁ ATRIBUÍDA */}

                {isOrderAssigned && (
                    <div className="mt-5 rounded-2xl bg-green-50 p-4">

                        <p className="text-sm font-semibold text-green-700">
                            Esta encomenda já foi atribuída a uma florista.
                        </p>

                        <p className="mt-1 text-sm text-green-600">
                            Não é possível criar novas propostas para esta encomenda.
                        </p>

                    </div>
                )}

                {/* ORDER NÃO PODE RECEBER NOVAS OFFERS */}

                {!isOrderAssigned &&
                    !canCreateOffer && (
                        <div className="mt-5 rounded-2xl bg-gray-50 p-4">

                            <p className="text-sm font-semibold text-gray-700">
                                Não é possível criar novas propostas.
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                A encomenda já não se encontra num estado que permita novas propostas.
                            </p>

                        </div>
                    )}

                {/* FORMULÁRIO */}

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

                                window.location.reload();
                            }}
                        />

                    </div>
                )}

                {/* LISTA DE OFFERS */}

                {order.offers.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">

                        <p className="font-medium text-gray-600">
                            Ainda não existem propostas.
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            Cria uma proposta para enviar esta encomenda a uma florista.
                        </p>

                    </div>
                ) : (
                    <div className="mt-6 space-y-4">

                        {order.offers.map(
                            (offer) => {

                                const canEditOffer =
                                    offer.status ===
                                        "PENDING" ||
                                    offer.status ===
                                        "VIEWED";

                                return (
                                    <div
                                        key={offer.id}
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-100
                                            p-5
                                        "
                                    >

                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                            {/* INFO */}

                                            <div>

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        {offer.florist?.name ??
                                                            `Florista #${offer.floristId}`}
                                                    </p>

                                                    <span
                                                        className={`
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            ${getOfferStatusClass(
                                                                offer.status,
                                                            )}
                                                        `}
                                                    >
                                                        {getOfferStatusLabel(
                                                            offer.status,
                                                        )}
                                                    </span>

                                                </div>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    Criada em{" "}
                                                    {formatDateTime(
                                                        offer.createdAt,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Expira em{" "}
                                                    {formatDateTime(
                                                        offer.expiresAt,
                                                    )}
                                                </p>

                                            </div>

                                            {/* VALOR + AÇÕES */}

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                                                <div className="sm:text-right">

                                                    <p className="text-xs text-gray-400">
                                                        Compensação
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold text-[#55624A]">
                                                        {formatCurrency(
                                                            offer.compensationAmount,
                                                        )}
                                                    </p>

                                                </div>

                                                {/* EDITAR */}

                                                {canEditOffer && (
                                                    <button
                                                        type="button"
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
                                                            justify-center
                                                            gap-2
                                                            rounded-full
                                                            border
                                                            border-gray-200
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            text-gray-600
                                                            transition
                                                            hover:bg-gray-50
                                                        "
                                                    >
                                                        <Pencil
                                                            size={16}
                                                        />

                                                        Editar
                                                    </button>
                                                )}

                                            </div>

                                        </div>

                                        {/* MOTIVO DA RECUSA */}

                                        {offer.declineReason && (
                                            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">

                                                <strong>
                                                    Motivo da recusa:
                                                </strong>{" "}

                                                {
                                                    offer.declineReason
                                                }

                                            </div>
                                        )}

                                        {/* PRODUTOS DA OFFER */}

                                        {offer.items?.length > 0 && (
                                            <div className="mt-5 border-t border-gray-100 pt-4">

                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Produtos incluídos
                                                </p>

                                                <div className="mt-3 space-y-2">

                                                    {offer.items.map(
                                                        (item) => (
                                                            <div
                                                                key={
                                                                    item.id
                                                                }
                                                                className="flex items-center justify-between text-sm"
                                                            >

                                                                <span className="text-gray-600">
                                                                    {
                                                                        item.productName
                                                                    }{" "}
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                                <span className="font-medium text-gray-700">
                                                                    {formatCurrency(
                                                                        item.totalCompensation,
                                                                    )}
                                                                </span>

                                                            </div>
                                                        ),
                                                    )}

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                );
                            },
                        )}

                    </div>
                )}

            </section>

        </div>
    );
}