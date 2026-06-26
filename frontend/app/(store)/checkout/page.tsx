"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
    const router = useRouter();

    const { items, clearCart } =
        useCart();

    const total = items.reduce(
        (sum, item) =>
            sum +
            item.price * item.quantity,
        0
    );

    function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        clearCart();

        router.push("/success");
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            <h1 className="text-4xl font-bold">
                Checkout
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >

                    <div className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold">
                            Comprador
                        </h2>

                        <div className="mt-6 grid gap-4">

                            <input
                                placeholder="Nome"
                                className="rounded-xl border p-3"
                            />

                            <input
                                placeholder="Email"
                                className="rounded-xl border p-3"
                            />

                            <input
                                placeholder="Telefone"
                                className="rounded-xl border p-3"
                            />

                        </div>

                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold">
                            Destinatário
                        </h2>

                        <div className="mt-6 grid gap-4">

                            <input
                                placeholder="Nome do destinatário"
                                className="rounded-xl border p-3"
                            />

                            <input
                                placeholder="Morada de entrega"
                                className="rounded-xl border p-3"
                            />

                            <input
                                type="date"
                                className="rounded-xl border p-3"
                            />

                        </div>

                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold">
                            Cartão
                        </h2>

                        <textarea
                            rows={5}
                            placeholder="Escreva uma mensagem personalizada..."
                            className="mt-6 w-full rounded-xl border p-3"
                        />

                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-semibold">
                            Notas adicionais
                        </h2>

                        <textarea
                            rows={4}
                            placeholder="Instruções para entrega, porteiro, horário preferencial, etc."
                            className="mt-6 w-full rounded-xl border p-3"
                        />

                    </div>

                </form>

                <div>

                    <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="text-2xl font-bold">
                            Resumo
                        </h2>

                        <div className="mt-6 space-y-4">

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between"
                                >
                                    <div>
                                        <div>
                                            {item.name}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            x{item.quantity}
                                        </div>
                                    </div>

                                    <div>
                                        {(
                                            item.price *
                                            item.quantity
                                        ).toFixed(2)} €
                                    </div>
                                </div>
                            ))}

                        </div>

                        <div className="mt-8 border-t pt-6">

                            <div className="flex justify-between text-xl font-bold">
                                <span>
                                    Total
                                </span>

                                <span>
                                    {total.toFixed(2)} €
                                </span>
                            </div>

                        </div>

                        <button
                            onClick={() => {
                                clearCart();
                                router.push(
                                    "/success"
                                );
                            }}
                            className="mt-8 w-full rounded-full bg-[#55624A] py-4 font-medium text-white transition hover:opacity-90"
                        >
                            Confirmar Encomenda
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}