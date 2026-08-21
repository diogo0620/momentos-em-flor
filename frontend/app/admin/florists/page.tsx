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
    Eye,
    Flower2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import SearchInput from "@/components/admin/common/SearchInput";
import FilterBar from "@/components/admin/common/FilterBar";
import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";

import {
    getFlorists,
    type GetFloristsParams,
} from "@/lib/api/florists";

import type {
    Florist,
    FloristPagination,
} from "@/types/florist";

export default function AdminFloristsPage() {
    const [florists, setFlorists] =
        useState<Florist[]>([]);

    const [pagination, setPagination] =
        useState<FloristPagination>({
            page: 1,
            pageSize: 20,
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

    /* ---------------------------------------------------------------------- */
    /* LOAD                                                                   */
    /* ---------------------------------------------------------------------- */

    const loadFlorists = useCallback(
        async (
            params: GetFloristsParams = {},
        ) => {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await getFlorists({
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

                setFlorists(
                    response.data,
                );

                setPagination(
                    response.pagination,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as floristas.",
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
        loadFlorists({
            page: 1,
        });
    }, [
        search,
        sort,
        order,
    ]);

    /* ---------------------------------------------------------------------- */
    /* SEARCH                                                                 */
    /* ---------------------------------------------------------------------- */

    function handleSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim(),
        );
    }

    /* ---------------------------------------------------------------------- */
    /* SORT                                                                   */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* PAGINATION                                                             */
    /* ---------------------------------------------------------------------- */

    function goToPage(
        page: number,
    ) {
        if (
            page < 1 ||
            page > pagination.pages
        ) {
            return;
        }

        loadFlorists({
            page,
        });
    }

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <PageHeader
                    title="Floristas"
                    subtitle="Gere a rede de floristas parceiras do Momentos em Flor."
                />

                <Link
                    href="/admin/florists/new"
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
                    Nova florista
                </Link>

            </div>

            {/* ================================================================== */}
            {/* OVERVIEW                                                           */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Flower2 size={23} />
                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Rede de floristas
                            </p>

                            <div className="mt-1 flex items-baseline gap-2">

                                <span className="text-3xl font-bold text-[#2F3B2A]">
                                    {
                                        pagination.total
                                    }
                                </span>

                                <span className="text-sm text-gray-400">
                                    floristas registadas
                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="rounded-2xl bg-[#F5F7F2] px-5 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            A mostrar
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#55624A]">
                            {florists.length} nesta página
                        </p>

                    </div>

                </div>

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
                            Encontre rapidamente uma florista.
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={handleSearch}
                    className="mt-5 flex flex-col gap-3 lg:flex-row"
                >

                    <div className="flex-1">

                        <SearchInput
                            value={
                                searchInput
                            }
                            onChange={
                                setSearchInput
                            }
                            placeholder="Pesquisar por nome, email ou NIF..."
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

                        <option value="deliveryRadiusKm">
                            Ordenar por raio
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
                        <Search size={17} />
                        Pesquisar
                    </button>

                </form>

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
            {/* TABLE                                                              */}
            {/* ================================================================== */}

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">

                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Florista"
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
                                    Contacto
                                </th>

                                <th className="px-6 py-4 font-semibold text-[#2F3B2A]">
                                    Localização
                                </th>

                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Raio"
                                        field="deliveryRadiusKm"
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
                            ) : florists.length ===
                              0 ? (
                                <EmptyFlorists />
                            ) : (
                                florists.map(
                                    (
                                        florist,
                                    ) => (
                                        <FloristRow
                                            key={
                                                florist.id
                                            }
                                            florist={
                                                florist
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
                                            florists.length
                                        }
                                    </span>

                                    {" "}de{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.total
                                        }
                                    </span>

                                    {" "}floristas

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
                                    title="Página anterior"
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
                                        hover:text-[#55624A]
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
                                    title="Página seguinte"
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
                                        hover:text-[#55624A]
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

            </div>

        </div>
    );
}

/* ========================================================================== */
/* FLORIST ROW                                                                */
/* ========================================================================== */

function FloristRow({
    florist,
}: {
    florist: Florist;
}) {
    return (
        <tr
            className="
                group
                border-b
                border-gray-50
                transition
                last:border-0
                hover:bg-[#FAFBF8]
            "
        >

            {/* ================================================================ */}
            {/* FLORIST                                                          */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A] transition group-hover:bg-[#E9EDE3]">
                        <Flower2
                            size={21}
                        />
                    </div>

                    <div className="min-w-0">

                        <p className="truncate font-semibold text-[#2F3B2A]">
                            {
                                florist.name
                            }
                        </p>

                        {florist.legalName && (
                            <p className="mt-1 truncate text-sm text-gray-400">
                                {
                                    florist.legalName
                                }
                            </p>
                        )}

                        <p className="mt-1 text-xs text-gray-400">
                            NIF:{" "}
                            {
                                florist.taxNumber
                            }
                        </p>

                    </div>

                </div>

            </td>

            {/* ================================================================ */}
            {/* CONTACT                                                          */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="space-y-2">

                    <div className="flex items-center gap-2 text-sm text-gray-600">

                        <Mail
                            size={15}
                            className="shrink-0 text-gray-400"
                        />

                        <span className="max-w-[220px] truncate">
                            {
                                florist.email
                            }
                        </span>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">

                        <Phone
                            size={15}
                            className="shrink-0 text-gray-400"
                        />

                        <span>
                            {
                                florist.phone
                            }
                        </span>

                    </div>

                </div>

            </td>

            {/* ================================================================ */}
            {/* LOCATION                                                          */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="flex items-start gap-2">

                    <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <div>

                        <p className="font-medium text-gray-700">
                            {
                                florist
                                    .address
                                    .city
                            }
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            {
                                florist
                                    .address
                                    .postalCode
                            }
                        </p>

                    </div>

                </div>

            </td>

            {/* ================================================================ */}
            {/* RADIUS                                                            */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="inline-flex items-center rounded-xl bg-[#F5F7F2] px-3 py-2">

                    <span className="font-semibold text-[#55624A]">
                        {
                            florist.deliveryRadiusKm
                        }{" "}
                        km
                    </span>

                </div>

            </td>

            {/* ================================================================ */}
            {/* STATUS                                                            */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="space-y-2">

                    <StatusBadge
                        status={
                            florist.active
                                ? "Ativa"
                                : "Inativa"
                        }
                    />

                    <div>

                        <span
                            className={`
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-medium
                                ${
                                    florist.acceptingOrders
                                        ? "bg-[#D6DEC8] text-[#55624A]"
                                        : "bg-gray-100 text-gray-500"
                                }
                            `}
                        >

                            <span
                                className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${
                                        florist.acceptingOrders
                                            ? "bg-[#55624A]"
                                            : "bg-gray-400"
                                    }
                                `}
                            />

                            {florist.acceptingOrders
                                ? "Aceita encomendas"
                                : "Não aceita encomendas"}

                        </span>

                    </div>

                </div>

            </td>

            {/* ================================================================ */}
            {/* ACTIONS                                                           */}
            {/* ================================================================ */}

            <td className="px-6 py-5">

                <div className="flex items-center justify-end gap-2">

                    <Link
                        href={`/admin/florists/${florist.id}`}
                        title="Ver florista"
                        aria-label={`Ver ${florist.name}`}
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
                            text-gray-500
                            transition
                            hover:border-[#D6DEC8]
                            hover:bg-[#F5F7F2]
                            hover:text-[#55624A]
                        "
                    >
                        <Eye
                            size={18}
                        />
                    </Link>

                    <Link
                        href={`/admin/florists/${florist.id}/edit`}
                        title="Editar florista"
                        aria-label={`Editar ${florist.name}`}
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
                            text-gray-500
                            transition
                            hover:border-[#D6DEC8]
                            hover:bg-[#F5F7F2]
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
                className={
                    active
                        ? "text-[#55624A]"
                        : "text-gray-300"
                }
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
/* LOADING                                                                    */
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
/* EMPTY                                                                      */
/* ========================================================================== */

function EmptyFlorists() {
    return (
        <tr>

            <td
                colSpan={6}
                className="px-6 py-20 text-center"
            >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <Flower2
                        size={27}
                    />
                </div>

                <p className="mt-5 text-lg font-semibold text-[#2F3B2A]">
                    Nenhuma florista encontrada
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                    Não encontrámos floristas
                    correspondentes à pesquisa
                    atual.
                </p>

                <Link
                    href="/admin/florists/new"
                    className="
                        mt-6
                        inline-flex
                        items-center
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
                    <Plus size={17} />
                    Adicionar florista
                </Link>

            </td>

        </tr>
    );
}