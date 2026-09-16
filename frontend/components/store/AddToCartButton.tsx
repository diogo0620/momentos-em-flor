"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/CartContext";

import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

type SelectedComponent = {
    componentId: number;
    name: string;
    quantity: number;
};

type Props = {
    product: Product;
    quantity: number;
    price: number;
    image?: string;
    variantId?: number;
    variantName?: string;
    components?: SelectedComponent[];
};

export default function AddToCartButton({
    product,
    quantity,
    price,
    image = "",
    variantId,
    variantName,
    components = [],
}: Props) {
    const { addItem } = useCart();

    const [added, setAdded] =
        useState(false);

    function handleAddToCart() {
        const item: CartItem = {
            cartItemId:
                crypto.randomUUID(),

            id: product.id,
            name: product.name,
            image,
            price,
            quantity,

            variantId,
            variantName,

            components,
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