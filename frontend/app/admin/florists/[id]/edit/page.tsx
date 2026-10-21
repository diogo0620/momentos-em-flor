"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Store,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";

import { adminFloristsApi } from "@/lib/api/florists/admin-florists";
import { adminUsersApi } from "@/lib/api/users/admin-users";

import FloristForm from "@/components/admin/florists/FloristForm";

import type { AdminFloristDetail } from "@/types/florists/admin/admin-florist-detail";
import type { AdminCreateUser } from "@/types/users/admin/admin-create-user";

const inputClassName =
    "w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5EE]";

const labelClassName = "mb-2 block text-sm font-medium text-[#374132]";

function generatePassword(length = 14): string {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    const values = new Uint32Array(length);

    crypto.getRandomValues(values);

    return Array.from(values)
        .map((value) => chars[value % chars.length])
        .join("");
}

export default function EditFloristPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = Number(params.id);

    const [florist, setFlorist] = useState<AdminFloristDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState(() => generatePassword());
    const [showPassword, setShowPassword] = useState(false);

    const loadFlorist = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("O ID da florista é inválido.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await adminFloristsApi.getById(id);

            if (response) {
                setFlorist(response);
            } else {
                setError("Não foi possível encontrar esta florista.");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a florista.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadFlorist();
    }, [loadFlorist]);

    function openCreateAdmin() {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setPassword(generatePassword());
        setShowPassword(false);
        setError(null);
        setSuccess(null);
        setShowCreateAdmin(true);
    }

    async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!florist || creatingAdmin) return;

        setError(null);
        setSuccess(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError("O nome e o apelido são obrigatórios.");
            return;
        }

        if (!email.trim()) {
            setError("O email é obrigatório.");
            return;
        }

        if (password.length < 8) {
            setError("A password deve ter pelo menos 8 caracteres.");
            return;
        }

        setCreatingAdmin(true);

        try {
            const data: AdminCreateUser = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
                role: "FLORIST",
                active: true,
                floristId: florist.id,
            };

            await adminUsersApi.create(data);

            const updatedFlorist = await adminFloristsApi.getById(florist.id);

            setFlorist(updatedFlorist);
            setShowCreateAdmin(false);
            setSuccess("Administrador criado com sucesso.");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar o administrador.",
            );
        } finally {
            setCreatingAdmin(false);
        }
    }

    async function handleDelete() {
        if (!florist || deleting) return;

        setDeleting(true);
        setError(null);

        try {
            await adminFloristsApi.delete(florist.id);
            router.push("/admin/florists");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível eliminar a florista.",
            );
            setShowDeleteConfirmation(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="mx-auto w-full max-w-5xl space-y-8 pb-10">
                <div>
                    <Link
                        href="/admin/florists"
                        className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                    >
                        <ArrowLeft size={16} />
                        Voltar às floristas
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                <Store size={23} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                                    Editar florista
                                </h1>
                                <p className="mt-1 text-sm text-[#7A8474]">
                                    Gere os dados da florista e os utilizadores
                                    com acesso ao seu portal.
                                </p>
                            </div>
                        </div>

                        {florist && !loading && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(true)}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 size={16} />
                                Eliminar florista
                            </button>
                        )}
                    </div>
                </div>

                {error && !showCreateAdmin && !showDeleteConfirmation && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1">
                            <p className="font-medium">Ocorreu um problema</p>
                            <p className="mt-1">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            aria-label="Fechar alerta"
                            className="rounded-lg p-1 transition hover:bg-red-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <p className="flex-1">{success}</p>
                        <button
                            type="button"
                            onClick={() => setSuccess(null)}
                            aria-label="Fechar mensagem"
                            className="rounded-lg p-1 transition hover:bg-green-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                        A carregar florista...
                    </div>
                ) : florist ? (
                    <>
                        <FloristForm florist={florist}>
                            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-7">
                                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                        Administradores
                                    </h2>
                                    <p className="mt-1 text-sm text-[#7A8474]">
                                        Gere os utilizadores que têm acesso ao portal de{" "}
                                        {florist.name}.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#2F3B2A]">
                                                Utilizadores associados
                                            </h3>
                                            <p className="mt-1 text-sm text-[#7A8474]">
                                                {florist.admins.length === 1
                                                    ? "1 administrador associado"
                                                    : `${florist.admins.length} administradores associados`}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openCreateAdmin}
                                            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#435039]"
                                        >
                                            <UserPlus size={17} />
                                            Novo administrador
                                        </button>
                                    </div>

                                    <div className="mt-6 border-t border-[#EEF0EA] pt-6">
                                        {florist.admins.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-[#DDE2D7] bg-[#FAFBF8] px-6 py-8 text-center">
                                                <UserPlus
                                                    size={24}
                                                    className="mx-auto text-[#7A8474]"
                                                />
                                                <p className="mt-3 font-medium text-[#2F3B2A]">
                                                    Ainda não existem administradores
                                                </p>
                                                <p className="mt-1 text-sm text-[#7A8474]">
                                                    Cria um administrador para dar acesso ao portal desta florista.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {florist.admins.map((admin) => (
                                                    <div
                                                        key={admin.id}
                                                        className="flex items-center gap-4 rounded-2xl border border-[#E8EBE4] p-4 transition hover:border-[#D6DEC8] hover:bg-[#FAFBF8]"
                                                    >
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D6DEC8] text-sm font-bold text-[#55624A]">
                                                            {admin.firstName.charAt(0).toUpperCase()}
                                                            {admin.lastName.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-semibold text-[#2F3B2A]">
                                                                    {admin.firstName} {admin.lastName}
                                                                </p>

                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                                        admin.active
                                                                            ? "bg-green-50 text-green-700"
                                                                            : "bg-gray-100 text-gray-500"
                                                                    }`}
                                                                >
                                                                    {admin.active ? "Ativo" : "Inativo"}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 truncate text-sm text-[#7A8474]">
                                                                {admin.email}
                                                            </p>
                                                        </div>

                                                        <Link
                                                            href={`/admin/users/${admin.id}/edit`}
                                                            title="Editar administrador"
                                                            aria-label={`Editar administrador ${admin.firstName} ${admin.lastName}`}
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E6DD] bg-white text-[#55624A] transition hover:bg-[#F3F5EE]"
                                                        >
                                                            <ExternalLink size={17} />
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </FloristForm>
                    </>
                ) : (
                    !error && (
                        <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                            Florista não encontrada.
                        </div>
                    )
                )}
            </div>

            {showCreateAdmin && florist && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !creatingAdmin) {
                            setShowCreateAdmin(false);
                            setError(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-admin-title"
                        className="my-auto w-full max-w-xl rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                    <UserPlus size={22} />
                                </div>
                                <div>
                                    <h2
                                        id="create-admin-title"
                                        className="text-xl font-semibold text-[#2F3B2A]"
                                    >
                                        Novo administrador
                                    </h2>
                                    <p className="mt-1 text-sm text-[#7A8474]">
                                        Associado a {florist.name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateAdmin(false);
                                    setError(null);
                                }}
                                disabled={creatingAdmin}
                                aria-label="Fechar formulário"
                                className="rounded-xl p-2 text-[#7A8474] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="mt-7 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="admin-first-name" className={labelClassName}>
                                        Nome *
                                    </label>
                                    <input
                                        id="admin-first-name"
                                        value={firstName}
                                        onChange={(event) => setFirstName(event.target.value)}
                                        className={inputClassName}
                                        required
                                        disabled={creatingAdmin}
                                        autoComplete="given-name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="admin-last-name" className={labelClassName}>
                                        Apelido *
                                    </label>
                                    <input
                                        id="admin-last-name"
                                        value={lastName}
                                        onChange={(event) => setLastName(event.target.value)}
                                        className={inputClassName}
                                        required
                                        disabled={creatingAdmin}
                                        autoComplete="family-name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="admin-email" className={labelClassName}>
                                        Email *
                                    </label>
                                    <input
                                        id="admin-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className={inputClassName}
                                        required
                                        disabled={creatingAdmin}
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="admin-phone" className={labelClassName}>
                                        Telefone
                                    </label>
                                    <input
                                        id="admin-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        className={inputClassName}
                                        disabled={creatingAdmin}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-password" className={labelClassName}>
                                    Password inicial *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className={`${inputClassName} font-mono`}
                                        minLength={8}
                                        required
                                        disabled={creatingAdmin}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="shrink-0 rounded-xl border border-[#DDE2D7] px-3 text-sm font-medium text-[#55624A] hover:bg-[#F3F5EE]"
                                    >
                                        {showPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPassword(generatePassword());
                                            setShowPassword(true);
                                        }}
                                        disabled={creatingAdmin}
                                        className="shrink-0 rounded-xl border border-[#DDE2D7] px-3 text-sm font-medium text-[#55624A] hover:bg-[#F3F5EE]"
                                    >
                                        Gerar
                                    </button>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-[#7A8474]">
                                    Guarda esta password e entrega-a ao administrador
                                    de forma segura. Não é enviada automaticamente por email.
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#F3F5EE] p-4 text-sm text-[#55624A]">
                                O utilizador será criado com o perfil{" "}
                                <strong>Florista</strong>, associado a esta florista
                                e com a conta ativa.
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                >
                                    <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateAdmin(false);
                                        setError(null);
                                    }}
                                    disabled={creatingAdmin}
                                    className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={creatingAdmin}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <UserPlus size={16} />
                                    {creatingAdmin
                                        ? "A criar..."
                                        : "Criar administrador"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirmation && florist && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !deleting) {
                            setShowDeleteConfirmation(false);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-florist-title"
                        aria-describedby="delete-florist-description"
                        className="w-full max-w-md rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertTriangle size={24} />
                        </div>

                        <h2
                            id="delete-florist-title"
                            className="mt-5 text-xl font-semibold text-[#2F3B2A]"
                        >
                            Eliminar florista?
                        </h2>

                        <p
                            id="delete-florist-description"
                            className="mt-3 text-sm leading-6 text-[#7A8474]"
                        >
                            Estás prestes a eliminar a florista{" "}
                            <span className="font-semibold text-[#374132]">
                                {florist.name}
                            </span>
                            . Esta ação pode ser irreversível. Tens a certeza
                            de que pretendes continuar?
                        </p>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(false)}
                                disabled={deleting}
                                className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={16} />
                                {deleting ? "A eliminar..." : "Sim, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
