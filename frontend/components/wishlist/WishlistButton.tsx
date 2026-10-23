"use client";

import { Heart } from "lucide-react";

import { useWishlist } from "@/contexts/WishlistContext";
import { PublicProductList } from "@/types/products/public/public-product-list";

type Props = {
    product: Pick<PublicProductList, "id" | "slug" | "name" | "image">;
};

export default function WishlistButton({
    product,
}: Props) {
    const { isInWishlist, toggleWishlist } =
        useWishlist();

    const active = isInWishlist(product.id);

    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.image ?? "",
                });
            }}
            aria-label={
                active
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
            }
            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#55624A]
                shadow-sm
                transition
                hover:scale-105
                hover:bg-[#F3F5EE]
            "
        >
            <Heart
                size={19}
                strokeWidth={1.8}
                fill={active ? "currentColor" : "none"}
            />
        </button>
    );
}