"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api/products";

import type {
    Pagination,
    ProductListItem,
} from "@/types/product";

export default function ProductsPage() {
    const [products, setProducts] =
        useState<ProductListItem[]>([]);

    const [pagination, setPagination] =
        useState<Pagination>({
            page: 1,
            pageSize: 12,
            total: 0,
            pages: 0,
        });

    const [searchInput, setSearchInput] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [sort, setSort] =
        useState("name");

    const [order, setOrder] =
        useState<"asc" | "desc">("asc");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const loadProducts = useCallback(
        async (
            page = 1,
        ) => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getProducts({
                        page,
                        pageSize: 12,
                        search,
                        sort,
                        order,
                    });

                setProducts(response.data);

                setPagination(
                    response.pagination,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar os produtos.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [
            search,
            sort,
            order,
        ],
    );

    useEffect(() => {
        loadProducts(1);
    }, [
        loadProducts,
    ]);

    function handleSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim(),
        );
    }

    function handleSort(
        value: string,
    ) {

        setSort("name");
        setOrder("asc");
    }

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12">

                <div className="mb-12 text-center">

                    <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
                        Catálogo
                    </span>

                    <h1 className="mt-3 text-5xl font-bold text-[#2F3B2A]">
                        Flores para todos os momentos
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        Descubra bouquets preparados
                        por floristas locais para
                        todos os momentos especiais.
                    </p>

                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-[500px]
                                    animate-pulse
                                    rounded-3xl
                                    bg-gray-100
                                "
                            />
                        ),
                    )}

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12">

                <div className="mb-12 text-center">

                    <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
                        Catálogo
                    </span>

                    <h1 className="mt-3 text-5xl font-bold text-[#2F3B2A]">
                        Flores para todos os momentos
                    </h1>

                </div>

                <div className="rounded-3xl bg-red-50 p-10 text-center text-red-600">
                    {error}
                </div>

            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            {/* HEADER */}

            <div className="mb-12 text-center">

                <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
                    Catálogo
                </span>

                <h1 className="mt-3 text-5xl font-bold text-[#2F3B2A]">
                    Flores para todos os momentos
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                    Descubra bouquets preparados
                    por floristas locais para
                    aniversários, celebrações e
                    momentos especiais.
                </p>

            </div>

            {/* PESQUISA + ORDENAÇÃO */}

            <div className="mb-10 flex flex-col gap-4 md:flex-row">

                <form
                    onSubmit={handleSearch}
                    className="flex flex-1 gap-3"
                >

                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) =>
                            setSearchInput(
                                e.target.value,
                            )
                        }
                        placeholder="Pesquisar flores..."
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-[#E5E7E0]
                            bg-white
                            px-5
                            py-4
                            shadow-sm
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:ring-4
                            focus:ring-[#55624A]/10
                        "
                    />

                    <button
                        type="submit"
                        className="
                            rounded-2xl
                            bg-[#55624A]
                            px-6
                            font-medium
                            text-white
                            transition
                            hover:opacity-90
                        "
                    >
                        Pesquisar
                    </button>

                </form>

                <select
                    value={
                        sort === "basePrice"
                            ? order === "asc"
                                ? "price-asc"
                                : "price-desc"
                            : "name"
                    }
                    onChange={(e) =>
                        handleSort(
                            e.target.value,
                        )
                    }
                    className="
                        rounded-2xl
                        border
                        border-[#E5E7E0]
                        bg-white
                        px-5
                        py-4
                        outline-none
                        focus:border-[#55624A]
                    "
                >
                    <option value="name">
                        Nome
                    </option>

                    <option value="price-asc">
                        Preço: menor primeiro
                    </option>

                    <option value="price-desc">
                        Preço: maior primeiro
                    </option>
                </select>

            </div>

            {/* RESULTADOS */}

            <div className="mb-8 flex items-center justify-between">

                <div
                    className="
                        rounded-full
                        bg-[#F3F5EE]
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-[#55624A]
                    "
                >
                    {pagination.total} produtos
                </div>

            </div>

            {/* PRODUTOS */}

            {products.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

                    <h3 className="text-2xl font-semibold text-[#2F3B2A]">
                        Nenhum produto encontrado
                    </h3>

                    <p className="mt-3 text-gray-600">
                        Experimente alterar a sua
                        pesquisa.
                    </p>

                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                    {products.map(
                        (product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ),
                    )}

                </div>
            )}

            {/* PAGINAÇÃO */}

            {pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">

                    <button
                        type="button"
                        disabled={
                            pagination.page <= 1
                        }
                        onClick={() =>
                            loadProducts(
                                pagination.page -
                                    1,
                            )
                        }
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-gray-200
                            transition
                            hover:bg-[#F3F5EE]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <ChevronLeft
                            size={20}
                        />
                    </button>

                    <span className="text-sm text-gray-500">

                        Página{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {pagination.page}
                        </span>

                        {" "}de{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {pagination.pages}
                        </span>

                    </span>

                    <button
                        type="button"
                        disabled={
                            pagination.page >=
                            pagination.pages
                        }
                        onClick={() =>
                            loadProducts(
                                pagination.page +
                                    1,
                            )
                        }
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-gray-200
                            transition
                            hover:bg-[#F3F5EE]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <ChevronRight
                            size={20}
                        />
                    </button>

                </div>
            )}

        </div>
    );
}