"use client";

import Link from "next/link";

import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
    Phone,
    Search,
    SlidersHorizontal,
    UserRound,
    UserRoundCheck,
    UserRoundX,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import PageHeader from "@/components/admin/common/PageHeader";

import { apiFetch } from "@/lib/api/client";

import type { User } from "@/types/user";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type SortOrder =
    | "asc"
    | "desc";

type UsersResponse = {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        pages: number;
    };
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatDate(
    value?: string | Date | null,
) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(
        new Date(value),
    );
}

function formatLastLogin(
    value?: string | Date | null,
) {
    if (!value) {
        return "Nunca iniciou sessão";
    }

    const date =
        new Date(value);

    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(date);
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function AdminCustomersPage() {
    const [users, setUsers] =
        useState<User[]>([]);

    const [pagination, setPagination] =
        useState({
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
        useState("firstName");

    const [order, setOrder] =
        useState<SortOrder>("asc");

    const [statusFilter, setStatusFilter] =
        useState<
            "all" | "active" | "inactive"
        >("all");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    /* ====================================================================== */
    /* LOAD                                                                   */
    /* ====================================================================== */

    const loadUsers = useCallback(
        async (
            page = 1,
        ) => {
            try {
                setIsLoading(true);
                setError(null);

                const params =
                    new URLSearchParams();

                params.set(
                    "page",
                    page.toString(),
                );

                params.set(
                    "pageSize",
                    pagination.pageSize.toString(),
                );

                if (search) {
                    params.set(
                        "search",
                        search,
                    );
                }

                params.set(
                    "sort",
                    sort,
                );

                params.set(
                    "order",
                    order,
                );

                const response =
                    await apiFetch<UsersResponse>(
                        `/users?${params.toString()}`,
                    );

                setUsers(
                    response.data,
                );

                setPagination(
                    response.pagination,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar os clientes.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [
            pagination.pageSize,
            search,
            sort,
            order,
        ],
    );

    useEffect(() => {
        loadUsers(1);
    }, [
        search,
        sort,
        order,
    ]);

    /* ====================================================================== */
    /* CUSTOMERS                                                              */
    /* ====================================================================== */

    const customers =
        useMemo(
            () =>
                users.filter(
                    (user) =>
                        user.role ===
                        "CUSTOMER",
                ),
            [users],
        );

    const filteredCustomers =
        useMemo(() => {
            if (
                statusFilter ===
                "active"
            ) {
                return customers.filter(
                    (user) =>
                        user.active,
                );
            }

            if (
                statusFilter ===
                "inactive"
            ) {
                return customers.filter(
                    (user) =>
                        !user.active,
                );
            }

            return customers;
        }, [
            customers,
            statusFilter,
        ]);

    const activeCustomers =
        customers.filter(
            (user) =>
                user.active,
        ).length;

    const inactiveCustomers =
        customers.length -
        activeCustomers;

    /* ====================================================================== */
    /* SEARCH                                                                 */
    /* ====================================================================== */

    function handleSubmit(
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

            return;
        }

        setSort(field);
        setOrder("asc");
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

        loadUsers(page);
    }

    /* ====================================================================== */
    /* RENDER                                                                 */
    /* ====================================================================== */

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <PageHeader
                title="Clientes"
                subtitle="Consulte e acompanhe os clientes registados na plataforma."
            />

            {/* ================================================================== */}
            {/* OVERVIEW                                                           */}
            {/* ================================================================== */}

            <div className="grid gap-5 md:grid-cols-3">

                <OverviewCard
                    icon={UserRound}
                    label="Total de clientes"
                    value={
                        customers.length
                    }
                    description="Na página atual"
                />

                <OverviewCard
                    icon={
                        UserRoundCheck
                    }
                    label="Contas ativas"
                    value={
                        activeCustomers
                    }
                    description="Na página atual"
                    valueClassName="text-green-700"
                />

                <OverviewCard
                    icon={
                        UserRoundX
                    }
                    label="Contas inativas"
                    value={
                        inactiveCustomers
                    }
                    description="Na página atual"
                    valueClassName="text-gray-500"
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
                            Pesquisar e filtrar
                        </h2>

                        <p className="text-xs text-gray-400">
                            Encontre rapidamente um cliente.
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="mt-5 flex flex-col gap-3 lg:flex-row"
                >

                    <div className="flex-1">

                        <div className="relative">

                            <Search
                                size={17}
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                value={
                                    searchInput
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearchInput(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Pesquisar por nome ou email..."
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-white
                                    py-3
                                    pl-11
                                    pr-4
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#55624A]
                                    focus:ring-4
                                    focus:ring-[#55624A]/10
                                "
                            />

                        </div>

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setStatusFilter(
                                event.target
                                    .value as
                                    | "all"
                                    | "active"
                                    | "inactive",
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
                        <option value="all">
                            Todos os estados
                        </option>

                        <option value="active">
                            Ativos
                        </option>

                        <option value="inactive">
                            Inativos
                        </option>
                    </select>

                    <select
                        value={sort}
                        onChange={(
                            event,
                        ) =>
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
                        <option value="firstName">
                            Ordenar por nome
                        </option>

                        <option value="email">
                            Ordenar por email
                        </option>

                        <option value="createdAt">
                            Mais recentes
                        </option>

                        <option value="lastLoginAt">
                            Último acesso
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

                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                    <div>

                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Lista de clientes
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {filteredCustomers.length}{" "}
                            cliente
                            {filteredCustomers.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            nesta página
                        </p>

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">

                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Cliente"
                                        field="firstName"
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
                                    Estado
                                </th>

                                <th className="px-6 py-4 font-semibold text-[#2F3B2A]">
                                    Email
                                </th>

                                <th className="px-6 py-4">
                                    <SortButton
                                        label="Último acesso"
                                        field="lastLoginAt"
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
                                        label="Registado em"
                                        field="createdAt"
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

                                <th className="px-6 py-4 text-right font-semibold text-[#2F3B2A]">
                                    Ações
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {isLoading ? (
                                <LoadingRows />
                            ) : filteredCustomers.length ===
                              0 ? (
                                <EmptyCustomers />
                            ) : (
                                filteredCustomers.map(
                                    (
                                        customer,
                                    ) => (
                                        <CustomerRow
                                            key={
                                                customer.id
                                            }
                                            customer={
                                                customer
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
                                            filteredCustomers.length
                                        }
                                    </span>

                                    {" "}de{" "}

                                    <span className="font-semibold text-gray-700">
                                        {
                                            pagination.total
                                        }
                                    </span>

                                    {" "}utilizadores

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

            </div>

        </div>
    );
}

/* ========================================================================== */
/* CUSTOMER ROW                                                               */
/* ========================================================================== */

function CustomerRow({
    customer,
}: {
    customer: User;
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

            {/* CUSTOMER */}

            <td className="px-6 py-5">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A] transition group-hover:bg-[#E9EDE3]">
                        <UserRound
                            size={21}
                        />
                    </div>

                    <div className="min-w-0">

                        <p className="truncate font-semibold text-[#2F3B2A]">
                            {
                                customer.firstName
                            }{" "}
                            {
                                customer.lastName
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            ID #{customer.id}
                        </p>

                    </div>

                </div>

            </td>

            {/* CONTACT */}

            <td className="px-6 py-5">

                <div className="space-y-2">

                    <div className="flex items-center gap-2 text-sm text-gray-600">

                        <Mail
                            size={15}
                            className="shrink-0 text-gray-400"
                        />

                        <span className="max-w-[220px] truncate">
                            {
                                customer.email
                            }
                        </span>

                    </div>

                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">

                            <Phone
                                size={15}
                                className="shrink-0 text-gray-400"
                            />

                            <span>
                                {
                                    customer.phone
                                }
                            </span>

                        </div>
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
                        ${
                            customer.active
                                ? "border-green-100 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-100 text-gray-600"
                        }
                    `}
                >

                    <span
                        className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${
                                customer.active
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                            }
                        `}
                    />

                    {customer.active
                        ? "Ativo"
                        : "Inativo"}

                </span>

            </td>

            {/* EMAIL VERIFIED */}

            <td className="px-6 py-5">

                {customer.emailVerified ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">

                        <CheckCircle2
                            size={16}
                        />

                        Verificado

                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-400">

                        <XCircle
                            size={16}
                        />

                        Não verificado

                    </span>
                )}

            </td>

            {/* LAST LOGIN */}

            <td className="px-6 py-5">

                <span className="text-sm text-gray-600">
                    {formatLastLogin(
                        customer.lastLoginAt,
                    )}
                </span>

            </td>

            {/* CREATED */}

            <td className="px-6 py-5">

                <span className="text-sm text-gray-600">
                    {formatDate(
                        customer.createdAt,
                    )}
                </span>

            </td>

            {/* ACTION */}

            <td className="px-6 py-5">

                <div className="flex justify-end">

                    <Link
                        href={`/admin/users/${customer.id}`}
                        title="Ver cliente"
                        aria-label={`Ver ${customer.firstName} ${customer.lastName}`}
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
    onSort: (
        field: string,
    ) => void;
}) {
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
/* OVERVIEW CARD                                                              */
/* ========================================================================== */

function OverviewCard({
    icon: Icon,
    label,
    value,
    description,
    valueClassName = "text-[#2F3B2A]",
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    description: string;
    valueClassName?: string;
}) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                    <Icon size={21} />
                </div>

                <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {label}
                    </p>

                    <p
                        className={`
                            mt-1
                            text-2xl
                            font-bold
                            ${valueClassName}
                        `}
                    >
                        {value}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                        {description}
                    </p>

                </div>

            </div>

        </div>
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
                        length: 7,
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

function EmptyCustomers() {
    return (
        <tr>

            <td
                colSpan={7}
                className="px-6 py-20 text-center"
            >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <UserRound
                        size={27}
                    />
                </div>

                <p className="mt-5 text-lg font-semibold text-[#2F3B2A]">
                    Nenhum cliente encontrado
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                    Não encontrámos clientes
                    correspondentes aos filtros
                    aplicados.
                </p>

            </td>

        </tr>
    );
}