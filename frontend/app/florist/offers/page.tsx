"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Check,
    Clock,
    MapPin,
    Package,
    X,
} from "lucide-react";

import {
    getOrderOffers,
    acceptOrderOffer,
    declineOrderOffer,
} from "@/lib/api/order-offers";

import type {
    OrderOffer,
} from "@/types/order-offer";

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

function formatTimeSlot(
    value: string,
) {
    switch (value) {
        case "MORNING":
            return "Manhã";

        case "AFTERNOON":
            return "Tarde";

        case "EVENING":
            return "Noite";

        default:
            return value;
    }
}

function getTimeRemaining(
    expiresAt: string,
) {
    const difference =
        new Date(expiresAt).getTime() -
        Date.now();

    if (difference <= 0) {
        return "Expirada";
    }

    const hours = Math.floor(
        difference /
            (1000 * 60 * 60),
    );

    const minutes = Math.floor(
        (difference %
            (1000 * 60 * 60)) /
            (1000 * 60),
    );

    if (hours > 0) {
        return `${hours}h ${minutes}min restantes`;
    }

    return `${minutes}min restantes`;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function FloristOffersPage() {
    const [offers, setOffers] =
        useState<OrderOffer[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [processingId, setProcessingId] =
        useState<number | null>(null);

    const [decliningId, setDecliningId] =
        useState<number | null>(null);

    const [declineReason, setDeclineReason] =
        useState("");

    const [error, setError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------------- */
    /* LOAD OFFERS                                                            */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* ACCEPT                                                                 */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* DECLINE                                                                */
    /* ---------------------------------------------------------------------- */

    async function handleDecline(
        offerId: number,
    ) {
        const reason =
            declineReason.trim();

        if (!reason) {
            setError(
                "Indique o motivo da recusa.",
            );

            return;
        }

        try {
            setProcessingId(offerId);
            setError(null);

            await declineOrderOffer(
                offerId,
                reason,
            );

            setOffers((current) =>
                current.filter(
                    (offer) =>
                        offer.id !== offerId,
                ),
            );

            setDecliningId(null);
            setDeclineReason("");
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

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                 */
    /* ---------------------------------------------------------------------- */

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
                                    h-72
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
    /* PAGE                                                                    */
    /* ---------------------------------------------------------------------- */

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
                <div className="space-y-6">

                    {offers.map(
                        (offer) => {
                            const isProcessing =
                                processingId ===
                                offer.id;

                            const isDeclining =
                                decliningId ===
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

                                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                                            <div>

                                                <p className="text-sm font-medium uppercase tracking-wider text-[#55624A]">
                                                    Nova proposta
                                                </p>

                                                <h2 className="mt-2 text-xl font-bold text-[#2F3B2A]">
                                                    Nova encomenda para entrega
                                                </h2>

                                                <p className="mt-2 text-sm text-gray-400">
                                                    Recebida em{" "}
                                                    {formatDateTime(
                                                        offer.createdAt,
                                                    )}
                                                </p>

                                            </div>

                                            <div className="text-left md:text-right">

                                                <p className="text-xs text-gray-400">
                                                    Vai receber
                                                </p>

                                                <p className="mt-1 text-3xl font-bold text-[#55624A]">
                                                    {formatCurrency(
                                                        offer.compensationAmount,
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* KEY INFORMATION */}

                                    <div className="grid gap-6 border-b border-gray-100 p-6 md:grid-cols-2 xl:grid-cols-4">

                                        {/* DISTANCE */}

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
                                                    Distância
                                                </p>

                                                <p className="mt-1 font-medium text-gray-700">
                                                    {Number(
                                                        offer.distanceKm,
                                                    ).toFixed(
                                                        1,
                                                    )}{" "}
                                                    km
                                                </p>

                                            </div>

                                        </div>

                                        {/* DELIVERY DATE */}

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
                                                    Entrega
                                                </p>

                                                <p className="mt-1 font-medium text-gray-700">
                                                    {formatDate(
                                                        offer
                                                            .order
                                                            .deliveryDate,
                                                    )}
                                                </p>

                                                <p className="mt-0.5 text-sm text-gray-400">
                                                    {formatTimeSlot(
                                                        offer
                                                            .order
                                                            .deliveryTimeSlot,
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        {/* RESPONSE DEADLINE */}

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

                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {formatDateTime(
                                                        offer.expiresAt,
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        {/* PRODUCTS COUNT */}

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

                                                <p className="mt-0.5 text-sm text-gray-400">
                                                    {
                                                        offer.items.reduce(
                                                            (
                                                                total,
                                                                item,
                                                            ) =>
                                                                total +
                                                                item.quantity,
                                                            0,
                                                        )
                                                    }{" "}
                                                    unidades
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* DELIVERY ADDRESS */}

                                    <div className="border-b border-gray-100 p-6">

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

                                                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                    Morada de entrega
                                                </p>

                                                <p className="mt-2 font-medium text-gray-700">
                                                    {
                                                        offer
                                                            .order
                                                            .deliveryAddress
                                                            .street
                                                    }

                                                    {offer
                                                        .order
                                                        .deliveryAddress
                                                        .street2 && (
                                                        <>
                                                            {", "}
                                                            {
                                                                offer
                                                                    .order
                                                                    .deliveryAddress
                                                                    .street2
                                                            }
                                                        </>
                                                    )}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        offer
                                                            .order
                                                            .deliveryAddress
                                                            .postalCode
                                                    }{" "}
                                                    {
                                                        offer
                                                            .order
                                                            .deliveryAddress
                                                            .city
                                                    }
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {
                                                        offer
                                                            .order
                                                            .deliveryAddress
                                                            .district
                                                    }
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
                                                            py-4
                                                        "
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-9
                                                                    w-9
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-full
                                                                    bg-[#D6DEC8]
                                                                    text-sm
                                                                    font-semibold
                                                                    text-[#55624A]
                                                                "
                                                            >
                                                                {
                                                                    item.quantity
                                                                }
                                                                ×
                                                            </div>

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

                                                        </div>

                                                    </div>
                                                ),
                                            )}

                                        </div>

                                    </div>

                                    {/* DECLINE FORM */}

                                    {isDeclining && (
                                        <div className="border-t border-gray-100 bg-red-50/50 p-6">

                                            <label className="mb-2 block text-sm font-semibold text-[#2F3B2A]">
                                                Motivo da recusa
                                            </label>

                                            <p className="mb-3 text-sm text-gray-500">
                                                Indique o motivo pelo qual não pode aceitar esta encomenda.
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
                                                    4
                                                }
                                                maxLength={
                                                    1000
                                                }
                                                placeholder="Ex.: Não tenho disponibilidade para realizar esta entrega."
                                                className="
                                                    w-full
                                                    resize-none
                                                    rounded-2xl
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    p-4
                                                    text-sm
                                                    text-gray-700
                                                    outline-none
                                                    transition
                                                    placeholder:text-gray-400
                                                    focus:border-[#55624A]
                                                    focus:ring-4
                                                    focus:ring-[#55624A]/10
                                                "
                                                autoFocus
                                            />

                                            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isProcessing
                                                    }
                                                    onClick={() => {
                                                        setDecliningId(
                                                            null,
                                                        );
                                                        setDeclineReason(
                                                            "",
                                                        );
                                                        setError(
                                                            null,
                                                        );
                                                    }}
                                                    className="
                                                        rounded-2xl
                                                        px-5
                                                        py-3
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
                                                        bg-red-600
                                                        px-5
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
                                                    <X
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    {isProcessing
                                                        ? "A recusar..."
                                                        : "Confirmar recusa"}
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                    {/* ACTIONS */}

                                    {!isDeclining && (
                                        <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#FAFBF8] p-6 sm:flex-row sm:items-center sm:justify-end">

                                            <button
                                                type="button"
                                                disabled={
                                                    isProcessing ||
                                                    isExpired
                                                }
                                                onClick={() => {
                                                    setDecliningId(
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
                                                <X
                                                    size={
                                                        17
                                                    }
                                                />

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
                                                <Check
                                                    size={
                                                        17
                                                    }
                                                />

                                                {isProcessing
                                                    ? "A processar..."
                                                    : "Aceitar"}
                                            </button>

                                        </div>
                                    )}

                                </article>
                            );
                        },
                    )}

                </div>
            )}

        </div>
    );
}