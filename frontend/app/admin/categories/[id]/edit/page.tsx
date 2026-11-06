
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    FolderPen,
    Trash2,
    X,
    AlertTriangle,
} from "lucide-react";

import { adminCategoriesApi } from "@/lib/api/categories/admin-categories";
import CategoryForm from "@/components/admin/categories/CategoryForm";

import type { AdminCategoryDetail } from "@/types/categories/admin/admin-category-detail";

export default function EditCategoryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const id = Number(params.id);

    const [category, setCategory] =
        useState<AdminCategoryDetail | null>(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);

    const loadCategory = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("O ID da categoria é inválido.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await adminCategoriesApi.getById(id);

            setCategory(response ?? null);

            if (!response) {
                setError("Não foi possível encontrar esta categoria.");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a categoria.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadCategory();
    }, [loadCategory]);

    async function handleDelete() {
        if (!category || deleting) return;

        setDeleting(true);
        setError(null);

        try {
            await adminCategoriesApi.delete(category.id);

            setShowDeleteConfirmation(false);

            router.push("/admin/categories");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível eliminar a categoria.",
            );

            setShowDeleteConfirmation(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="mx-auto w-full max-w-5xl space-y-8">
                {/* HEADER */}
                <div>
                    <Link
                        href="/admin/categories"
                        className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                    >
                        <ArrowLeft size={16} />
                        Voltar às categorias
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                <FolderPen size={23} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                                    Editar categoria
                                </h1>

                                <p className="mt-1 text-sm text-[#7A8474]">
                                    Atualiza os dados e o estado da categoria.
                                </p>
                            </div>
                        </div>

                        {/* DELETE BUTTON */}
                        {category && !loading && (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeleteConfirmation(true)
                                }
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 size={16} />
                                Eliminar categoria
                            </button>
                        )}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-medium">
                                Ocorreu um problema
                            </p>
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

                {/* CONTENT */}
                {loading ? (
                    <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 text-sm text-[#7A8474]">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#DDE2D7] border-t-[#55624A]" />
                            A carregar categoria...
                        </div>
                    </div>
                ) : category ? (
                    <CategoryForm category={category} />
                ) : (
                    !error && (
                        <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                            Categoria não encontrada.
                        </div>
                    )
                )}
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteConfirmation && (
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
                        aria-labelledby="delete-category-title"
                        aria-describedby="delete-category-description"
                        className="w-full max-w-md rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertTriangle size={24} />
                        </div>

                        <h2
                            id="delete-category-title"
                            className="mt-5 text-xl font-semibold text-[#2F3B2A]"
                        >
                            Eliminar categoria?
                        </h2>

                        <p
                            id="delete-category-description"
                            className="mt-3 text-sm leading-6 text-[#7A8474]"
                        >
                            Estás prestes a eliminar a categoria{" "}
                            <span className="font-semibold text-[#374132]">
                                {category?.name}
                            </span>
                            . Esta ação pode ser irreversível.
                            Tens a certeza de que pretendes continuar?
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
                                {deleting
                                    ? "A eliminar..."
                                    : "Sim, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
