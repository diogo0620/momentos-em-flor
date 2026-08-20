"use client";

import Link from "next/link";

import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Mail,
    Pencil,
    Phone,
    ShieldCheck,
    Store,
    UserCircle,
    Users,
    XCircle,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import PageHeader from "@/components/admin/common/PageHeader";

import { getUser } from "@/lib/api/users";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

type UserData = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role:
        | "SYSTEM_ADMIN"
        | "FLORIST"
        | "CUSTOMER";
    active: boolean;
    emailVerified: boolean;
    florist?: {
        id: number;
        name: string;
    } | null;
    createdAt: string;
    updatedAt: string;
};

function formatDate(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "pt-PT",
        {
            dateStyle: "medium",
            timeStyle: "short",
        },
    ).format(new Date(value));
}

function getRoleLabel(
    role: string,
) {
    switch (role) {
        case "SYSTEM_ADMIN":
            return "Administrador do sistema";

        case "FLORIST":
            return "Administrador de florista";

        case "CUSTOMER":
            return "Cliente";

        default:
            return role;
    }
}

function getRoleIcon(
    role: string,
) {
    switch (role) {
        case "SYSTEM_ADMIN":
            return ShieldCheck;

        case "FLORIST":
            return Store;

        case "CUSTOMER":
            return Users;

        default:
            return UserCircle;
    }
}

function getRoleDescription(
    role: string,
) {
    switch (role) {
        case "SYSTEM_ADMIN":
            return "Utilizador com acesso à administração da plataforma.";

        case "FLORIST":
            return "Utilizador com acesso ao portal da florista.";

        case "CUSTOMER":
            return "Utilizador que pode realizar encomendas na plataforma.";

        default:
            return "Utilizador da plataforma.";
    }
}

export default function UserDetailPage({
    params,
}: Props) {
    const [user, setUser] =
        useState<UserData | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    const [userId, setUserId] =
        useState<number | null>(null);

    /*
     * Resolve o parâmetro da rota no cliente.
     */
    useEffect(() => {
        let cancelled = false;

        async function resolveParams() {
            try {
                const resolved =
                    await params;

                const id =
                    Number(resolved.id);

                if (
                    Number.isNaN(id)
                ) {
                    if (!cancelled) {
                        setError(true);
                        setIsLoading(false);
                    }

                    return;
                }

                if (!cancelled) {
                    setUserId(id);
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        }

        resolveParams();

        return () => {
            cancelled = true;
        };
    }, [params]);

    /*
     * Faz o pedido depois de o componente
     * estar montado no browser.
     *
     * Aqui o apiFetch já consegue utilizar
     * o access token existente no AuthContext.
     */
    useEffect(() => {
        if (userId === null) {
            return;
        }

        let cancelled = false;

        async function loadUser() {
            try {
                setIsLoading(true);
                setError(false);

                const response =
                    await getUser(userId);

                if (!cancelled) {
                    setUser(
                        response.data as UserData,
                    );
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    /* ====================================================================== */
    /* LOADING                                                                */
    /* ====================================================================== */

    if (isLoading) {
        return (
            <div>

                <Link
                    href="/admin/users"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar aos utilizadores
                </Link>

                <div className="mt-8 space-y-6">

                    <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />

                    <div className="grid gap-4 md:grid-cols-3">

                        {Array.from({
                            length: 3,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="h-24 animate-pulse rounded-3xl bg-gray-200"
                            />
                        ))}

                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">

                        <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />

                        <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />

                    </div>

                </div>
            </div>
        );
    }

    /* ====================================================================== */
    /* ERROR                                                                  */
    /* ====================================================================== */

    if (
        error ||
        !user
    ) {
        return (
            <div>

                <Link
                    href="/admin/users"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar aos utilizadores
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <XCircle size={28} />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-[#2F3B2A]">
                        Utilizador não encontrado
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível carregar o
                        utilizador
                        {userId !== null
                            ? ` #${userId}`
                            : "."}
                    </p>

                    <Link
                        href="/admin/users"
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
                            font-medium
                            text-white
                            transition
                            hover:bg-[#46523C]
                        "
                    >
                        <ArrowLeft size={16} />
                        Voltar aos utilizadores
                    </Link>

                </div>
            </div>
        );
    }

    /* ====================================================================== */
    /* DATA                                                                   */
    /* ====================================================================== */

    const RoleIcon =
        getRoleIcon(user.role);

    const roleLabel =
        getRoleLabel(user.role);

    const roleDescription =
        getRoleDescription(
            user.role,
        );

    /* ====================================================================== */
    /* PAGE                                                                   */
    /* ====================================================================== */

    return (
        <div>

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div>

                    <Link
                        href="/admin/users"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                            transition
                            hover:text-[#55624A]
                        "
                    >
                        <ArrowLeft size={16} />
                        Voltar aos utilizadores
                    </Link>

                    <div className="mt-6">

                        <PageHeader
                            title={`${user.firstName} ${user.lastName}`}
                            subtitle="Detalhes do utilizador"
                        />

                    </div>

                </div>

                <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="
                        inline-flex
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-[#55624A]
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#46523C]
                    "
                >
                    <Pencil size={17} />
                    Editar utilizador
                </Link>

            </div>

            {/* ================================================================== */}
            {/* STATUS                                                             */}
            {/* ================================================================== */}

            <div className="mt-8 grid gap-4 md:grid-cols-3">

                {/* ROLE */}

                <div className="flex items-center gap-4 rounded-3xl border border-[#D6DEC8] bg-[#F5F7F2] p-5">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#55624A]">
                        <RoleIcon size={23} />
                    </div>

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Tipo de utilizador
                        </p>

                        <p className="mt-1 font-semibold text-[#2F3B2A]">
                            {roleLabel}
                        </p>

                    </div>

                </div>

                {/* ACTIVE */}

                <div
                    className={`
                        flex
                        items-center
                        gap-4
                        rounded-3xl
                        border
                        p-5
                        ${
                            user.active
                                ? "border-green-100 bg-green-50"
                                : "border-red-100 bg-red-50"
                        }
                    `}
                >

                    {user.active ? (
                        <CheckCircle2
                            size={24}
                            className="text-green-600"
                        />
                    ) : (
                        <XCircle
                            size={24}
                            className="text-red-500"
                        />
                    )}

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Estado
                        </p>

                        <p
                            className={`
                                mt-1
                                font-semibold
                                ${
                                    user.active
                                        ? "text-green-700"
                                        : "text-red-600"
                                }
                            `}
                        >
                            {user.active
                                ? "Ativo"
                                : "Inativo"}
                        </p>

                    </div>

                </div>

                {/* EMAIL */}

                <div
                    className={`
                        flex
                        items-center
                        gap-4
                        rounded-3xl
                        border
                        p-5
                        ${
                            user.emailVerified
                                ? "border-green-100 bg-green-50"
                                : "border-amber-100 bg-amber-50"
                        }
                    `}
                >

                    {user.emailVerified ? (
                        <CheckCircle2
                            size={24}
                            className="text-green-600"
                        />
                    ) : (
                        <Mail
                            size={24}
                            className="text-amber-600"
                        />
                    )}

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Email
                        </p>

                        <p
                            className={`
                                mt-1
                                font-semibold
                                ${
                                    user.emailVerified
                                        ? "text-green-700"
                                        : "text-amber-700"
                                }
                            `}
                        >
                            {user.emailVerified
                                ? "Verificado"
                                : "Não verificado"}
                        </p>

                    </div>

                </div>

            </div>

            {/* ================================================================== */}
            {/* MAIN INFORMATION                                                  */}
            {/* ================================================================== */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

                {/* PERSONAL DATA */}

                <section className="rounded-3xl bg-white p-8 shadow-sm">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <UserCircle size={23} />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Dados pessoais
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Informação de contacto do utilizador.
                            </p>

                        </div>

                    </div>

                    <div className="space-y-6">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Nome completo
                            </p>

                            <p className="mt-1 text-lg font-semibold text-gray-800">
                                {user.firstName}{" "}
                                {user.lastName}
                            </p>

                        </div>

                        <div className="flex items-start gap-3">

                            <Mail
                                size={18}
                                className="mt-0.5 text-[#55624A]"
                            />

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Email
                                </p>

                                <a
                                    href={`mailto:${user.email}`}
                                    className="
                                        mt-1
                                        block
                                        font-medium
                                        text-gray-800
                                        transition
                                        hover:text-[#55624A]
                                    "
                                >
                                    {user.email}
                                </a>

                            </div>

                        </div>

                        {user.phone && (
                            <div className="flex items-start gap-3">

                                <Phone
                                    size={18}
                                    className="mt-0.5 text-[#55624A]"
                                />

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Telefone
                                    </p>

                                    <a
                                        href={`tel:${user.phone}`}
                                        className="
                                            mt-1
                                            block
                                            font-medium
                                            text-gray-800
                                            transition
                                            hover:text-[#55624A]
                                        "
                                    >
                                        {user.phone}
                                    </a>

                                </div>

                            </div>
                        )}

                        {user.avatarUrl && (
                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Avatar
                                </p>

                                <a
                                    href={
                                        user.avatarUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        mt-1
                                        inline-flex
                                        items-center
                                        gap-2
                                        font-medium
                                        text-[#55624A]
                                        hover:underline
                                    "
                                >
                                    Ver imagem
                                    <ExternalLink
                                        size={14}
                                    />
                                </a>

                            </div>
                        )}

                    </div>

                </section>

                {/* ACCOUNT */}

                <section className="rounded-3xl bg-white p-8 shadow-sm">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <ShieldCheck size={23} />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Conta e permissões
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Estado e nível de acesso.
                            </p>

                        </div>

                    </div>

                    <div className="space-y-5">

                        <div className="rounded-2xl bg-[#FAFBF8] p-5">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Perfil
                            </p>

                            <p className="mt-1 font-semibold text-[#2F3B2A]">
                                {roleLabel}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                {roleDescription}
                            </p>

                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-5">

                            <div>

                                <p className="font-medium text-gray-700">
                                    Conta
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Estado atual da conta
                                </p>

                            </div>

                            <span
                                className={`
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    ${
                                        user.active
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-600"
                                    }
                                `}
                            >
                                {user.active
                                    ? "Ativo"
                                    : "Inativo"}
                            </span>

                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-5">

                            <div>

                                <p className="font-medium text-gray-700">
                                    Email
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Confirmação do endereço de email
                                </p>

                            </div>

                            <span
                                className={`
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    ${
                                        user.emailVerified
                                            ? "bg-green-50 text-green-700"
                                            : "bg-amber-50 text-amber-700"
                                    }
                                `}
                            >
                                {user.emailVerified
                                    ? "Verificado"
                                    : "Não verificado"}
                            </span>

                        </div>

                    </div>

                </section>

            </div>

            {/* ================================================================== */}
            {/* FLORIST                                                           */}
            {/* ================================================================== */}

            {user.role === "FLORIST" &&
                user.florist && (
                    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                    <Store size={24} />
                                </div>

                                <div>

                                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                                        Florista associada
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Este utilizador tem acesso ao portal desta florista.
                                    </p>

                                </div>

                            </div>

                            <Link
                                href={`/admin/florists/${user.florist.id}`}
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[#F3F5EE]
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-[#55624A]
                                    transition
                                    hover:bg-[#D6DEC8]
                                "
                            >
                                Ver florista
                                <ExternalLink
                                    size={15}
                                />
                            </Link>

                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-100 bg-[#FAFBF8] p-5">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Florista
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#2F3B2A]">
                                {user.florist.name}
                            </p>

                        </div>

                    </section>
                )}

            {/* ================================================================== */}
            {/* DATES                                                             */}
            {/* ================================================================== */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Conta criada
                    </p>

                    <p className="mt-1 text-gray-700">
                        {formatDate(
                            user.createdAt,
                        )}
                    </p>

                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Última atualização
                    </p>

                    <p className="mt-1 text-gray-700">
                        {formatDate(
                            user.updatedAt,
                        )}
                    </p>

                </div>

            </div>

        </div>
    );
}