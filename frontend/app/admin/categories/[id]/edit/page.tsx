"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import CategoryForm from "@/components/admin/categories/CategoryForm";

import {
    getCategory,
    type Category,
} from "@/lib/api/categories";

export default function EditCategoryPage() {
    const params = useParams();

    const id = Number(params.id);

    const [category, setCategory] =
        useState<Category | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadCategory() {
            if (Number.isNaN(id)) {
                setError(
                    "Categoria inválida.",
                );

                setIsLoading(false);

                return;
            }

            try {
                setError(null);

                const response =
                    await getCategory(id);

                setCategory(
                    response.data,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar a categoria.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadCategory();
    }, [id]);

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">
                <PageHeader
                    title="Editar categoria"
                    subtitle="A carregar a categoria..."
                />

                <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-100" />

                    <div className="mt-8 space-y-6">
                        <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="space-y-8 pb-10">
                <div>
                    <Link
                        href="/admin/categories"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                            transition
                            hover:text-[#55624A]
                        "
                    >
                        <ArrowLeft size={16} />
                        Voltar às categorias
                    </Link>

                    <div className="mt-5">
                        <PageHeader
                            title="Editar categoria"
                            subtitle="Não foi possível carregar a categoria."
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                    {error ??
                        "Categoria não encontrada."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <Link
                    href="/admin/categories"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar às categorias
                </Link>

                <div className="mt-5">
                    <PageHeader
                        title="Editar categoria"
                        subtitle={`Atualiza a categoria ${category.name}.`}
                    />
                </div>
            </div>

            <CategoryForm
                category={category}
            />
        </div>
    );
}
