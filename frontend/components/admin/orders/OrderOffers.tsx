"use client";

import { useState } from "react";
import {
    Check,
    Edit,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import {
    deleteOrderOffer,
} from "@/lib/api/order-offers";

import type {
    OrderOffer,
} from "@/types/order-offer";

import OrderOfferForm from "./OrderOfferForm";

type Florist = {
    id: number;
    name: string;
};

type Props = {
    orderId: number;
    initialOffers: OrderOffer[];
    florists: Florist[];
};

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
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(new Date(value));
}

function getStatusLabel(
    status: string,
) {
    switch (status) {
        case "PENDING":
            return "Pendente";

        case "VIEWED":
            return "Visualizada";

        case "ACCEPTED":
            return "Aceite";

        case "DECLINED":
            return "Recusada";

        case "EXPIRED":
            return "Expirada";

        default:
            return status;
    }
}

function getStatusClasses(
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
            return "bg-gray-100 text-gray-600";

        default:
            return "bg-gray-100 text-gray-600";
    }
}

export default function OrderOffers({
    orderId,
    initialOffers,
    florists,
}: Props) {
    const [offers, setOffers] =
        useState<OrderOffer[]>(
            initialOffers,
        );

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [editingOffer, setEditingOffer] =
        useState<OrderOffer | null>(null);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    function handleCreated(
        offer: OrderOffer,
    ) {
        setOffers((current) => [
            offer,
            ...current,
        ]);

        setShowCreateForm(false);
        setError(null);
    }

    function handleUpdated(
        offer: OrderOffer,
    ) {
        setOffers((current) =>
            current.map((item) =>
                item.id === offer.id
                    ? offer
                    : item,
            ),
        );

        setEditingOffer(null);
        setError(null);
    }

    async function handleDelete(
        offer: OrderOffer,
    ) {
        const confirmed =
            window.confirm(
                `Tem a certeza de que pretende remover a proposta da florista "${offer.florist?.name ?? "selecionada"}"?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(
                offer.id,
            );

            setError(null);

            await deleteOrderOffer(
                offer.id,
            );

            setOffers((current) =>
                current.filter(
                    (item) =>
                        item.id !==
                        offer.id,
                ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível remover a proposta.",
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="mt-8">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                    <h2 className="text-2xl font-bold text-[#2F3B2A]">
                        Offers
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Propostas enviadas às floristas para esta encomenda.
                    </p>

                </div>

                {!showCreateForm &&
                    !editingOffer && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateForm(
                                    true,
                                )
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
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
                            Criar proposta
                        </button>
                    )}

            </div>

            {/* FORM */}

            {(showCreateForm ||
                editingOffer) && (
                <div className="mt-6">

                    <OrderOfferForm
                        orderId={orderId}
                        florists={florists}
                        offer={
                            editingOffer
                        }
                        onSuccess={
                            editingOffer
                                ? handleUpdated
                                : handleCreated
                        }
                        onCancel={() => {
                            setShowCreateForm(
                                false,
                            );
                            setEditingOffer(
                                null,
                            );
                        }}
                    />

                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* EMPTY */}

            {offers.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-white p-12 text-center shadow-sm">

                    <div
                        className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F5F7F2]
                            text-[#55624A]
                        "
                    >
                        <Plus size={24} />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-[#2F3B2A]">
                        Ainda não existem propostas
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Crie uma proposta para enviar esta encomenda a uma florista.
                    </p>

                </div>
            ) : (
                <div className="mt-6 space-y-4">

                    {offers.map(
                        (offer) => (
                            <article
                                key={offer.id}
                                className="
                                    rounded-3xl
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                    {/* INFO */}

                                    <div>

                                        <div className="flex flex-wrap items-center gap-3">

                                            <h3 className="text-lg font-semibold text-[#2F3B2A]">
                                                {offer.florist?.name ??
                                                    `Florista #${offer.floristId}`}
                                            </h3>

                                            <span
                                                className={`
                                                    rounded-full
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    ${getStatusClasses(
                                                        offer.status,
                                                    )}
                                                `}
                                            >
                                                {getStatusLabel(
                                                    offer.status,
                                                )}
                                            </span>

                                        </div>

                                        <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-gray-500 sm:grid-cols-2">

                                            <p>
                                                <span className="text-gray-400">
                                                    Compensação:
                                                </span>{" "}
                                                <span className="font-semibold text-[#55624A]">
                                                    {formatCurrency(
                                                        offer.compensationAmount,
                                                    )}
                                                </span>
                                            </p>

                                            <p>
                                                <span className="text-gray-400">
                                                    Criada:
                                                </span>{" "}
                                                {formatDate(
                                                    offer.createdAt,
                                                )}
                                            </p>

                                            {offer.acceptedAt && (
                                                <p>
                                                    <span className="text-gray-400">
                                                        Aceite:
                                                    </span>{" "}
                                                    {formatDate(
                                                        offer.acceptedAt,
                                                    )}
                                                </p>
                                            )}

                                            {offer.declinedAt && (
                                                <p>
                                                    <span className="text-gray-400">
                                                        Recusada:
                                                    </span>{" "}
                                                    {formatDate(
                                                        offer.declinedAt,
                                                    )}
                                                </p>
                                            )}

                                            {offer.expiresAt && (
                                                <p>
                                                    <span className="text-gray-400">
                                                        Expira:
                                                    </span>{" "}
                                                    {formatDate(
                                                        offer.expiresAt,
                                                    )}
                                                </p>
                                            )}

                                        </div>

                                        {offer.declineReason && (
                                            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                                <strong>
                                                    Motivo da recusa:
                                                </strong>{" "}
                                                {
                                                    offer.declineReason
                                                }
                                            </div>
                                        )}

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="flex shrink-0 gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingOffer(
                                                    offer,
                                                )
                                            }
                                            className="
                                                inline-flex
                                                items-center
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
                                                transition
                                                hover:bg-gray-50
                                            "
                                        >
                                            <Edit
                                                size={16}
                                            />
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                deletingId ===
                                                offer.id
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    offer,
                                                )
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-2xl
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
                                            <Trash2
                                                size={16}
                                            />
                                            {deletingId ===
                                            offer.id
                                                ? "A remover..."
                                                : "Remover"}
                                        </button>

                                    </div>

                                </div>

                                {/* ITEMS */}

                                {offer.items?.length >
                                    0 && (
                                    <div className="mt-6 border-t border-gray-100 pt-5">

                                        <p className="mb-3 text-sm font-semibold text-[#2F3B2A]">
                                            Produtos da proposta
                                        </p>

                                        <div className="space-y-2">

                                            {offer.items.map(
                                                (
                                                    item,
                                                ) => (
                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            rounded-xl
                                                            bg-[#FAFBF8]
                                                            px-4
                                                            py-3
                                                            text-sm
                                                        "
                                                    >
                                                        <div>

                                                            <span className="font-medium text-gray-700">
                                                                {
                                                                    item.productName
                                                                }
                                                            </span>

                                                            <span className="ml-2 text-gray-400">
                                                                ×{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>

                                                        </div>

                                                        <span className="font-medium text-gray-600">
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

                            </article>
                        ),
                    )}

                </div>
            )}

        </section>
    );
}