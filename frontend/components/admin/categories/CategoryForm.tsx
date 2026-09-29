"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    ArrowLeft,
    Save,
} from "lucide-react";

import {
    createCategory,
    updateCategory,
    type Category,
} from "@/lib/api/categories";

type Props = {
    category?: Category;
};

export default function CategoryForm({
    category,
}: Props) {
    const router = useRouter();

    const isEditing = !!category;

    const [name, setName] = useState(
        category?.name ?? "",
    );

    const [description, setDescription] =
        useState(category?.description ?? "");

    const [active, setActive] = useState(
        category?.active ?? true,
    );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError(
                "O nome da categoria é obrigatório.",
            );

            return;
        }

        try {
            setIsSubmitting(true);

            const data = {
                name: trimmedName,
                description:
                    description.trim() || undefined,
                active,
            };

            if (isEditing) {
                await updateCategory(
                    category.id,
                    data,
                );
            } else {
                await createCategory(data);
            }

            router.push("/admin/categories");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a categoria.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            <section className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Informação da categoria
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        Define a informação principal da
                        categoria.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Nome
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            placeholder="Nome da categoria"
                            disabled={isSubmitting}
                            className="
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
                            "
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            rows={5}
                            placeholder="Descrição da categoria"
                            disabled={isSubmitting}
                            className="
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
                            "
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-[#FAFBF8] p-5">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[#2F3B2A]">
                                    Categoria ativa
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Categorias inativas deixam de
                                    estar disponíveis para novos
                                    produtos.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(event) =>
                                    setActive(
                                        event.target.checked,
                                    )
                                }
                                disabled={isSubmitting}
                                className="
                                    h-5
                                    w-5
                                    cursor-pointer
                                    rounded
                                    border-gray-300
                                    text-[#55624A]
                                    accent-[#55624A]
                                "
                            />
                        </label>
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Link
                    href="/admin/categories"
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-gray-600
                        transition
                        hover:bg-gray-50
                    "
                >
                    <ArrowLeft size={17} />
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
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
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <Save size={17} />

                    {isSubmitting
                        ? "A guardar..."
                        : isEditing
                            ? "Guardar alterações"
                            : "Criar categoria"}
                </button>
            </div>
        </form>
    );
}
