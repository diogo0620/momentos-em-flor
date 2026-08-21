"use client";

import Link from "next/link";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Package,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import FilterBar from "@/components/admin/common/FilterBar";
import SearchInput from "@/components/admin/common/SearchInput";
import DataTable from "@/components/admin/DataTable";

import {
    getProducts,
    type GetProductsParams,
} from "@/lib/api/products";

import type {
    Product,
    Pagination,
} from "@/types/product";

/* ========================================================================== */
/* STATUS                                                                     */
/* ========================================================================== */

const statusConfig = {
    ACTIVE: {
        label: "Ativo",
        className:
            "bg-green-50 text-green-700 border-green-100",
        dotClassName:
            "bg-green-500",
    },

    INACTIVE: {
        label: "Inativo",
        className:
            "bg-gray-100 text-gray-600 border-gray-200",
        dotClassName:
            "bg-gray-400",
    },
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatPrice(
    value: number,
) {
    return new Intl.NumberFormat(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR",
        },
    ).format(value);
}

function getPricingTypeLabel(
    pricingType: Product["pricingType"],
) {
    switch (pricingType) {
        case "FIXED":
            return "Preço fixo";

        case "PER_UNIT":
            return "Por unidade";

        default:
            return pricingType;
    }
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

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

    /* ====================================================================== */
    /* LOAD                                                                   */
    /* ====================================================================== */

    const loadProducts =
        useCallback(
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

    /* ====================================================================== */
    /* SEARCH                                                                 */
    /* ====================================================================== */

    function handleSearch(
        value: string,
    ) {
        setSearchInput(value);
    }

    function submitSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim(),
        );
    }

    /* ====================================================================== */
    /* SORT                                                                   */
    /* ====================================================================== */

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

    /* ====================================================================== */
    /* PAGINATION                                                             */
    /* ====================================================================== */

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

    /* ====================================================================== */
    /* METRICS                                                                */
    /* ====================================================================== */

    const activeProducts =
        useMemo(
            () =>
                products.filter(
                    (product) =>
                        product.active,
                ).length,
            [products],
        );

    const inactiveProducts =
        products.length -
        activeProducts;

    const averagePrice =
        products.length > 0
            ? products.reduce(
                  (
                      sum,
                      product,
                  ) =>
                      sum +
                      Number(
                          product.basePrice,
                      ),
                  0,
              ) / products.length
            : 0;

    /* ====================================================================== */
    /* PAGE                                                                   */
    /* ====================================================================== */

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <PageHeader
                    title="Produtos"
                    subtitle="Gira o catálogo de produtos disponíveis na plataforma."
                />

                <Link
                    href="/admin/products/new"
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-[#55624A]
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#46523C]
                        hover:shadow-md
                    "
                >
                    <Plus size={18} />
                    Novo produto
                </Link>

            </div>

            {/* ================================================================== */}
            {/* SUMMARY                                                            */}
            {/* ================================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    icon={Package}
                    label="Total de produtos"
                    value={
                        pagination.total
                    }
                    description="No catálogo"
                />

                <SummaryCard
                    label="Produtos ativos"
                    value={
                        activeProducts
                    }
                    description="Nesta página"
                    valueClassName="text-green-700"
                />

                <SummaryCard
                    label="Produtos inativos"
                    value={
                        inactiveProducts
                    }
                    description="Nesta página"
                    valueClassName="text-gray-500"
                />

                <SummaryCard
                    label="Preço médio"
                    value={formatPrice(
                        averagePrice,
                    )}
                    description="Nesta página"
                />

            </div>

            {/* ================================================================== */}
            {/* FILTERS                                                            */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <SlidersHorizontal
                            size={19}
                        />
                    </div>

                    <div>

                        <h2 className="font-semibold text-[#2F3B2A]">
                            Pesquisar e ordenar
                        </h2>

                        <p className="text-xs text-gray-400">
                            Encontre rapidamente o produto que procura.
                        </p>

                    </div>

                </div>

                <div className="mt-5">

                    <form
                        onSubmit={
                            submitSearch
                        }
                        className="flex flex-col gap-3 lg:flex-row"
                    >

                        <div className="flex-1">

                            <SearchInput
                                value={
                                    searchInput
                                }
                                onChange={
                                    handleSearch
                                }
                                placeholder="Pesquisar por nome ou produto..."
                            />

                        </div>

                        <select
                            value={sort}
                            onChange={(event) =>
                                handleSort(
                                    event.target
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
                                text-gray-700
                                outline-none
                                transition
                                focus:border-[#55624A]
                                focus:ring-4
                                focus:ring-[#55624A]/10
                            "
                        >
                            <option value="name">
                                Ordenar por nome
                            </option>

                            <option value="basePrice">
                                Ordenar por preço
                            </option>

                            <option value="createdAt">
                                Ordenar por data
                            </option>
                        </select>

                        <button
                            type="submit"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#46523C]
                            "
                        >
                            <Search
                                size={17}
                            />
                            Pesquisar
                        </button>

                    </form>

                </div>

            </div>

            {/* ================================================================== */}
            {/* ERROR                                                              */}
            {/* ================================================================== */}

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* ================================================================== */}
            {/* PRODUCTS                                                           */}
            {/* ================================================================== */}

            <DataTable>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">

                                <th className="px-6 py-4">

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

                                <th className="px-6 py-4 font-semibold text-[#2F3B2A]">
                                    Categoria
                                </th>

                                <th className="px-6 py-4 font-semibold text-[#2F3B2A]">
                                    Tipo
                                </th>

                                <th className="px-6 py-4">

                                    <SortButton
                                        label="Preço"
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

                                <th className="px-6 py-4 font-semibold text-[#2F3B2A]">
                                    Estado
                                </th>

                                <th className="px-6 py-4 text-right font-semibold text-[#2F3B2A]">
                                    Ações
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {isLoading ? (
                                <LoadingRows />
                            ) : products.length ===
                              0 ? (
                                <EmptyProducts />
                            ) : (
                                products.map(
                                    (
                                        product,
                                    ) => (
                                        <ProductRow
                                            key={
                                                product.id
                                            }
                                            product={
                                                product
                                            }
                                        />
                                    ),
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                {/* ================================================================== */}
                {/* PAGINATION                                                         */}
                {/* ================================================================== */}

                {!isLoading &&
                    pagination.pages >
                        0 && (
                        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-sm text-gray-500">

                                    A mostrar{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            products.length
                                        }
                                    </span>

                                    {" "}de{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.total
                                        }
                                    </span>

                                    {" "}produtos

                                </p>

                                <p className="mt-1 text-xs text-gray-400">

                                    Página{" "}
                                    {
                                        pagination.page
                                    }{" "}
                                    de{" "}
                                    {
                                        pagination.pages
                                    }

                                </p>

                            </div>

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
                                        bg-white
                                        text-gray-600
                                        transition
                                        hover:border-[#D6DEC8]
                                        hover:bg-[#F5F7F2]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft
                                        size={18}
                                    />
                                </button>

                                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#55624A] px-3 text-sm font-semibold text-white">
                                    {
                                        pagination.page
                                    }
                                </div>

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
                                        bg-white
                                        text-gray-600
                                        transition
                                        hover:border-[#D6DEC8]
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
    );
}

/* ========================================================================== */
/* SUMMARY CARD                                                               */
/* ========================================================================== */

type SummaryCardProps = {
    icon?: React.ElementType;
    label: string;
    value: string | number;
    description: string;
    valueClassName?: string;
};

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    valueClassName = "text-[#2F3B2A]",
}: SummaryCardProps) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between gap-4">

                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <Icon size={19} />
                    </div>
                )}

                <div
                    className={
                        Icon
                            ? "text-right"
                            : "w-full"
                    }
                >

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {label}
                    </p>

                    <p
                        className={`
                            mt-2
                            text-2xl
                            font-bold
                            ${valueClassName}
                        `}
                    >
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        {description}
                    </p>

                </div>

            </div>

        </div>
    );
}

/* ========================================================================== */
/* PRODUCT ROW                                                                */
/* ========================================================================== */

function ProductRow({
    product,
}: {
    product: Product;
}) {
    const status =
        product.active
            ? statusConfig.ACTIVE
            : statusConfig.INACTIVE;

    return (
        <tr
            className="
                group
                border-b
                border-gray-50
                transition
                hover:bg-[#FAFBF8]
            "
        >

            {/* PRODUCT */}

            <td className="px-6 py-5">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A] transition group-hover:bg-[#E9EDE3]">
                        <Package
                            size={21}
                        />
                    </div>

                    <div className="min-w-0">

                        <p className="truncate font-semibold text-[#2F3B2A]">
                            {
                                product.name
                            }
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                            /{
                                product.slug
                            }
                        </p>

                    </div>

                </div>

            </td>

            {/* CATEGORY */}

            <td className="px-6 py-5">

                <span className="inline-flex rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-medium text-[#55624A]">
                    {
                        product
                            .category
                            .name
                    }
                </span>

            </td>

            {/* PRICING TYPE */}

            <td className="px-6 py-5">

                <span className="text-sm text-gray-600">
                    {
                        getPricingTypeLabel(
                            product.pricingType,
                        )
                    }
                </span>

            </td>

            {/* PRICE */}

            <td className="px-6 py-5">

                <div>

                    <p className="font-bold text-[#2F3B2A]">
                        {formatPrice(
                            Number(
                                product.basePrice,
                            ),
                        )}
                    </p>

                    {product.pricingType ===
                        "PER_UNIT" && (
                        <p className="mt-1 text-xs text-gray-400">
                            por unidade
                        </p>
                    )}

                </div>

            </td>

            {/* STATUS */}

            <td className="px-6 py-5">

                <span
                    className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        ${status.className}
                    `}
                >

                    <span
                        className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${status.dotClassName}
                        `}
                    />

                    {status.label}

                </span>

            </td>

            {/* ACTIONS */}

            <td className="px-6 py-5">

                <div className="flex items-center justify-end gap-2">

                    <Link
                        href={`/admin/products/${product.id}`}
                        title="Ver produto"
                        aria-label="Ver produto"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-gray-400
                            transition
                            hover:bg-[#F3F5EE]
                            hover:text-[#55624A]
                        "
                    >
                        <Eye
                            size={17}
                        />
                    </Link>

                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        title="Editar produto"
                        aria-label="Editar produto"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-gray-400
                            transition
                            hover:bg-[#F3F5EE]
                            hover:text-[#55624A]
                        "
                    >
                        <Pencil
                            size={17}
                        />
                    </Link>

                </div>

            </td>

        </tr>
    );
}

/* ========================================================================== */
/* SORT BUTTON                                                                */
/* ========================================================================== */

type SortButtonProps = {
    label: string;
    field: string;
    currentSort: string;
    order: "asc" | "desc";
    onSort: (
        field: string,
    ) => void;
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

            <span
                className={`
                    text-xs
                    ${
                        active
                            ? "text-[#55624A]"
                            : "text-gray-300"
                    }
                `}
            >
                {active
                    ? order === "asc"
                        ? "↑"
                        : "↓"
                    : "↕"}
            </span>

        </button>
    );
}

/* ========================================================================== */
/* LOADING ROWS                                                               */
/* ========================================================================== */

function LoadingRows() {
    return (
        <>
            {Array.from({
                length: 6,
            }).map((_, index) => (
                <tr
                    key={index}
                    className="border-b border-gray-50"
                >
                    {Array.from({
                        length: 6,
                    }).map(
                        (
                            _,
                            cellIndex,
                        ) => (
                            <td
                                key={
                                    cellIndex
                                }
                                className="px-6 py-5"
                            >
                                <div className="h-5 animate-pulse rounded-lg bg-gray-100" />
                            </td>
                        ),
                    )}
                </tr>
            ))}
        </>
    );
}

/* ========================================================================== */
/* EMPTY PRODUCTS                                                             */
/* ========================================================================== */

function EmptyProducts() {
    return (
        <tr>

            <td
                colSpan={6}
                className="px-6 py-20 text-center"
            >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <Package
                        size={27}
                    />
                </div>

                <p className="mt-5 text-lg font-semibold text-[#2F3B2A]">
                    Nenhum produto encontrado
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                    Não encontrámos produtos
                    correspondentes aos filtros
                    aplicados.
                </p>

            </td>

        </tr>
    );
}