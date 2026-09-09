"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getCategories } from "@/lib/api/categories";
import {
    createProduct,
    updateProduct,
    updateProductConfiguration,
    uploadProductImage,
    type ProductAdminDetail,
    type ProductConfigurationComponent,
    type ProductConfigurationImage,
    type ProductConfigurationVariant,
} from "@/lib/api/products";

import type { Category } from "@/lib/api/categories";

type Props = {
    product?: ProductAdminDetail;
};

type ComponentForm = ProductConfigurationComponent;
type VariantForm = ProductConfigurationVariant;
type ImageForm = ProductConfigurationImage & {
    previewUrl?: string;
    fileName?: string;
};

const VARIANT_TYPES = [
    "SIZE",
    "COLOR",
    "STYLE",
    "OTHER",
] as const;

function createComponent(sortOrder: number): ComponentForm {
    return {
        name: "",
        minQuantity: 0,
        recommendedQuantity: 1,
        maxQuantity: 1,
        customerPricePerAdditionalUnit: 0,
        floristCompensationPerAdditionalUnit: 0,
        active: true,
        sortOrder,
    };
}

function createVariant(sortOrder: number): VariantForm {
    return {
        type: "SIZE",
        name: "",
        code: "",
        price: 0,
        floristCompensation: 0,
        active: true,
        sortOrder,
    };
}

function normaliseComponents(
    components: ProductAdminDetail["components"],
): ComponentForm[] {
    return [...components]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((component, index) => ({
            id: component.id,
            name: component.name,
            minQuantity: component.minQuantity,
            recommendedQuantity:
                component.recommendedQuantity,
            maxQuantity: component.maxQuantity,
            customerPricePerAdditionalUnit:
                component.customerPricePerAdditionalUnit,
            floristCompensationPerAdditionalUnit:
                component.floristCompensationPerAdditionalUnit,
            active: component.active,
            sortOrder: index,
        }));
}

function normaliseVariants(
    variants: ProductAdminDetail["variants"],
): VariantForm[] {
    return [...variants]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((variant, index) => ({
            id: variant.id,
            type: variant.type,
            name: variant.name,
            code: variant.code,
            price: variant.price,
            floristCompensation:
                variant.floristCompensation,
            active: variant.active,
            sortOrder: index,
            imageId: variant.image?.id ?? null,
        }));
}

function normaliseImages(
    images: ProductAdminDetail["images"],
): ImageForm[] {
    return [...images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image, index) => ({
            id: image.id,
            fileId: image.fileId,
            altText: image.altText,
            sortOrder: index,
            isPrimary: image.isPrimary,
            variantId: image.variantId,
            previewUrl: image.url,
        }));
}

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
        useState(product?.description ?? "");

    const [basePrice, setBasePrice] =
        useState(
            product?.basePrice?.toString() ?? "",
        );

    const [baseFloristCompensation, setBaseFloristCompensation] =
        useState(
            product?.baseFloristCompensation?.toString() ??
                "",
        );

    const [categoryId, setCategoryId] =
        useState(
            product?.category?.id?.toString() ?? "",
        );

    const [active, setActive] =
        useState(product?.active ?? true);

    const [components, setComponents] =
        useState<ComponentForm[]>(
            product
                ? normaliseComponents(product.components)
                : [],
        );

    const [variants, setVariants] =
        useState<VariantForm[]>(
            product
                ? normaliseVariants(product.variants)
                : [],
        );

    const [images, setImages] =
        useState<ImageForm[]>(
            product
                ? normaliseImages(product.images)
                : [],
        );

    const [isLoadingCategories, setIsLoadingCategories] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const configurationMode = useMemo(() => {
        if (components.length > 0) {
            return "components";
        }

        if (variants.length > 0) {
            return "variants";
        }

        return null;
    }, [components.length, variants.length]);

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

    function reorder<T extends { sortOrder: number }>(
        items: T[],
        fromIndex: number,
        toIndex: number,
    ): T[] {
        if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= items.length ||
            toIndex >= items.length
        ) {
            return items;
        }

        const next = [...items];

        const [item] =
            next.splice(fromIndex, 1);

        next.splice(toIndex, 0, item);

        return next.map((entry, index) => ({
            ...entry,
            sortOrder: index,
        }));
    }

    function moveComponent(
        index: number,
        direction: -1 | 1,
    ) {
        setComponents((current) =>
            reorder(
                current,
                index,
                index + direction,
            ),
        );
    }

    function moveVariant(
        index: number,
        direction: -1 | 1,
    ) {
        setVariants((current) =>
            reorder(
                current,
                index,
                index + direction,
            ),
        );
    }

    function moveImage(
        index: number,
        direction: -1 | 1,
    ) {
        setImages((current) =>
            reorder(
                current,
                index,
                index + direction,
            ),
        );
    }

    function addComponent() {
        if (variants.length > 0) {
            setVariants([]);
        }

        setComponents((current) => [
            ...current,
            createComponent(current.length),
        ]);
    }

    function addVariant() {
        if (components.length > 0) {
            setComponents([]);
        }

        setVariants((current) => [
            ...current,
            createVariant(current.length),
        ]);
    }

    function removeComponent(index: number) {
        setComponents((current) =>
            current
                .filter(
                    (_, itemIndex) =>
                        itemIndex !== index,
                )
                .map((item, itemIndex) => ({
                    ...item,
                    sortOrder: itemIndex,
                })),
        );
    }

    function removeVariant(index: number) {
        setVariants((current) =>
            current
                .filter(
                    (_, itemIndex) =>
                        itemIndex !== index,
                )
                .map((item, itemIndex) => ({
                    ...item,
                    sortOrder: itemIndex,
                })),
        );
    }

    function removeImage(index: number) {
        setImages((current) =>
            current
                .filter(
                    (_, itemIndex) =>
                        itemIndex !== index,
                )
                .map((item, itemIndex) => ({
                    ...item,
                    sortOrder: itemIndex,
                })),
        );
    }

    async function handleImageUpload(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        setError(null);
        setUploadingImage(true);

        try {
            const uploaded =
                await uploadProductImage(file);

            setImages((current) => [
                ...current,
                {
                    fileId: uploaded.id,
                    altText: "",
                    sortOrder: current.length,
                    isPrimary:
                        current.length === 0,
                    variantId: null,
                    previewUrl: uploaded.url,
                    fileName:
                        uploaded.originalName,
                },
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a imagem.",
            );
        } finally {
            setUploadingImage(false);
        }
    }

    function setPrimaryImage(index: number) {
        setImages((current) =>
            current.map((image, imageIndex) => ({
                ...image,
                isPrimary:
                    imageIndex === index,
            })),
        );
    }

    function validateForm(): string | null {
        if (!name.trim()) {
            return "O nome do produto é obrigatório.";
        }

        if (!categoryId) {
            return "Selecione uma categoria.";
        }

        if (basePrice === "") {
            return "O preço base é obrigatório.";
        }

        if (baseFloristCompensation === "") {
            return "A compensação da florista é obrigatória.";
        }

        const parsedBasePrice =
            Number(basePrice);

        const parsedCompensation =
            Number(baseFloristCompensation);

        if (
            Number.isNaN(parsedBasePrice) ||
            parsedBasePrice < 0
        ) {
            return "O preço base é inválido.";
        }

        if (
            Number.isNaN(parsedCompensation) ||
            parsedCompensation < 0
        ) {
            return "A compensação da florista é inválida.";
        }

        if (components.length > 0) {
            for (
                let index = 0;
                index < components.length;
                index++
            ) {
                const component =
                    components[index];

                if (!component.name.trim()) {
                    return `Indica o nome do componente ${index + 1}.`;
                }

                if (
                    component.minQuantity < 0 ||
                    component.recommendedQuantity <
                        component.minQuantity ||
                    component.maxQuantity <
                        component.recommendedQuantity
                ) {
                    return `As quantidades do componente "${component.name}" são inválidas.`;
                }

                if (
                    component.customerPricePerAdditionalUnit <
                    0 ||
                    component.floristCompensationPerAdditionalUnit <
                    0
                ) {
                    return `Os valores do componente "${component.name}" são inválidos.`;
                }
            }
        }

        if (variants.length > 0) {
            for (
                let index = 0;
                index < variants.length;
                index++
            ) {
                const variant =
                    variants[index];

                if (!variant.name.trim()) {
                    return `Indica o nome da variante ${index + 1}.`;
                }

                if (variant.price < 0) {
                    return `O preço da variante "${variant.name}" é inválido.`;
                }

                if (
                    variant.floristCompensation <
                    0
                ) {
                    return `A compensação da variante "${variant.name}" é inválida.`;
                }

                if (
                    variant.floristCompensation >=
                    variant.price
                ) {
                    return `A compensação da variante "${variant.name}" deve ser inferior ao preço.`;
                }

                if (
                    variant.price <
                    parsedBasePrice
                ) {
                    return `A variante "${variant.name}" não pode ter um preço inferior ao preço base.`;
                }
            }
        }

        return null;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const parsedBasePrice =
            Number(basePrice);

        const parsedCompensation =
            Number(baseFloristCompensation);

        const parsedCategoryId =
            Number(categoryId);

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
                        basePrice:
                            parsedBasePrice,
                        baseFloristCompensation:
                            parsedCompensation,
                        categoryId:
                            parsedCategoryId,
                        active,
                    },
                );

                const configuration = {
                    components:
                        components.map(
                            (component, index) => ({
                                ...component,
                                sortOrder: index,
                            }),
                        ),
                    variants:
                        variants.map(
                            (variant, index) => ({
                                ...variant,
                                sortOrder: index,
                            }),
                        ),
                    images:
                        images.map(
                            (image, index) => ({
                                id: image.id,
                                fileId:
                                    image.fileId,
                                altText:
                                    image.altText ||
                                    null,
                                sortOrder: index,
                                isPrimary:
                                    image.isPrimary,
                                variantId:
                                    image.variantId ??
                                    null,
                            }),
                        ),
                };

                await updateProductConfiguration(
                    product.id,
                    configuration,
                );

                router.push(
                    `/admin/products/${product.id}`,
                );
                router.refresh();
                return;
            }

            const response =
                await createProduct({
                    name: name.trim(),
                    description:
                        description.trim() ||
                        undefined,
                    basePrice:
                        parsedBasePrice,
                    baseFloristCompensation:
                        parsedCompensation,
                    categoryId:
                        parsedCategoryId,
                    active,
                });

            const createdProduct =
                response.data;

            if (
                createdProduct?.id &&
                (components.length > 0 ||
                    variants.length > 0 ||
                    images.length > 0)
            ) {
                await updateProductConfiguration(
                    createdProduct.id,
                    {
                        components:
                            components.map(
                                (
                                    component,
                                    index,
                                ) => ({
                                    ...component,
                                    sortOrder:
                                        index,
                                }),
                            ),
                        variants:
                            variants.map(
                                (
                                    variant,
                                    index,
                                ) => ({
                                    ...variant,
                                    sortOrder:
                                        index,
                                }),
                            ),
                        images:
                            images.map(
                                (
                                    image,
                                    index,
                                ) => ({
                                    fileId:
                                        image.fileId,
                                    altText:
                                        image.altText ||
                                        null,
                                    sortOrder:
                                        index,
                                    isPrimary:
                                        image.isPrimary,
                                    variantId:
                                        null,
                                }),
                            ),
                    },
                );
            }

            router.push(
                "/admin/products",
            );
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
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#55624A]">
                        Produtos
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        {isEditing
                            ? "Editar produto"
                            : "Novo produto"}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {isEditing
                            ? "Atualiza a informação, configuração e imagens do produto."
                            : "Cria um novo produto para o catálogo."}
                    </p>
                </div>
            </div>

            {/* BASIC INFORMATION */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div>
                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Informação do produto
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Informação principal apresentada no
                        catálogo.
                    </p>
                </div>

                <div className="mt-8 grid gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nome
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            maxLength={150}
                            placeholder="Ex.: Ramo de Rosas Vermelhas"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#55624A]/10"
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            {name.length}/150 caracteres.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Descrição
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            maxLength={500}
                            rows={5}
                            placeholder="Descreve o produto..."
                            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#55624A]/10"
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            {description.length}/500
                            caracteres.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRICING */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div>
                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Preços
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        O preço apresentado ao cliente é o preço
                        base acrescido de IVA.
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Preço base (€)
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={basePrice}
                            onChange={(event) =>
                                setBasePrice(
                                    event.target.value,
                                )
                            }
                            placeholder="29.90"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#55624A]/10"
                        />

                        {product && (
                            <p className="mt-2 text-xs text-gray-400">
                                Preço atual com IVA:{" "}
                                {product.price.toFixed(
                                    2,
                                )}
                                €
                            </p>
                        )}
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
                            onChange={(event) =>
                                setBaseFloristCompensation(
                                    event.target.value,
                                )
                            }
                            placeholder="25.00"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#55624A]/10"
                        />
                    </div>
                </div>

                {product && (
                    <div className="mt-6 rounded-2xl bg-[#F7F8F5] p-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-500">
                                Taxa de IVA
                            </span>

                            <span className="font-semibold text-[#2F3B2A]">
                                {product.taxCode.name}{" "}
                                (
                                {product.taxCode.rate.toFixed(
                                    2,
                                )}
                                %)
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-200 pt-3">
                            <span className="text-sm text-gray-500">
                                Preço final atual
                            </span>

                            <span className="font-bold text-[#2F3B2A]">
                                {product.price.toFixed(
                                    2,
                                )}
                                €
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {/* CATEGORY */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div>
                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Categoria
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Define onde o produto aparece no catálogo.
                    </p>
                </div>

                <div className="mt-6 max-w-xl">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Categoria
                    </label>

                    <select
                        value={categoryId}
                        onChange={(event) =>
                            setCategoryId(
                                event.target.value,
                            )
                        }
                        disabled={
                            isLoadingCategories
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#55624A]/10 disabled:bg-gray-100"
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
                                    {category.name}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </section>

            {/* CONFIGURATION */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Configuração
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Um produto pode ter componentes ou
                            variantes. Não é possível utilizar os
                            dois tipos simultaneamente.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={addComponent}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            + Componente
                        </button>

                        <button
                            type="button"
                            onClick={addVariant}
                            className="rounded-xl bg-[#55624A] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            + Variante
                        </button>
                    </div>
                </div>

                {configurationMode === null && (
                    <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <p className="font-medium text-gray-600">
                            Este produto não tem configuração
                            adicional.
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            Adiciona componentes ou variantes se
                            o produto permitir personalização.
                        </p>
                    </div>
                )}

                {/* COMPONENTS */}

                {components.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-[#2F3B2A]">
                                    Componentes
                                </h3>

                                <p className="text-xs text-gray-400">
                                    Personalizações e unidades
                                    adicionais.
                                </p>
                            </div>

                            <span className="rounded-full bg-[#F1F3ED] px-3 py-1 text-xs font-medium text-[#55624A]">
                                {components.length}{" "}
                                {components.length === 1
                                    ? "componente"
                                    : "componentes"}
                            </span>
                        </div>

                        {components.map(
                            (
                                component,
                                index,
                            ) => (
                                <div
                                    key={
                                        component.id ??
                                        `new-component-${index}`
                                    }
                                    className="rounded-2xl border border-gray-200 p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Nome
                                            </label>

                                            <input
                                                value={
                                                    component.name
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              name: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                placeholder="Ex.: Rosas adicionais"
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    index ===
                                                    0
                                                }
                                                onClick={() =>
                                                    moveComponent(
                                                        index,
                                                        -1,
                                                    )
                                                }
                                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                title="Mover para cima"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    index ===
                                                    components.length -
                                                        1
                                                }
                                                onClick={() =>
                                                    moveComponent(
                                                        index,
                                                        1,
                                                    )
                                                }
                                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                title="Mover para baixo"
                                            >
                                                ↓
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeComponent(
                                                        index,
                                                    )
                                                }
                                                className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Mínimo
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    component.minQuantity
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              minQuantity:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Recomendado
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    component.recommendedQuantity
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              recommendedQuantity:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Máximo
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    component.maxQuantity
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              maxQuantity:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Preço por unidade
                                                adicional (€)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    component.customerPricePerAdditionalUnit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              customerPricePerAdditionalUnit:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Compensação por
                                                unidade (€)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    component.floristCompensationPerAdditionalUnit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setComponents(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              floristCompensationPerAdditionalUnit:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>
                                    </div>

                                    <label className="mt-5 flex items-center gap-3 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={
                                                component.active ??
                                                true
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setComponents(
                                                    (
                                                        current,
                                                    ) =>
                                                        current.map(
                                                            (
                                                                item,
                                                                itemIndex,
                                                            ) =>
                                                                itemIndex ===
                                                                index
                                                                    ? {
                                                                          ...item,
                                                                          active: event
                                                                              .target
                                                                              .checked,
                                                                      }
                                                                    : item,
                                                        ),
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-300"
                                        />

                                        Componente ativo
                                    </label>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {/* VARIANTS */}

                {variants.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-[#2F3B2A]">
                                    Variantes
                                </h3>

                                <p className="text-xs text-gray-400">
                                    Cada variante pode ter um preço
                                    próprio.
                                </p>
                            </div>

                            <span className="rounded-full bg-[#F1F3ED] px-3 py-1 text-xs font-medium text-[#55624A]">
                                {variants.length}{" "}
                                {variants.length === 1
                                    ? "variante"
                                    : "variantes"}
                            </span>
                        </div>

                        {variants.map(
                            (
                                variant,
                                index,
                            ) => (
                                <div
                                    key={
                                        variant.id ??
                                        `new-variant-${index}`
                                    }
                                    className="rounded-2xl border border-gray-200 p-5"
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                                        <div className="w-full xl:w-40">
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Tipo
                                            </label>

                                            <select
                                                value={
                                                    variant.type
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              type: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            >
                                                {VARIANT_TYPES.map(
                                                    (
                                                        type,
                                                    ) => (
                                                        <option
                                                            key={
                                                                type
                                                            }
                                                            value={
                                                                type
                                                            }
                                                        >
                                                            {type}
                                                        </option>
                                                    ),
                                                )}

                                                {!VARIANT_TYPES.includes(
                                                    variant.type as any,
                                                ) && (
                                                    <option
                                                        value={
                                                            variant.type
                                                        }
                                                    >
                                                        {
                                                            variant.type
                                                        }
                                                    </option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="flex-1">
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Nome
                                            </label>

                                            <input
                                                value={
                                                    variant.name
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              name: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                placeholder="Ex.: Grande"
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div className="w-full xl:w-32">
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Código
                                            </label>

                                            <input
                                                value={
                                                    variant.code ??
                                                    ""
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              code: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                placeholder="GRD"
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Preço (€)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    variant.price
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              price:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Compensação (€)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    variant.floristCompensation
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              floristCompensation:
                                                                                  Number(
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                        <label className="flex items-center gap-3 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    variant.active ??
                                                    true
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setVariants(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              active: event
                                                                                  .target
                                                                                  .checked,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300"
                                            />

                                            Variante ativa
                                        </label>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    index ===
                                                    0
                                                }
                                                onClick={() =>
                                                    moveVariant(
                                                        index,
                                                        -1,
                                                    )
                                                }
                                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                title="Mover para cima"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    index ===
                                                    variants.length -
                                                        1
                                                }
                                                onClick={() =>
                                                    moveVariant(
                                                        index,
                                                        1,
                                                    )
                                                }
                                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                title="Mover para baixo"
                                            >
                                                ↓
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeVariant(
                                                        index,
                                                    )
                                                }
                                                className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>

            {/* IMAGES */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Imagens
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Adiciona, organiza e define a imagem
                            principal do produto.
                        </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#55624A] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
                        {uploadingImage
                            ? "A carregar..."
                            : "+ Adicionar imagem"}

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={
                                uploadingImage ||
                                isSubmitting
                            }
                            onChange={
                                handleImageUpload
                            }
                            className="hidden"
                        />
                    </label>
                </div>

                {images.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <p className="font-medium text-gray-600">
                            Ainda não existem imagens.
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            Adiciona pelo menos uma imagem para
                            apresentar melhor o produto.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {images.map(
                            (image, index) => (
                                <div
                                    key={
                                        image.id ??
                                        `${image.fileId}-${index}`
                                    }
                                    className="flex flex-col gap-5 rounded-2xl border border-gray-200 p-4 sm:flex-row"
                                >
                                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-32 sm:w-32">
                                        {image.previewUrl ? (
                                            <img
                                                src={
                                                    image.previewUrl
                                                }
                                                alt={
                                                    image.altText ??
                                                    ""
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                Sem
                                                preview
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-[#2F3B2A]">
                                                    {image.fileName ??
                                                        `Imagem ${index + 1}`}
                                                </p>

                                                {image.isPrimary && (
                                                    <span className="mt-2 inline-flex rounded-full bg-[#EEF2E9] px-2.5 py-1 text-xs font-medium text-[#55624A]">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        index ===
                                                        0
                                                    }
                                                    onClick={() =>
                                                        moveImage(
                                                            index,
                                                            -1,
                                                        )
                                                    }
                                                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                    title="Mover para cima"
                                                >
                                                    ↑
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        index ===
                                                        images.length -
                                                            1
                                                    }
                                                    onClick={() =>
                                                        moveImage(
                                                            index,
                                                            1,
                                                        )
                                                    }
                                                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-30"
                                                    title="Mover para baixo"
                                                >
                                                    ↓
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(
                                                            index,
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Texto alternativo
                                            </label>

                                            <input
                                                value={
                                                    image.altText ??
                                                    ""
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setImages(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              altText:
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                placeholder="Ex.: Ramo de rosas vermelhas"
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
                                            />
                                        </div>

                                        {!image.isPrimary && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrimaryImage(
                                                        index,
                                                    )
                                                }
                                                className="mt-3 text-xs font-medium text-[#55624A] hover:underline"
                                            >
                                                Definir como
                                                principal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                <p className="mt-5 text-xs text-gray-400">
                    Formatos permitidos: JPG, PNG e WEBP. Tamanho
                    máximo: 5 MB.
                </p>
            </section>

            {/* STATUS */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Estado
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Define se o produto está disponível no
                            catálogo.
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
                        className={`relative h-7 w-12 rounded-full transition ${
                            active
                                ? "bg-[#55624A]"
                                : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                active
                                    ? "left-6"
                                    : "left-1"
                            }`}
                        />
                    </button>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-700">
                    {active
                        ? "Produto ativo"
                        : "Produto inativo"}
                </p>
            </section>

            {/* ACTIONS */}

            <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    disabled={isSubmitting}
                    className="rounded-2xl border border-gray-200 px-6 py-3 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        isLoadingCategories ||
                        uploadingImage
                    }
                    className="rounded-2xl bg-[#55624A] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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