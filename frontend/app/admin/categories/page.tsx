
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    FolderTree,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    Star,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import SearchInput from "@/components/admin/common/SearchInput";
import StatusBadge from "@/components/admin/common/StatusBadge";
import DataTable from "@/components/admin/DataTable";

import type { AdminCategoryList } from "@/types/categories/admin/admin-category-list";
import type { PaginationParams } from "@/lib/api/common/base-api";
import { adminCategoriesApi } from "@/lib/api/categories/admin-categories";

const PAGE_SIZE = 10;

type SortOrder = "asc" | "desc";

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<AdminCategoryList[]>([]);

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] = useState("");
    const [featuredFilter, setFeaturedFilter] = useState("");

    const [sort, setSort] = useState("name");
    const [order, setOrder] = useState<SortOrder>("asc");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ====================================================================== */
    /* LOAD CATEGORIES                                                        */
    /* ====================================================================== */

    const loadCategories = useCallback(
        async (requestedPage = 1) => {
            try {
                setIsLoading(true);
                setError(null);

                const params: PaginationParams = {
                    page: requestedPage,
                    pageSize: PAGE_SIZE,
                    search: search || undefined,
                    sort,
                    order,
                };

                if (activeFilter !== "") {
                    params.active = activeFilter === "true";
                }

                if (featuredFilter !== "") {
                    params.featured = featuredFilter === "true";
                }

                const response = await adminCategoriesApi.getAll(params);

                setCategories(response.items);
                setPage(response.page);
                setPages(response.pages);
                setTotal(response.total);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as categorias.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [search, activeFilter, featuredFilter, sort, order],
    );

    /* ====================================================================== */
    /* EFFECTS                                                                */
    /* ====================================================================== */

    useEffect(() => {
        void loadCategories(1);
    }, [loadCategories]);

    /* ====================================================================== */
    /* SEARCH                                                                 */
    /* ====================================================================== */

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch(searchInput.trim());
    }

    /* ====================================================================== */
    /* FILTERS                                                                */
    /* ====================================================================== */

    function handleResetFilters() {
        setSearchInput("");
        setSearch("");
        setActiveFilter("");
        setFeaturedFilter("");
    }

    /* ====================================================================== */
    /* SORT                                                                   */
    /* ====================================================================== */

    function handleSort(field: string) {
        if (sort === field) {
            setOrder((current) =>
                current === "asc" ? "desc" : "asc",
            );
        } else {
            setSort(field);
            setOrder("asc");
        }
    }

    /* ====================================================================== */
    /* RENDER                                                                 */
    /* ====================================================================== */

    return (
        <div className="space-y-6 pb-10">
            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Categorias"
                    subtitle="Gere as categorias utilizadas para organizar os produtos do Momentos em Flor."
                />

                <Link
                    href="/admin/categories/new"
                    className="
                        inline-flex items-center justify-center gap-2
                        rounded-2xl bg-[#55624A] px-5 py-3
                        text-sm font-semibold text-white shadow-sm
                        transition hover:bg-[#46523C]
                    "
                >
                    <Plus size={18} />
                    Nova categoria
                </Link>
            </div>

            {/* SEARCH AND FILTERS */}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <SlidersHorizontal size={19} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-[#2F3B2A]">
                            Pesquisa e filtros
                        </h2>

                        <p className="text-xs text-gray-400">
                            Encontra categorias pelo nome, slug, estado ou destaque.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSearch}
                    className="mt-5 space-y-4"
                >
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Pesquisar categorias..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="
                                inline-flex items-center justify-center gap-2
                                rounded-2xl bg-[#55624A] px-5 py-3
                                text-sm font-semibold text-white
                                transition hover:bg-[#46523C]
                            "
                        >
                            <Search size={17} />
                            Pesquisar
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <FilterSelect
                            label="Estado"
                            value={activeFilter}
                            onChange={setActiveFilter}
                        >
                            <option value="">Todos os estados</option>
                            <option value="true">Ativas</option>
                            <option value="false">Inativas</option>
                        </FilterSelect>

                        <FilterSelect
                            label="Destaque"
                            value={featuredFilter}
                            onChange={setFeaturedFilter}
                        >
                            <option value="">Todos</option>
                            <option value="true">Destacadas</option>
                            <option value="false">Não destacadas</option>
                        </FilterSelect>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="text-sm font-medium text-gray-500 transition hover:text-[#55624A]"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </form>
            </section>

            {/* ERROR */}

            {error && (
                <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => void loadCategories(page)}
                        className="font-semibold underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* CATEGORIES TABLE */}

            <DataTable>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                <th className="px-5 py-4">
                                    <SortButton
                                        label="Categoria"
                                        field="name"
                                        currentSort={sort}
                                        order={order}
                                        onSort={handleSort}
                                    />
                                </th>

                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Destaque
                                </th>

                                <th className="px-5 py-4 font-semibold text-[#2F3B2A]">
                                    Estado
                                </th>

                                <th className="px-5 py-4 text-right font-semibold text-[#2F3B2A]">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <LoadingRows />
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-20 text-center"
                                    >
                                        <FolderTree
                                            size={28}
                                            className="mx-auto text-[#55624A]"
                                        />

                                        <p className="mt-4 font-semibold text-[#2F3B2A]">
                                            Nenhuma categoria encontrada
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Experimenta alterar a pesquisa ou os filtros.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}

                {!isLoading && pages > 0 && (
                    <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            A mostrar{" "}
                            <span className="font-semibold text-gray-700">
                                {categories.length}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-gray-700">
                                {total}
                            </span>{" "}
                            categorias
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => void loadCategories(page - 1)}
                                aria-label="Página anterior"
                                className="
                                    flex h-10 w-10 items-center justify-center
                                    rounded-xl border border-gray-200 text-gray-600
                                    transition hover:bg-[#F5F7F2]
                                    disabled:cursor-not-allowed disabled:opacity-40
                                "
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#55624A] px-3 text-sm font-semibold text-white">
                                {page}
                            </span>

                            <span className="text-sm text-gray-400">
                                / {pages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= pages}
                                onClick={() => void loadCategories(page + 1)}
                                aria-label="Página seguinte"
                                className="
                                    flex h-10 w-10 items-center justify-center
                                    rounded-xl border border-gray-200 text-gray-600
                                    transition hover:bg-[#F5F7F2]
                                    disabled:cursor-not-allowed disabled:opacity-40
                                "
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </DataTable>
        </div>
    );
}

/* ========================================================================== */
/* CATEGORY ROW                                                               */
/* ========================================================================== */

function CategoryRow({
    category,
}: {
    category: AdminCategoryList;
}) {
    return (
        <tr className="group border-b border-gray-50 transition hover:bg-[#FAFBF8]">
            {/* CATEGORY */}

            <td className="px-5 py-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        {category.image ? (
                            <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FolderTree size={21} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2F3B2A]">
                            {category.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                            /{category.slug}
                        </p>
                    </div>
                </div>
            </td>

            {/* FEATURED */}

            <td className="px-5 py-5">
                {category.featured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <Star size={13} className="fill-current" />
                        Sim
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">
                        Não
                    </span>
                )}
            </td>

            {/* STATUS */}

            <td className="px-5 py-5">
                <StatusBadge
                    status={category.active ? "Ativo" : "Inativo"}
                />
            </td>

            {/* ACTIONS */}

            <td className="px-5 py-5">
                <div className="flex items-center justify-end">
                    <Link
                        href={`/admin/categories/${category.id}/edit`}
                        title="Editar categoria"
                        aria-label={`Editar ${category.name}`}
                        className="
                            flex h-9 w-9 items-center justify-center
                            rounded-xl text-gray-400 transition
                            hover:bg-[#F3F5EE] hover:text-[#55624A]
                        "
                    >
                        <Pencil size={17} />
                    </Link>
                </div>
            </td>
        </tr>
    );
}

/* ========================================================================== */
/* SORT BUTTON                                                                */
/* ========================================================================== */

function SortButton({
    label,
    field,
    currentSort,
    order,
    onSort,
}: {
    label: string;
    field: string;
    currentSort: string;
    order: SortOrder;
    onSort: (field: string) => void;
}) {
    const isActive = currentSort === field;

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="
                inline-flex items-center gap-2
                font-semibold text-[#2F3B2A]
                transition hover:text-[#55624A]
            "
        >
            {label}

            {isActive ? (
                order === "asc" ? (
                    <ArrowUp size={15} className="text-[#55624A]" />
                ) : (
                    <ArrowDown size={15} className="text-[#55624A]" />
                )
            ) : (
                <ArrowUpDown size={15} className="text-gray-400" />
            )}
        </button>
    );
}

/* ========================================================================== */
/* FILTER SELECT                                                              */
/* ========================================================================== */

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-500">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="
                    w-full rounded-xl border border-gray-200 bg-white
                    px-3 py-3 text-sm text-gray-700 outline-none transition
                    focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10
                "
            >
                {children}
            </select>
        </label>
    );
}

/* ========================================================================== */
/* LOADING ROWS                                                               */
/* ========================================================================== */

function LoadingRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                    key={rowIndex}
                    className="border-b border-gray-50"
                >
                    {Array.from({ length: 4 }).map((_, cellIndex) => (
                        <td
                            key={cellIndex}
                            className="px-5 py-5"
                        >
                            <div className="h-5 animate-pulse rounded-lg bg-gray-100" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
