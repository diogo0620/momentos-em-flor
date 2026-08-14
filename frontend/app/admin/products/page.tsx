"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
    ChevronLeft,
    ChevronRight,
    Package,
    Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";
import SearchInput from "@/components/admin/common/SearchInput";
import FilterBar from "@/components/admin/common/FilterBar";
import DataTable from "@/components/admin/DataTable";

import {
    getProducts,
    type GetProductsParams,
} from "@/lib/api/products";

import type {
    Product,
    Pagination,
} from "@/types/product";

export default function AdminProductsPage() {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [pagination, setPagination] =
        useState<Pagination>({
            page: 1,
            pageSize: 20,
            total: 0,
            pages: 0,
        });

    const [search, setSearch] =
        useState("");

    const [searchInput, setSearchInput] =
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
            params: GetProductsParams = {},
        ) => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getProducts({
                        page:
                            params.page ??
                            pagination.page,

                        pageSize:
                            params.pageSize ??
                            pagination.pageSize,

                        search:
                            params.search ??
                            search,

                        sort:
                            params.sort ??
                            sort,

                        order:
                            params.order ??
                            order,
                    });

                setProducts(
                    response.data,
                );

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
            pagination.page,
            pagination.pageSize,
            search,
            sort,
            order,
        ],
    );

    useEffect(() => {
        loadProducts({
            page: 1,
        });
    }, [
        search,
        sort,
        order,
    ]);

    function handleSearch(
        value: string,
    ) {
        setSearchInput(value);
    }

    function submitSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setSearch(searchInput);
    }

    function handleSort(
        field: string,
    ) {
        if (sort === field) {
            setOrder(
                (current) =>
                    current === "asc"
                        ? "desc"
                        : "asc",
            );
        } else {
            setSort(field);
            setOrder("asc");
        }
    }

    function goToPage(
        page: number,
    ) {
        if (
            page < 1 ||
            page > pagination.pages
        ) {
            return;
        }

        loadProducts({
            page,
        });
    }

    return (
        <div>

            <PageHeader
                title="Produtos"
                subtitle="Gestão dos produtos disponíveis no catálogo."
            />

            {/* FILTERS + ACTION */}

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-stretch">

                <div className="flex-1">

                    <FilterBar>

                        <form
                            onSubmit={
                                submitSearch
                            }
                        >
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                                <div className="w-full xl:max-w-md">

                                    <SearchInput
                                        value={
                                            searchInput
                                        }
                                        onChange={
                                            handleSearch
                                        }
                                        placeholder="Pesquisar produtos..."
                                    />

                                </div>

                                <div className="flex flex-wrap items-center gap-3">

                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            handleSort(
                                                e.target
                                                    .value,
                                            )
                                        }
                                        className="
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            focus:border-[#55624A]
                                            focus:ring-4
                                            focus:ring-[#55624A]/10
                                        "
                                    >
                                        <option value="name">
                                            Nome
                                        </option>

                                        <option value="basePrice">
                                            Preço base
                                        </option>

                                        <option value="createdAt">
                                            Data de criação
                                        </option>
                                    </select>

                                    <button
                                        type="submit"
                                        className="
                                            rounded-2xl
                                            bg-[#55624A]
                                            px-5
                                            py-3
                                            text-sm
                                            font-medium
                                            text-white
                                            transition
                                            hover:opacity-90
                                        "
                                    >
                                        Pesquisar
                                    </button>

                                </div>

                            </div>
                        </form>

                    </FilterBar>

                </div>

                <Link
                    href="/admin/products/new"
                    className="
                        inline-flex
                        min-h-[76px]
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-3xl
                        bg-[#55624A]
                        px-6
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    <Plus size={18} />
                    Novo produto
                </Link>

            </div>

            {/* METRICS */}

            <div className="mt-8 grid gap-6 md:grid-cols-3">

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Package size={21} />
                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Total de produtos
                            </p>

                            <p className="mt-1 text-3xl font-bold text-[#2F3B2A]">
                                {pagination.total}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Produtos ativos
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                        {
                            products.filter(
                                (product) =>
                                    product.active,
                            ).length
                        }
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Na página atual
                    </p>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Preço médio
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                        {products.length > 0
                            ? (
                                  products.reduce(
                                      (
                                          sum,
                                          product,
                                      ) =>
                                          sum +
                                          product.basePrice,
                                      0,
                                  ) /
                                  products.length
                              ).toFixed(2)
                            : "0.00"}{" "}
                        €
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Na página atual
                    </p>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-600">
                    {error}
                </div>
            )}

            {/* TABLE */}

            <div className="mt-8">

                <DataTable>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-gray-100 text-left">

                                    <th className="px-6 py-5">

                                        <SortButton
                                            label="Produto"
                                            field="name"
                                            currentSort={
                                                sort
                                            }
                                            order={
                                                order
                                            }
                                            onSort={
                                                handleSort
                                            }
                                        />

                                    </th>

                                    <th className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                        Categoria
                                    </th>

                                    <th className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                        Tipo
                                    </th>

                                    <th className="px-6 py-5">

                                        <SortButton
                                            label="Preço base"
                                            field="basePrice"
                                            currentSort={
                                                sort
                                            }
                                            order={
                                                order
                                            }
                                            onSort={
                                                handleSort
                                            }
                                        />

                                    </th>

                                    <th className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                        Estado
                                    </th>

                                    <th className="px-6 py-5 text-right font-semibold text-[#2F3B2A]">
                                        Ações
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {isLoading ? (
                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center text-gray-500"
                                        >
                                            A carregar produtos...
                                        </td>

                                    </tr>
                                ) : products.length ===
                                  0 ? (
                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center"
                                        >

                                            <Package
                                                size={36}
                                                className="mx-auto text-gray-300"
                                            />

                                            <p className="mt-4 font-medium text-gray-600">
                                                Nenhum produto encontrado.
                                            </p>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Tente alterar a pesquisa.
                                            </p>

                                        </td>

                                    </tr>
                                ) : (
                                    products.map(
                                        (
                                            product,
                                        ) => (
                                            <tr
                                                key={
                                                    product.id
                                                }
                                                className="
                                                    border-b
                                                    border-gray-50
                                                    transition
                                                    hover:bg-[#FAFBF8]
                                                "
                                            >

                                                <td className="px-6 py-5">

                                                    <div>

                                                        <p className="font-semibold text-[#2F3B2A]">
                                                            {
                                                                product.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-400">
                                                            /
                                                            {
                                                                product.slug
                                                            }
                                                        </p>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="rounded-full bg-[#D6DEC8] px-3 py-1 text-xs font-medium text-[#55624A]">
                                                        {
                                                            product
                                                                .category
                                                                .name
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-gray-600">
                                                        {product.pricingType ===
                                                        "FIXED"
                                                            ? "Preço fixo"
                                                            : "Por unidade"}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="font-semibold text-[#2F3B2A]">
                                                        {product.basePrice.toFixed(
                                                            2,
                                                        )}{" "}
                                                        €
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <StatusBadge
                                                        status={
                                                            product.active
                                                                ? "ACTIVE"
                                                                : "INACTIVE"
                                                        }
                                                    />

                                                </td>

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center justify-end gap-4">

                                                        <Link
                                                            href={`/admin/products/${product.id}`}
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-[#55624A]
                                                                hover:underline
                                                            "
                                                        >
                                                            Ver
                                                        </Link>

                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-gray-500
                                                                hover:text-[#55624A]
                                                            "
                                                        >
                                                            Editar
                                                        </Link>

                                                    </div>

                                                </td>

                                            </tr>
                                        ),
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

                    {!isLoading &&
                        pagination.pages >
                            0 && (
                            <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-sm text-gray-500">

                                    Página{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.page
                                        }
                                    </span>

                                    {" "}de{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.pages
                                        }
                                    </span>

                                    <span className="ml-2 text-gray-400">
                                        ({pagination.total} produtos)
                                    </span>

                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <=
                                            1
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page -
                                                    1,
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-gray-200
                                            transition
                                            hover:bg-[#F5F7F2]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <ChevronLeft
                                            size={18}
                                        />
                                    </button>

                                    <span className="px-3 text-sm font-medium text-gray-600">
                                        {
                                            pagination.page
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page >=
                                            pagination.pages
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page +
                                                    1,
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-gray-200
                                            transition
                                            hover:bg-[#F5F7F2]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <ChevronRight
                                            size={18}
                                        />
                                    </button>

                                </div>

                            </div>
                        )}

                </DataTable>

            </div>

        </div>
    );
}

type SortButtonProps = {
    label: string;
    field: string;
    currentSort: string;
    order: "asc" | "desc";
    onSort: (field: string) => void;
};

function SortButton({
    label,
    field,
    currentSort,
    order,
    onSort,
}: SortButtonProps) {
    const active =
        currentSort === field;

    return (
        <button
            type="button"
            onClick={() =>
                onSort(field)
            }
            className="
                inline-flex
                items-center
                gap-2
                font-semibold
                text-[#2F3B2A]
                transition
                hover:text-[#55624A]
            "
        >
            {label}

            <span className="text-xs text-gray-400">
                {active
                    ? order === "asc"
                        ? "↑"
                        : "↓"
                    : "↕"}
            </span>
        </button>
    );
}