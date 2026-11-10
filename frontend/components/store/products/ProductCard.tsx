import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";

import WishlistButton from "@/components/wishlist/WishlistButton";
import { PublicProductList } from "@/types/products/public/public-product-list";

type Props = {
    product: PublicProductList;
};

export default function ProductCard({ product }: Props) {
    const href = `/products/${product.slug}`;
    const price = product.price.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR",
    });

    return (
        <article className="group flex h-full flex-col">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#E9ECE4]">
                <Link href={href} className="block h-full" aria-label={`Ver ${product.name}`}>
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
                            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[#9AA690]">
                            <Flower2 size={52} strokeWidth={1} />
                        </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#182017]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="absolute bottom-4 left-4 translate-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        Descobrir composição
                    </span>
                </Link>

                <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                    <WishlistButton product={product} />
                </div>
                {product.featured && (
                    <span className="absolute left-3 top-3 bg-[#F7F5EF]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4F5D47]">
                        Seleção da casa
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col border-b border-[#DDE1D8] py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#899382]">
                    {product.type === "RENTAL" ? "Aluguer" : "Composição floral"}
                </p>
                <Link href={href} className="mt-2 flex items-start justify-between gap-4">
                    <h2 className="line-clamp-2 text-lg font-medium leading-6 tracking-[-0.025em] text-[#293425] transition-colors group-hover:text-[#68795F] sm:text-xl">
                        {product.name}
                    </h2>
                    <ArrowRight className="mt-1 shrink-0 text-[#778570] transition-transform duration-300 group-hover:translate-x-1" size={18} />
                </Link>
                <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-[#4D5D45]">
                    {product.type === "RENTAL" && <span className="mr-1 text-xs font-normal text-[#879080]">Desde</span>}
                    {price}
                </p>
            </div>
        </article>
    );
}
