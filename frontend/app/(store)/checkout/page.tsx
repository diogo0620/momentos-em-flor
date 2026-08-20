"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/auth/AuthProvider";

import {
    createOrder,
    type CreateOrderData,
} from "@/lib/api/orders";

export default function CheckoutPage() {
    const router = useRouter();

    const { items, clearCart } = useCart();

    const {
        user,
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth();

    const [recipientFirstName, setRecipientFirstName] =
        useState("");

    const [recipientLastName, setRecipientLastName] =
        useState("");

    const [recipientPhone, setRecipientPhone] =
        useState("");

    const [occasion, setOccasion] =
        useState<CreateOrderData["occasion"]>();

    const [deliveryDate, setDeliveryDate] =
        useState("");

    const [deliveryTimeSlot, setDeliveryTimeSlot] =
        useState<CreateOrderData["deliveryTimeSlot"]>(
            "AFTERNOON",
        );

    const [deliveryInstructions, setDeliveryInstructions] =
        useState("");

    const [deliveryStreet, setDeliveryStreet] =
        useState("");

    const [deliveryStreet2, setDeliveryStreet2] =
        useState("");

    const [deliveryPostalCode, setDeliveryPostalCode] =
        useState("");

    const [deliveryCity, setDeliveryCity] =
        useState("");

    const [deliveryDistrict, setDeliveryDistrict] =
        useState("");

    const [cardMessage, setCardMessage] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const total = items.reduce(
        (sum, item) =>
            sum +
            item.price * item.quantity,
        0,
    );

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        if (items.length === 0) {
            setError(
                "O carrinho está vazio.",
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const data: CreateOrderData = {
                items: items.map(
                    (item) => ({
                        productId:
                            Number(item.id),
                        quantity:
                            item.quantity,
                    }),
                ),

                // CUSTOMER

                customerFirstName:
                    user.firstName,

                customerLastName:
                    user.lastName ||
                    undefined,

                customerEmail:
                    user.email,

                customerPhone:
                    user.phone ||
                    undefined,

                // RECIPIENT

                recipientFirstName,

                recipientLastName:
                    recipientLastName ||
                    undefined,

                recipientPhone:
                    recipientPhone ||
                    undefined,

                occasion,

                // DELIVERY

                deliveryDate,

                deliveryTimeSlot,

                deliveryInstructions:
                    deliveryInstructions ||
                    undefined,

                deliveryStreet,

                deliveryStreet2:
                    deliveryStreet2 ||
                    undefined,

                deliveryPostalCode,

                deliveryCity,

                deliveryDistrict,

                deliveryCountryCode:
                    "PT",

                // CARD

                cardMessage:
                    cardMessage ||
                    undefined,
            };

            const response =
                await createOrder(data);

            clearCart();

            router.push(
                `/success?order=${encodeURIComponent(
                    response.data.orderNumber,
                )}`,
            );
        } catch (err) {
            console.error(
                "Erro ao criar encomenda:",
                err,
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar a encomenda.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">
                    A carregar...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center">

                <h1 className="text-3xl font-bold text-[#2F3B2A]">
                    Inicie sessão para continuar
                </h1>

                <p className="mt-3 text-gray-500">
                    Precisa de estar autenticado
                    para finalizar a encomenda.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.push("/login")
                    }
                    className="
                        mt-8
                        rounded-full
                        bg-[#55624A]
                        px-8
                        py-4
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    Iniciar sessão
                </button>

            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center">

                <h1 className="text-3xl font-bold text-[#2F3B2A]">
                    O seu carrinho está vazio
                </h1>

                <p className="mt-3 text-gray-500">
                    Adicione pelo menos um produto
                    antes de finalizar a encomenda.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.push("/products")
                    }
                    className="
                        mt-8
                        rounded-full
                        bg-[#55624A]
                        px-8
                        py-4
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    Ver catálogo
                </button>

            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            <h1 className="text-4xl font-bold text-[#2F3B2A]">
                Finalizar encomenda
            </h1>

            <p className="mt-2 text-gray-500">
                Preencha os dados para preparar
                a sua entrega.
            </p>

            <form
                onSubmit={handleSubmit}
                className="
                    mt-10
                    grid
                    gap-8
                    lg:grid-cols-[2fr_1fr]
                "
            >

                {/* LEFT */}

                <div className="space-y-8">

                    {/* COMPRADOR */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold text-[#2F3B2A]">
                            Comprador
                        </h2>

                        <div className="mt-6 rounded-2xl bg-[#F5F7F2] p-5">

                            <p className="font-semibold text-[#2F3B2A]">
                                {user.firstName}{" "}
                                {user.lastName}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {user.email}
                            </p>

                            {user.phone && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {user.phone}
                                </p>
                            )}

                        </div>

                    </section>

                    {/* DESTINATÁRIO */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold text-[#2F3B2A]">
                            Destinatário
                        </h2>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">

                            <input
                                required
                                value={
                                    recipientFirstName
                                }
                                onChange={(e) =>
                                    setRecipientFirstName(
                                        e.target.value,
                                    )
                                }
                                placeholder="Nome *"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <input
                                value={
                                    recipientLastName
                                }
                                onChange={(e) =>
                                    setRecipientLastName(
                                        e.target.value,
                                    )
                                }
                                placeholder="Apelido"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <input
                                type="tel"
                                value={
                                    recipientPhone
                                }
                                onChange={(e) =>
                                    setRecipientPhone(
                                        e.target.value,
                                    )
                                }
                                placeholder="Telefone"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A] md:col-span-2"
                            />

                            <select
                                value={
                                    occasion ?? ""
                                }
                                onChange={(e) =>
                                    setOccasion(
                                        e.target.value
                                            ? (e.target.value as CreateOrderData["occasion"])
                                            : undefined,
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-[#55624A] md:col-span-2"
                            >
                                <option value="">
                                    Ocasião
                                </option>

                                <option value="BIRTHDAY">
                                    Aniversário
                                </option>

                                <option value="ANNIVERSARY">
                                    Aniversário de namoro/casamento
                                </option>

                                <option value="LOVE">
                                    Amor
                                </option>

                                <option value="WEDDING">
                                    Casamento
                                </option>

                                <option value="FUNERAL">
                                    Condolências
                                </option>

                                <option value="NEW_BABY">
                                    Nascimento
                                </option>

                                <option value="MOTHERS_DAY">
                                    Dia da Mãe
                                </option>

                                <option value="FATHERS_DAY">
                                    Dia do Pai
                                </option>

                                <option value="CHRISTMAS">
                                    Natal
                                </option>

                                <option value="OTHER">
                                    Outra
                                </option>
                            </select>

                        </div>

                    </section>

                    {/* ENTREGA */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold text-[#2F3B2A]">
                            Entrega
                        </h2>

                        <div className="mt-6 space-y-4">

                            <input
                                required
                                type="date"
                                value={
                                    deliveryDate
                                }
                                onChange={(e) =>
                                    setDeliveryDate(
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <select
                                required
                                value={
                                    deliveryTimeSlot
                                }
                                onChange={(e) =>
                                    setDeliveryTimeSlot(
                                        e.target.value as CreateOrderData["deliveryTimeSlot"],
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-[#55624A]"
                            >
                                <option value="MORNING">
                                    Manhã
                                </option>

                                <option value="AFTERNOON">
                                    Tarde
                                </option>

                                <option value="EVENING">
                                    Noite
                                </option>
                            </select>

                            <input
                                required
                                value={
                                    deliveryStreet
                                }
                                onChange={(e) =>
                                    setDeliveryStreet(
                                        e.target.value,
                                    )
                                }
                                placeholder="Rua, número, etc. *"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <input
                                value={
                                    deliveryStreet2
                                }
                                onChange={(e) =>
                                    setDeliveryStreet2(
                                        e.target.value,
                                    )
                                }
                                placeholder="Complemento da morada"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <div className="grid gap-4 md:grid-cols-2">

                                <input
                                    required
                                    value={
                                        deliveryPostalCode
                                    }
                                    onChange={(e) =>
                                        setDeliveryPostalCode(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Código postal *"
                                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                                />

                                <input
                                    required
                                    value={
                                        deliveryCity
                                    }
                                    onChange={(e) =>
                                        setDeliveryCity(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Cidade *"
                                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                                />

                            </div>

                            <input
                                required
                                value={
                                    deliveryDistrict
                                }
                                onChange={(e) =>
                                    setDeliveryDistrict(
                                        e.target.value,
                                    )
                                }
                                placeholder="Distrito *"
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                            <textarea
                                value={
                                    deliveryInstructions
                                }
                                onChange={(e) =>
                                    setDeliveryInstructions(
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                placeholder="Instruções para entrega..."
                                className="w-full resize-none rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                            />

                        </div>

                    </section>

                    {/* CARTÃO */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold text-[#2F3B2A]">
                            Cartão
                        </h2>

                        <textarea
                            value={
                                cardMessage
                            }
                            onChange={(e) =>
                                setCardMessage(
                                    e.target.value,
                                )
                            }
                            rows={5}
                            placeholder="Escreva uma mensagem personalizada..."
                            className="mt-6 w-full resize-none rounded-xl border border-gray-200 p-3 outline-none focus:border-[#55624A]"
                        />

                    </section>

                    {/* ERROR */}

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

                            <p className="font-semibold">
                                Não foi possível criar
                                a encomenda
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>

                        </div>
                    )}

                </div>

                {/* SUMMARY */}

                <div>

                    <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-bold text-[#2F3B2A]">
                            Resumo
                        </h2>

                        <div className="mt-6 space-y-5">

                            {items.map(
                                (item) => (
                                    <div
                                        key={`${item.id}-${item.recipient}-${item.message}`}
                                        className="flex justify-between gap-4"
                                    >

                                        <div>

                                            <p className="font-medium text-[#2F3B2A]">
                                                {item.name}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Quantidade:{" "}
                                                {item.quantity}
                                            </p>

                                        </div>

                                        <p className="whitespace-nowrap font-medium">
                                            {(
                                                item.price *
                                                item.quantity
                                            ).toFixed(
                                                2,
                                            )}{" "}
                                            €
                                        </p>

                                    </div>
                                ),
                            )}

                        </div>

                        <div className="mt-8 border-t pt-6">

                            <div className="flex justify-between text-xl font-bold text-[#2F3B2A]">

                                <span>
                                    Total
                                </span>

                                <span>
                                    {total.toFixed(
                                        2,
                                    )}{" "}
                                    €
                                </span>

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting
                            }
                            className="
                                mt-8
                                w-full
                                rounded-full
                                bg-[#55624A]
                                py-4
                                font-medium
                                text-white
                                transition
                                hover:opacity-90
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isSubmitting
                                ? "A criar encomenda..."
                                : "Confirmar encomenda"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}