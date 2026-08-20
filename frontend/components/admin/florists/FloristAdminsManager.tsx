"use client";

import Link from "next/link";
import { useState } from "react";

import {
    ExternalLink,
    Mail,
    Plus,
    ShieldCheck,
    UserCircle,
} from "lucide-react";

import { createUser } from "@/lib/api/users";

type FloristAdmin = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    active: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    floristId: number;
    admins: FloristAdmin[];
};

export default function FloristAdminsManager({
    floristId,
    admins,
}: Props) {
    const [showCreate, setShowCreate] =
        useState(false);

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [isCreating, setIsCreating] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleCreate(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (!firstName.trim()) {
            setError(
                "O nome é obrigatório.",
            );
            return;
        }

        if (!lastName.trim()) {
            setError(
                "O apelido é obrigatório.",
            );
            return;
        }

        if (!email.trim()) {
            setError(
                "O email é obrigatório.",
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "A password deve ter pelo menos 8 caracteres.",
            );
            return;
        }

        try {
            setIsCreating(true);

            await createUser({
                firstName:
                    firstName.trim(),

                lastName:
                    lastName.trim(),

                email:
                    email.trim(),

                password,

                phone:
                    phone.trim() ||
                    undefined,

                role: "FLORIST",

                floristId,
            });

            window.location.reload();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar o administrador.",
            );
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <section className="rounded-3xl bg-white shadow-sm">

            {/* ============================================================= */}
            {/* HEADER                                                        */}
            {/* ============================================================= */}

            <div className="flex flex-col gap-5 border-b border-gray-100 p-8 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <UserCircle size={23} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Administradores
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Gere os utilizadores que têm acesso
                            ao portal desta florista.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={() => {
                        setShowCreate(
                            (current) =>
                                !current,
                        );

                        setError(null);
                    }}
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
                        transition
                        hover:bg-[#46523C]
                    "
                >
                    <Plus size={17} />

                    Novo administrador
                </button>

            </div>

            {/* ============================================================= */}
            {/* CREATE FORM                                                    */}
            {/* ============================================================= */}

            {showCreate && (
                <div className="border-b border-gray-100 p-8">

                    <form
                        onSubmit={handleCreate}
                        className="rounded-2xl border border-[#D6DEC8] bg-[#FAFBF8] p-6"
                    >
                        <h3 className="font-semibold text-[#2F3B2A]">
                            Novo administrador
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Cria um utilizador com acesso ao
                            portal desta florista.
                        </p>

                        {error && (
                            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <Field
                                label="Nome"
                                value={firstName}
                                onChange={setFirstName}
                                required
                            />

                            <Field
                                label="Apelido"
                                value={lastName}
                                onChange={setLastName}
                                required
                            />

                            <Field
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                required
                            />

                            <Field
                                label="Telefone"
                                value={phone}
                                onChange={setPhone}
                            />

                            <Field
                                label="Password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                required
                            />

                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreate(
                                        false,
                                    )
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-600
                                    hover:bg-white
                                "
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="
                                    rounded-xl
                                    bg-[#55624A]
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-white
                                    disabled:opacity-50
                                "
                            >
                                {isCreating
                                    ? "A criar..."
                                    : "Criar administrador"}
                            </button>

                        </div>
                    </form>

                </div>
            )}

            {/* ============================================================= */}
            {/* ADMINS                                                        */}
            {/* ============================================================= */}

            <div className="p-8">

                {admins.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">

                        <UserCircle
                            size={36}
                            className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 font-medium text-gray-600">
                            Ainda não existem administradores.
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            Cria o primeiro administrador
                            através do botão acima.
                        </p>

                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">

                        {admins.map(
                            (admin) => (
                                <div
                                    key={admin.id}
                                    className="
                                        flex
                                        items-center
                                        gap-4
                                        rounded-2xl
                                        border
                                        border-gray-100
                                        bg-[#FAFBF8]
                                        p-5
                                        transition
                                        hover:border-[#D6DEC8]
                                        hover:shadow-sm
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#D6DEC8]
                                            text-[#55624A]
                                        "
                                    >
                                        <UserCircle
                                            size={26}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <p className="font-semibold text-[#2F3B2A]">
                                                {
                                                    admin.firstName
                                                }{" "}
                                                {
                                                    admin.lastName
                                                }
                                            </p>

                                            <span
                                                className={`
                                                    rounded-full
                                                    px-2
                                                    py-0.5
                                                    text-[11px]
                                                    font-medium
                                                    ${
                                                        admin.active
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }
                                                `}
                                            >
                                                {admin.active
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </span>

                                        </div>

                                        <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-gray-500">

                                            <Mail
                                                size={15}
                                                className="shrink-0"
                                            />

                                            <span className="truncate">
                                                {
                                                    admin.email
                                                }
                                            </span>

                                        </div>

                                    </div>

                                    {/* ABRIR ADMIN */}

                                    <Link
                                        href={`/admin/users/${admin.id}`}
                                        title="Abrir administrador"
                                        aria-label={`Abrir administrador ${admin.firstName} ${admin.lastName}`}
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-white
                                            text-[#55624A]
                                            shadow-sm
                                            transition
                                            hover:bg-[#F3F5EE]
                                            hover:text-[#2F3B2A]
                                        "
                                    >
                                        <ExternalLink
                                            size={17}
                                        />
                                    </Link>

                                </div>
                            ),
                        )}

                    </div>
                )}

            </div>

        </section>
    );
}

/* ========================================================================== */
/* FIELD                                                                      */
/* ========================================================================== */

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
};

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: FieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                required={required}
                className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    outline-none
                    focus:border-[#55624A]
                "
            />
        </div>
    );
}