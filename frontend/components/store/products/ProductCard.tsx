import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flower2, Sparkles } from "lucide-react";

import WishlistButton from "@/components/wishlist/WishlistButton";
import { AdminProductList } from "@/types/products/admin/admin-product-list";
import { PublicProductList } from "@/types/products/public/public-product-list";

type Props = {
    product: PublicProductList;
};

export default function ProductCard({ product }: Props) {
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E5E7E0] bg-white shadow-[0_3px_16px_rgba(47,59,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D5DCCB] hover:shadow-[0_14px_35px_rgba(47,59,42,0.09)]">
            <div className="relative aspect-[4/4.2] overflow-hidden bg-[#F1F3EC]">
                <Link href={`/products/${product.slug}`} className="block h-full" aria-label={`Ver ${product.name}`}>
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[#AAB69D]">
                            <Flower2 size={48} strokeWidth={1.1} />
                        </div>
                    )}
                </Link>

                {product.featured && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#55624A] shadow-sm backdrop-blur-sm">
                        <Sparkles size={12} /> Em destaque
                    </div>
                )}

                <div className="absolute right-4 top-4 z-10">
                    <WishlistButton product={product} />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A9580]">
                            {product.type === "RENTAL" ? "Aluguer" : "Coleção Momentos em Flor"}
                        </p>
                        <Link href={`/products/${product.slug}`} className="block">
                            <h2 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 tracking-[-0.02em] text-[#2F3B2A] transition-colors group-hover:text-[#55624A] sm:text-lg">
                                {product.name}
                            </h2>
                        </Link>
                    </div>
                    <Link href={`/products/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`} className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A] transition-all duration-300 hover:bg-[#55624A] hover:text-white">
                        <ArrowUpRight size={18} strokeWidth={1.8} />
                    </Link>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#EEF0EB] pt-4 mt-5">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#929B89]">
                            {product.type === "RENTAL" ? "Desde" : "Preço"}
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#55624A]">
                            {product.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                        </p>
                    </div>
                    <Link href={`/products/${product.slug}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[#55624A] transition-colors hover:bg-[#F3F5EE]">
                        Ver produto <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </article>
    );
}
