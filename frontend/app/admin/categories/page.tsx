"use client";

import Link from "next/link";
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ChevronLeft,
    ChevronRight,
    FolderTree,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import SearchInput from "@/components/admin/common/SearchInput";
import DataTable from "@/components/admin/DataTable";

import {
    getAdminCategories,
    type Category,
    type GetCategoriesParams,
} from "@/lib/api/categories";

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
    const [categories, setCategories] =
        useState<Category[]>([]);

    const [pagination, setPagination] =
        useState({
            page: 1,
            pageSize: PAGE_SIZE,
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

    const loadCategories = useCallback(
        async (
            params: GetCategoriesParams = {},
        ) => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getAdminCategories({
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

                setCategories(
                    response.data,
                );

                setPagination(
                    response.pagination,
                );
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
        [
            pagination.page,
            pagination.pageSize,
            search,
            sort,
            order,
        ],
    );

    useEffect(() => {
        loadCategories({
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

        setSearch(
            searchInput.trim(),
        );
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

            return;
        }

        setSort(field);
        setOrder("asc");
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

        loadCategories({
            page,
        });
    }

    const activeCategories =
        categories.filter(
            (category) =>
                category.active,
        ).length;

    const inactiveCategories =
        categories.length -
        activeCategories;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Categorias"
                    subtitle="Gere as categorias disponíveis para organizar os produtos da plataforma."
                />

                <Link
                    href="/admin/categories/new"
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
                    Nova categoria
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    icon={FolderTree}
                    label="Total de categorias"
                    value={
                        pagination.total
                    }
                    description="Categorias existentes"
                />

                <SummaryCard
                    label="Categorias ativas"
                    value={
                        activeCategories
                    }
                    description="Nesta página"
                    valueClassName="text-green-700"
                />

                <SummaryCard
                    label="Categorias inativas"
                    value={
                        inactiveCategories
                    }
                    description="Nesta página"
                    valueClassName="text-gray-500"
                />
            </div>

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
                            Encontre rapidamente a
                            categoria que procura.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={
                        submitSearch
                    }
                    className="mt-5 flex flex-col gap-3 lg:flex-row"
                >
                    <div className="flex-1">
                        <SearchInput
                            value={
                                searchInput
                            }
                            onChange={
                                handleSearch
                            }
                            placeholder="Pesquisar por nome ou slug..."
                        />
                    </div>

                    <select
                        value={sort}
                        onChange={(event) =>
                            handleSort(
                                event.target.value,
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

                        <option value="slug">
                            Ordenar por slug
                        </option>

                        <option value="createdAt">
                            Ordenar por data
                        </option>

                        <option value="active">
                            Ordenar por estado
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
                        <Search size={17} />
                        Pesquisar
                    </button>
                </form>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            <DataTable>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Categoria"
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

                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Slug"
                                        field="slug"
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
                                    Descrição
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
                            ) : categories.length ===
                              0 ? (
                                <EmptyCategories />
                            ) : (
                                categories.map(
                                    (
                                        category,
                                    ) => (
                                        <CategoryRow
                                            key={
                                                category.id
                                            }
                                            category={
                                                category
                                            }
                                        />
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading &&
                    pagination.pages >
                        0 && (
                        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    A mostrar{" "}
                                    <span className="font-semibold text-gray-700">
                                        {
                                            categories.length
                                        }
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.total
                                        }
                                    </span>{" "}
                                    categorias
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

function CategoryRow({
    category,
}: {
    category: Category;
}) {
    return (
        <tr className="group border-b border-gray-50 transition hover:bg-[#FAFBF8]">
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <FolderTree size={20} />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2F3B2A]">
                            {category.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            #{category.id}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-5">
                <span className="inline-flex rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-medium text-[#55624A]">
                    /{category.slug}
                </span>
            </td>

            <td className="max-w-md px-6 py-5">
                <p className="truncate text-sm text-gray-500">
                    {category.description ||
                        "Sem descrição"}
                </p>
            </td>

            <td className="px-6 py-5">
                {category.active ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Ativa
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Inativa
                    </span>
                )}
            </td>

            <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/admin/categories/${category.id}/edit`}
                        title="Editar categoria"
                        aria-label="Editar categoria"
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
                        <Pencil size={17} />
                    </Link>
                </div>
            </td>
        </tr>
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
                        length: 5,
                    }).map(
                        (_, cellIndex) => (
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

function EmptyCategories() {
    return (
        <tr>
            <td
                colSpan={5}
                className="px-6 py-20 text-center"
            >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <FolderTree size={27} />
                </div>

                <p className="mt-5 text-lg font-semibold text-[#2F3B2A]">
                    Nenhuma categoria encontrada
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                    Não encontrámos categorias
                    correspondentes aos filtros
                    aplicados.
                </p>
            </td>
        </tr>
    );
}

