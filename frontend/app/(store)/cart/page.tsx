"use client";

import Link from "next/link";
import {
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const {
        items,
        updateQuantity,
        removeItem,
    } = useCart();

    const total = items.reduce(
        (sum, item) =>
            sum +
            item.price * item.quantity,
        0,
    );

    const totalQuantity = items.reduce(
        (sum, item) =>
            sum + item.quantity,
        0,
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            {/* HEADER */}

            <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#2F3B2A]">
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

            {/* EMPTY CART */}

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

                    <p className="mx-auto mt-3 max-w-md text-gray-600">
                        Explore o nosso catálogo e
                        encontre o bouquet perfeito.
                    </p>

                    <Link
                        href="/products"
                        className="
                            mt-8
                            inline-flex
                            items-center
                            justify-center
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

                <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

                    {/* ITEMS */}

                    <div className="space-y-4">

                        {items.map((item) => (
                            <div
                                key={item.cartItemId}
                                className="
                                    rounded-3xl
                                    bg-white
                                    p-5
                                    shadow-sm
                                    transition
                                    hover:shadow-md
                                    sm:p-6
                                "
                            >
                                <div className="flex gap-5">

                                    {/* IMAGE */}

                                    <div
                                        className="
                                            h-28
                                            w-28
                                            shrink-0
                                            overflow-hidden
                                            rounded-2xl
                                            bg-[#FAFAF7]
                                            sm:h-32
                                            sm:w-32
                                        "
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="
                                                    h-full
                                                    w-full
                                                    object-cover
                                                "
                                            />
                                        ) : (
                                            <div
                                                className="
                                                    flex
                                                    h-full
                                                    w-full
                                                    items-center
                                                    justify-center
                                                    text-5xl
                                                "
                                            >
                                                🌸
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT */}

                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                                    {item.name}
                                                </h2>

                                                {item.variantName && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {item.variantName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* REMOVE */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(
                                                        item.cartItemId,
                                                    )
                                                }
                                                aria-label={`Remover ${item.name}`}
                                                className="
                                                    shrink-0
                                                    rounded-full
                                                    p-2
                                                    text-gray-400
                                                    transition
                                                    hover:bg-red-50
                                                    hover:text-red-500
                                                "
                                            >
                                                <Trash2
                                                    size={18}
                                                />
                                            </button>

                                        </div>

                                        {/* COMPONENTS */}

                                        {item.components &&
                                            item.components.length > 0 && (
                                                <p className="mt-3 text-sm text-gray-500">
                                                    {item.components
                                                        .map(
                                                            (
                                                                component,
                                                            ) =>
                                                                `${component.name} · ${component.quantity}`,
                                                        )
                                                        .join(
                                                            "  ·  ",
                                                        )}
                                                </p>
                                            )}

                                        {/* BOTTOM */}

                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                                            {/* QUANTITY */}

                                            <div
                                                className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                "
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartItemId,
                                                            item.quantity -
                                                                1,
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <=
                                                        1
                                                    }
                                                    aria-label="Diminuir quantidade"
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        text-gray-500
                                                        transition
                                                        hover:bg-gray-100
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-30
                                                    "
                                                >
                                                    <Minus
                                                        size={15}
                                                    />
                                                </button>

                                                <span
                                                    className="
                                                        min-w-8
                                                        text-center
                                                        text-sm
                                                        font-medium
                                                        text-[#2F3B2A]
                                                    "
                                                >
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartItemId,
                                                            item.quantity +
                                                                1,
                                                        )
                                                    }
                                                    aria-label="Aumentar quantidade"
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        text-gray-500
                                                        transition
                                                        hover:bg-gray-100
                                                    "
                                                >
                                                    <Plus
                                                        size={15}
                                                    />
                                                </button>
                                            </div>

                                            {/* PRICE */}

                                            <div className="text-right">

                                                <p className="text-sm text-gray-400">
                                                    {item.price.toFixed(
                                                        2,
                                                    )}{" "}
                                                    € cada
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-[#55624A]">
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(
                                                        2,
                                                    )}{" "}
                                                    €
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                    {/* SUMMARY */}

                    <aside>
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
                                        {totalQuantity}
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

                                <div className="flex items-center justify-between">

                                    <span className="text-xl font-bold text-[#2F3B2A]">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-[#55624A]">
                                        {total.toFixed(
                                            2,
                                        )}{" "}
                                        €
                                    </span>

                                </div>

                            </div>

                            <Link
                                href="/checkout"
                                className="
                                    mt-8
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#55624A]
                                    py-4
                                    font-medium
                                    text-white
                                    transition
                                    hover:opacity-90
                                "
                            >
                                Finalizar compra
                            </Link>

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
                    </aside>

                </div>
            )}

        </div>
    );
}