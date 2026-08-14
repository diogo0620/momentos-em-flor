"use client";

import { useEffect, useState } from "react";

import {
    createOrderOffer,
    updateOrderOffer,
} from "@/lib/api/order-offers";

import { getFlorists } from "@/lib/api/florists";

import type { OrderOffer } from "@/types/order-offer";

type Florist = {
    id: number;
    name: string;
};

type Props = {
    orderId: number;
    offer?: OrderOffer | null;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function OrderOfferForm({
    orderId,
    offer,
    onSuccess,
    onCancel,
}: Props) {
    const isEditing = !!offer;

    const [florists, setFlorists] =
        useState<Florist[]>([]);

    const [floristId, setFloristId] =
        useState(
            offer?.floristId
                ? String(offer.floristId)
                : "",
        );

    const [compensationAmount, setCompensationAmount] =
        useState(
            offer
                ? String(offer.compensationAmount)
                : "",
        );

    const [loading, setLoading] =
        useState(false);

    const [loadingFlorists, setLoadingFlorists] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadFlorists() {
            try {
                const response =
                    await getFlorists({
                        page: 1,
                        pageSize: 100,
                    });

                setFlorists(response.data);
            } catch (err) {
                console.error(err);

                setError(
                    "Não foi possível carregar as floristas.",
                );
            } finally {
                setLoadingFlorists(false);
            }
        }

        loadFlorists();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!floristId) {
            setError(
                "Selecione uma florista.",
            );

            return;
        }

        const compensation =
            Number(compensationAmount);

        if (
            !Number.isFinite(compensation) ||
            compensation <= 0
        ) {
            setError(
                "Introduza uma compensação válida.",
            );

            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (isEditing) {
                await updateOrderOffer(
                    offer.id,
                    {
                        floristId:
                            Number(floristId),
                        compensationAmount:
                            compensation,
                    },
                );
            } else {
                await createOrderOffer({
                    orderId,
                    floristId:
                        Number(floristId),
                    compensationAmount:
                        compensation,
                });
            }

            onSuccess();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a proposta.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {/* FLORISTA */}

            <div>
                <label
                    htmlFor="florist"
                    className="mb-2 block text-sm font-medium text-[#2F3B2A]"
                >
                    Florista
                </label>

                <select
                    id="florist"
                    value={floristId}
                    onChange={(event) =>
                        setFloristId(
                            event.target.value,
                        )
                    }
                    disabled={
                        loading ||
                        loadingFlorists
                    }
                    className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        outline-none
                        transition
                        focus:border-[#55624A]
                        focus:ring-4
                        focus:ring-[#55624A]/10
                    "
                >
                    <option value="">
                        {loadingFlorists
                            ? "A carregar floristas..."
                            : "Selecionar florista"}
                    </option>

                    {florists.map(
                        (florist) => (
                            <option
                                key={florist.id}
                                value={florist.id}
                            >
                                {florist.name}
                            </option>
                        ),
                    )}
                </select>
            </div>

            {/* COMPENSAÇÃO */}

            <div>
                <label
                    htmlFor="compensation"
                    className="mb-2 block text-sm font-medium text-[#2F3B2A]"
                >
                    Compensação da florista
                </label>

                <div className="relative">

                    <input
                        id="compensation"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                            compensationAmount
                        }
                        onChange={(event) =>
                            setCompensationAmount(
                                event.target.value,
                            )
                        }
                        disabled={loading}
                        placeholder="35.00"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-3
                            pr-12
                            text-sm
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:ring-4
                            focus:ring-[#55624A]/10
                        "
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        €
                    </span>

                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="
                        rounded-full
                        border
                        border-gray-200
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-600
                        transition
                        hover:bg-gray-50
                        disabled:opacity-50
                    "
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        loadingFlorists
                    }
                    className="
                        rounded-full
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
                    {loading
                        ? "A guardar..."
                        : isEditing
                            ? "Guardar alterações"
                            : "Criar proposta"}
                </button>

            </div>

        </form>
    );
}