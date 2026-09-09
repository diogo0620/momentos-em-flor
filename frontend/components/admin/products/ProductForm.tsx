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

type VariantForm = ProductConfigurationVariant & {
    clientId?: string;
};

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
        clientId: crypto.randomUUID(),
        type: "SIZE",
        name: "",
        code: "",
        price: 0,
        floristCompensation: 0,
        active: true,
        sortOrder,
        imageId: null,
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
            variantClientId: null,
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
        const variant = variants[index];

        if (!variant) {
            return;
        }

        setImages((current) =>
            current.map((image) => {
                const matchesExistingVariant =
                    variant.id != null &&
                    image.variantId === variant.id;

                const matchesNewVariant =
                    variant.clientId != null &&
                    image.variantClientId ===
                        variant.clientId;

                if (
                    matchesExistingVariant ||
                    matchesNewVariant
                ) {
                    return {
                        ...image,
                        variantId: null,
                        variantClientId: null,
                    };
                }

                return image;
            }),
        );

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
                    variantClientId: null,
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

    function isVariantImageAlreadyUsed(
        imageIndex: number,
        variant: VariantForm,
    ) {
        return images.some(
            (image, currentImageIndex) => {
                if (
                    currentImageIndex ===
                    imageIndex
                ) {
                    return false;
                }

                if (
                    variant.id != null &&
                    image.variantId === variant.id
                ) {
                    return true;
                }

                if (
                    variant.clientId != null &&
                    image.variantClientId ===
                        variant.clientId
                ) {
                    return true;
                }

                return false;
            },
        );
    }

    function setImageVariant(
        imageIndex: number,
        value: string,
    ) {
        if (value === "") {
            setImages((current) =>
                current.map(
                    (image, currentIndex) =>
                        currentIndex === imageIndex
                            ? {
                                  ...image,
                                  variantId:
                                      null,
                                  variantClientId:
                                      null,
                              }
                            : image,
                ),
            );

            return;
        }

        const variant = variants.find(
            (item) => {
                if (item.id != null) {
                    return (
                        `id:${item.id}` ===
                        value
                    );
                }

                if (item.clientId) {
                    return (
                        `client:${item.clientId}` ===
                        value
                    );
                }

                return false;
            },
        );

        if (!variant) {
            return;
        }

        if (
            isVariantImageAlreadyUsed(
                imageIndex,
                variant,
            )
        ) {
            setError(
                `A variante "${variant.name || "sem nome"}" já tem uma imagem associada.`,
            );
            return;
        }

        setError(null);

        setImages((current) =>
            current.map(
                (image, currentIndex) => {
                    if (
                        currentIndex !==
                        imageIndex
                    ) {
                        return image;
                    }

                    return {
                        ...image,
                        variantId:
                            variant.id ??
                            null,
                        variantClientId:
                            variant.id
                                ? null
                                : variant.clientId ??
                                  null,
                    };
                },
            ),
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

        if (
            baseFloristCompensation === ""
        ) {
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
                    component.minQuantity <
                        0 ||
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

        for (
            let index = 0;
            index < images.length;
            index++
        ) {
            const image = images[index];

            if (
                image.variantId != null ||
                image.variantClientId != null
            ) {
                const assignedVariants =
                    images.filter(
                        (otherImage, otherIndex) => {
                            if (
                                otherIndex ===
                                index
                            ) {
                                return false;
                            }

                            if (
                                image.variantId !=
                                    null &&
                                otherImage.variantId ===
                                    image.variantId
                            ) {
                                return true;
                            }

                            if (
                                image.variantClientId !=
                                    null &&
                                otherImage.variantClientId ===
                                    image.variantClientId
                            ) {
                                return true;
                            }

                            return false;
                        },
                    );

                if (
                    assignedVariants.length >
                    0
                ) {
                    return `Uma variante não pode ter mais do que uma imagem associada.`;
                }
            }
        }

        return null;
    }

    function buildConfiguration() {
        return {
            components: components.map(
                (component, index) => ({
                    ...component,
                    sortOrder: index,
                }),
            ),

            variants: variants.map(
                (variant, index) => ({
                    ...variant,
                    sortOrder: index,
                }),
            ),

            images: images.map(
                (image, index) => ({
                    id: image.id,
                    fileId: image.fileId,
                    altText:
                        image.altText || null,
                    sortOrder: index,
                    isPrimary:
                        image.isPrimary,
                    variantId:
                        image.variantId ??
                        null,
                    variantClientId:
                        image.variantClientId ??
                        null,
                }),
            ),
        };
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

                await updateProductConfiguration(
                    product.id,
                    buildConfiguration(),
                );

                router.push(
                    `/admin/products/${product.id}`,
                );

                router.refresh();

                return;
            }

            const response = await createProduct({
    name: name.trim(),
    description: description.trim() || undefined,
    basePrice: parsedBasePrice,
    baseFloristCompensation: parsedCompensation,
    categoryId: parsedCategoryId,
    taxCodeId: 1,
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
                    buildConfiguration(),
                );
            }

            router.push(
                `/admin/products/${createdProduct.id}`,
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar o produto.",
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
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Informação básica
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Informação principal do
                        produto.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nome
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                            placeholder="Nome do produto"
                        />
                    </div>

                    <div className="md:col-span-2">
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
                            rows={5}
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                            placeholder="Descrição do produto"
                        />
                    </div>

                    <div>
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
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">
                                {isLoadingCategories
                                    ? "A carregar..."
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
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Preços
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        O preço base é sempre
                        obrigatório. O preço apresentado
                        ao cliente inclui IVA.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Preço base
                        </label>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={basePrice}
                                onChange={(event) =>
                                    setBasePrice(
                                        event.target
                                            .value,
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-black"
                                placeholder="0.00"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                €
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Compensação da florista
                        </label>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    baseFloristCompensation
                                }
                                onChange={(event) =>
                                    setBaseFloristCompensation(
                                        event.target
                                            .value,
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-black"
                                placeholder="0.00"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                €
                            </span>
                        </div>
                    </div>
                </div>

                {product?.taxCode && (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Tax Code
                        </div>

                        <div className="mt-1 text-sm font-medium text-gray-900">
                            {product.taxCode.code}
                            {" · "}
                            {product.taxCode.name}
                            {" · "}
                            {product.taxCode.rate}%
                        </div>
                    </div>
                )}
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Configuração
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Escolhe entre componentes
                            personalizáveis ou variantes.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={addComponent}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                configurationMode ===
                                "components"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-700"
                            }`}
                        >
                            + Componente
                        </button>

                        <button
                            type="button"
                            onClick={addVariant}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                configurationMode ===
                                "variants"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-700"
                            }`}
                        >
                            + Variante
                        </button>
                    </div>
                </div>

                {components.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {components.map(
                            (
                                component,
                                index,
                            ) => (
                                <div
                                    key={
                                        component.id ??
                                        `component-${index}`
                                    }
                                    className="rounded-xl border bg-gray-50 p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">
                                            Componente{" "}
                                            {index +
                                                1}
                                        </h3>

                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveComponent(
                                                        index,
                                                        -1,
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    0
                                                }
                                                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveComponent(
                                                        index,
                                                        1,
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    components.length -
                                                        1
                                                }
                                                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
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
                                                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="lg:col-span-3">
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                                              name: event.target.value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                                placeholder="Ex.: Chocolates"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Preço adicional
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Compensação adicional
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    component.active
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
                                                                              active: event.target.checked,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                            />
                                            Ativo
                                        </label>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {variants.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {variants.map(
                            (
                                variant,
                                index,
                            ) => (
                                <div
                                    key={
                                        variant.id ??
                                        variant.clientId ??
                                        `variant-${index}`
                                    }
                                    className="rounded-xl border bg-gray-50 p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">
                                            Variante{" "}
                                            {index +
                                                1}
                                        </h3>

                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveVariant(
                                                        index,
                                                        -1,
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    0
                                                }
                                                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveVariant(
                                                        index,
                                                        1,
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    variants.length -
                                                        1
                                                }
                                                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
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
                                                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                                              type: event.target.value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
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
                                                            {
                                                                type
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                                              name: event.target.value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                                placeholder="Ex.: Vermelho"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
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
                                                                              code: event.target.value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                                placeholder="Opcional"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Preço
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Compensação
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
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-gray-700">
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
                                                                              active: event.target.checked,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                            />
                                            Ativo
                                        </label>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {configurationMode ===
                    null && (
                    <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Este produto não tem
                            configuração.
                        </p>
                    </div>
                )}
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Imagens
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Adiciona as imagens do
                            produto e, quando aplicável,
                            associa uma imagem a uma
                            variante.
                        </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
                        {uploadingImage
                            ? "A carregar..."
                            : "Adicionar imagem"}

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={
                                uploadingImage
                            }
                            onChange={
                                handleImageUpload
                            }
                        />
                    </label>
                </div>

                {images.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Ainda não existem imagens.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map(
                            (
                                image,
                                index,
                            ) => (
                                <div
                                    key={
                                        image.id ??
                                        `image-${image.fileId}-${index}`
                                    }
                                    className="overflow-hidden rounded-xl border bg-white"
                                >
                                    <div className="aspect-square bg-gray-100">
                                        {image.previewUrl && (
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
                                        )}
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {image.fileName ??
                                                        `Imagem ${index + 1}`}
                                                </p>

                                                {image.isPrimary && (
                                                    <span className="mt-1 inline-block rounded-full bg-black px-2 py-0.5 text-xs text-white">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveImage(
                                                            index,
                                                            -1,
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        0
                                                    }
                                                    className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                                                >
                                                    ↑
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveImage(
                                                            index,
                                                            1,
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        images.length -
                                                            1
                                                    }
                                                    className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Variante
                                            </label>

                                            <select
                                                value={
                                                    image.variantId !=
                                                        null
                                                        ? `id:${image.variantId}`
                                                        : image.variantClientId
                                                          ? `client:${image.variantClientId}`
                                                          : ""
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setImageVariant(
                                                        index,
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    variants.length ===
                                                    0
                                                }
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                            >
                                                <option value="">
                                                    Imagem geral
                                                    do produto
                                                </option>

                                                {variants.map(
                                                    (
                                                        variant,
                                                        variantIndex,
                                                    ) => {
                                                        const value =
                                                            variant.id !=
                                                            null
                                                                ? `id:${variant.id}`
                                                                : `client:${variant.clientId}`;

                                                        return (
                                                            <option
                                                                key={
                                                                    variant.id ??
                                                                    variant.clientId ??
                                                                    variantIndex
                                                                }
                                                                value={
                                                                    value
                                                                }
                                                            >
                                                                {variant.type}{" "}
                                                                ·{" "}
                                                                {variant.name ||
                                                                    `Variante ${variantIndex + 1}`}
                                                            </option>
                                                        );
                                                    },
                                                )}
                                            </select>

                                            {variants.length ===
                                                0 && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Adiciona primeiro
                                                    uma variante para
                                                    poder associar a
                                                    imagem.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Alt text
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
                                                                              altText: event.target.value,
                                                                          }
                                                                        : item,
                                                            ),
                                                    )
                                                }
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                                placeholder="Descrição da imagem"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrimaryImage(
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    image.isPrimary
                                                }
                                                className="rounded-lg border px-3 py-2 text-xs font-medium disabled:opacity-40"
                                            >
                                                Tornar principal
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(
                                                        index,
                                                    )
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Estado
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Define se o produto está disponível
                        no sistema.
                    </p>
                </div>

                <label className="mt-5 flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(event) =>
                            setActive(
                                event.target.checked,
                            )
                        }
                        className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-gray-700">
                        Produto ativo
                    </span>
                </label>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    disabled={isSubmitting}
                    className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        uploadingImage
                    }
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "A guardar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar produto"}
                </button>
            </div>
        </form>
    );
}