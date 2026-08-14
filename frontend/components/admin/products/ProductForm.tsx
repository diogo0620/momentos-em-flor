"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    createProduct,
    updateProduct,
} from "@/lib/api/products";

import { getCategories } from "@/lib/api/categories";

import type { Product } from "@/types/product";
import type { Category } from "@/lib/api/categories";

type Props = {
    product?: Product;
};

export default function ProductForm({
    product,
}: Props) {
    const router = useRouter();

    const isEditing = !!product;

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [name, setName] =
        useState(product?.name ?? "");

    const [description, setDescription] =
        useState(
            product?.description ?? "",
        );

    const [pricingType, setPricingType] =
        useState<"FIXED" | "PER_UNIT">(
            product?.pricingType ?? "FIXED",
        );

    const [basePrice, setBasePrice] =
        useState(
            product?.basePrice?.toString() ??
                "",
        );

    const [baseFloristCompensation, setBaseFloristCompensation] =
        useState("");

    const [categoryId, setCategoryId] =
        useState(
            product?.category?.id?.toString() ??
                "",
        );

    const [active, setActive] =
        useState(
            product?.active ?? true,
        );

    const [isLoadingCategories, setIsLoadingCategories] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadCategories() {
            try {
                setIsLoadingCategories(true);

                const response =
                    await getCategories();

                setCategories(
                    response.data.filter(
                        (category) =>
                            category.active ||
                            category.id ===
                                product?.category?.id,
                    ),
                );
            } catch {
                setError(
                    "Não foi possível carregar as categorias.",
                );
            } finally {
                setIsLoadingCategories(false);
            }
        }

        loadCategories();
    }, [product?.category?.id]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (!name.trim()) {
            setError(
                "O nome do produto é obrigatório.",
            );
            return;
        }

        if (!categoryId) {
            setError(
                "Selecione uma categoria.",
            );
            return;
        }

        if (basePrice === "") {
            setError(
                "O preço base é obrigatório.",
            );
            return;
        }

        if (
            !isEditing &&
            baseFloristCompensation === ""
        ) {
            setError(
                "A compensação da florista é obrigatória.",
            );
            return;
        }

        const parsedBasePrice =
            Number(basePrice);

        const parsedCategoryId =
            Number(categoryId);

        const parsedCompensation =
            Number(
                baseFloristCompensation,
            );

        if (
            Number.isNaN(
                parsedBasePrice,
            ) ||
            parsedBasePrice < 0
        ) {
            setError(
                "O preço base é inválido.",
            );
            return;
        }

        if (
            Number.isNaN(
                parsedCategoryId,
            )
        ) {
            setError(
                "A categoria selecionada é inválida.",
            );
            return;
        }

        if (
            !isEditing &&
            (Number.isNaN(
                parsedCompensation,
            ) ||
                parsedCompensation < 0)
        ) {
            setError(
                "A compensação da florista é inválida.",
            );
            return;
        }

        try {
            setIsSubmitting(true);

            if (isEditing) {
                await updateProduct(
                    product.id,
                    {
                        name: name.trim(),
                        description:
                            description.trim() ||
                            undefined,
                        pricingType,
                        basePrice:
                            parsedBasePrice,
                        categoryId:
                            parsedCategoryId,
                        active,
                    },
                );

                router.push(
                    `/admin/products/${product.id}`,
                );
            } else {
                await createProduct({
                    name: name.trim(),
                    description:
                        description.trim() ||
                        undefined,
                    pricingType,
                    basePrice:
                        parsedBasePrice,
                    baseFloristCompensation:
                        parsedCompensation,
                    categoryId:
                        parsedCategoryId,
                    active,
                });

                router.push(
                    "/admin/products",
                );
            }

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : isEditing
                      ? "Não foi possível atualizar o produto."
                      : "Não foi possível criar o produto.",
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

            {/* ERROR */}

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* BASIC INFORMATION */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Informação do produto
                </h2>

                <div className="mt-8 grid gap-6">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nome
                        </label>

                        <input
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value,
                                )
                            }
                            maxLength={150}
                            placeholder="Ex.: Ramo de Rosas Vermelhas"
                            className="
                                w-full
                                rounded-2xl
                                border
                                border-gray-200
                                px-4
                                py-3
                                outline-none
                                transition
                                focus:border-[#55624A]
                            "
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            Máximo de 150 caracteres.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Descrição
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value,
                                )
                            }
                            maxLength={500}
                            rows={5}
                            placeholder="Descreva o produto..."
                            className="
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-gray-200
                                px-4
                                py-3
                                outline-none
                                transition
                                focus:border-[#55624A]
                            "
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            Máximo de 500 caracteres.
                        </p>
                    </div>

                </div>

            </div>

            {/* PRICING */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Pricing
                </h2>

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Tipo de preço
                        </label>

                        <select
                            value={pricingType}
                            onChange={(e) =>
                                setPricingType(
                                    e.target
                                        .value as
                                        | "FIXED"
                                        | "PER_UNIT",
                                )
                            }
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
                        >
                            <option value="FIXED">
                                Preço fixo
                            </option>

                            <option value="PER_UNIT">
                                Por unidade
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Preço base (€)
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={basePrice}
                            onChange={(e) =>
                                setBasePrice(
                                    e.target.value,
                                )
                            }
                            placeholder="29.90"
                            className="
                                w-full
                                rounded-2xl
                                border
                                border-gray-200
                                px-4
                                py-3
                                outline-none
                                focus:border-[#55624A]
                            "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Compensação da florista (€)
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                baseFloristCompensation
                            }
                            onChange={(e) =>
                                setBaseFloristCompensation(
                                    e.target.value,
                                )
                            }
                            placeholder={
                                isEditing
                                    ? "Mantém o valor atual"
                                    : "25.00"
                            }
                            disabled={isEditing}
                            className="
                                w-full
                                rounded-2xl
                                border
                                border-gray-200
                                px-4
                                py-3
                                outline-none
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                focus:border-[#55624A]
                            "
                        />

                        {isEditing && (
                            <p className="mt-2 text-xs text-gray-400">
                                O DTO de resposta atual não
                                devolve a compensação da
                                florista, por isso não a
                                podemos editar aqui sem
                                alterar o backend.
                            </p>
                        )}
                    </div>

                </div>

            </div>

            {/* CATEGORY */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Categoria
                </h2>

                <div className="mt-6 max-w-xl">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Categoria
                    </label>

                    <select
                        value={categoryId}
                        onChange={(e) =>
                            setCategoryId(
                                e.target.value,
                            )
                        }
                        disabled={
                            isLoadingCategories
                        }
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-3
                            outline-none
                            disabled:bg-gray-100
                            focus:border-[#55624A]
                        "
                    >
                        <option value="">
                            {isLoadingCategories
                                ? "A carregar categorias..."
                                : "Selecionar categoria"}
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={
                                        category.id
                                    }
                                    value={
                                        category.id
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>
                            ),
                        )}
                    </select>

                </div>

            </div>

            {/* STATUS */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <div className="flex items-center justify-between gap-6">

                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Estado
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Define se o produto está disponível
                            no catálogo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setActive(
                                (current) =>
                                    !current,
                            )
                        }
                        className={`
                            relative
                            h-7
                            w-12
                            rounded-full
                            transition
                            ${
                                active
                                    ? "bg-[#55624A]"
                                    : "bg-gray-300"
                            }
                        `}
                    >
                        <span
                            className={`
                                absolute
                                top-1
                                h-5
                                w-5
                                rounded-full
                                bg-white
                                shadow
                                transition
                                ${
                                    active
                                        ? "left-6"
                                        : "left-1"
                                }
                            `}
                        />
                    </button>

                </div>

                <p className="mt-4 text-sm font-medium">
                    {active
                        ? "Produto ativo"
                        : "Produto inativo"}
                </p>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    disabled={isSubmitting}
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        px-6
                        py-3
                        font-medium
                        text-gray-600
                        transition
                        hover:bg-gray-50
                        disabled:opacity-50
                    "
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        isLoadingCategories
                    }
                    className="
                        rounded-2xl
                        bg-[#55624A]
                        px-6
                        py-3
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {isSubmitting
                        ? isEditing
                            ? "A guardar..."
                            : "A criar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar produto"}
                </button>

            </div>

        </form>
    );
}