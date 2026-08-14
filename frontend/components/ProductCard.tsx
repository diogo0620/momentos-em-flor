import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Product } from "@/types/product";

type Props = {
    product: Product;
};

export default function ProductCard({
    product,
}: Props) {
    return (
        <Link
            href={`/products/${product.id}`}
            className="group block"
        >
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
                {/* IMAGE */}

                <div
                    className="
                        relative
                        flex
                        h-80
                        items-center
                        justify-center
                        overflow-hidden
                        bg-[#FAFAF7]
                    "
                >
                    <div
                        className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-8xl
                            transition-transform
                            duration-500
                            group-hover:scale-110
                        "
                    >
                        🌸
                    </div>

                    {/* CATEGORY */}

                    <span
                        className="
                            absolute
                            left-5
                            top-5
                            rounded-full
                            bg-white/90
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-[#55624A]
                            shadow-sm
                            backdrop-blur
                        "
                    >
                        {product.category.name}
                    </span>
                </div>

                {/* CONTENT */}

                <div className="p-6">

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

                    {product.description && (
                        <p
                            className="
                                mt-2
                                line-clamp-2
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            {product.description}
                        </p>
                    )}

                    <div className="mt-6 flex items-end justify-between">

                        <div>

                            <p className="text-xs text-gray-400">
                                {product.pricingType === "PER_UNIT"
                                    ? "A partir de"
                                    : "Preço"}
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#55624A]">
                                {product.basePrice.toFixed(2)} €
                            </p>

                        </div>

                        <div
                            className="
                                flex
                                h-11
                                w-11
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

                    <div
                        className="
                            mt-5
                            border-t
                            border-gray-100
                            pt-4
                            text-sm
                            font-medium
                            text-[#55624A]
                        "
                    >
                        Ver produto
                    </div>

                </div>
            </article>
        </Link>
    );
}