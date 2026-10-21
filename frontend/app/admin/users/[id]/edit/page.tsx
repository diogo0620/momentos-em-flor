
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    AlertTriangle,
    Trash2,
    UserRoundPen,
    X,
} from "lucide-react";

import { adminUsersApi } from "@/lib/api/users/admin-users";
import UserForm from "@/components/admin/users/UserForm";

import type { AdminUserDetail } from "@/types/users/admin/admin-user-detail";

export default function EditUserPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const id = Number(params.id);

    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);

    const loadUser = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("O ID do utilizador é inválido.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await adminUsersApi.getById(id);

            if (response) {
                setUser(response);
            } else {
                setError("Não foi possível encontrar este utilizador.");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar o utilizador.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadUser();
    }, [loadUser]);

    async function handleDelete() {
        if (!user || deleting) return;

        setDeleting(true);
        setError(null);

        try {
            await adminUsersApi.delete(user.id);

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível eliminar o utilizador.",
            );
            setShowDeleteConfirmation(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="mx-auto w-full max-w-5xl space-y-8">
                <div>
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                    >
                        <ArrowLeft size={16} />
                        Voltar aos utilizadores
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                <UserRoundPen size={23} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                                    Editar utilizador
                                </h1>
                                <p className="mt-1 text-sm text-[#7A8474]">
                                    Gere os dados e o estado da conta.
                                </p>
                            </div>
                        </div>

                        {user && !loading && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(true)}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 size={16} />
                                Eliminar utilizador
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />

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

                {loading ? (
                    <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                        A carregar utilizador...
                    </div>
                ) : user ? (
                    <UserForm user={user} />
                ) : (
                    !error && (
                        <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                            Utilizador não encontrado.
                        </div>
                    )
                )}
            </div>

            {showDeleteConfirmation && user && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleting
                        ) {
                            setShowDeleteConfirmation(false);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-user-title"
                        aria-describedby="delete-user-description"
                        className="w-full max-w-md rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertTriangle size={24} />
                        </div>

                        <h2
                            id="delete-user-title"
                            className="mt-5 text-xl font-semibold text-[#2F3B2A]"
                        >
                            Eliminar utilizador?
                        </h2>

                        <p
                            id="delete-user-description"
                            className="mt-3 text-sm leading-6 text-[#7A8474]"
                        >
                            Estás prestes a eliminar a conta de{" "}
                            <span className="font-semibold text-[#374132]">
                                {user.firstName} {user.lastName}
                            </span>
                            . Esta ação pode ser irreversível. Tens a certeza
                            de que pretendes continuar?
                        </p>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeleteConfirmation(false)
                                }
                                disabled={deleting}
                                className="inline-flex items-center justify-center rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
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
