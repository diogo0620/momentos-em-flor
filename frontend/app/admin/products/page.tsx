"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
    Euro,
    Package,
    Pencil,
    Plus,
    Tag,
    TrendingUp,
} from "lucide-react";

import { products } from "@/data/products";

import PageHeader from "@/components/admin/common/PageHeader";
import FilterBar from "@/components/admin/common/FilterBar";
import SearchInput from "@/components/admin/common/SearchInput";
import SectionCard from "@/components/admin/common/SectionCard";
import StatusBadge from "@/components/admin/common/StatusBadge";
import EmptyState from "@/components/admin/common/EmptyState";
import MetricCard from "@/components/admin/common/MetricCard";

export default function AdminProductsPage() {

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("all");

    const [sort, setSort] =
        useState("name");

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

                default:

                    result.sort((a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                    );

            }

            return result;

        }, [
            search,
            category,
            sort,
        ]);

    const averagePrice =
        products.reduce(
            (sum, product) =>
                sum + product.price.selling,
            0
        ) / products.length;

    const maxPrice =
        Math.max(
            ...products.map(
                (product) =>
                    product.price.selling
            )
        );

    return (

        <div className="space-y-8">

            <PageHeader
                title="Produtos"
                subtitle="Gerencie o catálogo da loja."
                buttonText="Novo Produto"
                buttonHref="/admin/products/new"
                buttonIcon={Plus}
            />

            <FilterBar>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Pesquisar produtos..."
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-6">

                    <div>

                        <p className="mb-2 text-sm font-medium text-gray-500">
                            Categoria
                        </p>

                        <div className="flex flex-wrap gap-2">

                            <button
                                onClick={() =>
                                    setCategory("all")
                                }
                                className={`
                                    rounded-full
                                    px-4
                                    py-2
                                    text-sm
                                    transition
                                    ${category === "all"
                                        ? "bg-[#55624A] text-white"
                                        : "bg-[#F3F5EE] hover:bg-[#D6DEC8]"
                                    }
                                `}
                            >
                                Todas
                            </button>

                            {categories.map(
                                (cat) => (

                                    <button
                                        key={cat}
                                        onClick={() =>
                                            setCategory(cat)
                                        }
                                        className={`
                                            rounded-full
                                            px-4
                                            py-2
                                            text-sm
                                            transition
                                            ${category === cat
                                                ? "bg-[#55624A] text-white"
                                                : "bg-[#F3F5EE] hover:bg-[#D6DEC8]"
                                            }
                                        `}
                                    >
                                        {cat}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                    <div className="flex items-center gap-4">

                        <p className="text-sm text-gray-500">

                            A mostrar{" "}

                            <span className="font-semibold text-[#2F3B2A]">
                                {filteredProducts.length}
                            </span>

                            {" "}de{" "}

                            <span className="font-semibold text-[#2F3B2A]">
                                {products.length}
                            </span>

                            {" "}produtos

                        </p>

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
                                border-gray-200
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

                </div>

            </FilterBar>

            <SectionCard>

                {filteredProducts.length > 0 && (

                    <>

                        <div
                            className="
                                grid
                                grid-cols-[2.5fr_180px_140px_140px_70px]
                                border-b
                                bg-[#F8F9F5]
                                px-6
                                py-4
                                text-sm
                                font-semibold
                                text-gray-500
                            "
                        >

                            <div>Produto</div>

                            <div>Categoria</div>

                            <div>Preço</div>

                            <div>Estado</div>

                            <div></div>

                        </div>
                        {filteredProducts.map(
                            (product) => (

                                <div
                                    key={product.id}
                                    className="
                                        grid
                                        grid-cols-[2.5fr_180px_140px_140px_70px]
                                        items-center
                                        border-b
                                        border-gray-100
                                        px-6
                                        py-5
                                        transition-all
                                        duration-200
                                        hover:bg-[#F8F9F5]
                                    "
                                >

                                    {/* PRODUTO */}

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="
                                                flex
                                                h-16
                                                w-16
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-[#FAFAF7]
                                            "
                                        >

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="
                                                    h-14
                                                    w-14
                                                    object-contain
                                                    p-1
                                                "
                                            />

                                        </div>

                                        <div>

                                            <h3 className="font-semibold text-[#2F3B2A]">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                ID #{product.id}
                                            </p>

                                        </div>

                                    </div>

                                    {/* CATEGORIA */}

                                    <div>

                                        <span
                                            className="
                                                rounded-full
                                                bg-[#D6DEC8]/50
                                                px-3
                                                py-1
                                                text-sm
                                                text-[#55624A]
                                            "
                                        >
                                            {product.category}
                                        </span>

                                    </div>

                                    {/* PREÇO */}

                                    <div className="font-semibold">

                                        {product.price.selling.toFixed(2)} €

                                    </div>

                                    {/* ESTADO */}

                                    <div>

                                        <StatusBadge
                                            status="ACTIVE"
                                        />

                                    </div>

                                    {/* EDITAR */}

                                    <div className="flex justify-end">

                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                transition-all
                                                duration-200
                                                hover:bg-[#D6DEC8]
                                                hover:scale-110
                                            "
                                        >
                                            <Pencil
                                                size={18}
                                            />
                                        </Link>

                                    </div>

                                </div>

                            )
                        )}

                    </>

                )}

                {filteredProducts.length === 0 && (

                    <EmptyState
                        title="Nenhum produto encontrado"
                        description="Experimente alterar os filtros ou a pesquisa."
                    />

                )}

            </SectionCard>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Produtos"
                    value={products.length}
                    subtitle="No catálogo"
                    icon={Package}
                />

                <MetricCard
                    title="Categorias"
                    value={categories.length}
                    subtitle="Disponíveis"
                    icon={Tag}
                    color="#16A34A"
                />

                <MetricCard
                    title="Preço Médio"
                    value={`${averagePrice.toFixed(2)} €`}
                    subtitle="Por produto"
                    icon={Euro}
                    color="#2563EB"
                />

                <MetricCard
                    title="Preço Máximo"
                    value={`${maxPrice.toFixed(2)} €`}
                    subtitle="Produto mais caro"
                    icon={TrendingUp}
                    color="#D97706"
                />

            </div>

        </div>

    );

}