
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react";

import { adminCategoriesApi } from "@/lib/api/categories/admin-categories";

import type { AdminCategoryDetail } from "@/types/categories/admin/admin-category-detail";
import type { AdminCreateCategory } from "@/types/categories/admin/admin-create-category";
import type { AdminUpdateCategory } from "@/types/categories/admin/admin-update-category";
import { adminUploadsApi } from "@/lib/api/uploads/admin-uploads";

type CategoryFormProps = {
    category?: AdminCategoryDetail;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function generateSlug(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function formatDate(value: Date | string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

const inputClassName =
    "w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5EE]";

const labelClassName =
    "mb-2 block text-sm font-medium text-[#374132]";

export default function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter();
    const isEditing = Boolean(category);

    const [name, setName] = useState(category?.name ?? "");
    const [slug, setSlug] = useState(category?.slug ?? "");
    const [description, setDescription] = useState(
        category?.description ?? "",
    );
    const [active, setActive] = useState(category?.active ?? true);
    const [featured, setFeatured] = useState(category?.featured ?? false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(
        Boolean(category),
    );

    const [imageUrl, setImageUrl] = useState<string | null>(
        category?.image ?? null,
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageToDelete, setImageToDelete] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        category?.image ?? null,
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slugManuallyEdited) {
            setSlug(generateSlug(name));
        }
    }, [name, slugManuallyEdited]);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(imageToDelete ? null : imageUrl);
            return;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile, imageUrl, imageToDelete]);

    function handleImageChange(file: File | null) {
        setError(null);

        if (!file) {
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError("Seleciona uma imagem JPEG, PNG ou WebP.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError("A imagem não pode ultrapassar 5 MB.");
            return;
        }

        setImageFile(file);
        setImageToDelete(false);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const normalizedName = name.trim();
        const normalizedSlug = generateSlug(slug);

        if (!normalizedName) {
            setError("O nome da categoria é obrigatório.");
            return;
        }

        if (!normalizedSlug) {
            setError("O slug da categoria é obrigatório.");
            return;
        }

        const payload = {
            name: normalizedName,
            slug: normalizedSlug,
            description: description.trim() || undefined,
            active,
            featured,
        };

        setSaving(true);

        try {
            let categoryId: number;

            if (category) {
                const data: AdminUpdateCategory = payload;

                await adminCategoriesApi.update(category.id, data);
                categoryId = category.id;
            } else {
                const data: AdminCreateCategory = payload;
                const created = await adminCategoriesApi.create(data);

                categoryId = created.id;
            }

            if (imageFile) {
                await adminUploadsApi.uploadImage(imageFile, {
                    categoryId,
                });
            } else if (imageToDelete && category) {
                // Mantém o endpoint de remoção existente.
                // O novo endpoint de upload não remove imagens sem substituição.
                await adminCategoriesApi.deleteImage(categoryId);
            }

            router.push("/admin/categories");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a categoria. Tenta novamente.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Informação da categoria
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Define o nome, o endereço e a descrição da categoria.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className={labelClassName}>
                            Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ex.: Bouquets"
                            className={inputClassName}
                            maxLength={100}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label
                                htmlFor="slug"
                                className="text-sm font-medium text-[#374132]"
                            >
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setSlugManuallyEdited(false);
                                    setSlug(generateSlug(name));
                                }}
                                className="text-xs font-medium text-[#55624A] transition hover:text-[#35412F]"
                                disabled={saving}
                            >
                                Gerar a partir do nome
                            </button>
                        </div>

                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            value={slug}
                            onChange={(event) => {
                                setSlug(event.target.value);
                                setSlugManuallyEdited(true);
                            }}
                            placeholder="ex.: bouquets"
                            className={inputClassName}
                            maxLength={150}
                            required
                            disabled={saving}
                        />
                        <p className="mt-2 text-xs text-[#8A9383]">
                            Identificador utilizado no endereço da categoria.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className={labelClassName}>
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Descreve esta categoria..."
                            className={`${inputClassName} min-h-32 resize-y`}
                            rows={4}
                            disabled={saving}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                    Imagem da categoria
                </h2>
                <p className="mt-1 text-sm text-[#7A8474]">
                    Escolhe uma imagem para representar esta categoria na loja.
                </p>

                <div className="mt-5 space-y-4">
                    {previewUrl ? (
                        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#E2E6DD] bg-[#F8F9F5]">
                            <img
                                src={previewUrl}
                                alt={`Pré-visualização da categoria ${name || "nova"}`}
                                className="h-56 w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setImageFile(null);
                                    setImageToDelete(true);
                                    setImageUrl(null);
                                }}
                                disabled={saving}
                                className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 size={14} />
                                Remover imagem
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-44 w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8D0C1] bg-[#F8F9F5] text-center">
                            <ImagePlus size={28} className="text-[#8A9383]" />
                            <p className="mt-3 text-sm font-medium text-[#55624A]">
                                Ainda sem imagem
                            </p>
                            <p className="mt-1 text-xs text-[#8A9383]">
                                JPEG, PNG ou WebP · Máximo 5 MB
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="image" className={labelClassName}>
                            {previewUrl ? "Substituir imagem" : "Carregar imagem"}
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={saving}
                            onChange={(event) => {
                                handleImageChange(event.target.files?.[0] ?? null);
                                event.target.value = "";
                            }}
                            className="block w-full text-sm text-[#55624A] file:mr-4 file:rounded-full file:border-0 file:bg-[#E8EDDF] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-[#435039] hover:file:bg-[#DDE5D1] disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                    Estado e destaque
                </h2>

                <div className="mt-5 space-y-5">
                    <label htmlFor="active" className="flex cursor-pointer items-start gap-3">
                        <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            disabled={saving}
                            className="mt-1 h-4 w-4 rounded border-[#C8D0C1] accent-[#55624A]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Categoria ativa
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[#7A8474]">
                                {active
                                    ? "A categoria está ativa e pode ser utilizada."
                                    : "A categoria ficará inativa."}
                            </span>
                        </span>
                    </label>

                    <label htmlFor="featured" className="flex cursor-pointer items-start gap-3">
                        <input
                            id="featured"
                            name="featured"
                            type="checkbox"
                            checked={featured}
                            onChange={(event) => setFeatured(event.target.checked)}
                            disabled={saving}
                            className="mt-1 h-4 w-4 rounded border-[#C8D0C1] accent-[#55624A]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Destacar na página inicial
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[#7A8474]">
                                Permite apresentar esta categoria na secção de categorias em destaque da loja.
                            </span>
                        </span>
                    </label>
                </div>
            </div>

            {isEditing && category && (
                <div className="rounded-3xl border border-[#E8EBE4] bg-[#F8F9F5] p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Informação do registo
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Datas de criação e atualização da categoria.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-[#7A8474]">Criado em</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(category.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#7A8474]">Última atualização</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(category.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
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
                    onClick={() => router.push("/admin/categories")}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                >
                    <ArrowLeft size={16} />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={16} />
                    {saving
                        ? "A guardar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar categoria"}
                </button>
            </div>
        </form>
    );
}
