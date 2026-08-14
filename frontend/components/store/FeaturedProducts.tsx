"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api/products";

import type { Product } from "@/types/product";

export default function FeaturedProducts() {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadProducts() {
            try {
                setError(null);

                const data =
                    await getProducts();

                setProducts(
                    data
                        .filter(
                            (product) =>
                                product.active,
                        )
                        .slice(0, 3),
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os produtos.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (isLoading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-bold">
                    Produtos em Destaque
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-[500px] animate-pulse rounded-3xl bg-gray-100"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-bold">
                    Produtos em Destaque
                </h2>

                <div className="rounded-3xl bg-red-50 p-8 text-red-600">
                    {error}
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-bold">
                    Produtos em Destaque
                </h2>

                <div className="rounded-3xl bg-gray-50 p-8 text-center text-gray-500">
                    Não existem produtos disponíveis.
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="mb-8 text-3xl font-bold">
                Produtos em Destaque
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}