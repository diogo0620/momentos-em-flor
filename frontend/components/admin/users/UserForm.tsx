
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    RefreshCw,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { adminUsersApi } from "@/lib/api/users/admin-users";
import { adminFloristsApi } from "@/lib/api/florists/admin-florists";

import type { AdminUserDetail } from "@/types/users/admin/admin-user-detail";
import type { AdminCreateUser, UserRole } from "@/types/users/admin/admin-create-user";
import type { AdminUpdateUser } from "@/types/users/admin/admin-update-user";
import type { AdminFloristList } from "@/types/florists/admin/admin-florist-list";

type UserFormProps = {
    user?: AdminUserDetail;
};

const inputClassName =
    "w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5EE]";

const labelClassName =
    "mb-2 block text-sm font-medium text-[#374132]";

function generatePassword(length = 14): string {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    const randomValues = new Uint32Array(length);

    crypto.getRandomValues(randomValues);

    return Array.from(randomValues)
        .map((value) => chars[value % chars.length])
        .join("");
}

function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "Nunca";

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export default function UserForm({ user }: UserFormProps) {
    const router = useRouter();
    const isEditing = Boolean(user);

    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [role, setRole] = useState<UserRole>(user?.role ?? "CUSTOMER");
    const [active, setActive] = useState(user?.active ?? true);
    const [floristId, setFloristId] = useState(
        user?.florist?.id ? String(user.florist.id) : "",
    );

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [florists, setFlorists] = useState<AdminFloristList[]>([]);
    const [loadingFlorists, setLoadingFlorists] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEditing) {
            setPassword(generatePassword());
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing || role !== "FLORIST") return;

        let cancelled = false;

        async function loadFlorists() {
            setLoadingFlorists(true);

            try {
                const response = await adminFloristsApi.getAll({
                    page: 1,
                    pageSize: 100,
                    sort: "name",
                    order: "asc",
                    active: true,
                });

                if (!cancelled) {
                    setFlorists(response.items);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Não foi possível carregar as floristas.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingFlorists(false);
                }
            }
        }

        void loadFlorists();

        return () => {
            cancelled = true;
        };
    }, [isEditing, role]);

    function regeneratePassword() {
        setPassword(generatePassword());
        setShowPassword(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError("O nome e o apelido são obrigatórios.");
            return;
        }

        if (!isEditing && !email.trim()) {
            setError("O email é obrigatório.");
            return;
        }

        if (!isEditing && password.length < 8) {
            setError("A password deve ter pelo menos 8 caracteres.");
            return;
        }

        if (role === "FLORIST" && !floristId) {
            setError("É obrigatório selecionar uma florista para este utilizador.");
            return;
        }

        setSaving(true);

        try {
            if (user) {
                const data: AdminUpdateUser = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                    active,
                };

                await adminUsersApi.update(user.id, data);
            } else {
                const data: AdminCreateUser = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password,
                    role,
                    active,
                    ...(role === "FLORIST"
                        ? { floristId: Number(floristId) }
                        : {}),
                };

                await adminUsersApi.create(data);
            }

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar o utilizador.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <UserRound size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Dados pessoais
                        </h2>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Informação de identificação e contacto.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="firstName" className={labelClassName}>
                            Nome *
                        </label>
                        <input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={inputClassName}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className={labelClassName}>
                            Apelido *
                        </label>
                        <input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={inputClassName}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClassName}>
                            Email *
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClassName}
                            required={!isEditing}
                            disabled={saving || isEditing}
                        />
                        {isEditing && (
                            <p className="mt-2 text-xs text-[#8A9383]">
                                O email não pode ser alterado neste formulário.
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className={labelClassName}>
                            Telefone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClassName}
                            disabled={saving}
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Acesso e permissões
                        </h2>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Define o perfil e o estado da conta.
                        </p>
                    </div>
                </div>

                {isEditing ? (
                    <div>
                        <label className={labelClassName}>Perfil</label>
                        <div className={`${inputClassName} flex items-center`}>
                            {user?.role === "SYSTEM_ADMIN"
                                ? "Administrador"
                                : user?.role === "FLORIST"
                                  ? "Florista"
                                  : "Cliente"}
                        </div>
                        <p className="mt-2 text-xs text-[#8A9383]">
                            O perfil não pode ser alterado depois da criação.
                        </p>

                        {user?.role === "FLORIST" && user.florist && (
                            <div className="mt-5">
                                <label className={labelClassName}>Florista associada</label>
                                <div className={inputClassName}>
                                    {user.florist.name}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div>
                            <label htmlFor="role" className={labelClassName}>
                                Perfil *
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => {
                                    const nextRole = e.target.value as UserRole;
                                    setRole(nextRole);
                                    if (nextRole !== "FLORIST") {
                                        setFloristId("");
                                    }
                                }}
                                className={inputClassName}
                                disabled={saving}
                            >
                                <option value="CUSTOMER">Cliente</option>
                                <option value="FLORIST">Florista</option>
                                <option value="SYSTEM_ADMIN">Administrador</option>
                            </select>
                        </div>

                        {role === "FLORIST" && (
                            <div className="mt-5">
                                <label htmlFor="floristId" className={labelClassName}>
                                    Florista associada *
                                </label>
                                <select
                                    id="floristId"
                                    value={floristId}
                                    onChange={(e) => setFloristId(e.target.value)}
                                    className={inputClassName}
                                    required
                                    disabled={saving || loadingFlorists}
                                >
                                    <option value="">
                                        {loadingFlorists
                                            ? "A carregar floristas..."
                                            : "Seleciona uma florista"}
                                    </option>
                                    {florists.map((florist) => (
                                        <option key={florist.id} value={florist.id}>
                                            {florist.name}
                                        </option>
                                    ))}
                                </select>

                                {!loadingFlorists && florists.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-700">
                                        Não foram encontradas floristas ativas.
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-6 border-t border-[#EEF0EA] pt-6">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            disabled={saving}
                            className="mt-1 h-4 w-4 accent-[#55624A]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Conta ativa
                            </span>
                            <span className="mt-1 block text-sm text-[#7A8474]">
                                Permite ao utilizador aceder à plataforma.
                            </span>
                        </span>
                    </label>
                </div>
            </section>

            {!isEditing && (
                <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Password inicial
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Foi gerada uma password aleatória. Podes utilizá-la ou substituí-la.
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClassName} pr-12 font-mono`}
                                autoComplete="new-password"
                                minLength={8}
                                required
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#7A8474] hover:bg-[#F3F5EE]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={regeneratePassword}
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE2D7] px-4 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                        >
                            <RefreshCw size={16} />
                            Gerar outra
                        </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#8A9383]">
                        Guarda a password num local seguro antes de terminares.
                        Este formulário não envia automaticamente a password por email.
                    </p>
                </section>
            )}

            {isEditing && user && (
                <section className="rounded-3xl border border-[#E8EBE4] bg-[#F8F9F5] p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Informação do registo
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Datas de criação, atualização e último acesso do utilizador.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-[#7A8474]">Criado em</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-[#7A8474]">Última atualização</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(user.updatedAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-[#7A8474]">Último acesso</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {user.lastLoginAt
                                    ? formatDate(user.lastLoginAt)
                                    : "Nunca"}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                    type="button"
                    onClick={() => router.push("/admin/users")}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                >
                    <ArrowLeft size={16} />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving || loadingFlorists}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={16} />
                    {saving
                        ? "A guardar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar utilizador"}
                </button>
            </div>
        </form>
    );
}
