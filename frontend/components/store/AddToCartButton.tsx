"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/CartContext";

import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

type Props = {
    product: Product;
    quantity: number;
    recipient?: string;
    message?: string;
};

export default function AddToCartButton({
    product,
    quantity,
    recipient,
    message,
}: Props) {
    const { addItem } = useCart();

    const [added, setAdded] =
        useState(false);

    function handleAddToCart() {
        const item: CartItem = {
            id: product.id,
            name: product.name,
            image: "",
            price: product.basePrice,
            quantity,
            recipient,
            message,
        };

        addItem(item);

        setAdded(true);

        setTimeout(() => {
            setAdded(false);
        }, 2000);
    }

    return (
        <button
            type="button"
            onClick={handleAddToCart}
            className="
                flex
                w-full
                items-center
                justify-center
                gap-3
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
            {added ? (
                <>
                    <Check size={20} />
                    Adicionado ao Carrinho
                </>
            ) : (
                <>
                    <ShoppingBag size={20} />
                    Adicionar ao Carrinho
                </>
            )}
        </button>
    );
}