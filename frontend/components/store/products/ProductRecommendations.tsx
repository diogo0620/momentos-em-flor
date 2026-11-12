"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { publicProductsApi } from "@/lib/api/products/public-products";
import type { PublicProductList } from "@/types/products/public/public-product-list";

export default function ProductRecommendations({
  productId,
  categoryId,
}: {
  productId: number;
  categoryId?: number;
}) {
  const [related, setRelated] = useState<PublicProductList[]>([]);
  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled([
      publicProductsApi.getAll({ categoryId, pageSize: 8 }),
    ]).then(([suggestions]) => {
      if (cancelled) return;
      if (suggestions.status === "fulfilled")
        setRelated(
          suggestions.value.items
            .filter((item) => item.id !== productId)
            .slice(0, 4),
        );
    });
    return () => {
      cancelled = true;
    };
  }, [productId, categoryId]);
  return (
    <>
      {[
        {
          title: "Também podes gostar.",
          text: "Continua a explorar a coleção e encontra a composição certa para este momento.",
          items: related,
        },
      ].map(
        (section) =>
          section.items.length > 0 && (
            <section
              key={section.title}
              className="mt-20 border-t border-[#d8ddcf] pt-12 sm:mt-28"
            >
              <p className="editorial-kicker">Combina com o teu momento</p>
              <h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:text-5xl">
                {section.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#687363]">
                {section.text}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-4">
                {section.items.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ),
      )}
    </>
  );
}
