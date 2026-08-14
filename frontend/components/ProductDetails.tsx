"use client";

import { useState } from "react";

import AddToCartButton from "@/components/store/AddToCartButton";
import type { Product } from "@/types/product";

type Props = {
    product: Product;
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

    const total =
        product.basePrice * quantity;

    return (
        <div>

            {/* CATEGORIA */}

            <span
                className="
                    inline-block
                    rounded-full
                    bg-[#D6DEC8]
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-[#55624A]
                "
            >
                {product.category.name}
            </span>

            {/* NOME */}

            <h1
                className="
                    mt-6
                    text-4xl
                    font-bold
                    text-[#2F3B2A]
                "
            >
                {product.name}
            </h1>

            {/* PREÇO */}

            <div className="mt-5">

                <p className="text-3xl font-bold text-[#55624A]">
                    {total.toFixed(2)} €
                </p>

                <p className="mt-1 text-sm text-gray-400">
                    {product.basePrice.toFixed(2)} € por unidade
                </p>

            </div>

            {/* DESCRIÇÃO */}

            <p className="mt-6 leading-7 text-gray-600">
                {product.description ??
                    "Flores frescas preparadas por floristas locais para tornar os seus momentos especiais."}
            </p>

            {/* BENEFÍCIOS */}

            <div className="mt-8 space-y-3 text-sm text-gray-700">

                <div>
                    ✓ Flores frescas
                </div>

                <div>
                    ✓ Entrega local
                </div>

                <div>
                    ✓ Preparado no dia
                </div>

            </div>

            {/* QUANTIDADE */}

            <div className="mt-10">

                <label
                    className="
                        mb-3
                        block
                        font-medium
                        text-[#2F3B2A]
                    "
                >
                    Quantidade
                </label>

                <div className="flex items-center gap-4">

                    <button
                        type="button"
                        onClick={() =>
                            setQuantity(
                                (current) =>
                                    Math.max(
                                        1,
                                        current - 1,
                                    ),
                            )
                        }
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-gray-200
                            text-lg
                            transition
                            hover:bg-[#F3F5EE]
                        "
                        aria-label="Diminuir quantidade"
                    >
                        −
                    </button>

                    <span className="w-8 text-center font-semibold">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setQuantity(
                                (current) =>
                                    Math.min(
                                        20,
                                        current + 1,
                                    ),
                            )
                        }
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-gray-200
                            text-lg
                            transition
                            hover:bg-[#F3F5EE]
                        "
                        aria-label="Aumentar quantidade"
                    >
                        +
                    </button>

                </div>

            </div>

            {/* DESTINATÁRIO */}

            <div className="mt-8">

                <label
                    htmlFor="recipient"
                    className="
                        mb-3
                        block
                        font-medium
                        text-[#2F3B2A]
                    "
                >
                    Destinatário
                </label>

                <input
                    id="recipient"
                    type="text"
                    value={recipient}
                    onChange={(event) =>
                        setRecipient(
                            event.target.value,
                        )
                    }
                    maxLength={100}
                    placeholder="Nome da pessoa que vai receber"
                    className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        p-3
                        outline-none
                        transition
                        focus:border-[#55624A]
                        focus:ring-4
                        focus:ring-[#55624A]/10
                    "
                />

            </div>

            {/* DEDICATÓRIA */}

            <div className="mt-8">

                <div className="mb-3 flex items-center justify-between">

                    <label
                        htmlFor="message"
                        className="
                            block
                            font-medium
                            text-[#2F3B2A]
                        "
                    >
                        Dedicatória
                    </label>

                    <span className="text-xs text-gray-400">
                        {message.length}/2000
                    </span>

                </div>

                <textarea
                    id="message"
                    value={message}
                    onChange={(event) =>
                        setMessage(
                            event.target.value,
                        )
                    }
                    maxLength={2000}
                    rows={5}
                    placeholder="Escreva a mensagem para acompanhar as flores..."
                    className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-gray-200
                        p-3
                        outline-none
                        transition
                        focus:border-[#55624A]
                        focus:ring-4
                        focus:ring-[#55624A]/10
                    "
                />

            </div>

            {/* TOTAL + CARRINHO */}

            <div className="mt-10">

                <div className="mb-4 flex items-center justify-between">

                    <span className="text-gray-500">
                        Total
                    </span>

                    <span className="text-2xl font-bold text-[#2F3B2A]">
                        {total.toFixed(2)} €
                    </span>

                </div>

                <AddToCartButton
                    product={product}
                    quantity={quantity}
                    recipient={
                        recipient.trim() ||
                        undefined
                    }
                    message={
                        message.trim() ||
                        undefined
                    }
                />

            </div>

        </div>
    );
}