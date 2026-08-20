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
    /* LOAD FLORISTS                                                          */
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

        setSearch(searchInput);
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
    /* METRICS                                                                */
    /* ---------------------------------------------------------------------- */

    const activeCount =
        florists.filter(
            (florist) =>
                florist.active,
        ).length;

    const acceptingOrdersCount =
        florists.filter(
            (florist) =>
                florist.acceptingOrders,
        ).length;

    const averageRadius =
        florists.length > 0
            ? florists.reduce(
                  (
                      total,
                      florist,
                  ) =>
                      total +
                      florist.deliveryRadiusKm,
                  0,
              ) /
              florists.length
            : 0;

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div>

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <PageHeader
                title="Floristas"
                subtitle="Gestão das floristas parceiras do Momentos em Flor."
            />

            {/* ================================================================== */}
            {/* SEARCH + ACTION                                                    */}
            {/* ================================================================== */}

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">

                    <FilterBar>

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="w-full lg:max-w-md">

                                <SearchInput
                                    value={
                                        searchInput
                                    }
                                    onChange={
                                        setSearchInput
                                    }
                                    placeholder="Pesquisar floristas..."
                                />

                            </div>

                            <div className="flex flex-wrap items-center gap-3">

                                <select
                                    value={
                                        sort
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setSort(
                                            e
                                                .target
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

                                    <option value="deliveryRadiusKm">
                                        Raio de entrega
                                    </option>

                                    <option value="createdAt">
                                        Data de criação
                                    </option>

                                </select>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOrder(
                                            (
                                                current,
                                            ) =>
                                                current ===
                                                "asc"
                                                    ? "desc"
                                                    : "asc",
                                        )
                                    }
                                    title={
                                        order ===
                                        "asc"
                                            ? "Ordenação ascendente"
                                            : "Ordenação descendente"
                                    }
                                    className="
                                        flex
                                        h-[46px]
                                        w-[46px]
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border
                                        border-gray-200
                                        bg-white
                                        text-lg
                                        text-gray-600
                                        transition
                                        hover:bg-[#F5F7F2]
                                        hover:text-[#55624A]
                                    "
                                >
                                    {order ===
                                    "asc"
                                        ? "↑"
                                        : "↓"}
                                </button>

                            </div>

                        </div>

                    </FilterBar>

                </div>

                <Link
                    href="/admin/florists/new"
                    className="
                        inline-flex
                        h-[50px]
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-[#55624A]
                        px-5
                        font-medium
                        text-white
                        transition
                        hover:bg-[#46523C]
                    "
                >
                    <Plus size={18} />
                    Nova florista
                </Link>

            </div>

            {/* ================================================================== */}
            {/* METRICS                                                            */}
            {/* ================================================================== */}

            <div className="mt-8 grid gap-6 md:grid-cols-4">

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Flower2 size={21} />
                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Total
                            </p>

                            <p className="mt-1 text-3xl font-bold text-[#2F3B2A]">
                                {
                                    pagination.total
                                }
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Ativas
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                        {
                            activeCount
                        }
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Na página atual
                    </p>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        A aceitar encomendas
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                        {
                            acceptingOrdersCount
                        }
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Na página atual
                    </p>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Raio médio
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                        {averageRadius.toFixed(
                            1,
                        )}{" "}
                        km
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Na página atual
                    </p>

                </div>

            </div>

            {/* ================================================================== */}
            {/* ERROR                                                              */}
            {/* ================================================================== */}

            {error && (
                <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-600">
                    {error}
                </div>
            )}

            {/* ================================================================== */}
            {/* TABLE                                                              */}
            {/* ================================================================== */}

            <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b border-gray-100 text-left">

                                <th className="px-6 py-5">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSort(
                                                "name",
                                            )
                                        }
                                        className="
                                            font-semibold
                                            text-[#2F3B2A]
                                            transition
                                            hover:text-[#55624A]
                                        "
                                    >
                                        Florista
                                    </button>

                                </th>

                                <th className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                    Contacto
                                </th>

                                <th className="px-6 py-5 font-semibold text-[#2F3B2A]">
                                    Localização
                                </th>

                                <th className="px-6 py-5">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSort(
                                                "deliveryRadiusKm",
                                            )
                                        }
                                        className="
                                            font-semibold
                                            text-[#2F3B2A]
                                            transition
                                            hover:text-[#55624A]
                                        "
                                    >
                                        Raio
                                    </button>

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
                                        A carregar floristas...
                                    </td>

                                </tr>
                            ) : florists.length ===
                              0 ? (
                                <tr>

                                    <td
                                        colSpan={6}
                                        className="px-6 py-16 text-center"
                                    >

                                        <Flower2
                                            size={36}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="mt-4 font-medium text-gray-600">
                                            Nenhuma florista encontrada.
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Tente alterar a pesquisa.
                                        </p>

                                    </td>

                                </tr>
                            ) : (
                                florists.map(
                                    (
                                        florist,
                                    ) => (
                                        <tr
                                            key={
                                                florist.id
                                            }
                                            className="
                                                border-b
                                                border-gray-50
                                                transition
                                                last:border-0
                                                hover:bg-[#FAFBF8]
                                            "
                                        >

                                            {/* ====================================================== */}
                                            {/* FLORIST                                              */}
                                            {/* ====================================================== */}

                                            <td className="px-6 py-5">

                                                <div>

                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        {
                                                            florist.name
                                                        }
                                                    </p>

                                                    {florist.legalName && (
                                                        <p className="mt-1 text-sm text-gray-400">
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

                                            </td>

                                            {/* ====================================================== */}
                                            {/* CONTACT                                               */}
                                            {/* ====================================================== */}

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

                                            {/* ====================================================== */}
                                            {/* LOCATION                                              */}
                                            {/* ====================================================== */}

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

                                            {/* ====================================================== */}
                                            {/* RADIUS                                                */}
                                            {/* ====================================================== */}

                                            <td className="px-6 py-5">

                                                <span className="font-semibold text-[#2F3B2A]">
                                                    {
                                                        florist.deliveryRadiusKm
                                                    }{" "}
                                                    km
                                                </span>

                                            </td>

                                            {/* ====================================================== */}
                                            {/* STATUS                                                */}
                                            {/* ====================================================== */}

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
                                                            {florist.acceptingOrders
                                                                ? "Aceita encomendas"
                                                                : "Não aceita encomendas"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* ====================================================== */}
                                            {/* ACTIONS                                               */}
                                            {/* ====================================================== */}

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

                            <p className="text-sm text-gray-500">

                                Página{" "}

                                <span className="font-semibold text-gray-700">
                                    {
                                        pagination.page
                                    }
                                </span>{" "}

                                de{" "}

                                <span className="font-semibold text-gray-700">
                                    {
                                        pagination.pages
                                    }
                                </span>

                                <span className="ml-2 text-gray-400">

                                    (
                                    {
                                        pagination.total
                                    }{" "}
                                    floristas)

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
                                        transition
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
                                        transition
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