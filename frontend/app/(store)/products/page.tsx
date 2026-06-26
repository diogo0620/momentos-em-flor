"use client";

import { useMemo, useState } from "react";

import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
    const [search, setSearch] = useState("");

    const [category, setCategory] =
        useState("all");

    const [sort, setSort] =
        useState("name");

    const [priceFilter, setPriceFilter] =
        useState("all");

    const categories = [
        ...new Set(
            products.map(
                (product) =>
                    product.category
            )
        ),
    ];

    const filteredProducts =
        useMemo(() => {
            let result = [...products];

            if (search) {
                result = result.filter(
                    (product) =>
                        product.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        product.description
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                );
            }

            if (category !== "all") {
                result = result.filter(
                    (product) =>
                        product.category ===
                        category
                );
            }

            switch (priceFilter) {
                case "under25":
                    result = result.filter(
                        (product) =>
                            product.price.selling <= 25
                    );
                    break;

                case "25to50":
                    result = result.filter(
                        (product) =>
                            product.price.selling > 25 &&
                            product.price.selling <= 50
                    );
                    break;

                case "50to75":
                    result = result.filter(
                        (product) =>
                            product.price.selling > 50 &&
                            product.price.selling <= 75
                    );
                    break;

                case "75plus":
                    result = result.filter(
                        (product) =>
                            product.price.selling > 75
                    );
                    break;
            }

            switch (sort) {
                case "price-asc":
                    result.sort(
                        (a, b) =>
                            a.price.selling - b.price.selling
                    );
                    break;

                case "price-desc":
                    result.sort(
                        (a, b) =>
                            b.price.selling - a.price.selling
                    );
                    break;

                case "name":
                default:
                    result.sort((a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                    );
                    break;
            }

            return result;
        }, [
            search,
            category,
            sort,
            priceFilter,
        ]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            {/* HEADER */}

            <div className="mb-12 text-center">

                <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
                    Catálogo
                </span>

                <h1 className="mt-3 text-5xl font-bold">
                    Flores para todos os momentos
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                    Descubra bouquets preparados por floristas locais
                    para aniversários, celebrações e momentos especiais.
                </p>

            </div>

            {/* PESQUISA */}

            <div className="mb-8">

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="🔍 Pesquisar flores..."
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
                    "
                />

            </div>

            {/* CATEGORIAS */}

            <div className="mb-8">

                <p className="mb-3 text-sm font-medium text-gray-500">
                    Categorias
                </p>

                <div className="flex flex-wrap gap-3">

                    <button
                        onClick={() =>
                            setCategory("all")
                        }
                        className={`
                            rounded-full
                            px-5
                            py-2
                            text-sm
                            transition
                            ${
                                category ===
                                "all"
                                    ? "bg-[#55624A] text-white"
                                    : "bg-[#F3F5EE]"
                            }
                        `}
                    >
                        Todas
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() =>
                                setCategory(cat)
                            }
                            className={`
                                rounded-full
                                px-5
                                py-2
                                text-sm
                                transition
                                ${
                                    category ===
                                    cat
                                        ? "bg-[#55624A] text-white"
                                        : "bg-[#F3F5EE]"
                                }
                            `}
                        >
                            {cat}
                        </button>
                    ))}

                </div>

            </div>

            {/* PREÇO */}

            <div className="mb-8">

                <p className="mb-3 text-sm font-medium text-gray-500">
                    Preço
                </p>

                <div className="flex flex-wrap gap-3">

                    {[
                        {
                            value: "all",
                            label: "Todos",
                        },
                        {
                            value: "under25",
                            label: "Até 25€",
                        },
                        {
                            value: "25to50",
                            label: "25€ - 50€",
                        },
                        {
                            value: "50to75",
                            label: "50€ - 75€",
                        },
                        {
                            value: "75plus",
                            label: "75€+",
                        },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() =>
                                setPriceFilter(
                                    option.value
                                )
                            }
                            className={`
                                rounded-full
                                px-5
                                py-2
                                text-sm
                                transition
                                ${
                                    priceFilter ===
                                    option.value
                                        ? "bg-[#55624A] text-white"
                                        : "bg-[#F3F5EE]"
                                }
                            `}
                        >
                            {option.label}
                        </button>
                    ))}

                </div>

            </div>

            {/* TOPO RESULTADOS */}

            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

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
                    {filteredProducts.length} produtos
                </div>

                <select
                    value={sort}
                    onChange={(e) =>
                        setSort(
                            e.target.value
                        )
                    }
                    className="
                        rounded-xl
                        border
                        border-[#E5E7E0]
                        bg-white
                        px-4
                        py-3
                    "
                >
                    <option value="name">
                        Nome
                    </option>

                    <option value="price-asc">
                        Preço ↑
                    </option>

                    <option value="price-desc">
                        Preço ↓
                    </option>
                </select>

            </div>

            {/* PRODUTOS */}

            {filteredProducts.length ===
            0 ? (
                <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

                    <h3 className="text-2xl font-semibold">
                        Nenhum produto encontrado
                    </h3>

                    <p className="mt-3 text-gray-600">
                        Experimente alterar os filtros.
                    </p>

                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                    {filteredProducts.map(
                        (product) => (
                            <ProductCard
                               product={product}
                                
                            />
                        )
                    )}

                </div>
            )}

        </div>
    );
}