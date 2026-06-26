"use client";

import { useState } from "react";

import AddToCartButton from "@/components/store/AddToCartButton";
import { Product } from "@/types/product";

type Props = {
    product: Product
};

export default function ProductDetails({
    product,
}: Props) {
    const [quantity, setQuantity] =
        useState(1);

    const [recipient, setRecipient] =
        useState("");

    const [message, setMessage] =
        useState("");

    return (
        <div>

            <span className="rounded-full bg-[#D6DEC8] px-4 py-2 text-sm">
                {product.category}
            </span>

            <h1 className="mt-6 text-4xl font-bold">
                {product.name}
            </h1>

            <div className="mt-4">
                ⭐⭐⭐⭐⭐ 4.9
            </div>

            <p className="mt-6 text-3xl font-bold">
                {(product.price.selling
                    * quantity).toFixed(2)} €
            </p>

            <p className="mt-6 text-gray-600">
                {product.description}
            </p>

            <div className="mt-8 space-y-3">
                <div>✓ Flores frescas</div>
                <div>✓ Entrega local</div>
                <div>✓ Preparado no dia</div>
            </div>

            {/* QUANTIDADE */}

            <div className="mt-10">

                <label className="mb-3 block font-medium">
                    Quantidade
                </label>

                <div className="flex items-center gap-4">

                    <button
                        onClick={() =>
                            setQuantity((q) =>
                                Math.max(1, q - 1)
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full border"
                    >
                        -
                    </button>

                    <span className="w-8 text-center font-semibold">
                        {quantity}
                    </span>

                    <button
                        onClick={() =>
                            setQuantity((q) =>
                                q + 1
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full border"
                    >
                        +
                    </button>

                </div>

            </div>

            {/* DESTINATÁRIO */}

            <div className="mt-8">

                <label className="mb-3 block font-medium">
                    Destinatário
                </label>

                <input
                    type="text"
                    value={recipient}
                    onChange={(e) =>
                        setRecipient(
                            e.target.value
                        )
                    }
                    placeholder="Nome da pessoa que vai receber"
                    className="w-full rounded-xl border p-3"
                />

            </div>

            {/* DEDICATÓRIA */}

            <div className="mt-8">

                <label className="mb-3 block font-medium">
                    Dedicatória
                </label>

                <textarea
                    value={message}
                    onChange={(e) =>
                        setMessage(
                            e.target.value
                        )
                    }
                    rows={5}
                    placeholder="Escreva a mensagem para acompanhar as flores..."
                    className="w-full rounded-xl border p-3"
                />

            </div>

            <div className="mt-10">

                <AddToCartButton
                    product={product}
                    quantity={quantity}
                    recipient={recipient}
                    message={message}
                />

            </div>

        </div>
    );
}