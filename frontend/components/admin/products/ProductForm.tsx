"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    ImagePlus,
    Plus,
    Save,
    Trash2,
    Upload,
} from "lucide-react";

import { adminProductsApi } from "@/lib/api/products/admin-products";
import { adminTaxCodesApi } from "@/lib/api/tax-codes/admin-tax-codes";
import { publicCategoriesApi } from "@/lib/api/categories/public-categories";

import type { AdminProductDetail } from "@/types/products/admin/admin-product-detail";
import type { AdminCreateProduct } from "@/types/products/admin/admin-create-product";
import type { AdminUpdateProduct } from "@/types/products/admin/admin-update-product";
import type { ProductType } from "@/types/products/admin/admin-product-list";
import type { PublicCategoryList } from "@/types/categories/public/public-category-list";
import type { AdminTaxCodeList } from "@/types/tax-codes/admin/admin-tax-code-list";
import { adminUploadsApi } from "@/lib/api/uploads/admin-uploads";

type ProductFormProps = {
    product?: AdminProductDetail;
};

type ComponentFormItem = {
    id?: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristPricePerAdditionalUnit: number;
};

type VariantFormItem = {
    id?: number;
    type: "SIZE";
    name: string;
    description: string;
    customerPrice: number;
    floristPrice: number;
    imageFile?: File;
    image?: string;
};

const inputClassName =
    "w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5EE]";

const labelClassName = "mb-2 block text-sm font-medium text-[#374132]";

const sectionClassName =
    "rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8";

function generateSlug(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function toNumber(value: string): number {
    return value === "" ? 0 : Number(value);
}

function formatDate(value: unknown): string {
    if (typeof value !== "string" && !(value instanceof Date)) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function ImagePreview({
    file,
    src,
    alt,
    className = "h-28 w-28",
}: {
    file?: File;
    src?: string;
    alt: string;
    className?: string;
}) {
    const [preview, setPreview] = useState<string | undefined>(src);

    useEffect(() => {
        if (!file) {
            setPreview(src);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file, src]);

    if (!preview) {
        return (
            <div
                className={`${className} flex shrink-0 items-center justify-center rounded-xl border border-dashed border-[#D8DED1] bg-[#F8F9F5] text-[#A0A89A]`}
            >
                <ImagePlus size={24} />
            </div>
        );
    }

    return (
        <img
            src={preview}
            alt={alt}
            className={`${className} shrink-0 rounded-xl border border-[#E8EBE4] object-cover`}
        />
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mb-7">
            <h2 className="text-lg font-semibold text-[#2F3B2A]">
                {title}
            </h2>
            <p className="mt-1 text-sm text-[#7A8474]">{description}</p>
        </div>
    );
}

export default function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();
    const isEditing = Boolean(product);

    const [name, setName] = useState(product?.name ?? "");
    const [slug, setSlug] = useState(product?.slug ?? "");
    const [description, setDescription] = useState(product?.description ?? "");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(product));

    const [type, setType] = useState<ProductType>(product?.type ?? "SALE");
    const [customerPrice, setCustomerPrice] = useState(
        String(product?.customerPrice ?? ""),
    );
    const [floristPrice, setFloristPrice] = useState(
        String(product?.floristPrice ?? ""),
    );
    const [rentalDeposit, setRentalDeposit] = useState(
        product?.rentalDeposit != null ? String(product.rentalDeposit) : "",
    );

    const [taxCodeId, setTaxCodeId] = useState(
        product?.taxCode != null ? Number(product.taxCode.id) : ""
    );

    const [featured, setFeatured] = useState(product?.featured ?? false);
    const [active, setActive] = useState(product?.active ?? true);

    const [categories, setCategories] = useState<PublicCategoryList[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        product?.categories.map((category) => category.id) ?? [],
    );

    const [taxCodes, setTaxCodes] = useState<AdminTaxCodeList[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [productImage] = useState<string | null>(
        product?.image ?? null,
    );
    const [productImageFile, setProductImageFile] = useState<File | null>(null);

    const [components, setComponents] = useState<ComponentFormItem[]>(
        product?.components.map((component) => ({
            id: component.id,
            name: component.name,
            minQuantity: component.minQuantity,
            recommendedQuantity: component.recommendedQuantity,
            maxQuantity: component.maxQuantity,
            customerPricePerAdditionalUnit:
                component.customerPricePerAdditionalUnit,
            floristPricePerAdditionalUnit:
                component.floristPricePerAdditionalUnit,
        })) ?? [],
    );

    const [variants, setVariants] = useState<VariantFormItem[]>(
        product?.variants.map((variant) => ({
            id: variant.id,
            type: variant.type,
            name: variant.name,
            description: variant.description ?? "",
            customerPrice: variant.customerPrice,
            floristPrice: variant.floristPrice,
            image: variant.image ?? ""
        })) ?? [],
    );

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!slugManuallyEdited) {
            setSlug(generateSlug(name));
        }
    }, [name, slugManuallyEdited]);

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoadingOptions(true);

            try {
                const [categoryResponse, taxCodeResponse] = await Promise.all([
                    publicCategoriesApi.getAll({
                        page: 1,
                        pageSize: 100,
                    }),
                    adminTaxCodesApi.getAll({
                        page: 1,
                        pageSize: 100,
                        sort: "name",
                        order: "asc",
                        active: true,
                    }),
                ]);

                if (!cancelled) {
                    setCategories(categoryResponse.items);
                    setTaxCodes(taxCodeResponse.items);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? `Não foi possível carregar as categorias ou os códigos fiscais: ${err.message}`
                            : "Não foi possível carregar as opções do formulário.",
                    );
                }
            } finally {
                if (!cancelled) setLoadingOptions(false);
            }
        }

        void loadOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    function handleProductImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        event.target.value = "";

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("A imagem do produto tem de ser JPEG, PNG ou WebP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("A imagem do produto não pode exceder 5 MB.");
            return;
        }

        setError(null);
        setProductImageFile(file);
    }

    function toggleCategory(categoryId: number) {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((id) => id !== categoryId)
                : [...current, categoryId],
        );
    }

    function addComponent() {
        if (variants.length > 0) {
            setError(
                "Um produto não pode ter variantes e componentes ao mesmo tempo. Remove as variantes primeiro.",
            );
            return;
        }

        setError(null);
        setComponents((current) => [
            ...current,
            {
                name: "",
                minQuantity: 0,
                recommendedQuantity: 1,
                maxQuantity: 10,
                customerPricePerAdditionalUnit: 0,
                floristPricePerAdditionalUnit: 0,
            },
        ]);
    }

    function updateComponent(
        index: number,
        changes: Partial<ComponentFormItem>,
    ) {
        setComponents((current) =>
            current.map((component, i) =>
                i === index ? { ...component, ...changes } : component,
            ),
        );
    }

    function removeComponent(index: number) {
        setComponents((current) => current.filter((_, i) => i !== index));
    }

    function addVariant() {
        if (components.length > 0) {
            setError(
                "Um produto não pode ter variantes e componentes ao mesmo tempo. Remove os componentes primeiro.",
            );
            return;
        }

        setError(null);
        setVariants((current) => [
            ...current,
            {
                type: "SIZE",
                name: "",
                description: "",
                customerPrice: toNumber(customerPrice),
                floristPrice: toNumber(floristPrice),
                image: "",
            },
        ]);
    }

    function updateVariant(
        index: number,
        changes: Partial<VariantFormItem>,
    ) {
        setVariants((current) =>
            current.map((variant, i) =>
                i === index ? { ...variant, ...changes } : variant,
            ),
        );
    }

    function removeVariant(index: number) {
        setVariants((current) => current.filter((_, i) => i !== index));
    }

    function validate(): string | null {
        if (!name.trim()) return "O nome do produto é obrigatório.";

        if (!generateSlug(slug)) return "O slug do produto é obrigatório.";

        if (!taxCodeId || !taxCodes.some((code) => code.id === Number(taxCodeId))) {
            return "Seleciona um código fiscal ativo.";
        }

        if (selectedCategoryIds.length === 0) {
            return "Seleciona pelo menos uma categoria.";
        }

        const customer = toNumber(customerPrice);
        const florist = toNumber(floristPrice);

        if (customer <= 0) {
            return "O preço para o cliente deve ser superior a zero.";
        }

        if (florist < 0 || florist >= customer) {
            return "O preço da florista tem de ser estritamente inferior ao preço do cliente.";
        }

        if (type === "RENTAL" && (rentalDeposit.trim() === "" || toNumber(rentalDeposit) < 0)) {
            return "Define uma caução válida para o produto de aluguer.";
        }

        if (!productImage && !productImageFile) {
            return "O produto tem de ter uma imagem.";
        }

        if (components.length > 0 && variants.length > 0) {
            return "O produto não pode ter componentes e variantes simultaneamente.";
        }

        for (let index = 0; index < components.length; index++) {
            const component = components[index];

            if (!component.name.trim()) {
                return `Indica o nome do componente ${index + 1}.`;
            }

            if (
                component.minQuantity < 0 ||
                component.recommendedQuantity < component.minQuantity ||
                component.maxQuantity < component.recommendedQuantity
            ) {
                return `Verifica as quantidades mínimas, recomendadas e máximas do componente "${component.name}".`;
            }

            if (
                component.customerPricePerAdditionalUnit <= 0 ||
                component.floristPricePerAdditionalUnit < 0 ||
                component.floristPricePerAdditionalUnit >=
                    component.customerPricePerAdditionalUnit
            ) {
                return `No componente "${component.name}", o preço adicional da florista tem de ser inferior ao preço adicional do cliente, e o preço do cliente tem de ser superior a zero.`;
            }
        }

        for (let index = 0; index < variants.length; index++) {
            const variant = variants[index];

            if (!variant.name.trim()) {
                return `Indica o nome da variante ${index + 1}.`;
            }

            if (
                variant.customerPrice < customer ||
                variant.floristPrice < 0 ||
                variant.floristPrice >= variant.customerPrice
            ) {
                return `Verifica os preços da variante "${variant.name}". O preço da variante para o cliente não pode ser inferior ao preço base e o preço da florista tem de ser estritamente inferior.`;
            }

            if (index === 0 && variant.customerPrice !== customer) {
                return "O preço para o cliente da primeira variante tem de ser igual ao preço base do produto.";
            }

            if (!variant.imageFile && !variant.image) {
                return `Adiciona uma imagem à variante "${variant.name}".`;
            }
        }

        return null;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setWarning(null);

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        let createdProductId: number | null = null;

        try {
            const payload = {
                name: name.trim(),
                slug: generateSlug(slug),
                description: description.trim() || undefined,
                customerPrice: toNumber(customerPrice),
                floristPrice: toNumber(floristPrice),
                featured,
                categoryIds: selectedCategoryIds,
                taxCodeId: Number(taxCodeId),
                components: components.map((component) => ({
                    ...(component.id !== undefined ? { id: component.id } : {}),
                    name: component.name.trim(),
                    minQuantity: component.minQuantity,
                    recommendedQuantity: component.recommendedQuantity,
                    maxQuantity: component.maxQuantity,
                    customerPricePerAdditionalUnit:
                        component.customerPricePerAdditionalUnit,
                    floristPricePerAdditionalUnit:
                        component.floristPricePerAdditionalUnit,
                })),
                variants: variants.map((variant) => ({
                    ...(variant.id !== undefined ? { id: variant.id } : {}),
                    type: variant.type,
                    name: variant.name.trim(),
                    description: variant.description.trim(),
                    customerPrice: variant.customerPrice,
                    floristPrice: variant.floristPrice,
                })),
                active,
                ...(type === "RENTAL"
                    ? { rentalDeposit: toNumber(rentalDeposit) }
                    : {}),
            };

            if (product) {
                const updatePayload: AdminUpdateProduct = payload;
                await adminProductsApi.update(product.id, updatePayload);
                createdProductId = product.id;
            } else {
                const createPayload: AdminCreateProduct = {
                    ...payload,
                    type,
                };

                const created = await adminProductsApi.create(createPayload);
                createdProductId = created.id;
            }

            // Recarrega o produto para obter os IDs persistidos das variantes.
            const savedProduct = await adminProductsApi.getById(createdProductId);
            const uploadErrors: string[] = [];

            // O endpoint centralizado mantém apenas uma imagem associada ao produto.
            if (productImageFile) {
                try {
                    await adminUploadsApi.uploadImage(productImageFile, {
                        productId: createdProductId,
                    });
                } catch (err) {
                    uploadErrors.push(
                        `Imagem do produto: ${err instanceof Error ? err.message : "falha no upload"}`,
                    );
                }
            }

            // Cada variante tem uma única imagem, carregada apenas quando foi substituída ou escolhida.
            for (let index = 0; index < variants.length; index++) {
                const variant = variants[index];
                if (!variant.imageFile) continue;

                const savedVariant = savedProduct.variants.find(
                    (item) => variant.id !== undefined && item.id === variant.id,
                ) ?? savedProduct.variants[index];

                if (!savedVariant) {
                    uploadErrors.push(
                        `Não foi possível encontrar a variante "${variant.name}" para carregar a imagem.`,
                    );
                    continue;
                }

                try {
                    await adminUploadsApi.uploadImage(variant.imageFile, {
                        variantId: savedVariant.id,
                    });
                } catch (err) {
                    uploadErrors.push(
                        `Imagem da variante "${variant.name}": ${err instanceof Error ? err.message : "falha no upload"}`,
                    );
                }
            }

            if (uploadErrors.length > 0) {
                setWarning(
                    `O produto foi guardado, mas alguns uploads falharam:\n${uploadErrors.join("\n")}\nPodes voltar a editar o produto e carregar as imagens em falta.`,
                );
                return;
            }

            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            if (createdProductId !== null) {
                setWarning(
                    `O produto (ID ${createdProductId}) já foi guardado, mas ocorreu um erro numa etapa posterior. Não cries novamente o produto. Verifica a edição do produto para confirmar as imagens.`,
                );
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível guardar o produto. Tenta novamente.",
                );
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!product || deleting) return;

        setDeleting(true);
        setError(null);

        try {
            await adminProductsApi.delete(product.id);
            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível eliminar o produto.",
            );
            setShowDeleteConfirmation(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#2F3B2A]">
                        {isEditing ? "Editar produto" : "Novo produto"}
                    </h1>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Define a informação, os preços, as imagens e as opções do produto.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {product && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirmation(true)}
                            disabled={saving || deleting}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            Eliminar produto
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => router.push("/admin/products")}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E2E6DD] px-4 py-2.5 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE]"
                        disabled={saving || deleting}
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </button>
                </div>
            </div>


            {error && (
                <div
                    role="alert"
                    className="whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {warning && (
                <div
                    role="alert"
                    className="whitespace-pre-line rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
                >
                    {warning}
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => router.push(`/admin/products/${createdProductIdForRoute(product)}/edit`)}
                            className="text-sm font-semibold underline"
                        >
                            Voltar à edição do produto
                        </button>
                    </div>
                </div>
            )}

            <section className={sectionClassName}>
                <SectionHeading
                    title="Informação geral"
                    description="Nome, endereço, descrição, tipo e categoria do produto."
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="name" className={labelClassName}>
                            Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className={inputClassName}
                            placeholder="Ex.: Bouquet Primavera"
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label htmlFor="slug" className={labelClassName}>
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setSlugManuallyEdited(false);
                                    setSlug(generateSlug(name));
                                }}
                                className="text-xs font-medium text-[#55624A] hover:text-[#35412F]"
                                disabled={saving}
                            >
                                Gerar automaticamente
                            </button>
                        </div>
                        <input
                            id="slug"
                            value={slug}
                            onChange={(event) => {
                                setSlug(event.target.value);
                                setSlugManuallyEdited(true);
                            }}
                            className={inputClassName}
                            placeholder="bouquet-primavera"
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className={labelClassName}>
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className={`${inputClassName} min-h-28 resize-y`}
                            rows={4}
                            placeholder="Descreve o produto..."
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="type" className={labelClassName}>
                            Tipo de produto <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(event) => setType(event.target.value as ProductType)}
                            className={inputClassName}
                            disabled={saving || isEditing}
                        >
                            <option value="SALE">Venda</option>
                            <option value="RENTAL">Aluguer</option>
                        </select>
                        {isEditing && (
                            <p className="mt-2 text-xs text-[#8A9383]">
                                O tipo não é alterável durante a edição.
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="taxCodeId" className={labelClassName}>
                            Código fiscal <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="taxCodeId"
                            value={taxCodeId}
                            onChange={(event) => setTaxCodeId(event.target.value)}
                            className={inputClassName}
                            required
                            disabled={saving || loadingOptions}
                        >
                            <option value="">
                                {loadingOptions
                                    ? "A carregar códigos fiscais..."
                                    : "Seleciona um código fiscal"}
                            </option>
                            {taxCodes.map((taxCode) => (
                                <option key={taxCode.id} value={taxCode.id}>
                                    {taxCode.name} — {taxCode.rate}%
                                </option>
                            ))}
                        </select>
                        {!loadingOptions && taxCodes.length === 0 && (
                            <p className="mt-2 text-xs text-amber-700">
                                Não foram encontrados códigos fiscais ativos.
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClassName}>Categorias</label>
                        {loadingOptions ? (
                            <p className="text-sm text-[#7A8474]">
                                A carregar categorias...
                            </p>
                        ) : categories.length === 0 ? (
                            <p className="text-sm text-amber-700">
                                Não foram encontradas categorias.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => {
                                    const selected = selectedCategoryIds.includes(category.id);

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleCategory(category.id)}
                                            disabled={saving}
                                            className={`rounded-full border px-4 py-2 text-sm transition ${
                                                selected
                                                    ? "border-[#55624A] bg-[#55624A] text-white"
                                                    : "border-[#E2E6DD] bg-white text-[#55624A] hover:bg-[#F3F5EE]"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={sectionClassName}>
                <SectionHeading
                    title="Preços"
                    description="O preço pago pelo cliente tem de ser superior ao preço da florista."
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="customerPrice" className={labelClassName}>
                            Preço para o cliente (€) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="customerPrice"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={customerPrice}
                            onChange={(event) => setCustomerPrice(event.target.value)}
                            className={inputClassName}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="floristPrice" className={labelClassName}>
                            Preço para a florista (€) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="floristPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={floristPrice}
                            onChange={(event) => setFloristPrice(event.target.value)}
                            className={inputClassName}
                            required
                            disabled={saving}
                        />
                    </div>

                    {type === "RENTAL" && (
                        <div className="md:col-span-2">
                            <label htmlFor="rentalDeposit" className={labelClassName}>
                                Caução (€) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="rentalDeposit"
                                type="number"
                                min="0"
                                step="0.01"
                                value={rentalDeposit}
                                onChange={(event) => setRentalDeposit(event.target.value)}
                                className={inputClassName}
                                required
                                disabled={saving}
                            />
                        </div>
                    )}
                </div>
            </section>

            <section className={sectionClassName}>
                <SectionHeading
                    title="Imagem do produto"
                    description="Escolhe uma única imagem JPEG, PNG ou WebP. Tamanho máximo de 5 MB. Ao carregar uma nova imagem, a anterior será substituída."
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <ImagePreview
                        file={productImageFile ?? undefined}
                        src={productImage ?? undefined}
                        alt={`Imagem do produto ${name || "novo produto"}`}
                        className="h-44 w-44"
                    />

                    <div className="space-y-3">
                        <label
                            htmlFor="productImage"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D8DED1] px-4 py-2.5 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE]"
                        >
                            <Upload size={16} />
                            {productImage || productImageFile ? "Substituir imagem" : "Escolher imagem"}
                            <input
                                id="productImage"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleProductImageChange}
                                className="hidden"
                                disabled={saving}
                            />
                        </label>
                        {productImageFile && (
                            <p className="text-xs text-[#7A8474]">
                                Nova imagem: {productImageFile.name}
                            </p>
                        )}
                        <p className="text-xs text-[#7A8474]">
                            Só podes associar uma imagem ao produto. Se escolheres outra, substituirá a atual quando guardares.
                        </p>
                    </div>
                </div>
            </section>

            <section className={sectionClassName}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Componentes ou variantes
                        </h2>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Escolhe uma configuração. Um produto não pode ter ambos.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={addComponent}
                            disabled={saving || variants.length > 0}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#D8DED1] px-4 py-2.5 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EE] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={16} />
                            Componente
                        </button>
                        <button
                            type="button"
                            onClick={addVariant}
                            disabled={saving || components.length > 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#55624A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#46523C] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={16} />
                            Variante
                        </button>
                    </div>
                </div>

                {components.length === 0 && variants.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#D8DED1] bg-[#F8F9F5] px-5 py-8 text-center">
                        <p className="text-sm font-medium text-[#55624A]">
                            Sem componentes ou variantes
                        </p>
                        <p className="mt-1 text-xs text-[#7A8474]">
                            Podes guardar o produto apenas com o seu preço base.
                        </p>
                    </div>
                )}

                {components.length > 0 && (
                    <div className="space-y-5">
                        {components.map((component, index) => (
                            <div
                                key={component.id ?? `component-${index}`}
                                className="rounded-2xl border border-[#E8EBE4] bg-[#FCFCFA] p-5"
                            >
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <h3 className="font-semibold text-[#2F3B2A]">
                                        Componente {index + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removeComponent(index)}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                        disabled={saving}
                                    >
                                        <Trash2 size={14} />
                                        Remover
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <label className={labelClassName}>Nome</label>
                                        <input
                                            value={component.name}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    name: event.target.value,
                                                })
                                            }
                                            className={inputClassName}
                                            placeholder="Ex.: Rosas"
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Quantidade mínima</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={component.minQuantity}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    minQuantity: toNumber(event.target.value),
                                                })
                                            }
                                            className={inputClassName}
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Quantidade recomendada</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={component.recommendedQuantity}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    recommendedQuantity: toNumber(event.target.value),
                                                })
                                            }
                                            className={inputClassName}
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Quantidade máxima</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={component.maxQuantity}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    maxQuantity: toNumber(event.target.value),
                                                })
                                            }
                                            className={inputClassName}
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>
                                            Preço adicional cliente (€)
                                        </label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={component.customerPricePerAdditionalUnit}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    customerPricePerAdditionalUnit: toNumber(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                            className={inputClassName}
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>
                                            Preço adicional florista (€)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={component.floristPricePerAdditionalUnit}
                                            onChange={(event) =>
                                                updateComponent(index, {
                                                    floristPricePerAdditionalUnit: toNumber(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                            className={inputClassName}
                                            required
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {variants.length > 0 && (
                    <div className="space-y-5">
                        {variants.map((variant, index) => (
                            <div
                                key={variant.id ?? `variant-${index}`}
                                className="rounded-2xl border border-[#E8EBE4] bg-[#FCFCFA] p-5"
                            >
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <h3 className="font-semibold text-[#2F3B2A]">
                                        Variante {index + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                        disabled={saving}
                                    >
                                        <Trash2 size={14} />
                                        Remover
                                    </button>
                                </div>

                                <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
                                    <div>
                                        <label className={labelClassName}>
                                            Imagem <span className="text-red-500">*</span>
                                        </label>

                                        <ImagePreview
                                            file={variant.imageFile}
                                            src={variant.image || undefined}
                                            alt={`Imagem da variante ${variant.name || index + 1}`}
                                            className="mb-3 h-44 w-full"
                                        />

                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D8DED1] px-4 py-2.5 text-sm font-medium text-[#55624A] hover:bg-[#F3F5EE]">
                                            <ImagePlus size={16} />
                                            Escolher imagem
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                disabled={saving}
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0];
                                                    event.target.value = "";

                                                    if (!file) return;

                                                    if (
                                                        ![
                                                            "image/jpeg",
                                                            "image/png",
                                                            "image/webp",
                                                        ].includes(file.type)
                                                    ) {
                                                        setError(
                                                            "A imagem da variante tem de ser JPEG, PNG ou WebP.",
                                                        );
                                                        return;
                                                    }

                                                    if (file.size > 5 * 1024 * 1024) {
                                                        setError(
                                                            "A imagem da variante não pode exceder 5 MB.",
                                                        );
                                                        return;
                                                    }

                                                    setError(null);
                                                    updateVariant(index, {
                                                        imageFile: file,
                                                    });
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid content-start gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClassName}>Tipo</label>
                                            <select
                                                value={variant.type}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        type: event.target.value as "SIZE",
                                                    })
                                                }
                                                className={inputClassName}
                                                disabled={saving}
                                            >
                                                <option value="SIZE">Tamanho</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Nome</label>
                                            <input
                                                value={variant.name}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        name: event.target.value,
                                                    })
                                                }
                                                className={inputClassName}
                                                placeholder="Ex.: Grande"
                                                required
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClassName}>Descrição</label>
                                            <textarea
                                                value={variant.description}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        description: event.target.value,
                                                    })
                                                }
                                                className={`${inputClassName} min-h-20 resize-y`}
                                                rows={2}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>
                                                Preço cliente (€)
                                            </label>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={variant.customerPrice}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        customerPrice: toNumber(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                                className={inputClassName}
                                                required
                                                disabled={saving}
                                            />
                                            {index === 0 && (
                                                <p className="mt-2 text-xs text-[#7A8474]">
                                                    Tem de ser igual ao preço base.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClassName}>
                                                Preço florista (€)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.floristPrice}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        floristPrice: toNumber(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                                className={inputClassName}
                                                required
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={sectionClassName}>
                <SectionHeading
                    title="Visibilidade"
                    description="Define se o produto está ativo e se deve aparecer em destaque."
                />

                <div className="space-y-4">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            className="mt-1 h-4 w-4 accent-[#55624A]"
                            disabled={saving}
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Produto ativo
                            </span>
                            <span className="mt-1 block text-xs text-[#7A8474]">
                                O produto pode ser apresentado na plataforma.
                            </span>
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={featured}
                            onChange={(event) => setFeatured(event.target.checked)}
                            className="mt-1 h-4 w-4 accent-[#55624A]"
                            disabled={saving}
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Produto em destaque
                            </span>
                            <span className="mt-1 block text-xs text-[#7A8474]">
                                Permite destacar o produto nas áreas relevantes da loja.
                            </span>
                        </span>
                    </label>
                </div>
            </section>

            {isEditing && product && (
                <section className="rounded-3xl border border-[#E8EBE4] bg-[#F8F9F5] p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">Informação do registo</h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Datas de criação e última atualização do produto.
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-[#7A8474]">Criado em</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate((product as unknown as Record<string, unknown>).createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#7A8474]">Última atualização</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate((product as unknown as Record<string, unknown>).updatedAt)}
                            </p>
                        </div>
                    </div>
                </section>
            )}


            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="rounded-xl border border-[#E2E6DD] px-5 py-3 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EE]"
                    disabled={saving}
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving || loadingOptions}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#55624A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46523C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={17} />
                    {saving
                        ? "A guardar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar produto"}
                </button>
            </div>

            {showDeleteConfirmation && product && (
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
                        aria-labelledby="delete-product-title"
                        aria-describedby="delete-product-description"
                        className="w-full max-w-md rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertTriangle size={24} />
                        </div>

                        <h2
                            id="delete-product-title"
                            className="mt-5 text-xl font-semibold text-[#2F3B2A]"
                        >
                            Eliminar produto?
                        </h2>

                        <p
                            id="delete-product-description"
                            className="mt-3 text-sm leading-6 text-[#7A8474]"
                        >
                            Estás prestes a eliminar o produto{" "}
                            <span className="font-semibold text-[#374132]">
                                {product.name}
                            </span>
                            . Esta ação pode ser irreversível. Tens a certeza de que
                            pretendes continuar?
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
        </form>
    );
}

function createdProductIdForRoute(product?: AdminProductDetail): number | string {
    return product?.id ?? "";
}
