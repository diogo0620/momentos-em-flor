"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const {
        items,
        removeItem,
    } = useCart();

    const total = items.reduce(
        (sum, item) =>
            sum +
            item.price * item.quantity,
        0,
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            {/* HEADER */}

            <div>
                <h1 className="text-4xl font-bold text-[#2F3B2A]">
                    Carrinho
                </h1>

                {items.length > 0 && (
                    <p className="mt-2 text-gray-500">
                        {items.length === 1
                            ? "1 produto no carrinho"
                            : `${items.length} produtos no carrinho`}
                    </p>
                )}
            </div>

            {/* EMPTY */}

            {items.length === 0 ? (
                <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">

                    <div
                        className="
                            mx-auto
                            flex
                            h-20
                            w-20
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F3F5EE]
                            text-[#55624A]
                        "
                    >
                        <ShoppingBag
                            size={32}
                            strokeWidth={1.7}
                        />
                    </div>

                    <h2 className="mt-6 text-2xl font-semibold text-[#2F3B2A]">
                        O seu carrinho está vazio
                    </h2>

                    <p className="mt-3 text-gray-600">
                        Explore o nosso catálogo e
                        encontre o bouquet perfeito.
                    </p>

                    <Link
                        href="/products"
                        className="
                            mt-8
                            inline-block
                            rounded-full
                            bg-[#55624A]
                            px-8
                            py-3
                            font-medium
                            text-white
                            transition
                            hover:opacity-90
                        "
                    >
                        Ver catálogo
                    </Link>

                </div>
            ) : (

                /* CART */

                <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">

                    {/* ITEMS */}

                    <div className="space-y-4">

                        {items.map((item) => (

                            <div
                                key={`${item.id}-${item.recipient}-${item.message}`}
                                className="
                                    rounded-3xl
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                                    {/* PRODUCT */}

                                    <div className="flex items-center gap-5">

                                        <div
                                            className="
                                                flex
                                                h-28
                                                w-28
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-[#FAFAF7]
                                                text-5xl
                                            "
                                        >
                                            🌸
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                                {item.name}
                                            </h2>

                                            <p className="mt-1 text-gray-500">
                                                {item.price.toFixed(
                                                    2,
                                                )}{" "}
                                                € cada
                                            </p>

                                            <p className="mt-2 text-sm font-medium text-gray-700">
                                                Quantidade:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            {item.recipient && (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Destinatário:{" "}
                                                    {
                                                        item.recipient
                                                    }
                                                </p>
                                            )}

                                            {item.message && (
                                                <p className="mt-1 max-w-md text-sm text-gray-500">
                                                    Dedicatória:{" "}
                                                    {
                                                        item.message
                                                    }
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                    {/* PRICE */}

                                    <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">

                                        <p className="text-xl font-bold text-[#55624A]">
                                            {(
                                                item.price *
                                                item.quantity
                                            ).toFixed(
                                                2,
                                            )}{" "}
                                            €
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(
                                                    item.id,
                                                )
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-full
                                                border
                                                border-red-200
                                                px-4
                                                py-2
                                                text-sm
                                                text-red-500
                                                transition
                                                hover:bg-red-50
                                            "
                                        >
                                            <Trash2
                                                size={16}
                                            />

                                            Remover
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                    {/* SUMMARY */}

                    <div>

                        <div
                            className="
                                sticky
                                top-28
                                rounded-3xl
                                bg-white
                                p-6
                                shadow-sm
                            "
                        >

                            <h2 className="text-2xl font-bold text-[#2F3B2A]">
                                Resumo
                            </h2>

                            <div className="mt-6 space-y-4">

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Produtos
                                    </span>

                                    <span>
                                        {items.reduce(
                                            (
                                                total,
                                                item,
                                            ) =>
                                                total +
                                                item.quantity,
                                            0,
                                        )}
                                    </span>

                                </div>

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        {total.toFixed(
                                            2,
                                        )}{" "}
                                        €
                                    </span>

                                </div>

                            </div>

                            <div className="mt-6 border-t pt-6">

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
    type="button"
    onClick={() => {
        window.location.href = "/checkout";
    }}
    className="
        mt-8
        block
        w-full
        rounded-full
        bg-[#55624A]
        py-4
        text-center
        font-medium
        text-white
        transition
        hover:opacity-90
    "
>
    Finalizar compra
</button>

                            <Link
                                href="/products"
                                className="
                                    mt-4
                                    block
                                    text-center
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    transition
                                    hover:text-[#55624A]
                                "
                            >
                                Continuar a comprar
                            </Link>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}