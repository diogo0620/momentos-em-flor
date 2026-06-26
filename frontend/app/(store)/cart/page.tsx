"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const { items, removeItem } = useCart();

    const total = items.reduce(
        (sum, item) =>
            sum + item.price.selling * item.quantity,
        0
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            <h1 className="text-4xl font-bold">
                Carrinho
            </h1>

            {items.length === 0 ? (
                <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <h2 className="text-2xl font-semibold">
                        O seu carrinho está vazio
                    </h2>

                    <p className="mt-3 text-gray-600">
                        Explore o nosso catálogo e encontre o bouquet perfeito.
                    </p>

                    <Link
                        href="/products"
                        className="mt-6 inline-block rounded-full bg-[#55624A] px-6 py-3 text-white"
                    >
                        Ver Catálogo
                    </Link>
                </div>
            ) : (
                <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">

                    <div className="space-y-4">

                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-3xl bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                    <div className="flex items-center gap-4">

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-24 w-24 rounded-2xl object-cover"
                                        />

                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                {item.name}
                                            </h2>

                                            <p className="text-gray-500">
                                                {item.price.selling.toFixed(2)} € cada
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                Quantidade: {item.quantity}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-xl font-bold">
                                            {(item.price.selling * item.quantity).toFixed(2)} €
                                        </p>

                                        <button
                                            onClick={() =>
                                                removeItem(item.id)
                                            }
                                            className="mt-3 rounded-full border border-red-300 px-4 py-2 text-red-500 transition hover:bg-red-50"
                                        >
                                            Remover
                                        </button>

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                    <div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-2xl font-bold">
                                Resumo
                            </h2>

                            <div className="mt-6 flex justify-between">
                                <span>
                                    Produtos
                                </span>

                                <span>
                                    {items.length}
                                </span>
                            </div>

                            <div className="mt-4 flex justify-between text-xl font-bold">
                                <span>
                                    Total
                                </span>

                                <span>
                                    {total.toFixed(2)} €
                                </span>
                            </div>

                            <Link
                                href="/checkout"
                                className="mt-8 block rounded-full bg-[#55624A] py-4 text-center font-medium text-white transition hover:opacity-90"
                            >
                                Finalizar Compra
                            </Link>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}