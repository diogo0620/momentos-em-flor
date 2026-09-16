import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { ProductListItem } from "@/types/product";
import WishlistButton from "@/components/wishlist/WishlistButton";

type Props = {
    product: ProductListItem;
};

export default function ProductCard({
    product,
}: Props) {

    console.log(product);
    return (
        <article
            className="
                overflow-hidden
                rounded-3xl
                border
                border-[#E5E7E0]
                bg-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
            "
        >
            <div className="relative h-80 overflow-hidden bg-[#FAFAF7]">
    <Link
        href={`/products/${product.id}`}
        className="group block h-full"
    >
        <Image
    src={product.image.url}
    alt={product.name}
    fill
    unoptimized
    className="
        object-cover
        transition-transform
        duration-500
        group-hover:scale-105
    "
    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
/>
    </Link>

    <div className="absolute right-4 top-4 z-10">
        <WishlistButton product={product} />
    </div>
</div>

            <Link
                href={`/products/${product.id}`}
                className="group block p-6"
            >
                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                    "
                >
                    <div className="min-w-0">
                        <h2
                            className="
                                text-xl
                                font-semibold
                                text-[#2F3B2A]
                                transition-colors
                                duration-300
                                group-hover:text-[#55624A]
                            "
                        >
                            {product.name}
                        </h2>

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-400
                            "
                        >
                            Flores preparadas
                            por floristas locais
                        </p>
                    </div>

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F3F5EE]
                            text-[#55624A]
                            transition-all
                            duration-300
                            group-hover:bg-[#55624A]
                            group-hover:text-white
                        "
                    >
                        <ArrowUpRight size={20} />
                    </div>
                </div>

                <div className="mt-6">
                    <p
                        className="
                            text-xs
                            uppercase
                            tracking-wide
                            text-gray-400
                        "
                    >
                        A partir de
                    </p>

                    <p
                        className="
                            mt-1
                            text-2xl
                            font-bold
                            text-[#55624A]
                        "
                    >
                        {product.price.toFixed(2)} €
                    </p>
                </div>
            </Link>
        </article>
    );
}

