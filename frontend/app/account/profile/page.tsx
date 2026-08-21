"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    CheckCircle2,
    Mail,
    Phone,
    Save,
    UserRound,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import {
    updateMyProfile,
} from "@/lib/api/users";
import { useAuth } from "@/lib/auth/AuthProvider";




export default function AccountProfilePage() {
    const {
        user,
        updateUser,
    } = useAuth();

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [isSaving, setIsSaving] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    /* ====================================================================== */
    /* LOAD USER                                                               */
    /* ====================================================================== */

    useEffect(() => {
        if (!user) {
            return;
        }

        setFirstName(
            user.firstName ?? "",
        );

        setLastName(
            user.lastName ?? "",
        );

        setPhone(
            user.phone ?? "",
        );
    }, [user]);

    /* ====================================================================== */
    /* SAVE                                                                    */
    /* ====================================================================== */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setSuccessMessage(null);
        setErrorMessage(null);

        const trimmedFirstName =
            firstName.trim();

        const trimmedLastName =
            lastName.trim();

        const trimmedPhone =
            phone.trim();

        if (!trimmedFirstName) {
            setErrorMessage(
                "O nome é obrigatório.",
            );

            return;
        }

        if (!trimmedLastName) {
            setErrorMessage(
                "O apelido é obrigatório.",
            );

            return;
        }

        try {
            setIsSaving(true);

            const response =
                await updateMyProfile({
                    firstName:
                        trimmedFirstName,

                    lastName:
                        trimmedLastName,

                    phone:
                        trimmedPhone ||
                        undefined,
                });

            /*
             * Atualiza o utilizador no AuthContext.
             *
             * Desta forma, qualquer componente que utilize
             * useAuth() passa imediatamente a ter os dados
             * atualizados.
             */
            updateUser(
                response.data,
            );

            setSuccessMessage(
                "Os seus dados foram atualizados com sucesso.",
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar os seus dados.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    /* ====================================================================== */
    /* LOADING / NO USER                                                       */
    /* ====================================================================== */

    if (!user) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                    <UserRound
                        size={26}
                    />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#2F3B2A]">
                    Perfil
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Não foi possível carregar os seus dados.
                </p>

            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <PageHeader
                title="Perfil"
                subtitle="Consulte e atualize os seus dados pessoais."
            />

            {/* ================================================================== */}
            {/* PROFILE SUMMARY                                                    */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-center gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D6DEC8] text-[#55624A]">
                        <UserRound
                            size={28}
                        />
                    </div>

                    <div className="min-w-0">

                        <h2 className="truncate text-xl font-bold text-[#2F3B2A]">
                            {user.firstName}{" "}
                            {user.lastName}
                        </h2>

                        <p className="mt-1 truncate text-sm text-gray-500">
                            {user.email}
                        </p>

                    </div>

                </div>

            </div>

            {/* ================================================================== */}
            {/* PERSONAL DATA                                                      */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">
                        <UserRound
                            size={20}
                        />
                    </div>

                    <div>

                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Dados pessoais
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Mantenha os seus dados atualizados.
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="mt-8 space-y-6"
                >

                    {/* ========================================================== */}
                    {/* NAME                                                         */}
                    {/* ========================================================== */}

                    <div className="grid gap-6 sm:grid-cols-2">

                        <FormField
                            label="Nome"
                            required
                        >
                            <input
                                type="text"
                                value={
                                    firstName
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setFirstName(
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    isSaving
                                }
                                autoComplete="given-name"
                                className={inputClassName}
                            />
                        </FormField>

                        <FormField
                            label="Apelido"
                            required
                        >
                            <input
                                type="text"
                                value={
                                    lastName
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setLastName(
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    isSaving
                                }
                                autoComplete="family-name"
                                className={inputClassName}
                            />
                        </FormField>

                    </div>

                    {/* ========================================================== */}
                    {/* EMAIL                                                        */}
                    {/* ========================================================== */}

                    <FormField
                        label="Email"
                        description="O email da conta não pode ser alterado nesta página."
                    >

                        <div className="relative">

                            <Mail
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
                                type="email"
                                value={
                                    user.email
                                }
                                readOnly
                                disabled
                                className="
                                    w-full
                                    cursor-not-allowed
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    py-3
                                    pl-11
                                    pr-4
                                    text-sm
                                    text-gray-500
                                    outline-none
                                "
                            />

                        </div>

                    </FormField>

                    {/* ========================================================== */}
                    {/* PHONE                                                        */}
                    {/* ========================================================== */}

                    <FormField
                        label="Telefone"
                        description="Pode ser utilizado para contactos relacionados com as suas encomendas."
                    >

                        <div className="relative">

                            <Phone
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
                                type="tel"
                                value={
                                    phone
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setPhone(
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    isSaving
                                }
                                autoComplete="tel"
                                placeholder="+351 912 345 678"
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
                                    placeholder:text-gray-300
                                    focus:border-[#55624A]
                                    focus:ring-4
                                    focus:ring-[#55624A]/10
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-50
                                "
                            />

                        </div>

                    </FormField>

                    {/* ========================================================== */}
                    {/* FEEDBACK                                                     */}
                    {/* ========================================================== */}

                    {successMessage && (
                        <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">

                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-green-600"
                            />

                            <div>

                                <p className="text-sm font-semibold text-green-700">
                                    Alterações guardadas
                                </p>

                                <p className="mt-0.5 text-sm text-green-600">
                                    {
                                        successMessage
                                    }
                                </p>

                            </div>

                        </div>
                    )}

                    {errorMessage && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">

                            <p className="text-sm font-semibold text-red-700">
                                Não foi possível guardar
                            </p>

                            <p className="mt-0.5 text-sm text-red-600">
                                {
                                    errorMessage
                                }
                            </p>

                        </div>
                    )}

                    {/* ========================================================== */}
                    {/* ACTIONS                                                      */}
                    {/* ========================================================== */}

                    <div className="flex justify-end border-t border-gray-100 pt-6">

                        <button
                            type="submit"
                            disabled={
                                isSaving
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#46523C]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <Save
                                size={17}
                            />

                            {isSaving
                                ? "A guardar..."
                                : "Guardar alterações"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

/* ========================================================================== */
/* FORM FIELD                                                                 */
/* ========================================================================== */

function FormField({
    label,
    description,
    required = false,
    children,
}: {
    label: string;
    description?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>

            <label className="block text-sm font-semibold text-[#2F3B2A]">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {description && (
                <p className="mt-1 text-xs text-gray-400">
                    {description}
                </p>
            )}

            <div className="mt-2">
                {children}
            </div>

        </div>
    );
}

/* ========================================================================== */
/* INPUT                                                                      */
/* ========================================================================== */

const inputClassName = `
    w-full
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
    placeholder:text-gray-300
    focus:border-[#55624A]
    focus:ring-4
    focus:ring-[#55624A]/10
    disabled:cursor-not-allowed
    disabled:bg-gray-50
`;