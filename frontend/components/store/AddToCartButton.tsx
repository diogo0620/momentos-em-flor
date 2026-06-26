"use client";

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

    function handleAddToCart() {
        const item: CartItem = {
            id: product.id,

            name: product.name,

            image: product.image,

            price: product.price,

            quantity,

            recipient,

            message,
        };

        addItem(item);
    }

    return (
        <button
            onClick={handleAddToCart}
            className="
                mt-6
                rounded-full
                bg-[#55624A]
                px-8
                py-4
                text-white
                transition
                hover:opacity-90
            "
        >
            Adicionar ao Carrinho
        </button>
    );
}