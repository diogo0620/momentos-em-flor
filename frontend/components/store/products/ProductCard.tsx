import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flower2 } from "lucide-react";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { PublicProductList } from "@/types/products/public/public-product-list";

export default function ProductCard({
  product,
}: {
  product: PublicProductList;
}) {
  const href = `/products/${product.slug}`;
  const price = product.price.toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-[#ecebe3] bg-white p-2 shadow-[0_4px_20px_rgba(39,56,43,.025)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(39,56,43,.09)] sm:p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f2f1eb]">
        <Link
          href={href}
          className="block h-full"
          aria-label={`Ver ${product.name}`}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#8c987e]">
              <Flower2 size={52} strokeWidth={1} />
            </div>
          )}
        </Link>
        <div className="absolute right-2 top-2">
          <WishlistButton product={product} />
        </div>
        {product.featured && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] text-[#40513c]">
            Seleção da casa
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 sm:px-2 sm:pb-2 sm:pt-5">
        <p className="text-[9px] uppercase tracking-[.15em] text-[#68715f] sm:text-[10px]">
          {product.type === "RENTAL"
            ? "Aluguer · Decoração"
            : "Momentos em Flor"}
        </p>
        <Link href={href} className="mt-2">
          <h3 className="line-clamp-2 font-[family-name:var(--serif)] text-xl leading-tight tracking-[-.02em] text-[#293e32] sm:text-2xl">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-5">
          <p className="text-base font-semibold text-[#293e32] sm:text-lg">
            {product.type === "RENTAL" && (
              <span className="mr-1 text-xs font-normal text-[#68715f]">
                Desde
              </span>
            )}
            {price}
          </p>
          <Link
            href={href}
            aria-label={`Ver opções de ${product.name}`}
            className="mt-4 flex min-h-11 items-center justify-between gap-2 border-t border-[#ecebe3] pt-3 text-[11px] font-semibold text-[#40513c] sm:text-xs"
          >
            Ver opções{" "}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f3ec] transition-colors group-hover:bg-[#293e32] group-hover:text-white">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
