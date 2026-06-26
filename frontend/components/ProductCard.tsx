import Link from "next/link";

import type { Product } from "@/types/product";

type Props = {
    product: Product;
};

export default function ProductCard({
    product,
}: Props) {
    return (
        <Link href={`/products/${product.id}`}>

            <article
                className="
                    group
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#E5E7E0]
                    bg-white
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-xl
                "
            >

                {/* IMAGE */}

                <div
                    className="
                        flex
                        h-80
                        items-center
                        justify-center
                        bg-[#FAFAF7]
                    "
                >

                    <img
                        src={product.image}
                        alt={product.name}
                        className="
                            max-h-72
                            w-auto
                            object-contain
                            transition-transform
                            duration-500
                            group-hover:scale-105
                        "
                    />

                </div>

                {/* CONTENT */}

                <div className="p-6">

                    <div className="flex items-center justify-between">

                        <span
                            className="
                                rounded-full
                                bg-[#D6DEC8]
                                px-3
                                py-1
                                text-xs
                                font-medium
                                text-[#55624A]
                            "
                        >
                            {product.category}
                        </span>

                        <span className="text-sm text-gray-400">
                            {product.active
                                ? "Disponível"
                                : "Indisponível"}
                        </span>

                    </div>

                    <h2
                        className="
                            mt-5
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

                    <div className="mt-4 flex items-end justify-between">

                        <div>

                            <div className="text-sm text-gray-500">
                                Desde
                            </div>

                            <div className="text-3xl font-bold text-[#55624A]">
                                {product.price.selling.toFixed(2)} €
                            </div>

                        </div>

                        <div
                            className="
                                flex
                                h-12
                                w-12
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
                            →
                        </div>

                    </div>

                </div>

            </article>

        </Link>
    );
}