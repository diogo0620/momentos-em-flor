"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Check,
    Clock,
    MapPin,
    Package,
    X,
    ChevronRight,
} from "lucide-react";

import {
    getOrderOffers,
    acceptOrderOffer,
    declineOrderOffer,
} from "@/lib/api/order-offers";

import type {
    OrderOffer,
} from "@/types/order-offer";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getTimeRemaining(expiresAt: string) {
    const difference =
        new Date(expiresAt).getTime() -
        Date.now();

    if (difference <= 0) {
        return "Expirada";
    }

    const hours = Math.floor(
        difference / (1000 * 60 * 60),
    );

    const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) /
            (1000 * 60),
    );

    if (hours > 0) {
        return `${hours}h ${minutes}min restantes`;
    }

    return `${minutes}min restantes`;
}

export default function FloristOffersPage() {
    const [offers, setOffers] =
        useState<OrderOffer[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [processingId, setProcessingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const loadOffers = useCallback(
        async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data =
                    await getOrderOffers();

                setOffers(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as propostas.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        loadOffers();
    }, [loadOffers]);

    async function handleAccept(
        offerId: number,
    ) {
        try {
            setProcessingId(offerId);
            setError(null);

            await acceptOrderOffer(
                offerId,
            );

            setOffers((current) =>
                current.filter(
                    (offer) =>
                        offer.id !== offerId,
                ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível aceitar a proposta.",
            );
        } finally {
            setProcessingId(null);
        }
    }

    async function handleDecline(
        offerId: number,
    ) {
        const confirmed =
            window.confirm(
                "Tem a certeza de que pretende recusar esta proposta?",
            );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(offerId);
            setError(null);

            await declineOrderOffer(
                offerId,
            );

            setOffers((current) =>
                current.filter(
                    (offer) =>
                        offer.id !== offerId,
                ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível recusar a proposta.",
            );
        } finally {
            setProcessingId(null);
        }
    }

    if (isLoading) {
        return (
            <div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2F3B2A]">
                        Propostas
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Consulte as propostas de encomendas que recebeu.
                    </p>
                </div>

                <div className="space-y-5">

                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-64
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

    return (
        <div>

            {/* HEADER */}

            <div className="mb-8">

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                    <div>

                        <h1 className="text-3xl font-bold text-[#2F3B2A]">
                            Propostas
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Encomendas disponíveis para aceitar.
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

                        {offers.length}{" "}
                        {offers.length === 1
                            ? "proposta"
                            : "propostas"}
                    </div>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* EMPTY */}

            {offers.length === 0 ? (
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
                        <Check size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-[#2F3B2A]">
                        Não tem propostas pendentes
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Quando existir uma nova oportunidade
                        de entrega na sua zona, ela aparecerá aqui.
                    </p>

                </div>
            ) : (
                <div className="space-y-5">

                    {offers.map((offer) => {
                        const isProcessing =
                            processingId ===
                            offer.id;

                        const isExpired =
                            new Date(
                                offer.expiresAt,
                            ).getTime() <=
                            Date.now();

                        return (
                            <article
                                key={offer.id}
                                className="
                                    overflow-hidden
                                    rounded-3xl
                                    bg-white
                                    shadow-sm
                                "
                            >

                                {/* TOP */}

                                <div className="border-b border-gray-100 p-6">

                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                                        <div>

                                            <div className="flex items-center gap-3">

                                                <span className="text-lg font-bold text-[#2F3B2A]">
                                                    #{offer.orderNumber}
                                                </span>

                                                {offer.status ===
                                                    "PENDING" && (
                                                    <span
                                                        className="
                                                            rounded-full
                                                            bg-yellow-50
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-yellow-700
                                                        "
                                                    >
                                                        Nova proposta
                                                    </span>
                                                )}

                                            </div>

                                            <p className="mt-2 text-sm text-gray-400">
                                                Recebida em{" "}
                                                {formatDateTime(
                                                    offer.createdAt,
                                                )}
                                            </p>

                                        </div>

                                        <div className="text-left md:text-right">

                                            <p className="text-xs text-gray-400">
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

                                {/* INFO */}

                                <div className="grid gap-6 border-b border-gray-100 p-6 md:grid-cols-3">

                                    <div className="flex items-start gap-3">

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#F5F7F2]
                                                text-[#55624A]
                                            "
                                        >
                                            <Package
                                                size={18}
                                            />
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                Produtos
                                            </p>

                                            <p className="mt-1 font-medium text-gray-700">
                                                {offer.items.length}{" "}
                                                {offer.items.length ===
                                                1
                                                    ? "produto"
                                                    : "produtos"}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex items-start gap-3">

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#F5F7F2]
                                                text-[#55624A]
                                            "
                                        >
                                            <Clock
                                                size={18}
                                            />
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                Responder até
                                            </p>

                                            <p
                                                className={`
                                                    mt-1
                                                    font-medium
                                                    ${
                                                        isExpired
                                                            ? "text-red-600"
                                                            : "text-gray-700"
                                                    }
                                                `}
                                            >
                                                {isExpired
                                                    ? "Expirada"
                                                    : getTimeRemaining(
                                                          offer.expiresAt,
                                                      )}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex items-start gap-3">

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#F5F7F2]
                                                text-[#55624A]
                                            "
                                        >
                                            <MapPin
                                                size={18}
                                            />
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                Entrega
                                            </p>

                                            <p className="mt-1 font-medium text-gray-700">
                                                Ver detalhes da encomenda
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* PRODUCTS */}

                                <div className="p-6">

                                    <h3 className="mb-4 text-sm font-semibold text-[#2F3B2A]">
                                        Produtos da encomenda
                                    </h3>

                                    <div className="space-y-3">

                                        {offer.items.map(
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
                                                        rounded-2xl
                                                        bg-[#FAFBF8]
                                                        px-4
                                                        py-3
                                                    "
                                                >

                                                    <div>

                                                        <p className="font-medium text-gray-700">
                                                            {
                                                                item.productName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Quantidade:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="text-right">

                                                        <p className="text-sm font-medium text-gray-700">
                                                            {formatCurrency(
                                                                item.totalCompensation,
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            {formatCurrency(
                                                                item.unitCompensation,
                                                            )}{" "}
                                                            / unidade
                                                        </p>

                                                    </div>

                                                </div>
                                            ),
                                        )}

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#FAFBF8] p-6 sm:flex-row sm:items-center sm:justify-between">

                                    <Link
                                        href={`/florist/orders/${offer.orderId}`}
                                        className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-2xl
                                            px-5
                                            py-3
                                            text-sm
                                            font-medium
                                            text-[#55624A]
                                            transition
                                            hover:bg-[#F0F2EB]
                                        "
                                    >
                                        Ver encomenda
                                        <ChevronRight
                                            size={16}
                                        />
                                    </Link>

                                    <div className="flex gap-3">

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing ||
                                                isExpired
                                            }
                                            onClick={() =>
                                                handleDecline(
                                                    offer.id,
                                                )
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-2xl
                                                border
                                                border-red-200
                                                bg-white
                                                px-5
                                                py-3
                                                text-sm
                                                font-medium
                                                text-red-600
                                                transition
                                                hover:bg-red-50
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            <X size={17} />

                                            Recusar
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing ||
                                                isExpired
                                            }
                                            onClick={() =>
                                                handleAccept(
                                                    offer.id,
                                                )
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-2xl
                                                bg-[#55624A]
                                                px-6
                                                py-3
                                                text-sm
                                                font-medium
                                                text-white
                                                transition
                                                hover:opacity-90
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            <Check size={17} />

                                            {isProcessing
                                                ? "A processar..."
                                                : "Aceitar"}
                                        </button>

                                    </div>

                                </div>

                            </article>
                        );
                    })}

                </div>
            )}

        </div>
    );
}